import { Guide } from '../models/Guide.js'

export const getAllActivities = async (req, res) => {
  try {
    const activities = await Guide.getAllActivities()
    
    res.json({
      success: true,
      data: activities
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

export const getActivityById = async (req, res) => {
  try {
    const { id } = req.params
    
    // Implémentation pour récupérer une activité spécifique
    res.json({
      success: true,
      data: {} // À implémenter
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}