import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

// Import des routes
import authRoutes from './routes/auth.js'
import sessionRoutes from './routes/sessions.js'
import offerRoutes from './routes/offers.js'
import likesRoutes from './routes/likes.js'
import guideRoutes from './routes/guide-offers.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares de sécurité
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite de 100 requêtes par fenêtre de temps
})
app.use(limiter)

// Parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/sessions', sessionRoutes)
app.use('/api/offers', offerRoutes)        // ✅ Système principal
app.use('/api', likesRoutes)               // ✅ Routes likes
app.use('/api/guide', guideRoutes)         // ✅ Routes guide

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'TourGuide API is running with MySQL' })
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

app.listen(PORT, () => {
  console.log(`🚀 Serveur TourGuide démarré sur le port ${PORT}`)
  console.log(`📍 API disponible sur http://localhost:${PORT}/api`)
})