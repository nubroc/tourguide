<template>
  <div class="page">
    <div class="container">
      <!-- Header avec recherche -->
      <div class="explorer-header">
        <div class="header-content">
          <h1>Découvrez des expériences uniques</h1>
          <p>Trouvez le guide parfait pour votre prochaine aventure</p>
        </div>
        
        <!-- Barre de recherche principale -->
        <div class="main-search">
          <div class="search-input-group">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              v-model="searchQuery"
              @input="debounceSearch"
              placeholder="Rechercher une activité, un lieu..."
              class="search-input"
            />
            <button v-if="searchQuery" @click="clearSearch" class="clear-search">✕</button>
          </div>
        </div>
      </div>

      <!-- Filtres avancés -->
      <div class="filters-section">
        <div class="filters-header">
          <h3>Affinez votre recherche</h3>
          <button @click="toggleFilters" class="toggle-filters">
            {{ showFilters ? 'Masquer les filtres' : 'Plus de filtres' }}
            <span>{{ showFilters ? '▲' : '▼' }}</span>
          </button>
        </div>

        <div v-show="showFilters" class="filters-content">
          <div class="filters-grid">
            <!-- Filtre par ville -->
            <div class="filter-group">
              <label>Ville</label>
              <select v-model="filters.city" @change="applyFilters">
                <option value="">Toutes les villes</option>
                <option v-for="city in availableCities" :key="city" :value="city">
                  {{ city }}
                </option>
              </select>
            </div>

            <!-- Filtre par date -->
            <div class="filter-group">
              <label>Date de début</label>
              <input
                type="date"
                v-model="filters.dateFrom"
                @change="applyFilters"
                :min="minDate"
              />
            </div>

            <div class="filter-group">
              <label>Date de fin</label>
              <input
                type="date"
                v-model="filters.dateTo"
                @change="applyFilters"
                :min="filters.dateFrom || minDate"
              />
            </div>

            <!-- Filtre par prix -->
            <div class="filter-group">
              <label>Prix minimum (€)</label>
              <input
                type="number"
                v-model="filters.priceMin"
                @input="applyFilters"
                min="0"
                placeholder="0"
              />
            </div>

            <div class="filter-group">
              <label>Prix maximum (€)</label>
              <input
                type="number"
                v-model="filters.priceMax"
                @input="applyFilters"
                min="0"
                placeholder="100"
              />
            </div>

            <!-- Filtre par langues -->
            <div class="filter-group languages-filter">
              <label>Langues</label>
              <div class="languages-selector">
                <div
                  v-for="language in availableLanguages"
                  :key="language.code"
                  class="language-item"
                  :class="{ active: filters.languages.includes(language.code) }"
                  @click="toggleLanguageFilter(language.code)"
                >
                  {{ language.flag }} {{ language.name }}
                </div>
              </div>
            </div>
          </div>

          <!-- Actions filtres -->
          <div class="filters-actions">
            <button @click="clearFilters" class="btn btn-outline">
              Effacer les filtres
            </button>
            <button @click="applyFilters" class="btn btn-primary">
              Appliquer ({{ filteredOffersCount }} résultats)
            </button>
          </div>
        </div>
      </div>

      <!-- Tri et résultats -->
      <div class="results-header">
        <div class="results-count">
          <span>{{ offers.length }} offre{{ offers.length > 1 ? 's' : '' }} trouvée{{ offers.length > 1 ? 's' : '' }}</span>
        </div>
        
        <div class="sort-options">
          <label>Trier par :</label>
          <select v-model="sortBy" @change="applySorting">
            <option value="date">Date</option>
            <option value="price">Prix</option>
            <option value="popularity">Popularité</option>
          </select>
          <button @click="toggleSortOrder" class="sort-order">
            {{ sortOrder === 'asc' ? '↑' : '↓' }}
          </button>
        </div>
      </div>

      <!-- État de chargement -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Recherche en cours...</p>
      </div>

      <!-- Aucun résultat -->
      <div v-else-if="offers.length === 0" class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>Aucune offre trouvée</h3>
        <p>Essayez de modifier vos critères de recherche</p>
        <button @click="clearAllFilters" class="btn btn-primary">
          Voir toutes les offres
        </button>
      </div>

      <!-- Grille des offres -->
      <div v-else class="offers-grid">
        <div
          v-for="offer in offers"
          :key="offer.id"
          class="offer-card"
          @click="viewOfferDetails(offer.id)"
        >
          <!-- Photo et bouton like -->
          <div class="offer-image">
            <img v-if="offer.photo_url" :src="offer.photo_url" :alt="offer.title" />
            <div v-else class="image-placeholder">
              <span class="placeholder-icon">📸</span>
            </div>
            
            <button
              v-if="user && user.role === 'tourist'"
              @click.stop="toggleLike(offer)"
              class="like-button"
              :class="{ liked: offer.isLiked }"
            >
              {{ offer.isLiked ? '❤️' : '🤍' }}
            </button>
            
            <div class="offer-price">{{ offer.price }}€</div>
          </div>

          <!-- Contenu de l'offre -->
          <div class="offer-content">
            <div class="offer-header">
              <h3 class="offer-title">{{ offer.title }}</h3>
              <div class="guide-info">
                <div class="guide-avatar">
                  <img v-if="offer.guide_photo" :src="offer.guide_photo" :alt="offer.guide_name" />
                  <div v-else class="avatar-placeholder">{{ offer.guide_name.charAt(0) }}</div>
                </div>
                <span class="guide-name">{{ offer.guide_name }}</span>
              </div>
            </div>

            <p class="offer-description">{{ truncateText(offer.description, 120) }}</p>

            <div class="offer-details">
              <div class="detail-item">
                <span class="detail-icon">📅</span>
                <span>{{ formatDate(offer.tour_date) }}</span>
              </div>
              <div class="detail-item" v-if="offer.tour_time">
                <span class="detail-icon">🕐</span>
                <span>{{ formatTime(offer.tour_time) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-icon">📍</span>
                <span>{{ offer.location }}, {{ offer.city }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-icon">👥</span>
                <span>{{ offer.current_participants }}/{{ offer.max_participants }} places</span>
              </div>
            </div>

            <!-- Langues disponibles -->
            <div class="offer-languages">
              <span
                v-for="lang in offer.languages"
                :key="lang"
                class="language-tag"
              >
                {{ getLanguageFlag(lang) }}
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

          <!-- Actions de la card -->
          <div class="card-actions">
            <button class="btn btn-outline btn-sm" @click.stop="viewOfferDetails(offer.id)">
              Voir détails
            </button>
            <button v-if="user && user.role === 'tourist'" class="btn btn-primary btn-sm">
              Réserver
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="pagination">
        <button
          @click="goToPage(pagination.page - 1)"
          :disabled="pagination.page === 1"
          class="pagination-btn"
        >
          ← Précédent
        </button>
        
        <div class="pagination-pages">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            class="pagination-page"
            :class="{ active: page === pagination.page }"
          >
            {{ page }}
          </button>
        </div>
        
        <button
          @click="goToPage(pagination.page + 1)"
          :disabled="pagination.page === pagination.totalPages"
          class="pagination-btn"
        >
          Suivant →
        </button>
      </div>

      <!-- Section de test (à garder temporairement) -->
      <div class="connection-test">
        <h2>🔧 Test de connexion</h2>
        <div class="test-actions">
          <button @click="testConnection" class="btn btn-outline">Test Santé API</button>
          <button @click="testActivitiesOld" class="btn btn-outline">Test Anciennes Activités</button>
          <button @click="testOffersNew" class="btn btn-primary">Test Nouvelles Offres</button>
        </div>

        <div v-if="testResult" class="test-result" :class="testResult.type">
          <h4>{{ testResult.title }}</h4>
          <pre>{{ testResult.message }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { apiServices } from '../services/api.js'

export default {
  name: 'Explorer',
  data() {
    return {
      // Utilisateur connecté
      user: null,
      
      // Recherche et filtres
      searchQuery: '',
      searchTimeout: null,
      showFilters: false,
      
      filters: {
        city: '',
        dateFrom: '',
        dateTo: '',
        priceMin: '',
        priceMax: '',
        languages: []
      },
      
      // Tri
      sortBy: 'date',
      sortOrder: 'asc',
      
      // Données
      offers: [],
      availableCities: [],
      likedOffers: new Set(), // IDs des offres likées
      
      // États
      loading: false,
      error: null,
      
      // Pagination
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      },
      
      // Test (temporaire)
      testResult: null,
      
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
    minDate() {
      const today = new Date()
      return today.toISOString().split('T')[0]
    },
    
    filteredOffersCount() {
      return this.offers.length
    },
    
    visiblePages() {
      const pages = []
      const current = this.pagination.page
      const total = this.pagination.totalPages
      
      // Afficher 5 pages maximum autour de la page courante
      const start = Math.max(1, current - 2)
      const end = Math.min(total, current + 2)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
    }
  },
  
  mounted() {
    this.loadUserData()
    this.loadOffers()
    this.loadAvailableCities()
    this.testConnection()
  },
  
  methods: {
    loadUserData() {
      const userData = localStorage.getItem('user')
      if (userData) {
        this.user = JSON.parse(userData)
        if (this.user.role === 'tourist') {
          this.loadLikedOffers()
        }
      }
    },
    
    async loadOffers() {
      try {
        this.loading = true
        this.error = null
        
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          sort: this.sortBy,
          order: this.sortOrder,
          search: this.searchQuery || undefined,
          city: this.filters.city || undefined,
          dateFrom: this.filters.dateFrom || undefined,
          dateTo: this.filters.dateTo || undefined,
          priceMin: this.filters.priceMin || undefined,
          priceMax: this.filters.priceMax || undefined,
          languages: this.filters.languages.length > 0 ? this.filters.languages.join(',') : undefined
        }
        
        const response = await apiServices.getOffers(params)
        
        if (response.data.success) {
          this.offers = response.data.data.offers.map(offer => ({
            ...offer,
            isLiked: this.likedOffers.has(offer.id)
          }))
          this.pagination = response.data.data.pagination
        } else {
          throw new Error(response.data.message)
        }
        
      } catch (error) {
        console.error('Erreur chargement offres:', error)
        this.error = 'Erreur lors du chargement des offres'
        this.testResult = {
          type: 'error',
          title: 'Erreur API Offres',
          message: error.response?.data?.message || error.message
        }
      } finally {
        this.loading = false
      }
    },
    
    async loadLikedOffers() {
      if (!this.user || this.user.role !== 'tourist') return
      
      try {
        const response = await apiServices.getLikedOffers()
        if (response.data.success) {
          this.likedOffers = new Set(
            response.data.data.offers.map(offer => offer.id)
          )
        }
      } catch (error) {
        console.error('Erreur chargement favoris:', error)
      }
    },
    
    async loadAvailableCities() {
      try {
        // Charger toutes les villes depuis les offres
        const response = await apiServices.getOffers({ limit: 1000 })
        if (response.data.success) {
          const cities = [...new Set(
            response.data.data.offers.map(offer => offer.city)
          )].sort()
          this.availableCities = cities
        }
      } catch (error) {
        console.error('Erreur chargement villes:', error)
      }
    },
    
    // Recherche avec debounce
    debounceSearch() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.pagination.page = 1
        this.loadOffers()
      }, 500) // Attendre 500ms après la dernière frappe
    },
    
    clearSearch() {
      this.searchQuery = ''
      this.pagination.page = 1
      this.loadOffers()
    },
    
    // Gestion des filtres
    toggleFilters() {
      this.showFilters = !this.showFilters
    },
    
    toggleLanguageFilter(languageCode) {
      const index = this.filters.languages.indexOf(languageCode)
      if (index > -1) {
        this.filters.languages.splice(index, 1)
      } else {
        this.filters.languages.push(languageCode)
      }
    },
    
    applyFilters() {
      this.pagination.page = 1
      this.loadOffers()
    },
    
    clearFilters() {
      this.filters = {
        city: '',
        dateFrom: '',
        dateTo: '',
        priceMin: '',
        priceMax: '',
        languages: []
      }
      this.applyFilters()
    },
    
    clearAllFilters() {
      this.searchQuery = ''
      this.clearFilters()
    },
    
    // Tri
    applySorting() {
      this.pagination.page = 1
      this.loadOffers()
    },
    
    toggleSortOrder() {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      this.applySorting()
    },
    
    // Pagination
    goToPage(page) {
      if (page >= 1 && page <= this.pagination.totalPages) {
        this.pagination.page = page
        this.loadOffers()
        // Scroll vers le haut
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
    
    // Gestion des likes
    async toggleLike(offer) {
      if (!this.user || this.user.role !== 'tourist') {
        this.$router.push('/login')
        return
      }
      
      try {
        const response = await apiServices.toggleLike(offer.id)
        
        if (response.data.success) {
          const isLiked = response.data.data.liked
          offer.isLiked = isLiked
          
          if (isLiked) {
            this.likedOffers.add(offer.id)
            offer.likes_count = (offer.likes_count || 0) + 1
          } else {
            this.likedOffers.delete(offer.id)
            offer.likes_count = Math.max((offer.likes_count || 0) - 1, 0)
          }
          
          // Notification
          this.$toast?.success(
            isLiked ? 'Ajouté aux favoris' : 'Retiré des favoris'
          )
        }
        
      } catch (error) {
        console.error('Erreur toggle like:', error)
        this.$toast?.error('Erreur lors de la gestion du favori')
      }
    },
    
    // Navigation
    viewOfferDetails(offerId) {
      this.$router.push(`/offers/${offerId}`)
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
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      })
    },
    
    formatTime(timeString) {
      if (!timeString) return ''
      return timeString.substring(0, 5) // HH:MM
    },
    
    getLanguageFlag(code) {
      const lang = this.availableLanguages.find(l => l.code === code)
      return lang ? lang.flag : code
    },
    
    // Tests (temporaires)
    async testConnection() {
      try {
        const response = await apiServices.health()
        this.testResult = {
          type: 'success',
          title: 'Connexion API OK',
          message: JSON.stringify(response.data, null, 2)
        }
      } catch (error) {
        this.testResult = {
          type: 'error',
          title: 'Erreur connexion API',
          message: error.message
        }
      }
    },
    
    async testActivitiesOld() {
      try {
        const response = await apiServices.getActivities()
        this.testResult = {
          type: 'success',
          title: 'Anciennes activités',
          message: JSON.stringify(response.data, null, 2)
        }
      } catch (error) {
        this.testResult = {
          type: 'error',
          title: 'Erreur anciennes activités',
          message: error.message
        }
      }
    },
    
    async testOffersNew() {
      try {
        const response = await apiServices.getOffers({ limit: 5 })
        this.testResult = {
          type: 'success',
          title: 'Nouvelles offres',
          message: JSON.stringify(response.data, null, 2)
        }
      } catch (error) {
        this.testResult = {
          type: 'error',
          title: 'Erreur nouvelles offres',
          message: error.response?.data?.message || error.message
        }
      }
    }
  }
}
</script>

