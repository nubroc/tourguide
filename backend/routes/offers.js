import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import pool from '../config/database.js'
import { authenticateToken, requireRole, getGuideId } from '../middleware/auth.js'

const router = express.Router()

// Test simple pour debug
router.get('/', async (req, res) => {
  try {
    console.log('📍 Route GET /api/offers appelée')
    
    // Test simple sans DB d'abord
    res.json({
      success: true,
      data: {
        offers: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        }
      }
    })
  } catch (error) {
    console.error('❌ Erreur dans GET /offers:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

export default router