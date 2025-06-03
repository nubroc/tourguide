import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import pool from '../config/database.js'
import { authenticateToken, requireRole } from '../middleware/auth.js'

const router = express.Router()

// ✨ POST /api/offers/:id/like - Liker/Unliker une offre
router.post('/:id/like', authenticateToken, requireRole(['tourist']), async (req, res) => {
  try {
    const { id: offerId } = req.params
    const userId = req.user.id

    // Vérifier que l'offre existe
    const [offers] = await pool.execute(
      'SELECT id FROM tour_offers WHERE id = ? AND status = "active"',
      [offerId]
    )

    if (offers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Offre non trouvée'
      })
    }

    // Vérifier si déjà liké
    const [existingLikes] = await pool.execute(
      'SELECT id FROM offer_likes WHERE offer_id = ? AND tourist_id = ?',
      [offerId, userId]
    )

    if (existingLikes.length > 0) {
      // Unliker - supprimer le like
      await pool.execute(
        'DELETE FROM offer_likes WHERE offer_id = ? AND tourist_id = ?',
        [offerId, userId]
      )

      res.json({
        success: true,
        message: 'Like retiré',
        data: { liked: false }
      })
    } else {
      // Liker - ajouter le like
      await pool.execute(
        'INSERT INTO offer_likes (id, offer_id, tourist_id) VALUES (?, ?, ?)',
        [uuidv4(), offerId, userId]
      )

      res.json({
        success: true,
        message: 'Offre likée',
        data: { liked: true }
      })
    }

  } catch (error) {
    console.error('Erreur like/unlike:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la gestion du like'
    })
  }
})

// ✨ GET /api/users/liked-offers - Offres likées par l'utilisateur
router.get('/users/liked-offers', authenticateToken, requireRole(['tourist']), async (req, res) => {
  try {
    const userId = req.user.id
    const { page = 1, limit = 20 } = req.query

    const offset = (parseInt(page) - 1) * parseInt(limit)

    const [likedOffers] = await pool.execute(`
      SELECT 
        to.*,
        u.full_name as guide_name,
        u.profile_photo_url as guide_photo,
        ol.created_at as liked_at,
        COALESCE(os.likes_count, 0) as likes_count
      FROM offer_likes ol
      JOIN tour_offers to ON ol.offer_id = to.id
      JOIN guides g ON to.guide_id = g.id
      JOIN users u ON g.user_id = u.id
      LEFT JOIN offer_stats os ON to.id = os.offer_id
      WHERE ol.tourist_id = ?
      ORDER BY ol.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, parseInt(limit), offset])

    // Récupérer les langues pour chaque offre
    for (let offer of likedOffers) {
      const [languages] = await pool.execute(
        'SELECT language_code FROM tour_offer_languages WHERE offer_id = ?',
        [offer.id]
      )
      offer.languages = languages.map(l => l.language_code)
    }

    // Compter le total
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM offer_likes WHERE tourist_id = ?',
      [userId]
    )
    const total = countResult[0].total

    res.json({
      success: true,
      data: {
        offers: likedOffers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    })

  } catch (error) {
    console.error('Erreur récupération favoris:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des favoris'
    })
  }
})

export default router