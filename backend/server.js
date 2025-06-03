import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

// Import des routes
import authRoutes from './routes/auth.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares de sécurité
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))

// Parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'TourGuide API is running' })
})

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

// Gestion globale des erreurs
app.use((error, req, res, next) => {
  console.error(error.stack)
  res.status(500).json({
    success: false,
    message: 'Erreur serveur interne'
  })
})

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur TourGuide démarré sur le port ${PORT}`)
  console.log(`📍 API disponible sur http://localhost:${PORT}/api`)
})