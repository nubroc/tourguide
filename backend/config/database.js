import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tourguide',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// Test de connexion
pool.getConnection()
  .then(connection => {
    console.log('✅ Connexion MySQL réussie')
    connection.release()
  })
  .catch(error => {
    console.error('❌ Erreur connexion MySQL:', error.message)
  })

export default pool