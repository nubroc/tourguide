<template>
  <div class="page">
    <div class="container">
      <div class="page-header">
        <h1>Explorer les Activités</h1>
        <p>Découvrez les expériences authentiques proposées par nos guides locaux</p>
      </div>

      <!-- Composant de test de connexion -->
      <div class="connection-test">
        <div class="card">
          <div class="card-content">
            <h3>Test de Connexion API</h3>
            <div class="test-actions">
              <button @click="testConnection" class="btn btn-primary" :disabled="testing">
                {{ testing ? '⏳ Test en cours...' : '🔄 Tester la Connexion' }}
              </button>
              <button @click="loadActivities" class="btn btn-secondary" :disabled="loadingActivities">
                {{ loadingActivities ? '⏳ Chargement...' : '📋 Charger les Activités' }}
              </button>
            </div>
            
            <!-- Résultats des tests -->
            <div v-if="connectionResult" class="test-result" :class="connectionResult.success ? 'success' : 'error'">
              <h4>{{ connectionResult.success ? '✅ Connexion réussie' : '❌ Erreur de connexion' }}</h4>
              <pre>{{ JSON.stringify(connectionResult, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des activités -->
      <div class="activities-section" v-if="activities.length > 0">
        <h2>Activités Disponibles</h2>
        <div class="activities-grid">
          <div v-for="activity in activities" :key="activity.id" class="activity-card card">
            <div class="card-content">
              <div class="activity-header">
                <h3>{{ activity.title }}</h3>
                <div class="price">{{ activity.price }}€</div>
              </div>
              <p class="description">{{ activity.description }}</p>
              <div class="activity-meta">
                <div class="duration">⏱️ {{ activity.duration }}h</div>
                <div class="guide">👨‍🏫 {{ activity.guide_name }}</div>
                <div class="location">📍 {{ activity.cities }}</div>
              </div>
              <div class="languages" v-if="activity.languages && activity.languages.length">
                <span class="language-tag" v-for="lang in activity.languages" :key="lang">
                  {{ getLanguageFlag(lang) }} {{ lang.toUpperCase() }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Message si pas d'activités -->
      <div v-else-if="!loadingActivities && activitiesLoaded" class="no-activities">
        <div class="card">
          <div class="card-content">
            <h3>Aucune activité disponible</h3>
            <p>Il n'y a pas encore d'activités enregistrées dans la base de données.</p>
          </div>
        </div>
      </div>

      <!-- Indicateur de chargement -->
      <div v-if="loadingActivities" class="loading-indicator">
        <div class="card">
          <div class="card-content">
            <h3>⏳ Chargement des activités...</h3>
          </div>
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
      testing: false,
      loadingActivities: false,
      activitiesLoaded: false,
      connectionResult: null,
      activities: [],
      languageFlags: {
        'fr': '🇫🇷',
        'en': '🇺🇸',
        'es': '🇪🇸',
        'de': '🇩🇪',
        'it': '🇮🇹',
        'pt': '🇵🇹',
        'ar': '🇸🇦',
        'zh': '🇨🇳',
        'ja': '🇯🇵'
      }
    }
  },
  mounted() {
    // Test automatique de la connexion au chargement
    this.testConnection()
  },
  methods: {
    async testConnection() {
      this.testing = true
      this.connectionResult = null
      
      try {
        const result = await apiServices.health()
        this.connectionResult = {
          success: true,
          data: result,
          timestamp: new Date().toLocaleString()
        }
        console.log('✅ Connexion API réussie:', result)
      } catch (error) {
        this.connectionResult = {
          success: false,
          error: error.message,
          details: error.response?.data || error,
          timestamp: new Date().toLocaleString()
        }
        console.error('❌ Erreur de connexion API:', error)
      } finally {
        this.testing = false
      }
    },

    async loadActivities() {
      this.loadingActivities = true
      
      try {
        const result = await apiServices.getActivities()
        this.activities = result.data || []
        this.activitiesLoaded = true
        console.log('✅ Activités chargées:', this.activities)
        
        if (this.activities.length === 0) {
          console.log('ℹ️ Aucune activité trouvée')
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement des activités:', error)
        this.activities = []
        this.activitiesLoaded = true
      } finally {
        this.loadingActivities = false
      }
    },

    getLanguageFlag(langCode) {
      return this.languageFlags[langCode] || '🌐'
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

.connection-test {
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
  margin-top: var(--spacing-sm);
  white-space: pre-wrap;
  font-size: 0.85rem;
  overflow-x: auto;
}

.activities-section {
  margin-top: var(--spacing-xl);
}

.activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-lg);
}

.activity-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.activity-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-medium);
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
}

.activity-header h3 {
  color: var(--text-primary);
  margin: 0;
  flex: 1;
}

.price {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-left: var(--spacing-md);
}

.description {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
  line-height: 1.5;
}

.activity-meta {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.languages {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.language-tag {
  background-color: var(--background-gray);
  border: 1px solid var(--border-color);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.no-activities,
.loading-indicator {
  margin-top: var(--spacing-xl);
  text-align: center;
}

.no-activities h3,
.loading-indicator h3 {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: var(--spacing-lg) var(--spacing-md);
  }
  
  .test-actions {
    flex-direction: column;
  }
  
  .test-actions .btn {
    width: 100%;
  }
  
  .activities-grid {
    grid-template-columns: 1fr;
  }
  
  .activity-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .price {
    margin-left: 0;
    margin-top: var(--spacing-xs);
  }
}
</style>
