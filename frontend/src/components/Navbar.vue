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
        
        <!-- Auth Buttons -->
        <router-link to="/login" class="btn btn-login">Connexion</router-link>
        <router-link to="/signup" class="btn btn-signup">S'inscrire</router-link>
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
        <router-link to="/login" class="btn btn-login">Connexion</router-link>
        <router-link to="/signup" class="btn btn-signup">S'inscrire</router-link>
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
      currentLanguage: 'fr'
    }
  },
  methods: {
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
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  }
}
</script>