import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import pool from '../config/database.js'

const router = express.Router()

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, role, languages } = req.body

    // Vérifier si l'utilisateur existe
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Un compte avec cet email existe déjà'
      })
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, 12)
    const userId = uuidv4()

    // Insérer l'utilisateur
    await pool.execute(
      'INSERT INTO users (id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)',
      [userId, email, passwordHash, fullName, role]
    )

    // Ajouter les langues
    if (languages && languages.length > 0) {
      for (const lang of languages) {
        await pool.execute(
          'INSERT INTO user_languages (id, user_id, language_code) VALUES (?, ?, ?)',
          [uuidv4(), userId, lang]
        )
      }
    }

    // Générer le token JWT
    const token = jwt.sign(
      { userId, email, role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      data: {
        user: {
          id: userId,
          email,
          fullName,
          role
        },
        token
      }
    })

  } catch (error) {
    console.error('Erreur inscription:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du compte'
    })
  }
})

// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Chercher l'utilisateur
    const [users] = await pool.execute(
      'SELECT id, email, password_hash, full_name, role FROM users WHERE email = ?',
      [email]
    )

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      })
    }

    const user = users[0]

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      })
    }

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role
        },
        token
      }
    })

  } catch (error) {
    console.error('Erreur connexion:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion'
    })
  }
})

export default router