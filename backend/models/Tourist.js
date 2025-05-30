import db from '../config/database.js'
import { v4 as uuidv4 } from 'uuid'

export class Tourist {
  static async create(touristData) {
    const { user_id, country, destination, start_date, end_date, interests } = touristData
    
    const connection = await db.getConnection()
    const tourist_id = uuidv4()
    
    try {
      await connection.beginTransaction()

      // Créer le profil touriste
      await connection.execute(
        'INSERT INTO tourists (id, user_id, country, destination, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)',
        [tourist_id, user_id, country, destination, start_date, end_date]
      )

      // Ajouter les centres d'intérêt
      if (interests && interests.length > 0) {
        for (const interest of interests) {
          await connection.execute(
            'INSERT INTO tourist_interests (id, tourist_id, interest) VALUES (?, ?, ?)',
            [uuidv4(), tourist_id, interest]
          )
        }
      }

      await connection.commit()

      // Récupérer le profil créé
      const [tourist] = await connection.execute(
        'SELECT * FROM tourists WHERE id = ?',
        [tourist_id]
      )

      return tourist[0]
    } catch (error) {
      await connection.rollback()
      throw new Error(`Error creating tourist: ${error.message}`)
    } finally {
      connection.release()
    }
  }

  static async findByUserId(user_id) {
    try {
      const [tourists] = await db.query(`
        SELECT t.*,
               GROUP_CONCAT(ti.interest) as interests
        FROM tourists t
        LEFT JOIN tourist_interests ti ON t.id = ti.tourist_id
        WHERE t.user_id = ?
        GROUP BY t.id
      `, [user_id])

      if (tourists.length === 0) return null

      const tourist = tourists[0]
      tourist.interests = tourist.interests ? tourist.interests.split(',') : []
      
      return tourist
    } catch (error) {
      throw new Error(`Error finding tourist: ${error.message}`)
    }
  }
}