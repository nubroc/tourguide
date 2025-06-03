import express from 'express'
import pool from '../config/database.js'
import { authenticateToken, requireRole, getGuideId } from '../middleware/auth.js'

const router = express.Router()

// ✨ GET /api/guide/offers - Mes offres (guide)
router.get('/offers', authenticateToken, requireRole(['guide']), getGuideId, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    let query = `
      SELECT 
        to.*,
        COALESCE(os.likes_count, 0) as likes_count,
        COALESCE(os.views_count, 0) as views_count
      FROM tour_offers to
      LEFT JOIN offer_stats os ON to.id = os.offer_id
      WHERE to.guide_id = ?
    `

    const params = [req.guideId]

    if (status) {
      query += ` AND to.status = ?`
      params.push(status)
    }

    query += ` ORDER BY to.created_at DESC LIMIT ? OFFSET ?`
    params.push(parseInt(limit), offset)

    const [offers] = await pool.execute(query, params)

    // Récupérer les langues pour chaque offre
    for (let offer of offers) {
      const [languages] = await pool.execute(
        'SELECT language_code FROM tour_offer_languages WHERE offer_id = ?',
        [offer.id]
      )
      offer.languages = languages.map(l => l.language_code)
    }

    res.json({
      success: true,
      data: offers
    })

  } catch (error) {
    console.error('Erreur récupération offres guide:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des offres'
    })
  }
})

export default router