<style scoped>
.page {
  min-height: calc(100vh - 80px);
  background: var(--background-gray);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

/* Header Explorer */
.explorer-header {
  text-align: center;
  margin-bottom: var(--spacing-xxl);
  padding: var(--spacing-xxl) 0;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  color: white;
  border-radius: var(--border-radius-large);
  margin-bottom: var(--spacing-xl);
}

.header-content h1 {
  font-size: 2.5rem;
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-md);
  letter-spacing: -0.5px;
}

.header-content p {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: var(--spacing-xl);
}

/* Barre de recherche principale */
.main-search {
  max-width: 600px;
  margin: 0 auto;
}

.search-input-group {
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border-radius: var(--border-radius-large);
  box-shadow: var(--shadow-large);
  padding: var(--spacing-sm);
}

.search-icon {
  font-size: 1.2rem;
  margin: 0 var(--spacing-md);
  color: var(--text-secondary);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1.1rem;
  padding: var(--spacing-md);
  background: transparent;
}

.search-input::placeholder {
  color: var(--text-light);
}

.clear-search {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-sm);
  margin-right: var(--spacing-sm);
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.clear-search:hover {
  background: var(--background-gray);
}

/* Section des filtres */
.filters-section {
  background: white;
  border-radius: var(--border-radius-large);
  box-shadow: var(--shadow-light);
  margin-bottom: var(--spacing-xl);
  overflow: hidden;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
}

