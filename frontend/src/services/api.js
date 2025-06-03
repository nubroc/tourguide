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

// Fonction utilitaire pour générer des IDs uniques
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Fonction utilitaire pour obtenir les données du localStorage
const getLocalStorageData = (key, defaultValue = []) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Erreur lecture localStorage ${key}:`, error);
    return defaultValue;
  }
};

// Fonction utilitaire pour sauvegarder dans le localStorage
const setLocalStorageData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Erreur écriture localStorage ${key}:`, error);
    return false;
  }
};

// Services API mis à jour
export const apiServices = {
  // Test de connexion
  testConnection: () => api.get('/health'),

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
  },

  // ✅ SYSTÈME D'OFFRES (localStorage) - UNIFIÉ
  
  // Récupérer toutes les offres (pour Explorer)
  getOffers: (params = {}) => {
    return new Promise((resolve) => {
      try {
        let allOffers = getLocalStorageData('offers', []);
        
        // Filtrer seulement les offres actives
        allOffers = allOffers.filter(offer => offer.status === 'active');
        
        // Appliquer les filtres de recherche
        if (params.search) {
          const search = params.search.toLowerCase();
          allOffers = allOffers.filter(offer =>
            offer.title.toLowerCase().includes(search) ||
            offer.description.toLowerCase().includes(search) ||
            offer.city.toLowerCase().includes(search) ||
            offer.location.toLowerCase().includes(search)
          );
        }
        
        if (params.city) {
          allOffers = allOffers.filter(offer => offer.city === params.city);
        }
        
        if (params.dateFrom) {
          allOffers = allOffers.filter(offer => offer.tour_date >= params.dateFrom);
        }
        
        if (params.dateTo) {
          allOffers = allOffers.filter(offer => offer.tour_date <= params.dateTo);
        }
        
        if (params.priceMin) {
          allOffers = allOffers.filter(offer => offer.price >= parseFloat(params.priceMin));
        }
        
        if (params.priceMax) {
          allOffers = allOffers.filter(offer => offer.price <= parseFloat(params.priceMax));
        }
        
        if (params.languages) {
          const langs = params.languages.split(',');
          allOffers = allOffers.filter(offer => 
            langs.some(lang => offer.languages.includes(lang))
          );
        }
        
        // Tri
        const sortBy = params.sort || 'date';
        const sortOrder = params.order || 'asc';
        
        allOffers.sort((a, b) => {
          let comparison = 0;
          
          switch (sortBy) {
            case 'price':
              comparison = a.price - b.price;
              break;
            case 'popularity':
              comparison = (b.likes_count || 0) - (a.likes_count || 0);
              break;
            case 'date':
            default:
              comparison = new Date(a.tour_date) - new Date(b.tour_date);
              break;
          }
          
          return sortOrder === 'desc' ? -comparison : comparison;
        });
        
        // Pagination simple
        const page = parseInt(params.page) || 1;
        const limit = parseInt(params.limit) || 20;
        const total = allOffers.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        const paginatedOffers = allOffers.slice(startIndex, endIndex);
        
        resolve({
          success: true,
          data: {
            offers: paginatedOffers,
            pagination: {
              page,
              limit,
              total,
              totalPages
            }
          }
        });
        
      } catch (error) {
        console.error('Erreur getOffers localStorage:', error);
        resolve({
          success: false,
          message: 'Erreur lors du chargement des offres',
          data: { offers: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }
        });
      }
    });
  },

  // Récupérer une offre par ID
  getOffer: (id) => {
    return new Promise((resolve) => {
      try {
        const allOffers = getLocalStorageData('offers', []);
        const offer = allOffers.find(offer => offer.id === id);
        
        if (offer) {
          resolve({
            success: true,
            data: offer
          });
        } else {
          resolve({
            success: false,
            message: 'Offre non trouvée'
          });
        }
      } catch (error) {
        console.error('Erreur getOffer localStorage:', error);
        resolve({
          success: false,
          message: 'Erreur lors du chargement de l\'offre'
        });
      }
    });
  },

  // Récupérer les offres d'un guide (Dashboard)
  getGuideOffers: (params = {}) => {
    return new Promise((resolve) => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const allOffers = getLocalStorageData('offers', []);
        
        // Filtrer les offres du guide connecté
        let guideOffers = allOffers.filter(offer => offer.guide_id === user.id);
        
        // Appliquer les filtres
        if (params.status) {
          guideOffers = guideOffers.filter(offer => offer.status === params.status);
        }
        
        // Trier les offres (par date de création par défaut)
        guideOffers.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        resolve({
          success: true,
          data: guideOffers
        });
      } catch (error) {
        console.error('Erreur getGuideOffers localStorage:', error);
        resolve({
          success: false,
          message: 'Erreur lors du chargement des offres',
          data: []
        });
      }
    });
  },

  // Créer une offre
  createOffer: (offerData) => {
    return new Promise((resolve) => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const allOffers = getLocalStorageData('offers', []);
        
        // Créer la nouvelle offre
        const newOffer = {
          id: generateId(),
          guide_id: user.id,
          guide_name: user.fullName,
          guide_photo: user.profilePhoto || null,
          title: offerData.title,
          description: offerData.description,
          price: parseFloat(offerData.price),
          photo_url: offerData.photo_url || null,
          tour_date: offerData.tour_date,
          tour_time: offerData.tour_time || null,
          location: offerData.location,
          city: offerData.city,
          max_participants: parseInt(offerData.max_participants) || 10,
          current_participants: 0,
          languages: offerData.languages || [],
          status: 'active',
          likes_count: 0,
          views_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Ajouter la nouvelle offre
        allOffers.push(newOffer);
        
        // Sauvegarder dans localStorage
        if (setLocalStorageData('offers', allOffers)) {
          resolve({
            success: true,
            message: 'Offre créée avec succès',
            data: newOffer
          });
        } else {
          throw new Error('Erreur lors de la sauvegarde');
        }
        
      } catch (error) {
        console.error('Erreur createOffer localStorage:', error);
        resolve({
          success: false,
          message: error.message || 'Erreur lors de la création de l\'offre'
        });
      }
    });
  },

  // Modifier une offre
  updateOffer: (offerId, offerData) => {
    return new Promise((resolve) => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const allOffers = getLocalStorageData('offers', []);
        
        // Trouver l'index de l'offre à modifier
        const offerIndex = allOffers.findIndex(offer => 
          offer.id === offerId && offer.guide_id === user.id
        );
        
        if (offerIndex === -1) {
          throw new Error('Offre non trouvée ou non autorisée');
        }
        
        // Mettre à jour l'offre
        const updatedOffer = {
          ...allOffers[offerIndex],
          ...offerData,
          updated_at: new Date().toISOString()
        };
        
        // Si price ou max_participants sont fournis, les convertir
        if (offerData.price !== undefined) {
          updatedOffer.price = parseFloat(offerData.price);
        }
        if (offerData.max_participants !== undefined) {
          updatedOffer.max_participants = parseInt(offerData.max_participants);
        }
        
        allOffers[offerIndex] = updatedOffer;
        
        // Sauvegarder dans localStorage
        if (setLocalStorageData('offers', allOffers)) {
          resolve({
            success: true,
            message: 'Offre modifiée avec succès',
            data: updatedOffer
          });
        } else {
          throw new Error('Erreur lors de la sauvegarde');
        }
        
      } catch (error) {
        console.error('Erreur updateOffer localStorage:', error);
        resolve({
          success: false,
          message: error.message || 'Erreur lors de la modification de l\'offre'
        });
      }
    });
  },

  // Supprimer une offre
  deleteOffer: (offerId) => {
    return new Promise((resolve) => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const allOffers = getLocalStorageData('offers', []);
        
        // Trouver l'index de l'offre à supprimer
        const offerIndex = allOffers.findIndex(offer => 
          offer.id === offerId && offer.guide_id === user.id
        );
        
        if (offerIndex === -1) {
          throw new Error('Offre non trouvée ou non autorisée');
        }
        
        // Supprimer l'offre
        allOffers.splice(offerIndex, 1);
        
        // Sauvegarder dans localStorage
        if (setLocalStorageData('offers', allOffers)) {
          resolve({
            success: true,
            message: 'Offre supprimée avec succès'
          });
        } else {
          throw new Error('Erreur lors de la sauvegarde');
        }
        
      } catch (error) {
        console.error('Erreur deleteOffer localStorage:', error);
        resolve({
          success: false,
          message: error.message || 'Erreur lors de la suppression de l\'offre'
        });
      }
    });
  },

  // ✅ SYSTÈME DE LIKES (localStorage)
  
  // Récupérer les offres aimées
  getLikedOffers: () => {
    return new Promise((resolve) => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userLikes = getLocalStorageData(`likes_${user.id}`, []);
        const allOffers = getLocalStorageData('offers', []);
        
        // Récupérer les offres likées
        const likedOffers = allOffers.filter(offer => 
          userLikes.includes(offer.id) && offer.status === 'active'
        );
        
        resolve({
          success: true,
          data: {
            offers: likedOffers
          }
        });
        
      } catch (error) {
        console.error('Erreur getLikedOffers localStorage:', error);
        resolve({
          success: false,
          message: 'Erreur lors du chargement des favoris',
          data: { offers: [] }
        });
      }
    });
  },

  // Toggle like sur une offre
  toggleLike: (offerId) => {
    return new Promise((resolve) => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userLikes = getLocalStorageData(`likes_${user.id}`, []);
        const allOffers = getLocalStorageData('offers', []);
        
        const isLiked = userLikes.includes(offerId);
        let updatedLikes;
        
        if (isLiked) {
          // Retirer le like
          updatedLikes = userLikes.filter(id => id !== offerId);
        } else {
          // Ajouter le like
          updatedLikes = [...userLikes, offerId];
        }
        
        // Mettre à jour le compteur de likes dans l'offre
        const offerIndex = allOffers.findIndex(offer => offer.id === offerId);
        if (offerIndex !== -1) {
          if (isLiked) {
            allOffers[offerIndex].likes_count = Math.max((allOffers[offerIndex].likes_count || 0) - 1, 0);
          } else {
            allOffers[offerIndex].likes_count = (allOffers[offerIndex].likes_count || 0) + 1;
          }
          setLocalStorageData('offers', allOffers);
        }
        
        // Sauvegarder les likes de l'utilisateur
        setLocalStorageData(`likes_${user.id}`, updatedLikes);
        
        resolve({
          success: true,
          data: {
            liked: !isLiked
          }
        });
        
      } catch (error) {
        console.error('Erreur toggleLike localStorage:', error);
        resolve({
          success: false,
          message: 'Erreur lors de la gestion du favori'
        });
      }
    });
  }
}

export default api