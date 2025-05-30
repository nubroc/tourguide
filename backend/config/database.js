import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tourguide',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4',
  timezone: 'Z'
}

class Database {
  constructor() {
    this.pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      acquireTimeout: 60000,
      timeout: 60000
    })
  }

  async query(sql, params = []) {
    try {
      const [rows] = await this.pool.execute(sql, params)
      return rows
    } catch (error) {
      console.error('Database query error:', error)
      throw error
    }
  }

  async getConnection() {
    return await this.pool.getConnection()
  }

  async close() {
    await this.pool.end()
  }
}

const db = new Database()

// Test de connexion
db.query('SELECT 1')
  .then(() => console.log('✅ Connected to MySQL database'))
  .catch(err => console.error('❌ Database connection failed:', err))

export default db