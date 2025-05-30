import db from '../config/database.js'
import { v4 as uuidv4 } from 'uuid'

export class Guide {
  static async create(guideData) {
    const { user_id, cities, activities, availability, socialLinks } = guideData
    
    const connection = await db.getConnection()
    const guide_id = uuidv4()
    
    try {
      await connection.beginTransaction()

      // Créer le profil guide
      await connection.execute(
        'INSERT INTO guides (id, user_id, cities, website_url, instagram_url, facebook_url) VALUES (?, ?, ?, ?, ?, ?)',
        [
          guide_id, 
          user_id, 
          cities, 
          socialLinks?.website || null,
          socialLinks?.instagram || null,
          socialLinks?.facebook || null
        ]
      )

      // Ajouter les activités
      if (activities && activities.length > 0) {
        for (const activity of activities) {
          const activity_id = uuidv4()
          
          await connection.execute(
            'INSERT INTO activities (id, guide_id, title, description, price, duration) VALUES (?, ?, ?, ?, ?, ?)',
            [activity_id, guide_id, activity.title, activity.description, activity.price, activity.duration]
          )

          // Ajouter les langues de l'activité
          if (activity.languages && activity.languages.length > 0) {
            for (const lang of activity.languages) {
              await connection.execute(
                'INSERT INTO activity_languages (id, activity_id, language_code) VALUES (?, ?, ?)',
                [uuidv4(), activity_id, lang]
              )
            }
          }
        }
      }

      // Ajouter les disponibilités
      if (availability) {
        const dayMapping = {
          'Lundi': 1, 'Mardi': 2, 'Mercredi': 3, 'Jeudi': 4,
          'Vendredi': 5, 'Samedi': 6, 'Dimanche': 7
        }

        for (const [day, data] of Object.entries(availability)) {
          if (data.available) {
            await connection.execute(
              'INSERT INTO guide_availability (id, guide_id, day_of_week, start_time, end_time, is_available) VALUES (?, ?, ?, ?, ?, ?)',
              [uuidv4(), guide_id, dayMapping[day], data.start, data.end, true]
            )
          }
        }
      }

      await connection.commit()

      // Récupérer le profil créé
      const [guide] = await connection.execute(
        'SELECT * FROM guides WHERE id = ?',
        [guide_id]
      )

      return guide[0]
    } catch (error) {
      await connection.rollback()
      throw new Error(`Error creating guide: ${error.message}`)
    } finally {
      connection.release()
    }
  }

  static async findByUserId(user_id) {
    try {
      const [guides] = await db.query(`
        SELECT g.*,
               JSON_ARRAYAGG(
                 JSON_OBJECT(
                   'id', a.id,
                   'title', a.title,
                   'description', a.description,
                   'price', a.price,
                   'duration', a.duration,
                   'languages', (
                     SELECT JSON_ARRAYAGG(al.language_code) 
                     FROM activity_languages al 
                     WHERE al.activity_id = a.id
                   )
                 )
               ) as activities,
               JSON_ARRAYAGG(
                 JSON_OBJECT(
                   'day_of_week', ga.day_of_week,
                   'start_time', ga.start_time,
                   'end_time', ga.end_time,
                   'is_available', ga.is_available
                 )
               ) as availability
        FROM guides g
        LEFT JOIN activities a ON g.id = a.guide_id
        LEFT JOIN guide_availability ga ON g.id = ga.guide_id
        WHERE g.user_id = ?
        GROUP BY g.id
      `, [user_id])

      return guides.length > 0 ? guides[0] : null
    } catch (error) {
      throw new Error(`Error finding guide: ${error.message}`)
    }
  }

  static async getAllActivities() {
    try {
      const activities = await db.query(`
        SELECT a.*, 
               g.cities,
               u.full_name as guide_name,
               u.profile_photo_url,
               JSON_ARRAYAGG(al.language_code) as languages
        FROM activities a
        JOIN guides g ON a.guide_id = g.id
        JOIN users u ON g.user_id = u.id
        LEFT JOIN activity_languages al ON a.id = al.activity_id
        GROUP BY a.id
        ORDER BY a.created_at DESC
      `)

      return activities.map(activity => ({
        ...activity,
        languages: activity.languages ? activity.languages.filter(l => l !== null) : []
      }))
    } catch (error) {
      throw new Error(`Error fetching activities: ${error.message}`)
    }
  }
}