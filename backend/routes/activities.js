import express from 'express'
import { getAllActivities, getActivityById } from '../controllers/activityController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.get('/', getAllActivities)
router.get('/:id', authenticate, getActivityById)

export default router