.filters-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: var(--font-weight-semibold);
}

.toggle-filters {
  background: none;
  border: none;
  color: var(--primary-color);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
  transition: background-color 0.2s ease;
}

.toggle-filters:hover {
  background: rgba(255, 90, 95, 0.1);
}

.filters-content {
  padding: var(--spacing-lg);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.filter-group label {
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.filter-group input,
.filter-group select {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
}

.filter-group input:focus,
.filter-group select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(255, 90, 95, 0.1);
}

/* Filtre langues spécial */
.languages-filter {
  grid-column: 1 / -1;
}

.languages-selector {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.language-item {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.85rem;
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

/* Actions des filtres */
.filters-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-light);
}

/* Header des résultats */
.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md) var(--spacing-lg);
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-light);
}

.results-count span {
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.sort-options {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.sort-options label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.sort-options select {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 0.9rem;
}

.sort-order {
  background: none;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: var(--spacing-xs) var(--spacing-sm);
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.sort-order:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

/* États de chargement et vide */
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

/* Grille des offres */
.offers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

/* Cards d'offres */
.offer-card {
  background: white;
  border-radius: var(--border-radius-large);
  box-shadow: var(--shadow-light);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.offer-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-hover);
}

/* Image de l'offre */
.offer-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.offer-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.offer-card:hover .offer-image img {
  transform: scale(1.05);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background: var(--background-gray);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 3rem;
  color: var(--text-light);
}

/* Bouton like */
.like-button {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.like-button:hover {
  background: white;
  transform: scale(1.1);
}

.like-button.liked {
  background: var(--primary-color);
  color: white;
}

/* Prix */
.offer-price {
  position: absolute;
  bottom: var(--spacing-md);
  left: var(--spacing-md);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius);
  font-weight: var(--font-weight-bold);
  font-size: 1.1rem;
}

/* Contenu de l'offre */
.offer-content {
  padding: var(--spacing-lg);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.offer-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
  gap: var(--spacing-md);
}

.offer-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  line-height: 1.3;
  flex: 1;
}

.guide-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.guide-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--border-light);
}

