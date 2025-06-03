import express from 'express'
import pool from '../config/database.js'

const router = express.Router()

// Placeholder pour les sessions
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Sessions endpoint - à implémenter'
  })
})

export default router