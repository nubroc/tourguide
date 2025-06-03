<template>
  <div class="home">
    <div class="connection-status">
      <h2>Statut de connexion Backend</h2>
      <div class="status-card" :class="connectionStatus.class">
        <div class="status-icon">{{ connectionStatus.icon }}</div>
        <div class="status-text">
          <h3>{{ connectionStatus.title }}</h3>
          <p>{{ connectionStatus.message }}</p>
        </div>
      </div>
      <button @click="checkConnection" :disabled="isChecking" class="check-btn">
        {{ isChecking ? 'Vérification...' : 'Vérifier la connexion' }}
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Home',
  data() {
    return {
      isConnected: false,
      isChecking: false,
      lastCheck: null,
      error: null
    }
  },
  computed: {
    connectionStatus() {
      if (this.isChecking) {
        return {
          class: 'checking',
          icon: '⏳',
          title: 'Vérification en cours...',
          message: 'Test de connexion au backend'
        }
      }
      
      if (this.isConnected) {
        return {
          class: 'connected',
          icon: '✅',
          title: 'Connecté',
          message: `Backend accessible - Dernière vérification: ${this.lastCheck}`
        }
      }
      
      return {
        class: 'disconnected',
        icon: '❌',
        title: 'Déconnecté',
        message: this.error || 'Impossible de se connecter au backend'
      }
    }
  },
  methods: {
    async checkConnection() {
      this.isChecking = true
      this.error = null
      
      try {
        // Remplacez l'URL par celle de votre backend
        const response = await axios.get('http://localhost:3000/api/health', {
          timeout: 5000
        })
        
        this.isConnected = true
        this.lastCheck = new Date().toLocaleTimeString()
        console.log('Backend response:', response.data)
        
      } catch (error) {
        this.isConnected = false
        this.error = `Erreur: ${error.message}`
        console.error('Connection error:', error)
      } finally {
        this.isChecking = false
      }
    }
  },
  mounted() {
    // Vérification automatique au chargement
    this.checkConnection()
    
    // Vérification automatique toutes les 30 secondes
    this.intervalId = setInterval(() => {
      this.checkConnection()
    }, 30000)
  },
  beforeUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
  }
}
</script>

<style scoped>
.home {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.connection-status {
  text-align: center;
}

.status-card {
  display: flex;
  align-items: center;
  padding: 20px;
  margin: 20px 0;
  border-radius: 8px;
  border: 2px solid;
  transition: all 0.3s ease;
}

.status-card.connected {
  background-color: #d4edda;
  border-color: #28a745;
  color: #155724;
}

.status-card.disconnected {
  background-color: #f8d7da;
  border-color: #dc3545;
  color: #721c24;
}

.status-card.checking {
  background-color: #fff3cd;
  border-color: #ffc107;
  color: #856404;
}

.status-icon {
  font-size: 2rem;
  margin-right: 15px;
}

.status-text {
  text-align: left;
}

.status-text h3 {
  margin: 0 0 5px 0;
  font-size: 1.2rem;
}

.status-text p {
  margin: 0;
  font-size: 0.9rem;
}

.check-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.check-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.check-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}
</style>

