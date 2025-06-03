<template>
  <div class="page">
    <div class="container">
      <div class="dashboard-container">
        <!-- Header du dashboard -->
        <div class="dashboard-header">
          <div class="user-info">
            <div class="user-avatar">
              <img v-if="user.profilePhoto" :src="userPhotoUrl" :alt="user.fullName" />
              <div v-else class="avatar-placeholder">{{ user.fullName ? user.fullName.charAt(0) : '?' }}</div>
            </div>
            <div class="user-details">
              <h1>Bienvenue, {{ user.fullName || 'Utilisateur' }}</h1>
              <p class="user-role">{{ user.role === 'guide' ? 'Guide Local' : 'Touriste' }}</p>
            </div>
          </div>
          <button @click="logout" class="btn btn-outline">Déconnexion</button>
        </div>

        <!-- Contenu du dashboard pour Guide -->
        <div v-if="user.role === 'guide'" class="dashboard-content">
          <!-- Section Mes Offres -->
          <div class="section-header">
            <h2>Mes Offres</h2>
            <button @click="showAddOfferModal = true" class="btn btn-primary">
              ➕ Ajouter une offre
            </button>
          </div>

          <!-- Statistiques rapides -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">📝</div>
              <div class="stat-info">
                <h3>{{ offers.length }}</h3>
                <p>Offres actives</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">❤️</div>
              <div class="stat-info">
                <h3>{{ totalLikes }}</h3>
                <p>Likes reçus</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">👁️</div>
              <div class="stat-info">
                <h3>{{ totalViews }}</h3>
                <p>Vues totales</p>
              </div>
            </div>
          </div>

          <!-- Filtres des offres -->
          <div class="offers-filters">
            <select v-model="selectedStatus" @change="loadOffers" class="filter-select">
              <option value="">Tous les statuts</option>
              <option value="active">Actives</option>
              <option value="inactive">Inactives</option>
              <option value="completed">Terminées</option>
            </select>
          </div>

          <!-- Loading state -->
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Chargement de vos offres...</p>
          </div>

          <!-- Empty state -->
          <div v-else-if="offers.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <h3>Aucune offre pour le moment</h3>
            <p>Commencez par créer votre première offre d'activité</p>
            <button @click="showAddOfferModal = true" class="btn btn-primary">
              Créer ma première offre
            </button>
          </div>

          <!-- Liste des offres -->
          <div v-else class="offers-grid">
            <div v-for="offer in offers" :key="offer.id" class="offer-card">
              <!-- Header de l'offre -->
              <div class="offer-header">
                <div class="offer-photo">
                  <img v-if="offer.photo_url" :src="offer.photo_url" :alt="offer.title" />
                  <div v-else class="photo-placeholder">📸</div>
                </div>
                <div class="offer-status" :class="offer.status">
                  {{ getStatusLabel(offer.status) }}
                </div>
              </div>

              <!-- Contenu de l'offre -->
              <div class="offer-content">
                <h3 class="offer-title">{{ offer.title }}</h3>
                <p class="offer-description">{{ truncateText(offer.description, 100) }}</p>
                
                <div class="offer-details">
                  <div class="detail-item">
                    <span class="detail-icon">💰</span>
                    <span class="detail-text">{{ offer.price }}€</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-icon">📅</span>
                    <span class="detail-text">{{ formatDate(offer.tour_date) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-icon">📍</span>
                    <span class="detail-text">{{ offer.location }}, {{ offer.city }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-icon">👥</span>
                    <span class="detail-text">{{ offer.current_participants }}/{{ offer.max_participants }}</span>
                  </div>
                </div>

                <!-- Langues -->
                <div class="offer-languages">
                  <span v-for="lang in offer.languages" :key="lang" class="language-tag">
                    {{ getLanguageName(lang) }}
                  </span>
                </div>

                <!-- Statistiques -->
                <div class="offer-stats">
                  <div class="stat-item">
                    <span class="stat-icon">❤️</span>
                    <span>{{ offer.likes_count || 0 }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-icon">👁️</span>
                    <span>{{ offer.views_count || 0 }}</span>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="offer-actions">
                <button @click="editOffer(offer)" class="btn-icon edit" title="Modifier">
                  ✏️
                </button>
                <button @click="toggleOfferStatus(offer)" class="btn-icon toggle" :title="offer.status === 'active' ? 'Désactiver' : 'Activer'">
                  {{ offer.status === 'active' ? '⏸️' : '▶️' }}
                </button>
                <button @click="deleteOffer(offer.id)" class="btn-icon delete" title="Supprimer">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Contenu du dashboard pour Touriste -->
        <div v-else class="dashboard-content">
          <h2>Mes Favoris</h2>
          
          <!-- Loading state -->
          <div v-if="loadingFavorites" class="loading-state">
            <div class="spinner"></div>
            <p>Chargement de vos favoris...</p>
          </div>

          <!-- Empty state favoris -->
          <div v-else-if="likedOffers.length === 0" class="empty-state">
            <div class="empty-icon">❤️</div>
            <h3>Aucun favori pour le moment</h3>
            <p>Explorez les offres et ajoutez vos activités préférées</p>
            <router-link to="/explorer" class="btn btn-primary">
              Découvrir les offres
            </router-link>
          </div>

          <!-- Liste des favoris -->
          <div v-else class="favorites-grid">
            <div v-for="offer in likedOffers" :key="offer.id" class="favorite-card">
              <div class="offer-photo">
                <img v-if="offer.photo_url" :src="offer.photo_url" :alt="offer.title" />
                <div v-else class="photo-placeholder">📸</div>
              </div>
              
              <div class="offer-content">
                <h3>{{ offer.title }}</h3>
                <p class="guide-name">Par {{ offer.guide_name }}</p>
                <p class="offer-description">{{ truncateText(offer.description, 80) }}</p>
                
                <div class="offer-details">
                  <span class="price">{{ offer.price }}€</span>
                  <span class="date">{{ formatDate(offer.tour_date) }}</span>
                  <span class="location">{{ offer.city }}</span>
                </div>
              </div>

              <div class="favorite-actions">
                <router-link :to="`/offers/${offer.id}`" class="btn btn-outline btn-sm">
                  Voir détails
                </router-link>
                <button @click="removeFavorite(offer.id)" class="btn-icon delete" title="Retirer des favoris">
                  💔
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'ajout/modification d'offre -->
    <div v-if="showAddOfferModal || showEditOfferModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditing ? 'Modifier l\'offre' : 'Créer une nouvelle offre' }}</h3>
          <button @click="closeModal" class="modal-close">✕</button>
        </div>

        <form @submit.prevent="submitOffer" class="offer-form">
          <!-- Titre et description -->
          <div class="form-group">
            <label for="title">Titre de l'offre *</label>
            <input
              type="text"
              id="title"
              v-model="offerForm.title"
              placeholder="Ex: Visite guidée du Montmartre authentique"
              required
              maxlength="255"
            />
          </div>

          <div class="form-group">
            <label for="description">Description *</label>
            <textarea
              id="description"
              v-model="offerForm.description"
              placeholder="Décrivez votre offre en détail..."
              required
              rows="4"
            ></textarea>
          </div>

          <!-- Prix et participants -->
          <div class="form-grid">
            <div class="form-group">
              <label for="price">Prix (€) *</label>
              <input
                type="number"
                id="price"
                v-model="offerForm.price"
                min="0"
                step="0.01"
                placeholder="25.00"
                required
              />
            </div>
            <div class="form-group">
              <label for="max_participants">Participants max</label>
              <input
                type="number"
                id="max_participants"
                v-model="offerForm.max_participants"
                min="1"
                max="50"
                placeholder="10"
              />
            </div>
          </div>

          <!-- Date et heure -->
          <div class="form-grid">
            <div class="form-group">
              <label for="tour_date">Date du tour *</label>
              <input
                type="date"
                id="tour_date"
                v-model="offerForm.tour_date"
                :min="minDate"
                required
              />
            </div>
            <div class="form-group">
              <label for="tour_time">Heure du tour</label>
              <input
                type="time"
                id="tour_time"
                v-model="offerForm.tour_time"
              />
            </div>
          </div>

          <!-- Lieu -->
          <div class="form-grid">
            <div class="form-group">
              <label for="location">Lieu de rendez-vous *</label>
              <input
                type="text"
                id="location"
                v-model="offerForm.location"
                placeholder="Ex: Place du Tertre"
                required
              />
            </div>
            <div class="form-group">
              <label for="city">Ville *</label>
              <input
                type="text"
                id="city"
                v-model="offerForm.city"
                placeholder="Ex: Paris"
                required
              />
            </div>
          </div>

          <!-- Photo -->
          <div class="form-group">
            <label for="photo">Photo de l'offre</label>
            <div class="photo-upload">
              <input
                type="file"
                id="photo"
                @change="handlePhotoUpload"
                accept="image/*"
                class="photo-input"
              />
              <div class="photo-preview" v-if="photoPreview">
                <img :src="photoPreview" alt="Aperçu" />
                <button type="button" @click="removePhoto" class="remove-photo">✕</button>
              </div>
              <div v-else class="photo-placeholder-upload">
                <span class="upload-icon">📸</span>
                <p>Cliquez pour ajouter une photo</p>
              </div>
            </div>
          </div>

          <!-- Langues -->
          <div class="form-group">
            <label>Langues disponibles *</label>
            <div class="languages-selector">
              <div
                v-for="language in availableLanguages"
                :key="language.code"
                class="language-item"
                :class="{ active: offerForm.languages.includes(language.code) }"
                @click="toggleLanguage(language.code)"
              >
                {{ language.flag }} {{ language.name }}
              </div>
            </div>
            <p v-if="offerForm.languages.length === 0" class="error-message">
              Sélectionnez au moins une langue
            </p>
          </div>

          <!-- Actions du formulaire -->
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn btn-outline">
              Annuler
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="!isFormValid || submitting"
            >
              <span v-if="submitting" class="spinner-border spinner-border-sm"></span>
              {{ submitting ? 'Sauvegarde...' : (isEditing ? 'Modifier' : 'Créer l\'offre') }}
            </button>
          </div>

          <!-- Message d'erreur -->
          <div v-if="formError" class="alert alert-danger">
            {{ formError }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { apiServices } from '../services/api.js'

export default {
  name: 'Dashboard',
  data() {
    return {
      user: {},
      offers: [],
      likedOffers: [],
      loading: false,
      loadingFavorites: false,
      selectedStatus: '',
      
      // Modals
      showAddOfferModal: false,
      showEditOfferModal: false,
      isEditing: false,
      editingOfferId: null,
      
      // Formulaire d'offre
      offerForm: {
        title: '',
        description: '',
        price: '',
        photo_url: '',
        tour_date: '',
        tour_time: '',
        location: '',
        city: '',
        max_participants: 10,
        languages: []
      },
      
      // Upload de photo
      photoFile: null,
      photoPreview: null,
      
      // États
      submitting: false,
      formError: null,
      
      // Langues disponibles
      availableLanguages: [
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
        { code: 'it', name: 'Italiano', flag: '🇮🇹' },
        { code: 'pt', name: 'Português', flag: '🇵🇹' },
        { code: 'ar', name: 'العربية', flag: '🇸🇦' },
        { code: 'zh', name: '中文', flag: '🇨🇳' },
        { code: 'ja', name: '日本語', flag: '🇯🇵' }
      ]
    }
  },
  
  computed: {
    userPhotoUrl() {
      return this.user.profilePhoto || '/placeholder-avatar.png'
    },
    
    totalLikes() {
      return this.offers.reduce((sum, offer) => sum + (offer.likes_count || 0), 0)
    },
    
    totalViews() {
      return this.offers.reduce((sum, offer) => sum + (offer.views_count || 0), 0)
    },
    
    minDate() {
      const today = new Date()
      return today.toISOString().split('T')[0]
    },
    
    isFormValid() {
      return this.offerForm.title.trim() &&
             this.offerForm.description.trim() &&
             this.offerForm.price > 0 &&
             this.offerForm.tour_date &&
             this.offerForm.location.trim() &&
             this.offerForm.city.trim() &&
             this.offerForm.languages.length > 0
    }
  },
  
  mounted() {
    this.loadUserData()
  },
  
  methods: {
    loadUserData() {
      const userData = localStorage.getItem('user')
      if (userData) {
        this.user = JSON.parse(userData)
        
        if (this.user.role === 'guide') {
          this.loadOffers()
        } else {
          this.loadLikedOffers()
        }
      }
    },
    
    // ✅ CORRECTION - loadOffers
    async loadOffers() {
      try {
        this.loading = true
        
        const response = await apiServices.getGuideOffers({
          status: this.selectedStatus
        })
        
        console.log('Response loadOffers:', response)
        
        if (response.success) {
          this.offers = response.data || []
        } else {
          console.error('Erreur API:', response.message)
          this.offers = []
        }
        
      } catch (error) {
        console.error('Erreur chargement offres:', error)
        this.offers = []
        
        // Afficher l'erreur à l'utilisateur
        alert(`Erreur: ${error.response?.data?.message || error.message}`)
      } finally {
        this.loading = false
      }
    },
    
    // ✅ CORRECTION - loadLikedOffers
    async loadLikedOffers() {
      try {
        this.loadingFavorites = true
        
        const response = await apiServices.getLikedOffers()
        
        console.log('Response loadLikedOffers:', response)
        
        if (response.success) {
          this.likedOffers = response.data?.offers || []
        } else {
          console.error('Erreur API favoris:', response.message)
          this.likedOffers = []
        }
        
      } catch (error) {
        console.error('Erreur chargement favoris:', error)
        this.likedOffers = []
      } finally {
        this.loadingFavorites = false
      }
    },
    
    // Gestion du formulaire d'offre
    openAddOfferModal() {
      this.resetForm()
      this.showAddOfferModal = true
      this.isEditing = false
    },
    
    editOffer(offer) {
      this.isEditing = true
      this.editingOfferId = offer.id
      this.showEditOfferModal = true
      
      // Pré-remplir le formulaire
      this.offerForm = {
        title: offer.title,
        description: offer.description,
        price: offer.price,
        photo_url: offer.photo_url,
        tour_date: offer.tour_date,
        tour_time: offer.tour_time,
        location: offer.location,
        city: offer.city,
        max_participants: offer.max_participants,
        languages: [...(offer.languages || [])]
      }
      
      if (offer.photo_url) {
        this.photoPreview = offer.photo_url
      }
    },
    
    closeModal() {
      this.showAddOfferModal = false
      this.showEditOfferModal = false
      this.resetForm()
    },
    
    resetForm() {
      this.offerForm = {
        title: '',
        description: '',
        price: '',
        photo_url: '',
        tour_date: '',
        tour_time: '',
        location: '',
        city: '',
        max_participants: 10,
        languages: []
      }
      this.photoFile = null
      this.photoPreview = null
      this.formError = null
      this.isEditing = false
      this.editingOfferId = null
    },
    
    // ✅ CORRECTION - submitOffer
    async submitOffer() {
      if (!this.isFormValid) return
      
      try {
        this.submitting = true
        this.formError = null
        
        console.log('Données du formulaire:', this.offerForm)
        
        // Upload de la photo si nécessaire
        if (this.photoFile) {
          const photoUrl = await this.uploadPhoto()
          this.offerForm.photo_url = photoUrl
        }
        
        let response
        if (this.isEditing) {
          console.log('Modification offre:', this.editingOfferId)
          response = await apiServices.updateOffer(this.editingOfferId, this.offerForm)
        } else {
          console.log('Création nouvelle offre')
          response = await apiServices.createOffer(this.offerForm)
        }
        
        console.log('Response submitOffer:', response)
        
        if (response.success) {
          this.closeModal()
          this.loadOffers() // Recharger la liste
          
          // Notification de succès
          alert(this.isEditing ? 'Offre modifiée avec succès' : 'Offre créée avec succès')
        } else {
          this.formError = response.message || 'Erreur lors de la sauvegarde'
        }
        
      } catch (error) {
        console.error('Erreur soumission offre:', error)
        this.formError = error.response?.data?.message || 'Erreur lors de la sauvegarde'
      } finally {
        this.submitting = false
      }
    },
    
    async uploadPhoto() {
      // Simulation d'upload - à remplacer par votre service d'upload
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          resolve(e.target.result)
        }
        reader.readAsDataURL(this.photoFile)
      })
    },
    
    handlePhotoUpload(event) {
      const file = event.target.files[0]
      if (file) {
        // Validation du fichier
        if (file.size > 5 * 1024 * 1024) { // 5MB max
          alert('La photo ne doit pas dépasser 5MB')
          return
        }
        
        if (!file.type.startsWith('image/')) {
          alert('Veuillez sélectionner une image')
          return
        }
        
        this.photoFile = file
        
        // Créer l'aperçu
        const reader = new FileReader()
        reader.onload = (e) => {
          this.photoPreview = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },
    
    removePhoto() {
      this.photoFile = null
      this.photoPreview = null
      this.offerForm.photo_url = ''
    },
    
    toggleLanguage(languageCode) {
      const index = this.offerForm.languages.indexOf(languageCode)
      if (index > -1) {
        this.offerForm.languages.splice(index, 1)
      } else {
        this.offerForm.languages.push(languageCode)
      }
    },
    
    async toggleOfferStatus(offer) {
      try {
        const newStatus = offer.status === 'active' ? 'inactive' : 'active'
        
        const response = await apiServices.updateOffer(offer.id, {
          status: newStatus
        })
        
        if (response.success) {
          offer.status = newStatus
          alert(`Offre ${newStatus === 'active' ? 'activée' : 'désactivée'}`)
        }
      } catch (error) {
        console.error('Erreur changement statut:', error)
        alert('Erreur lors du changement de statut')
      }
    },
    
    async deleteOffer(offerId) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) return
      
      try {
        const response = await apiServices.deleteOffer(offerId)
        
        if (response.success) {
          this.offers = this.offers.filter(offer => offer.id !== offerId)
          alert('Offre supprimée avec succès')
        }
      } catch (error) {
        console.error('Erreur suppression:', error)
        alert('Erreur lors de la suppression')
      }
    },
    
    async removeFavorite(offerId) {
      try {
        const response = await apiServices.toggleLike(offerId)
        
        if (response.success) {
          this.likedOffers = this.likedOffers.filter(offer => offer.id !== offerId)
          alert('Retiré des favoris')
        }
      } catch (error) {
        console.error('Erreur retrait favori:', error)
      }
    },
    
    // Utilitaires
    truncateText(text, length) {
      if (!text) return ''
      return text.length > length ? text.substring(0, length) + '...' : text
    },
    
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    
    getLanguageName(code) {
      const lang = this.availableLanguages.find(l => l.code === code)
      return lang ? `${lang.flag} ${lang.name}` : code
    },
    
    getStatusLabel(status) {
      const labels = {
        active: 'Active',
        inactive: 'Inactive',
        completed: 'Terminée',
        cancelled: 'Annulée'
      }
      return labels[status] || status
    },
    
    logout() {
      localStorage.removeItem('user')
      localStorage.removeItem('authToken')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.page {
  min-height: calc(100vh - 80px);
  padding: var(--spacing-lg);
  background: var(--background-gray);
}

.container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-container {
  padding: var(--spacing-xl);
}

/* Header */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xxl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 2px solid var(--border-light);
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-large);
  box-shadow: var(--shadow-light);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.user-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--primary-color);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: var(--font-weight-bold);
}

.user-details h1 {
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--text-primary);
  font-size: 1.75rem;
  font-weight: var(--font-weight-bold);
}

.user-role {
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0;
  font-weight: var(--font-weight-medium);
}

/* Section Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.section-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: var(--font-weight-semibold);
}

/* Statistiques */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-large);
  box-shadow: var(--shadow-light);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.stat-icon {
  font-size: 2rem;
  opacity: 0.8;
}

