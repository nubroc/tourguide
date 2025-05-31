import axios from 'axios'

// Configuration de base d'Axios
const API_BASE_URL = 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Intercepteur pour ajouter le token d'authentification automatiquement
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Intercepteur pour gérer les réponses et erreurs
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('API Error:', error)
    
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      // Rediriger vers login si nécessaire
    }
    
    return Promise.reject(error)
  }
)

// Services API
export const apiServices = {
  // Test de connexion
  health: () => api.get('/health'),
  
  // Authentication
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Activities
  getActivities: () => api.get('/activities'),
  getActivityById: (id) => api.get(`/activities/${id}`),
  
  // Sessions
  createSession: (sessionData) => api.post('/sessions', sessionData),
  getUserSessions: (role) => api.get(`/sessions/user?role=${role}`),
  updateSessionStatus: (id, status) => api.patch(`/sessions/${id}/status`, { status })
}

export default api