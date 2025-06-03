import express from 'express'
import pool from '../config/database.js'

const router = express.Router()

// Récupérer toutes les activités
router.get('/', async (req, res) => {
  try {
    const [activities] = await pool.execute(`
      SELECT 
        a.id,
        a.title,
        a.description,
        a.price,
        a.duration,
        u.full_name as guide_name,
        g.cities
      FROM activities a
      JOIN guides g ON a.guide_id = g.id
      JOIN users u ON g.user_id = u.id
      ORDER BY a.created_at DESC
    `)

    // Récupérer les langues pour chaque activité
    for (let activity of activities) {
      const [languages] = await pool.execute(
        'SELECT language_code FROM activity_languages WHERE activity_id = ?',
        [activity.id]
      )
      activity.languages = languages.map(l => l.language_code)
    }

    res.json({
      success: true,
      data: activities
    })

  } catch (error) {
    console.error('Erreur récupération activités:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des activités'
    })
  }
})

export default router