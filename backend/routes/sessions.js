import express from 'express'
import { createSession, getUserSessions, updateSessionStatus } from '../controllers/sessionController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.post('/', authenticate, createSession)
router.get('/user', authenticate, getUserSessions)
router.patch('/:id/status', authenticate, updateSessionStatus)

export default router