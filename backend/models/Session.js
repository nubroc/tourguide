import db from '../config/database.js'
import { v4 as uuidv4 } from 'uuid'

export class Session {
  static async create(sessionData) {
    const { tourist_id, activity_id, guide_id, session_date, session_time, message } = sessionData
    const session_id = uuidv4()
    
    try {
      await db.query(
        'INSERT INTO sessions (id, tourist_id, activity_id, guide_id, session_date, session_time, message, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [session_id, tourist_id, activity_id, guide_id, session_date, session_time, message, 'pending']
      )

      const [session] = await db.query(
        'SELECT * FROM sessions WHERE id = ?',
        [session_id]
      )

      return session[0]
    } catch (error) {
      throw new Error(`Error creating session: ${error.message}`)
    }
  }

  static async findByTouristId(tourist_id) {
    try {
      return await db.query(`
        SELECT s.*,
               a.title as activity_title,
               a.description as activity_description,
               a.price as activity_price,
               a.duration as activity_duration,
               u.full_name as guide_name,
               u.profile_photo_url as guide_photo
        FROM sessions s
        JOIN activities a ON s.activity_id = a.id
        JOIN guides g ON s.guide_id = g.id
        JOIN users u ON g.user_id = u.id
        WHERE s.tourist_id = ?
        ORDER BY s.created_at DESC
      `, [tourist_id])
    } catch (error) {
      throw new Error(`Error finding sessions: ${error.message}`)
    }
  }

  static async findByGuideId(guide_id) {
    try {
      return await db.query(`
        SELECT s.*,
               a.title as activity_title,
               a.description as activity_description,
               a.price as activity_price,
               a.duration as activity_duration,
               u.full_name as tourist_name,
               u.profile_photo_url as tourist_photo
        FROM sessions s
        JOIN activities a ON s.activity_id = a.id
        JOIN tourists t ON s.tourist_id = t.id
        JOIN users u ON t.user_id = u.id
        WHERE s.guide_id = ?
        ORDER BY s.created_at DESC
      `, [guide_id])
    } catch (error) {
      throw new Error(`Error finding sessions: ${error.message}`)
    }
  }

  static async updateStatus(session_id, status) {
    try {
      await db.query(
        'UPDATE sessions SET status = ? WHERE id = ?',
        [status, session_id]
      )

      const [session] = await db.query(
        'SELECT * FROM sessions WHERE id = ?',
        [session_id]
      )

      return session[0]
    } catch (error) {
      throw new Error(`Error updating session: ${error.message}`)
    }
  }
}