import db from '../config/database.js'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

export class User {
  static async create(userData) {
    const { email, password, full_name, role, languages } = userData
    
    // Hasher le mot de passe
    const password_hash = await bcrypt.hash(password, 12)
    const user_id = uuidv4()
    
    const connection = await db.getConnection()
    
    try {
      await connection.beginTransaction()

      // Créer l'utilisateur
      await connection.execute(
        'INSERT INTO users (id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)',
        [user_id, email, password_hash, full_name, role]
      )

      // Ajouter les langues
      if (languages && languages.length > 0) {
        for (const lang of languages) {
          await connection.execute(
            'INSERT INTO user_languages (id, user_id, language_code) VALUES (?, ?, ?)',
            [uuidv4(), user_id, lang]
          )
        }
      }

      await connection.commit()

      // Récupérer l'utilisateur créé
      const [user] = await connection.execute(
        'SELECT id, email, full_name, role, created_at FROM users WHERE id = ?',
        [user_id]
      )

      return user[0]
    } catch (error) {
      await connection.rollback()
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Un compte avec cet email existe déjà')
      }
      throw new Error(`Error creating user: ${error.message}`)
    } finally {
      connection.release()
    }
  }

  static async findByEmail(email) {
    try {
      const [users] = await db.query(`
        SELECT u.*, 
               GROUP_CONCAT(ul.language_code) as languages
        FROM users u
        LEFT JOIN user_languages ul ON u.id = ul.user_id
        WHERE u.email = ?
        GROUP BY u.id
      `, [email])

      if (users.length === 0) return null

      const user = users[0]
      user.languages = user.languages ? user.languages.split(',') : []
      
      return user
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`)
    }
  }

  static async findById(id) {
    try {
      const [users] = await db.query(`
        SELECT u.*, 
               GROUP_CONCAT(ul.language_code) as languages
        FROM users u
        LEFT JOIN user_languages ul ON u.id = ul.user_id
        WHERE u.id = ?
        GROUP BY u.id
      `, [id])

      if (users.length === 0) return null

      const user = users[0]
      user.languages = user.languages ? user.languages.split(',') : []
      
      return user
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`)
    }
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword)
  }
}