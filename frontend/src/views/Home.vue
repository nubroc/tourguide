<template>
  <div class="page">
    <div class="container">
      <!-- Hero Section -->
      <section class="hero">
        <h1>Découvrez des expériences uniques</h1>
        <p>Trouvez le guide parfait pour votre prochaine aventure</p>
        <div class="hero-actions">
          <router-link to="/explorer" class="btn btn-primary btn-large">
            Explorer les offres
          </router-link>
        </div>
      </section>

      <!-- Test de connexion (développement uniquement) -->
      <div class="connection-test" v-if="showDevTools">
        <h2>🔧 Tests de développement</h2>
        <div class="test-actions">
          <button @click="testConnection" class="btn btn-secondary">
            Test Connexion API
          </button>
          <button @click="loadOffers" class="btn btn-secondary">
            Charger les offres
          </button>
        </div>
        <div v-if="connectionResult" class="test-result" :class="connectionResult.success ? 'success' : 'error'">
          <h4>{{ connectionResult.success ? '✅ Succès' : '❌ Erreur' }}</h4>
          <pre>{{ JSON.stringify(connectionResult, null, 2) }}</pre>
        </div>
      </div>

      <!-- Section des offres populaires -->
      <section class="offers-section">
        <div class="section-header">
          <h2>Offres populaires</h2>
          <router-link to="/explorer" class="btn btn-outline">
            Voir toutes les offres
          </router-link>
        </div>

        <div v-if="loading" class="loading-indicator">
          <div class="spinner"></div>
          <h3>Chargement des offres...</h3>
        </div>

        <div v-else-if="offers.length > 0" class="offers-grid">
          <div v-for="offer in offers" :key="offer.id" class="offer-card">
            <div class="offer-header">
              <img v-if="offer.photo_url" :src="offer.photo_url" :alt="offer.title" />
              <div v-else class="photo-placeholder">📷</div>
              <div class="offer-meta">
                <span class="price">{{ offer.price }}€</span>
                <span class="likes">❤️ {{ offer.likes_count || 0 }}</span>
              </div>
            </div>
            <div class="offer-content">
              <h3>{{ offer.title }}</h3>
              <p class="description">{{ offer.description }}</p>
              <div class="offer-details">
                <span class="guide-name">🏃‍♂️ {{ offer.guide_name }}</span>
                <span class="location">📍 {{ offer.city }}</span>
                <span class="date">📅 {{ formatDate(offer.tour_date) }}</span>
              </div>
              <div class="languages">
                <span v-for="lang in offer.languages" :key="lang" class="language-tag">
                  {{ lang.toUpperCase() }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="no-offers">
          <h3>Aucune offre disponible</h3>
          <p>Les guides n'ont pas encore publié d'offres.</p>
          <router-link to="/signup" class="btn btn-primary">
            Devenir guide
          </router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { apiServices } from '../services/api.js'

export default {
  name: 'Home',
  data() {
    return {
      offers: [],
      loading: false,
      connectionResult: null,
      showDevTools: process.env.NODE_ENV === 'development'
    }
  },
  mounted() {
    this.loadOffers()
  },
  methods: {
    async testConnection() {
      try {
        this.connectionResult = await apiServices.testConnection()
      } catch (error) {
        this.connectionResult = {
          success: false,
          error: error.message
        }
      }
    },
    
    async loadOffers() {
      this.loading = true
      try {
        // Charger les offres populaires (limitées à 6)
        const response = await apiServices.getOffers({
          limit: 6,
          sort: 'likes',
          order: 'desc'
        })
        
        this.offers = response.data.offers || []
        
        if (this.showDevTools) {
          this.connectionResult = {
            success: true,
            message: `${this.offers.length} offres chargées`,
            data: response.data
          }
        }
      } catch (error) {
        console.error('Erreur chargement offres:', error)
        this.offers = []
        
        if (this.showDevTools) {
          this.connectionResult = {
            success: false,
            error: error.message
          }
        }
      } finally {
        this.loading = false
      }
    },

    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-md);
}

/* Hero Section */
.hero {
  text-align: center;
  padding: var(--spacing-3xl) 0;
  margin-bottom: var(--spacing-3xl);
}

.hero h1 {
  font-size: 3rem;
  font-weight: 700;
  color: var(--text-primary); /* au lieu de --text-dark */
  margin-bottom: var(--spacing-lg);
}

.hero p {
  font-size: 1.25rem;
  color: var(--text-secondary); /* au lieu de --text-medium */
  margin-bottom: var(--spacing-xl);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}

.btn-large {
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: 1.1rem;
}

/* Connection Test */
.connection-test {
  background: var(--background-light);
  border: 2px dashed var(--border-color);
  border-radius: var(--border-radius);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
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

.test-result pre {
  white-space: pre-wrap;
  margin: 0;
  font-size: 0.875rem;
}

/* Offers Section */
.offers-section {
  margin-bottom: var(--spacing-3xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.section-header h2 {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary); /* au lieu de --text-dark */
}

.offers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-xl);
}

.offer-card {
  background: var(--background-light);
  border-radius: var(--border-radius-large);
  box-shadow: var(--shadow-medium);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
}

.offer-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-large);
}

.offer-header {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.offer-header img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background-gray); /* au lieu de --background-dark */
  color: var(--text-secondary); /* au lieu de --text-light */
  font-size: 3rem;
}

.offer-meta {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.price {
  background: var(--primary-color);
  color: white;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
  font-weight: 600;
  font-size: 1.1rem;
}

.likes {
  background: rgba(255, 255, 255, 0.9);
  color: var(--text-dark);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
  font-size: 0.9rem;
}

.offer-content {
  padding: var(--spacing-lg);
}

.offer-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary); /* au lieu de --text-dark */
  margin-bottom: var(--spacing-md);
}

.description {
  color: var(--text-secondary); /* au lieu de --text-medium */
  margin-bottom: var(--spacing-lg);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.offer-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  font-size: 0.9rem;
  color: var(--text-medium);
}

.languages {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.language-tag {
  background: var(--background-gray); /* au lieu de --background-dark */
  color: var(--text-primary); /* au lieu de --text-light */
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius);
  font-size: 0.75rem;
  font-weight: 500;
}

.loading-indicator, .no-offers {
  text-align: center;
  padding: var(--spacing-3xl) var(--spacing-lg);
  color: var(--text-medium);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto var(--spacing-lg);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-offers h3 {
  margin-bottom: var(--spacing-md);
  color: var(--text-primary); /* au lieu de --text-dark */
}

/* Responsive */
@media (max-width: 768px) {
  .hero h1 {
    font-size: 2rem;
  }
  
  .hero p {
    font-size: 1.1rem;
  }
  
  .offers-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    gap: var(--spacing-md);
    text-align: center;
  }
  
  .test-actions {
    flex-direction: column;
  }
}
</style>
