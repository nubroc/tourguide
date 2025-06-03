<template>
  <nav class="nav">
    <div class="nav-content">
      <!-- Logo -->
      <router-link to="/" class="logo">TourGuide</router-link>
      
      <!-- Navigation Links (Desktop) -->
      <ul class="nav-links">
        <li><router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }">Accueil</router-link></li>
        <li><router-link to="/explorer" class="nav-link" :class="{ active: $route.path === '/explorer' }">Explorer</router-link></li>
      </ul>
      
      <!-- Authentication & Language (Desktop) -->
      <div class="nav-auth">
        <!-- Language Selector -->
        <div class="language-selector">
          <button 
            class="language-btn"
            @click="toggleLanguageDropdown"
          >
            🌐 {{ currentLanguage.toUpperCase() }}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M3 4.5L6 7.5L9 4.5"/>
            </svg>
          </button>
          <div class="language-dropdown" :class="{ active: isLanguageDropdownOpen }">
            <div 
              class="language-option" 
              :class="{ active: currentLanguage === 'fr' }"
              @click="changeLanguage('fr')"
            >
              🇫🇷 Français
            </div>
            <div 
              class="language-option" 
              :class="{ active: currentLanguage === 'en' }"
              @click="changeLanguage('en')"
            >
              🇺🇸 English
            </div>
          </div>
        </div>
        
        <!-- Auth Buttons - Connecté -->
        <div v-if="isLoggedIn" class="user-menu">
          <router-link to="/dashboard" class="btn btn-login">Dashboard</router-link>
          <button @click="logout" class="btn btn-signup">Déconnexion</button>
        </div>
        
        <!-- Auth Buttons - Non connecté -->
        <div v-else class="auth-buttons">
          <router-link to="/login" class="btn btn-login">Connexion</router-link>
          <router-link to="/signup" class="btn btn-signup">S'inscrire</router-link>
        </div>
      </div>
      
      <!-- Mobile Menu Button -->
      <button 
        class="mobile-menu-btn"
        @click="toggleMobileMenu"
      >
        ☰
      </button>
    </div>
    
    <!-- Mobile Menu -->
    <div class="mobile-menu" :class="{ active: isMobileMenuOpen }">
      <ul class="mobile-nav-links">
        <li><router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }">Accueil</router-link></li>
        <li><router-link to="/explorer" class="nav-link" :class="{ active: $route.path === '/explorer' }">Explorer</router-link></li>
      </ul>
      
      <div class="mobile-nav-auth">
        <div class="language-selector">
          <button class="language-btn" @click="toggleMobileLanguage">
            🌐 {{ currentLanguage.toUpperCase() }}
          </button>
        </div>
        
        <!-- Mobile Auth - Connecté -->
        <div v-if="isLoggedIn" class="mobile-user-menu">
          <router-link to="/dashboard" class="btn btn-login">Dashboard</router-link>
          <button @click="logout" class="btn btn-signup">Déconnexion</button>
        </div>
        
        <!-- Mobile Auth - Non connecté -->
        <div v-else class="mobile-auth-buttons">
          <router-link to="/login" class="btn btn-login">Connexion</router-link>
          <router-link to="/signup" class="btn btn-signup">S'inscrire</router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'Navbar',
  data() {
    return {
      isMobileMenuOpen: false,
      isLanguageDropdownOpen: false,
      currentLanguage: 'fr',
      isLoggedIn: false,
      user: null
    }
  },
  mounted() {
    // Vérifier l'état de connexion au montage
    this.checkAuthStatus()
    
    // Écouter les changements d'état de connexion
    window.addEventListener('storage', this.handleStorageChange)
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.handleStorageChange)
    document.removeEventListener('click', this.handleClickOutside)
  },
  watch: {
    // Surveiller les changements de route pour vérifier l'auth
    '$route'() {
      this.checkAuthStatus()
      this.isMobileMenuOpen = false // Fermer le menu mobile lors du changement de route
    }
  },
  methods: {
    checkAuthStatus() {
      const token = localStorage.getItem('authToken')
      const userData = localStorage.getItem('user')
      
      this.isLoggedIn = !!(token && userData)
      if (this.isLoggedIn) {
        try {
          this.user = JSON.parse(userData)
        } catch (error) {
          console.error('Erreur parsing user data:', error)
          this.isLoggedIn = false
          this.user = null
        }
      } else {
        this.user = null
      }
    },
    
    handleStorageChange(event) {
      // Réagir aux changements dans localStorage (connexion/déconnexion dans un autre onglet)
      if (event.key === 'authToken' || event.key === 'user') {
        this.checkAuthStatus()
      }
    },
    
    logout() {
      // Confirmer la déconnexion
      if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        // Supprimer les données d'authentification
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        
        // Mettre à jour l'état local
        this.isLoggedIn = false
        this.user = null
        
        // Fermer le menu mobile si ouvert
        this.isMobileMenuOpen = false
        
        // Rediriger vers l'accueil
        if (this.$route.path !== '/') {
          this.$router.push('/')
        }
        
        // Notification de déconnexion (optionnel)
        alert('Vous avez été déconnecté avec succès')
      }
    },
    
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen
    },
    
    toggleLanguageDropdown() {
      this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen
    },
    
    toggleMobileLanguage() {
      this.currentLanguage = this.currentLanguage === 'fr' ? 'en' : 'fr'
    },
    
    changeLanguage(lang) {
      this.currentLanguage = lang
      this.isLanguageDropdownOpen = false
      // Ici vous pouvez ajouter la logique pour changer la langue de l'app
      this.$emit('language-changed', lang)
    },
    
    handleClickOutside(event) {
      const languageSelector = this.$el.querySelector('.language-selector')
      const mobileMenu = this.$el.querySelector('.mobile-menu')
      const mobileMenuBtn = this.$el.querySelector('.mobile-menu-btn')
      
      if (languageSelector && !languageSelector.contains(event.target)) {
        this.isLanguageDropdownOpen = false
      }
      
      if (mobileMenu && mobileMenuBtn && 
          !mobileMenu.contains(event.target) && 
          !mobileMenuBtn.contains(event.target)) {
        this.isMobileMenuOpen = false
      }
    }
  }
}
</script>

