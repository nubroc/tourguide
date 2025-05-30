import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

// Routes
import authRoutes from './routes/auth.js'
import activityRoutes from './routes/activities.js'
import sessionRoutes from './routes/sessions.js'

// Database
import './config/database.js'

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
app.use('/api/activities', activityRoutes)
app.use('/api/sessions', sessionRoutes)

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
    message: 'Something went wrong!'
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📍 API available at http://localhost:${PORT}/api`)
  console.log(`🗄️ Using MySQL database`)
})