.guide-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: var(--font-weight-bold);
}

.guide-name {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.offer-description {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--text-secondary);
  line-height: 1.5;
  font-size: 0.9rem;
  flex: 1;
}

/* Détails de l'offre */
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
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.detail-icon {
  width: 16px;
  text-align: center;
  opacity: 0.7;
}

/* Langues de l'offre */
.offer-languages {
  display: flex;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
}

.language-tag {
  font-size: 1rem;
  opacity: 0.8;
}

/* Statistiques de l'offre */
.offer-stats {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 0.8rem;
  color: var(--text-light);
}

.stat-icon {
  font-size: 0.8rem;
}

/* Actions des cards */
.card-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--border-light);
  background: var(--background-gray);
  gap: var(--spacing-sm);
}

.btn-sm {
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: 0.9rem;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
  padding: var(--spacing-lg);
}

.pagination-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  background: white;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  gap: var(--spacing-xs);
}

.pagination-page {
  width: 40px;
  height: 40px;
  border: 1px solid var(--border-color);
  background: white;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: var(--font-weight-medium);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-page:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.pagination-page.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

/* Section de test (temporaire) */
.connection-test {
  margin-top: var(--spacing-xxl);
  padding: var(--spacing-lg);
  background: white;
  border-radius: var(--border-radius-large);
  box-shadow: var(--shadow-light);
  border-left: 4px solid var(--warning-color);
}

.test-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}

.test-result {
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  margin-top: var(--spacing-md);
}

.test-result.success {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.test-result.error {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.test-result h4 {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: 1rem;
}

.test-result pre {
  margin: 0;
  white-space: pre-wrap;
  font-size: 0.8rem;
  overflow-x: auto;
  background: rgba(0, 0, 0, 0.05);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-small);
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: var(--spacing-md);
  }
  
  .explorer-header {
    padding: var(--spacing-lg);
  }
  
  .header-content h1 {
    font-size: 2rem;
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
  }
  
  .results-header {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }
  
  .offers-grid {
    grid-template-columns: 1fr;
  }
  
  .pagination {
    flex-wrap: wrap;
  }
  
  .test-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .offer-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .guide-info {
    align-self: flex-end;
  }
  
  .card-actions {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .card-actions .btn {
    width: 100%;
  }
  
  .filters-actions {
    flex-direction: column;
  }
}
</style>