.stat-info h3 {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: 1.5rem;
  font-weight: var(--font-weight-bold);
  color: var(--primary-color);
}

.stat-info p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* Filtres */
.offers-filters {
  margin-bottom: var(--spacing-lg);
}

.filter-select {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background: white;
  font-size: 0.9rem;
}

/* Loading & Empty States */
.loading-state, .empty-state {
  text-align: center;
  padding: var(--spacing-xxl);
  background: white;
  border-radius: var(--border-radius-large);
  box-shadow: var(--shadow-light);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-light);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto var(--spacing-md);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
  opacity: 0.5;
}

.empty-state h3 {
  margin-bottom: var(--spacing-md);
  color: var(--text-secondary);
}

.empty-state p {
  color: var(--text-light);
  margin-bottom: var(--spacing-xl);
}

/* Grilles d'offres */
.offers-grid, .favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-lg);
}

/* Cards d'offres */
.offer-card, .favorite-card {
  background: white;
  border-radius: var(--border-radius-large);
  box-shadow: var(--shadow-light);
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.offer-card:hover, .favorite-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-large);
}

.offer-header {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.offer-photo, .offer-photo {
  width: 100%;
  height: 100%;
}

.offer-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  width: 100%;
  height: 100%;
  background: var(--background-gray);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: var(--text-light);
}

