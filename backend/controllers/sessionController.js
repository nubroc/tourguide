import { Session } from '../models/Session.js'

export const createSession = async (req, res) => {
  try {
    const session = await Session.create(req.body)
    
    res.status(201).json({
      success: true,
      message: 'Session créée avec succès',
      data: session
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

export const getUserSessions = async (req, res) => {
  try {
    const { userId } = req.user
    const { role } = req.query

    let sessions
    if (role === 'tourist') {
      sessions = await Session.findByTouristId(userId)
    } else if (role === 'guide') {
      sessions = await Session.findByGuideId(userId)
    }

    res.json({
      success: true,
      data: sessions
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

export const updateSessionStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const session = await Session.updateStatus(id, status)

    res.json({
      success: true,
      message: 'Statut de la session mis à jour',
      data: session
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}