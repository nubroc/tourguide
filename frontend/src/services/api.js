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

// Intercepteur pour ajouter le token d'authentification
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

// Intercepteur pour gérer les réponses
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Services API mis à jour
export const apiServices = {
  // Test de connexion
  testConnection: () => api.get('/health'),

  // ✅ Système d'offres
  getOffers: (params = {}) => api.get('/offers', { params }),
  getOffer: (id) => api.get(`/offers/${id}`),
  createOffer: (data) => api.post('/offers', data),
  updateOffer: (id, data) => api.put(`/offers/${id}`, data),
  deleteOffer: (id) => api.delete(`/offers/${id}`),

  // Système de likes
  toggleLike: (offerId) => api.post(`/${offerId}/like`),
  getLikedOffers: (params = {}) => api.get('/users/liked-offers', { params }),

  // ✅ CORRECTION: Route guide corrigée
  getMyOffers: (params = {}) => api.get('/guide/offres', { params }),

  // Authentification
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Utilitaires
  uploadImage: (file) => {
    const formData = new FormData()
    formData.append('image', file)
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

export default api