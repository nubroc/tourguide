<template>
  <div class="page">
    <div class="container">
      <div class="auth-container">
        <div class="auth-header">
          <h1>Connexion</h1>
          <p>Connectez-vous à votre compte TourGuide</p>
        </div>
        
        <div class="auth-content">
          <form @submit.prevent="handleLogin" class="auth-form">
            <div v-if="error" class="error-message">
              {{ error }}
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                v-model="loginData.email" 
                required 
                placeholder="votre@email.com"
              >
            </div>

            <div class="form-group">
              <label for="password">Mot de passe</label>
              <div class="password-input">
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  id="password" 
                  v-model="loginData.password" 
                  required 
                  placeholder="Votre mot de passe"
                >
                <button type="button" class="password-toggle" @click="showPassword = !showPassword">
                  {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="loginData.rememberMe">
                Se souvenir de moi
              </label>
            </div>

            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Connexion...' : 'Se connecter' }}
            </button>
          </form>
          
          <div class="auth-links">
            <p><a href="#" class="forgot-link">Mot de passe oublié ?</a></p>
            <p>Pas encore de compte ? 
              <router-link to="/signup">Inscrivez-vous</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { apiServices } from '../services/api.js'

export default {
  name: 'Login',
  data() {
    return {
      showPassword: false,
      loading: false,
      error: null,
      loginData: {
        email: '',
        password: '',
        rememberMe: false
      }
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true
      this.error = null
      
      try {
        const response = await apiServices.login({
          email: this.loginData.email,
          password: this.loginData.password
        })

        if (response.success) {
          // Sauvegarder les données utilisateur et token
          localStorage.setItem('user', JSON.stringify(response.data.user))
          localStorage.setItem('authToken', response.data.token)
          
          if (this.loginData.rememberMe) {
            localStorage.setItem('rememberMe', 'true')
          }
          
          console.log('✅ Connexion réussie')
          this.$router.push('/dashboard')
        } else {
          this.error = response.message || 'Erreur de connexion'
        }

      } catch (error) {
        console.error('❌ Erreur login:', error)
        this.error = error.response?.data?.message || 'Erreur de connexion'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.page {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl) var(--spacing-md);
}

.container {
  width: 100%;
  max-width: 1200px;
  display: flex;
  justify-content: center;
}

.auth-container {
  width: 100%;
  max-width: 400px;
}

.auth-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.auth-content {
  background: var(--background-light);
  border-radius: var(--border-radius-large);
  box-shadow: var(--shadow-medium);
  padding: var(--spacing-xl);
  border: 1px solid var(--border-color);
}

.auth-form {
  margin-bottom: var(--spacing-lg);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: normal;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.forgot-link {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.forgot-link:hover {
  color: var(--primary-color);
}

.auth-links {
  text-align: center;
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
}

.auth-links p {
  margin-bottom: var(--spacing-sm);
}

.error-message {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 20px;
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .page {
    padding: var(--spacing-lg) var(--spacing-md);
  }
  
  .auth-content {
    padding: var(--spacing-lg);
  }
}

@media (max-width: 480px) {
  .page {
    padding: var(--spacing-md);
  }
  
  .auth-container {
    max-width: 100%;
  }
  
  .auth-content {
    padding: var(--spacing-md);
  }
}
</style>
