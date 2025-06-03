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
    
    // ✅ CORRECTION - Gestion de l'upload de photo
    async uploadPhoto() {
      if (!this.photoFile) return null;
      
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          // Stocker l'image en base64 dans localStorage
          const imageData = e.target.result;
          
          // Optionnel: Compresser l'image si elle est trop grosse
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Redimensionner si nécessaire (max 800px)
            const maxWidth = 800;
            const maxHeight = 600;
            let { width, height } = img;
            
            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width *= ratio;
              height *= ratio;
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convertir en base64 avec compression
            const compressedImage = canvas.toDataURL('image/jpeg', 0.8);
            resolve(compressedImage);
          };
          img.src = imageData;
        };
        reader.readAsDataURL(this.photoFile);
      });
    },
    
    // ✅ CORRECTION - submitOffer avec gestion photo
    async submitOffer() {
      if (!this.isFormValid) return;
      
      try {
        this.submitting = true;
        this.formError = null;
        
        // Upload de la photo si nécessaire
        if (this.photoFile) {
          console.log('Upload de la photo...');
          const photoUrl = await this.uploadPhoto();
          this.offerForm.photo_url = photoUrl;
        }
        
        let response;
        if (this.isEditing) {
          console.log('Modification offre:', this.editingOfferId);
          response = await apiServices.updateOffer(this.editingOfferId, this.offerForm);
        } else {
          console.log('Création nouvelle offre');
          response = await apiServices.createOffer(this.offerForm);
        }
        
        console.log('Response submitOffer:', response);
        
        if (response.success) {
          this.closeModal();
          await this.loadOffers(); // Recharger la liste
          
          // Notification de succès
          alert(this.isEditing ? 'Offre modifiée avec succès!' : 'Offre créée avec succès!');
        } else {
          this.formError = response.message || 'Erreur lors de la sauvegarde';
        }
        
      } catch (error) {
        console.error('Erreur soumission offre:', error);
        this.formError = 'Erreur lors de la sauvegarde. Veuillez réessayer.';
      } finally {
        this.submitting = false;
      }
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
    }
  }
}
</script>

<style scoped>
/* Variables CSS pour cohérence avec le design Airbnb */
:root {
  --primary-color: #ff5a5f;
  --primary-hover: #e0484d;
  --text-primary: #222222;
  --text-secondary: #717171;
  --text-light: #b0b0b0;
  --border-color: #dddddd;
  --border-light: #f0f0f0;
  --background-gray: #f7f7f7;
  --background-light: #ffffff;
  --shadow-light: 0 1px 2px rgba(0, 0, 0, 0.08);
  --shadow-medium: 0 2px 16px rgba(0, 0, 0, 0.12);
  --shadow-strong: 0 6px 20px rgba(0, 0, 0, 0.15);
  --border-radius-sm: 8px;
  --border-radius: 12px;
  --border-radius-lg: 16px;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-xxl: 48px;
}

.page {
  background: var(--background-gray);
  min-height: 100vh;
  padding: var(--spacing-lg) 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

/* Header du Dashboard */
.dashboard-header {
  background: var(--background-light);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-light);
  border: 1px solid var(--border-light);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.user-avatar {
  position: relative;
}

.user-avatar img,
.avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 600;
}

.user-details h1 {
  color: var(--text-primary);
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-xs) 0;
  line-height: 1.2;
}

.user-role {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin: 0;
  font-weight: 400;
}

/* Section Headers */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.section-header h2 {
  color: var(--text-primary);
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  background: var(--background-light);
  border-radius: var(--border-radius);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-light);
  border: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  transition: all 0.2s ease;
}

.stat-card:hover {
  box-shadow: var(--shadow-medium);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 90, 95, 0.1);
  border-radius: var(--border-radius-sm);
}

.stat-info h3 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  line-height: 1;
}

.stat-info p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
  font-weight: 500;
}

/* Filtres */
.offers-filters {
  margin-bottom: var(--spacing-lg);
}

.filter-select {
  background: var(--background-light);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: 1rem;
  color: var(--text-primary);
  min-width: 200px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-select:hover,
.filter-select:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 90, 95, 0.1);
}

/* États de chargement et vides */
.loading-state,
.empty-state {
  text-align: center;
  padding: var(--spacing-xxl);
  background: var(--background-light);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-light);
  border: 1px solid var(--border-light);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-light);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto var(--spacing-lg) auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
  opacity: 0.6;
}

.empty-state h3 {
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-md) 0;
}

.empty-state p {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin: 0 0 var(--spacing-xl) 0;
  line-height: 1.5;
}

/* Grilles d'offres */
.offers-grid,
.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-lg);
}

/* Cartes d'offres */
.offer-card,
.favorite-card {
  background: var(--background-light);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-light);
  border: 1px solid var(--border-light);
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.offer-card:hover,
.favorite-card:hover {
  box-shadow: var(--shadow-strong);
  transform: translateY(-4px);
}

/* Header des cartes d'offres */
.offer-header {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.offer-photo img,
.photo-placeholder {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
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
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.offer-status.active {
  background: #00A699;
  color: white;
}

.offer-status.inactive {
  background: var(--text-light);
  color: white;
}

.offer-status.completed {
  background: #008489;
  color: white;
}

.offer-status.cancelled {
  background: #d93025;
  color: white;
}

/* Contenu des cartes */
.offer-content {
  padding: var(--spacing-lg);
}

.offer-title {
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-sm) 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.offer-description {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0 0 var(--spacing-lg) 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.guide-name {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0 0 var(--spacing-sm) 0;
  font-weight: 500;
}

/* Détails des offres */
.offer-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-lg);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 0.9rem;
}

.detail-icon {
  font-size: 1rem;
  width: 20px;
  text-align: center;
}

.detail-text {
  color: var(--text-secondary);
  font-weight: 500;
}

.price {
  color: var(--text-primary);
  font-weight: 700;
  font-size: 1.1rem;
}

/* Langues */
.offer-languages {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-lg);
}

