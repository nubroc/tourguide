import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { Tourist } from '../models/Tourist.js'
import { Guide } from '../models/Guide.js'

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
}

export const register = async (req, res) => {
  try {
    const { role, ...userData } = req.body

    // Créer l'utilisateur
    const user = await User.create(userData)

    // Créer le profil spécifique selon le rôle
    if (role === 'tourist') {
      const { country, destination, startDate, endDate, interests } = userData
      await Tourist.create({
        user_id: user.id,
        country,
        destination,
        start_date: startDate,
        end_date: endDate,
        interests
      })
    } else if (role === 'guide') {
      const { cities, activities, availability, socialLinks } = userData
      await Guide.create({
        user_id: user.id,
        cities,
        activities,
        availability,
        socialLinks
      })
    }

    const token = generateToken(user.id)

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        }
      }
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Trouver l'utilisateur
    const user = await User.findByEmail(email)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      })
    }

    // Vérifier le mot de passe
    const isValidPassword = await User.verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      })
    }

    const token = generateToken(user.id)

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        }
      }
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}