<template>
  <div class="page">
    <div class="container">
      <div class="signup-container">
        <div class="signup-header">
          <h1>Rejoignez TourGuide</h1>
          <p>Créez votre compte pour découvrir ou partager des expériences authentiques</p>
        </div>
        
        <div class="signup-form-container">
          <form @submit.prevent="handleSubmit" class="signup-form">
            
            <!-- Section Rôle (Premier choix) -->
            <div class="form-section">
              <h3>Quel est votre profil ?</h3>
              <div class="role-selector">
                <div class="role-option" :class="{ active: formData.role === 'tourist' }" @click="selectRole('tourist')">
                  <div class="role-icon">🧳</div>
                  <h4>Touriste</h4>
                  <p>Je recherche des expériences authentiques</p>
                </div>
                <div class="role-option" :class="{ active: formData.role === 'guide' }" @click="selectRole('guide')">
                  <div class="role-icon">🧭</div>
                  <h4>Guide Local</h4>
                  <p>Je souhaite partager ma région</p>
                </div>
              </div>
            </div>

            <!-- Section Informations personnelles -->
            <div class="form-section" v-if="formData.role">
              <h3>Informations personnelles</h3>
              
              <div class="form-grid">
                <div class="form-group">
                  <label for="fullName">Nom complet *</label>
                  <input 
                    type="text" 
                    id="fullName" 
                    v-model="formData.fullName" 
                    required 
                    placeholder="Votre nom complet"
                  >
                </div>

                <div class="form-group">
                  <label for="email">Email *</label>
                  <input 
                    type="email" 
                    id="email" 
                    v-model="formData.email" 
                    required 
                    placeholder="votre@email.com"
                  >
                </div>

                <div class="form-group">
                  <label for="password">Mot de passe *</label>
                  <div class="password-input">
                    <input 
                      :type="showPassword ? 'text' : 'password'" 
                      id="password" 
                      v-model="formData.password" 
                      required 
                      placeholder="Mot de passe"
                    >
                    <button type="button" class="password-toggle" @click="showPassword = !showPassword">
                      {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                    </button>
                  </div>
                </div>

                <div class="form-group">
                  <label for="confirmPassword">Confirmer le mot de passe *</label>
                  <input 
                    type="password" 
                    id="confirmPassword" 
                    v-model="formData.confirmPassword" 
                    required 
                    placeholder="Confirmer le mot de passe"
                    :class="{ 'error': formData.confirmPassword && formData.password !== formData.confirmPassword }"
                  >
                  <span v-if="formData.confirmPassword && formData.password !== formData.confirmPassword" class="error-message">
                    Les mots de passe ne correspondent pas
                  </span>
                </div>
              </div>

              <!-- Photo de profil -->
              <div class="form-group">
                <label for="profilePhoto">Photo de profil (optionnelle)</label>
                <div class="file-upload">
                  <input type="file" id="profilePhoto" @change="handleFileUpload" accept="image/*">
                  <label for="profilePhoto" class="file-upload-label">
                    <span v-if="!formData.profilePhoto">📷 Ajouter une photo</span>
                    <span v-else>✅ Photo ajoutée</span>
                  </label>
                </div>
              </div>

              <!-- Langues parlées -->
              <div class="form-group">
                <label>Langues parlées *</label>
                <div class="languages-selector">
                  <div 
                    v-for="language in availableLanguages" 
                    :key="language.code"
                    class="language-item"
                    :class="{ active: formData.languages.includes(language.code) }"
                    @click="toggleLanguage(language.code)"
                  >
                    {{ language.flag }} {{ language.name }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Bouton de soumission -->
            <div class="form-submit" v-if="formData.role">
              <button type="submit" class="btn btn-primary" :disabled="!isFormValid">
                Créer mon compte
              </button>
              
              <div class="auth-links">
                <p>Déjà un compte ? 
                  <router-link to="/login">Connectez-vous</router-link>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Signup',
  data() {
    return {
      showPassword: false,
      formData: {
        role: '',
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        profilePhoto: null,
        languages: []
      },
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
    isFormValid() {
      return this.formData.role && 
             this.formData.fullName && 
             this.formData.email && 
             this.formData.password && 
             this.formData.password === this.formData.confirmPassword &&
             this.formData.languages.length > 0;
    }
  },
  methods: {
    selectRole(role) {
      this.formData.role = role;
    },
    toggleLanguage(languageCode) {
      const index = this.formData.languages.indexOf(languageCode);
      if (index > -1) {
        this.formData.languages.splice(index, 1);
      } else {
        this.formData.languages.push(languageCode);
      }
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.formData.profilePhoto = file;
      }
    },
    handleSubmit() {
      if (this.isFormValid) {
        console.log('Données du formulaire:', this.formData);
        // Ici vous ajouterez l'appel API pour créer le compte
        localStorage.setItem('user', JSON.stringify(this.formData));
        this.$router.push('/dashboard');
      }
    }
  }
}
</script>