.language-tag {
  background: var(--background-gray);
  color: var(--text-secondary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

/* Statistiques */
.offer-stats {
  display: flex;
  gap: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-light);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
}

.stat-icon {
  font-size: 1rem;
}

/* Actions des cartes */
.offer-actions,
.favorite-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--border-light);
  background: rgba(247, 247, 247, 0.3);
}

.btn-icon {
  background: none;
  border: none;
  padding: var(--spacing-sm);
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: var(--background-gray);
  transform: scale(1.1);
}

.btn-icon.edit:hover {
  background: rgba(0, 166, 153, 0.1);
}

.btn-icon.delete:hover {
  background: rgba(217, 48, 37, 0.1);
}

.btn-icon.toggle:hover {
  background: rgba(255, 90, 95, 0.1);
}

/* Boutons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius-sm);
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  line-height: 1;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
  border: 2px solid var(--primary-color);
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
  border-color: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-medium);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-outline {
  background: transparent;
  color: var(--text-primary);
  border: 2px solid var(--border-color);
}

.btn-outline:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: rgba(255, 90, 95, 0.05);
}

.btn-sm {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 0.85rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
}

.modal-content {
  background: var(--background-light);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-strong);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl) var(--spacing-xl) var(--spacing-lg) var(--spacing-xl);
  border-bottom: 1px solid var(--border-light);
}

.modal-header h3 {
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--background-gray);
  color: var(--text-primary);
}

/* Formulaire */
.offer-form {
  padding: var(--spacing-xl);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-group label {
  display: block;
  color: var(--text-primary);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  font-size: 0.95rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  font-size: 1rem;
  color: var(--text-primary);
  background: var(--background-light);
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(255, 90, 95, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  line-height: 1.5;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}

/* Upload de photo */
.photo-upload {
  position: relative;
}

.photo-input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.photo-preview {
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  border: 2px solid var(--border-light);
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-photo {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
}

.photo-placeholder-upload {
  width: 100%;
  height: 200px;
  border: 2px dashed var(--border-color);
  border-radius: var(--border-radius-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--background-gray);
}

.photo-placeholder-upload:hover {
  border-color: var(--primary-color);
  background: rgba(255, 90, 95, 0.05);
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-sm);
  color: var(--text-light);
}

.photo-placeholder-upload p {
  color: var(--text-secondary);
  margin: 0;
  font-weight: 500;
}

/* Sélecteur de langues */
.languages-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.language-item {
  padding: var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--background-light);
  transition: all 0.2s ease;
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
  gap: var(--spacing-md);
  justify-content: flex-end;
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-light);
}

/* Messages d'erreur */
.error-message {
  color: #d93025;
  font-size: 0.85rem;
  margin-top: var(--spacing-xs);
  display: block;
}

.form-group input.error {
  border-color: #d93025;
  box-shadow: 0 0 0 3px rgba(217, 48, 37, 0.1);
}

.alert {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-sm);
  margin-top: var(--spacing-lg);
  font-weight: 500;
}

.alert-danger {
  background: rgba(217, 48, 37, 0.1);
  color: #d93025;
  border: 1px solid rgba(217, 48, 37, 0.2);
}

/* Spinner pour les boutons */
.spinner-border {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

.spinner-border-sm {
  width: 0.875rem;
  height: 0.875rem;
  border-width: 1px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: 0 var(--spacing-md);
  }
  
  .dashboard-header {
    padding: var(--spacing-lg);
  }
  
  .user-info {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-md);
  }
  
  .user-details h1 {
    font-size: 1.5rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md);
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .offers-grid,
  .favorites-grid {
    grid-template-columns: 1fr;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .languages-selector {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
  
  .modal-overlay {
    padding: var(--spacing-sm);
  }
  
  .modal-content {
    max-height: 95vh;
  }
  
  .modal-header,
  .offer-form {
    padding: var(--spacing-lg);
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .offer-actions,
  .favorite-actions {
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }
}

@media (max-width: 480px) {
  .user-avatar img,
  .avatar-placeholder {
    width: 60px;
    height: 60px;
  }
  
  .avatar-placeholder {
    font-size: 1.5rem;
  }
  
  .user-details h1 {
    font-size: 1.25rem;
  }
  
  .stat-card {
    padding: var(--spacing-md);
  }
  
  .stat-icon {
    font-size: 2rem;
    width: 50px;
    height: 50px;
  }
  
  .stat-info h3 {
    font-size: 1.5rem;
  }
  
  .offer-card,
  .favorite-card {
    border-radius: var(--border-radius);
  }
  
  .offer-header {
    height: 150px;
  }
  
  .offer-content {
    padding: var(--spacing-md);
  }
  
  .photo-preview,
  .photo-placeholder-upload {
    height: 150px;
  }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.offer-card,
.favorite-card,
.stat-card {
  animation: fadeIn 0.3s ease forwards;
}

/* Accessibilité */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus pour l'accessibilité */
button:focus-visible,
input:focus-visible,
textarea:focus-visible,
select:focus-visible,
.btn:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}
</style>