.offer-status {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-small);
  font-size: 0.8rem;
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
}

.offer-status.active {
  background: var(--success-color);
  color: white;
}

.offer-status.inactive {
  background: var(--text-light);
  color: white;
}

.offer-status.completed {
  background: var(--secondary-color);
  color: white;
}

.offer-content {
  padding: var(--spacing-lg);
}

.offer-title {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: 1.2rem;
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  line-height: 1.3;
}

.offer-description {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--text-secondary);
  line-height: 1.5;
  font-size: 0.9rem;
}

.guide-name {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--primary-color);
  font-weight: var(--font-weight-medium);
  font-size: 0.9rem;
}

/* Détails des offres */
.offer-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 0.9rem;
}

.detail-icon {
  width: 16px;
  text-align: center;
}

.detail-text {
  color: var(--text-secondary);
}

/* Langues */
.offer-languages {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
}

.language-tag {
  background: var(--background-gray);
  color: var(--text-secondary);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: var(--font-weight-medium);
}

/* Statistiques des offres */
.offer-stats {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.stat-icon {
  font-size: 0.8rem;
}

/* Actions */
.offer-actions, .favorite-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--border-light);
  background: var(--background-gray);
}

.btn-icon {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-small);
  transition: background-color 0.2s ease;
}

.btn-icon:hover {
  background: rgba(0, 0, 0, 0.1);
}