<style scoped>
.nav {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid var(--border-light);
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--spacing-lg);
  height: 70px;
}

.logo {
  font-size: 1.75rem;
  font-weight: var(--font-weight-bold);
  color: var(--primary-color);
  text-decoration: none;
  transition: transform 0.2s ease;
}

.logo:hover {
  transform: scale(1.05);
}

.nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: var(--spacing-xl);
}

.nav-link {
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
  transition: all 0.2s ease;
  position: relative;
}

.nav-link:hover {
  color: var(--primary-color);
  background: rgba(255, 90, 95, 0.05);
}

.nav-link.active {
  color: var(--primary-color);
  font-weight: var(--font-weight-semibold);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 2px;
  background: var(--primary-color);
  border-radius: 1px;
}

.nav-auth {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.user-menu,
.auth-buttons {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.language-selector {
  position: relative;
}

.language-btn {
  background: none;
  border: 1px solid var(--border-color);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 0.9rem;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.language-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.language-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-medium);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.2s ease;
  min-width: 120px;
  z-index: 200;
}

.language-dropdown.active {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.language-option {
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.language-option:hover {
  background: var(--background-gray);
  color: var(--primary-color);
}

.language-option.active {
  background: var(--primary-color);
  color: white;
}

.btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  font-size: 0.9rem;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-login {
  background: transparent;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}

.btn-login:hover {
  background: var(--primary-color);
  color: white;
}

.btn-signup {
  background: var(--primary-color);
  color: white;
  border: 1px solid var(--primary-color);
}

.btn-signup:hover {
  background: var(--primary-hover);
  border-color: var(--primary-hover);
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs);
}

.mobile-menu {
  display: none;
  background: white;
  border-top: 1px solid var(--border-light);
  padding: var(--spacing-lg);
}

.mobile-menu.active {
  display: block;
}

.mobile-nav-links {
  list-style: none;
  margin: 0 0 var(--spacing-lg) 0;
  padding: 0;
}

.mobile-nav-links li {
  margin-bottom: var(--spacing-sm);
}

.mobile-nav-auth {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  align-items: stretch;
}

.mobile-user-menu,
.mobile-auth-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.mobile-nav-auth .btn {
  text-align: center;
  width: 100%;
}

.mobile-nav-auth .language-btn {
  width: 100%;
  justify-content: center;
}

/* Responsive */
@media (max-width: 768px) {
  .nav-links,
  .nav-auth {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .nav-content {
    padding: 0 var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .logo {
    font-size: 1.5rem;
  }
  
  .nav-content {
    height: 60px;
  }
}

/* Variables CSS (à ajouter dans votre fichier CSS global si pas déjà fait) */
:root {
  --primary-color: #ff5a5f;
  --primary-hover: #e0484d;
  --text-primary: #333;
  --text-secondary: #666;
  --text-light: #999;
  --border-color: #ddd;
  --border-light: #eee;
  --background-gray: #f8f9fa;
  --shadow-light: 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-medium: 0 4px 12px rgba(0, 0, 0, 0.15);
  --border-radius: 8px;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
</style>