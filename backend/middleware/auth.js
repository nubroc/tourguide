import jwt from 'jsonwebtoken'
import pool from '../config/database.js'

// Middleware d'authentification
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'accès requis'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    // Récupérer les infos utilisateur complètes
    const [users] = await pool.execute(
      'SELECT id, email, full_name, role FROM users WHERE id = ?',
      [decoded.userId]
    )

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      })
    }

    req.user = users[0]
    next()

  } catch (error) {
    console.error('Erreur authentification:', error)
    return res.status(403).json({
      success: false,
      message: 'Token invalide'
    })
  }
}

// Middleware de vérification de rôle
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permissions insuffisantes'
      })
    }

    next()
  }
}

// Middleware pour récupérer l'ID du guide
export const getGuideId = async (req, res, next) => {
  try {
    const [guides] = await pool.execute(
      'SELECT id FROM guides WHERE user_id = ?',
      [req.user.id]
    )

    if (guides.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profil guide non trouvé'
      })
    }

    req.guideId = guides[0].id
    next()

  } catch (error) {
    console.error('Erreur récupération guide:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    })
  }
}