.btn-icon.delete:hover {
  background: rgba(193, 53, 21, 0.1);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
}

.modal-content {
  background: white;
  border-radius: var(--border-radius-large);
  box-shadow: var(--shadow-large);
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: var(--font-weight-semibold);
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  padding: var(--spacing-xs);
}

.modal-close:hover {
  color: var(--text-primary);
}

/* Formulaire */
.offer-form {
  padding: var(--spacing-lg);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(255, 90, 95, 0.1);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}

/* Upload de photo */
.photo-upload {
  border: 2px dashed var(--border-color);
  border-radius: var(--border-radius);
  padding: var(--spacing-lg);
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s ease;
  position: relative;
}

.photo-upload:hover {
  border-color: var(--primary-color);
}

.photo-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.photo-preview {
  position: relative;
  max-width: 200px;
  margin: 0 auto;
}

.photo-preview img {
  width: 100%;
  height: auto;
  border-radius: var(--border-radius);
}

.remove-photo {
  position: absolute;
  top: -10px;
  right: -10px;
  background: var(--error-color);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 0.8rem;
}

.photo-placeholder-upload {
  padding: var(--spacing-xl);
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
  opacity: 0.5;
}

/* Sélecteur de langues */
.languages-selector {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.language-item {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  background: white;
  user-select: none;
}

.language-item:hover {
  border-color: var(--primary-color);
  background: rgba(255, 90, 95, 0.05);
}

.language-item.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

/* Actions du modal */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-light);
}

/* Messages d'erreur */
.error-message {
  color: var(--error-color);
  font-size: 0.85rem;
  margin-top: var(--spacing-xs);
}

.alert {
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  margin-top: var(--spacing-lg);
}

.alert-danger {
  background: rgba(193, 53, 21, 0.1);
  color: var(--error-color);
  border: 1px solid rgba(193, 53, 21, 0.2);
}

/* Spinner */
.spinner-border {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 0.125em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border 0.75s linear infinite;
  margin-right: var(--spacing-sm);
}

.spinner-border-sm {
  width: 0.875rem;
  height: 0.875rem;
}

@keyframes spinner-border {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-container {
    padding: var(--spacing-md);
  }
  
  .dashboard-header {
    flex-direction: column;
    gap: var(--spacing-lg);
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .offers-grid, .favorites-grid {
    grid-template-columns: 1fr;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    margin: var(--spacing-md);
    max-width: calc(100vw - 2 * var(--spacing-md));
  }
}

@media (max-width: 480px) {
  .offer-actions {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .languages-selector {
    gap: var(--spacing-xs);
  }
  
  .language-item {
    font-size: 0.8rem;
    padding: var(--spacing-xs) var(--spacing-sm);
  }
}
</style>