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

            <!-- Section spécifique Touriste -->
            <div class="form-section" v-if="formData.role === 'tourist'">
              <h3>Informations de voyage</h3>
              
              <div class="form-grid">
                <div class="form-group">
                  <label for="country">Pays de résidence *</label>
                  <select id="country" v-model="formData.country" required>
                    <option value="">Sélectionnez votre pays</option>
                    <option v-for="country in countries" :key="country" :value="country">{{ country }}</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="destination">Destination souhaitée *</label>
                  <input 
                    type="text" 
                    id="destination" 
                    v-model="formData.destination" 
                    required 
                    placeholder="Ville ou pays que vous souhaitez visiter"
                  >
                </div>

                <div class="form-group">
                  <label for="startDate">Date d'arrivée *</label>
                  <input 
                    type="date" 
                    id="startDate" 
                    v-model="formData.startDate" 
                    required
                  >
                </div>

                <div class="form-group">
                  <label for="endDate">Date de départ *</label>
                  <input 
                    type="date" 
                    id="endDate" 
                    v-model="formData.endDate" 
                    required
                  >
                </div>
              </div>

              <div class="form-group">
                <label for="interests">Centres d'intérêt (optionnel)</label>
                <div class="interests-selector">
                  <div 
                    v-for="interest in availableInterests" 
                    :key="interest"
                    class="interest-item"
                    :class="{ active: formData.interests.includes(interest) }"
                    @click="toggleInterest(interest)"
                  >
                    {{ interest }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Section spécifique Guide -->
            <div class="form-section" v-if="formData.role === 'guide'">
              <h3>Informations de guide</h3>
              
              <div class="form-group">
                <label for="cities">Ville(s) où vous proposez des activités *</label>
                <input 
                  type="text" 
                  id="cities" 
                  v-model="formData.cities" 
                  required 
                  placeholder="Paris, Lyon, Marseille..."
                >
              </div>

              <!-- Activités proposées -->
              <div class="form-group">
                <label>Activités proposées *</label>
                <div class="activities-container">
                  <div 
                    v-for="(activity, index) in formData.activities" 
                    :key="index" 
                    class="activity-item"
                  >
                    <div class="activity-header">
                      <h4>Activité {{ index + 1 }}</h4>
                      <button 
                        type="button" 
                        class="btn-remove" 
                        @click="removeActivity(index)"
                        v-if="formData.activities.length > 1"
                      >
                        ❌
                      </button>
                    </div>
                    
                    <div class="form-grid">
                      <div class="form-group">
                        <label>Titre *</label>
                        <input 
                          type="text" 
                          v-model="activity.title" 
                          required 
                          placeholder="Nom de votre activité"
                        >
                      </div>

                      <div class="form-group">
                        <label>Prix par personne (€) *</label>
                        <input 
                          type="number" 
                          v-model="activity.price" 
                          required 
                          min="0" 
                          placeholder="50"
                        >
                      </div>

                      <div class="form-group span-2">
                        <label>Description *</label>
                        <textarea 
                          v-model="activity.description" 
                          required 
                          placeholder="Décrivez votre activité..."
                          rows="3"
                        ></textarea>
                      </div>

                      <div class="form-group">
                        <label>Durée (heures) *</label>
                        <input 
                          type="number" 
                          v-model="activity.duration" 
                          required 
                          min="0.5" 
                          step="0.5" 
                          placeholder="2"
                        >
                      </div>

                      <div class="form-group">
                        <label>Langues disponibles *</label>
                        <div class="activity-languages">
                          <div 
                            v-for="language in availableLanguages" 
                            :key="language.code"
                            class="language-item small"
                            :class="{ active: activity.languages.includes(language.code) }"
                            @click="toggleActivityLanguage(index, language.code)"
                          >
                            {{ language.flag }} {{ language.name }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button type="button" class="btn btn-outline" @click="addActivity">
                    ➕ Ajouter une activité
                  </button>
                </div>
              </div>

              <!-- Disponibilités -->
              <div class="form-group">
                <label>Disponibilités</label>
                <div class="availability-container">
                  <div v-for="day in daysOfWeek" :key="day" class="day-availability">
                    <div class="day-header">
                      <input 
                        type="checkbox" 
                        :id="`day-${day}`" 
                        v-model="formData.availability[day].available"
                      >
                      <label :for="`day-${day}`">{{ day }}</label>
                    </div>
                    <div v-if="formData.availability[day].available" class="time-slots">
                      <input 
                        type="time" 
                        v-model="formData.availability[day].start" 
                        placeholder="09:00"
                      >
                      <span>à</span>
                      <input 
                        type="time" 
                        v-model="formData.availability[day].end" 
                        placeholder="18:00"
                      >
                    </div>
                  </div>
                </div>
              </div>

              <!-- Réseaux sociaux -->
              <div class="form-group">
                <label for="socialLinks">Liens réseaux sociaux / site web (optionnel)</label>
                <div class="social-links">
                  <input 
                    type="url" 
                    v-model="formData.socialLinks.website" 
                    placeholder="https://votre-site.com"
                  >
                  <input 
                    type="url" 
                    v-model="formData.socialLinks.instagram" 
                    placeholder="https://instagram.com/votre-compte"
                  >
                  <input 
                    type="url" 
                    v-model="formData.socialLinks.facebook" 
                    placeholder="https://facebook.com/votre-page"
                  >
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
        languages: [],
        // Touriste
        country: '',
        destination: '',
        startDate: '',
        endDate: '',
        interests: [],
        // Guide
        cities: '',
        activities: [{
          title: '',
          description: '',
          price: '',
          duration: '',
          languages: []
        }],
        availability: {
          'Lundi': { available: false, start: '', end: '' },
          'Mardi': { available: false, start: '', end: '' },
          'Mercredi': { available: false, start: '', end: '' },
          'Jeudi': { available: false, start: '', end: '' },
          'Vendredi': { available: false, start: '', end: '' },
          'Samedi': { available: false, start: '', end: '' },
          'Dimanche': { available: false, start: '', end: '' }
        },
        socialLinks: {
          website: '',
          instagram: '',
          facebook: ''
        }
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
      ],
      countries: [
        'France', 'Espagne', 'Italie', 'Allemagne', 'Royaume-Uni', 
        'Portugal', 'Belgique', 'Suisse', 'Pays-Bas', 'Autriche',
        'États-Unis', 'Canada', 'Maroc', 'Tunisie', 'Algérie'
      ],
      availableInterests: [
        'Culture & Histoire', 'Gastronomie', 'Nature & Randonnée', 
        'Art & Musées', 'Vie nocturne', 'Shopping', 'Sports', 
        'Photographie', 'Architecture', 'Plages', 'Montagne'
      ],
      daysOfWeek: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
    }
  },
  computed: {
    isFormValid() {
      const basic = this.formData.role && 
                   this.formData.fullName && 
                   this.formData.email && 
                   this.formData.password && 
                   this.formData.password === this.formData.confirmPassword &&
                   this.formData.languages.length > 0;

      if (this.formData.role === 'tourist') {
        return basic && this.formData.country && this.formData.destination && 
               this.formData.startDate && this.formData.endDate;
      }

      if (this.formData.role === 'guide') {
        const hasValidActivity = this.formData.activities.some(activity => 
          activity.title && activity.description && activity.price && 
          activity.duration && activity.languages.length > 0
        );
        return basic && this.formData.cities && hasValidActivity;
      }

      return basic;
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
    toggleInterest(interest) {
      const index = this.formData.interests.indexOf(interest);
      if (index > -1) {
        this.formData.interests.splice(index, 1);
      } else {
        this.formData.interests.push(interest);
      }
    },
    toggleActivityLanguage(activityIndex, languageCode) {
      const activity = this.formData.activities[activityIndex];
      const index = activity.languages.indexOf(languageCode);
      if (index > -1) {
        activity.languages.splice(index, 1);
      } else {
        activity.languages.push(languageCode);
      }
    },
    addActivity() {
      this.formData.activities.push({
        title: '',
        description: '',
        price: '',
        duration: '',
        languages: []
      });
    },
    removeActivity(index) {
      this.formData.activities.splice(index, 1);
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
        alert('Compte créé avec succès !');
      }
    }
  }
}
</script>