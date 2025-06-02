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
          <button @click="logout" class="btn btn-outline">Déconnexion</button>
        </div>

        <!-- Contenu du dashboard pour Guide -->
        <div v-if="user.role === 'guide'" class="dashboard-content">
          <div class="section-header">
            <h2>Mes Offres</h2>
            <button @click="showAddOfferModal = true" class="btn btn-primary">
              ➕ Ajouter une offre
            </button>
          </div>

          <!-- Liste des offres -->
          <div v-if="offers.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <h3>Aucune offre pour le moment</h3>
            <p>Commencez par créer votre première offre d'activité</p>
          </div>

          <div v-else class="offers-grid">
            <div v-for="(offer, index) in offers" :key="index" class="offer-card">
              <div class="offer-header">
                <h3>{{ offer.title }}</h3>
                <div class="offer-actions">
                  <button @click="editOffer(index)" class="btn-icon">✏️</button>
                  <button @click="removeOffer(index)" class="btn-icon delete">🗑️</button>
                </div>
              </div>
              <p class="offer-description">{{ offer.description }}</p>
              <div class="offer-details">
                <div class="offer-price">{{ offer.price }}€ / personne</div>
                <div class="offer-duration">{{ offer.duration }}h</div>
              </div>
              <div class="offer-languages">
                <span v-for="lang in offer.languages" :key="lang" class="language-tag">
                  {{ getLanguageFlag(lang) }} {{ getLanguageName(lang) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Contenu du dashboard pour Touriste -->
        <div v-if="user.role === 'tourist'" class="dashboard-content">
          <div class="section-header">
            <h2>Mes Préférences de Voyage</h2>
            <button @click="showPreferencesModal = true" class="btn btn-primary">
              ⚙️ Modifier mes préférences
            </button>
          </div>

          <div class="preferences-card">
            <div v-if="!preferences.destination" class="empty-state">
              <div class="empty-icon">🧳</div>
              <h3>Configurez vos préférences</h3>
              <p>Ajoutez vos préférences de voyage pour recevoir des recommandations personnalisées</p>
            </div>
            <div v-else class="preferences-content">
              <div class="preference-item">
                <strong>Destination :</strong> {{ preferences.destination }}
              </div>
              <div class="preference-item">
                <strong>Dates :</strong> {{ preferences.startDate }} - {{ preferences.endDate }}
              </div>
              <div class="preference-item" v-if="preferences.interests && preferences.interests.length">
                <strong>Centres d'intérêt :</strong>
                <div class="interests-tags">
                  <span v-for="interest in preferences.interests" :key="interest" class="interest-tag">
                    {{ interest }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Message si pas d'utilisateur connecté -->
        <div v-if="!user.role" class="loading-state">
          <h2>Chargement...</h2>
          <p>Si cette page ne se charge pas, veuillez vous connecter.</p>
          <router-link to="/login" class="btn btn-primary">Se connecter</router-link>
        </div>
      </div>
    </div>

    <!-- Modal Ajouter/Modifier Offre -->
    <div v-if="showAddOfferModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingOfferIndex !== null ? 'Modifier l\'offre' : 'Nouvelle offre' }}</h3>
          <button @click="closeModal" class="modal-close">❌</button>
        </div>
        
        <form @submit.prevent="saveOffer" class="modal-form">
          <div class="form-group">
            <label for="offerTitle">Titre *</label>
            <input 
              type="text" 
              id="offerTitle"
              v-model="newOffer.title" 
              required 
              placeholder="Nom de votre activité"
            >
          </div>

          <div class="form-group">
            <label for="offerDescription">Description *</label>
            <textarea 
              id="offerDescription"
              v-model="newOffer.description" 
              required 
              placeholder="Décrivez votre activité..."
              rows="4"
            ></textarea>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label for="offerPrice">Prix par personne (€) *</label>
              <input 
                type="number" 
                id="offerPrice"
                v-model="newOffer.price" 
                required 
                min="0" 
                placeholder="50"
              >
            </div>

            <div class="form-group">
              <label for="offerDuration">Durée (heures) *</label>
              <input 
                type="number" 
                id="offerDuration"
                v-model="newOffer.duration" 
                required 
                min="0.5" 
                step="0.5" 
                placeholder="2"
              >
            </div>
          </div>

          <div class="form-group">
            <label>Langues disponibles *</label>
            <div class="languages-selector">
              <div 
                v-for="language in availableLanguages" 
                :key="language.code"
                class="language-item"
                :class="{ active: newOffer.languages.includes(language.code) }"
                @click="toggleOfferLanguage(language.code)"
              >
                {{ language.flag }} {{ language.name }}
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn btn-outline">Annuler</button>
            <button type="submit" class="btn btn-primary">
              {{ editingOfferIndex !== null ? 'Modifier' : 'Ajouter' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Préférences Touriste -->
    <div v-if="showPreferencesModal" class="modal-overlay" @click="closePreferencesModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Mes Préférences de Voyage</h3>
          <button @click="closePreferencesModal" class="modal-close">❌</button>
        </div>
        
        <form @submit.prevent="savePreferences" class="modal-form">
          <div class="form-group">
            <label for="destination">Destination souhaitée *</label>
            <input 
              type="text" 
              id="destination"
              v-model="tempPreferences.destination" 
              required 
              placeholder="Ville ou pays que vous souhaitez visiter"
            >
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label for="startDate">Date d'arrivée *</label>
              <input 
                type="date" 
                id="startDate"
                v-model="tempPreferences.startDate" 
                required
              >
            </div>

            <div class="form-group">
              <label for="endDate">Date de départ *</label>
              <input 
                type="date" 
                id="endDate"
                v-model="tempPreferences.endDate" 
                required
              >
            </div>
          </div>

          <div class="form-group">
            <label>Centres d'intérêt (optionnel)</label>
            <div class="interests-selector">
              <div 
                v-for="interest in availableInterests" 
                :key="interest"
                class="interest-item"
                :class="{ active: tempPreferences.interests.includes(interest) }"
                @click="toggleInterest(interest)"
              >
                {{ interest }}
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closePreferencesModal" class="btn btn-outline">Annuler</button>
            <button type="submit" class="btn btn-primary">Sauvegarder</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data() {
    return {
      user: {},
      offers: [],
      preferences: {},
      showAddOfferModal: false,
      showPreferencesModal: false,
      editingOfferIndex: null,
      newOffer: {
        title: '',
        description: '',
        price: '',
        duration: '',
        languages: []
      },
      tempPreferences: {
        destination: '',
        startDate: '',
        endDate: '',
        interests: []
      },
      availableLanguages: [
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
        { code: 'it', name: 'Italiano', flag: '🇮🇹' }
      ],
      availableInterests: [
        'Culture & Histoire', 'Gastronomie', 'Nature & Randonnée', 
        'Art & Musées', 'Vie nocturne', 'Shopping', 'Sports', 
        'Photographie', 'Architecture', 'Plages', 'Montagne'
      ]
    }
  },
  computed: {
    userPhotoUrl() {
      if (this.user.profilePhoto) {
        return URL.createObjectURL(this.user.profilePhoto);
      }
      return '';
    }
  },
  mounted() {
    this.loadUserData();
  },
  methods: {
    loadUserData() {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          this.user = JSON.parse(userData);
          this.loadOffers();
          this.loadPreferences();
        } catch (error) {
          console.error('Erreur lors du chargement des données utilisateur:', error);
          this.$router.push('/login');
        }
      } else {
        this.$router.push('/login');
      }
    },
    loadOffers() {
      if (this.user.email) {
        const offers = localStorage.getItem(`offers_${this.user.email}`);
        if (offers) {
          this.offers = JSON.parse(offers);
        }
      }
    },
    loadPreferences() {
      if (this.user.email) {
        const prefs = localStorage.getItem(`preferences_${this.user.email}`);
        if (prefs) {
          this.preferences = JSON.parse(prefs);
        }
      }
    },
    saveOffer() {
      if (this.editingOfferIndex !== null) {
        this.offers[this.editingOfferIndex] = { ...this.newOffer };
      } else {
        this.offers.push({ ...this.newOffer });
      }
      localStorage.setItem(`offers_${this.user.email}`, JSON.stringify(this.offers));
      this.closeModal();
    },
    editOffer(index) {
      this.editingOfferIndex = index;
      this.newOffer = { ...this.offers[index] };
      this.showAddOfferModal = true;
    },
    removeOffer(index) {
      if (confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
        this.offers.splice(index, 1);
        localStorage.setItem(`offers_${this.user.email}`, JSON.stringify(this.offers));
      }
    },
    closeModal() {
      this.showAddOfferModal = false;
      this.editingOfferIndex = null;
      this.newOffer = {
        title: '',
        description: '',
        price: '',
        duration: '',
        languages: []
      };
    },
    savePreferences() {
      this.preferences = { ...this.tempPreferences };
      localStorage.setItem(`preferences_${this.user.email}`, JSON.stringify(this.preferences));
      this.closePreferencesModal();
    },
    closePreferencesModal() {
      this.showPreferencesModal = false;
      this.tempPreferences = {
        destination: this.preferences.destination || '',
        startDate: this.preferences.startDate || '',
        endDate: this.preferences.endDate || '',
        interests: [...(this.preferences.interests || [])]
      };
    },
    toggleOfferLanguage(languageCode) {
      const index = this.newOffer.languages.indexOf(languageCode);
      if (index > -1) {
        this.newOffer.languages.splice(index, 1);
      } else {
        this.newOffer.languages.push(languageCode);
      }
    },
    toggleInterest(interest) {
      const index = this.tempPreferences.interests.indexOf(interest);
      if (index > -1) {
        this.tempPreferences.interests.splice(index, 1);
      } else {
        this.tempPreferences.interests.push(interest);
      }
    },
    getLanguageFlag(code) {
      const lang = this.availableLanguages.find(l => l.code === code);
      return lang ? lang.flag : '';
    },
    getLanguageName(code) {
      const lang = this.availableLanguages.find(l => l.code === code);
      return lang ? lang.name : code;
    },
    logout() {
      localStorage.removeItem('user');
      this.$router.push('/login');
    }
  }
}
</script>

<style scoped>
.page {
  min-height: calc(100vh - 80px);
  padding: 20px;
  background: #f8f9fa;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
}

.user-details h1 {
  margin: 0 0 5px 0;
  color: #333;
}

.user-role {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.section-header h2 {
  margin: 0;
  color: #333;
}

.btn {
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: none;
  display: inline-block;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-outline {
  background: transparent;
  color: #007bff;
  border: 1px solid #007bff;
}

.btn-outline:hover {
  background: #007bff;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 10px;
  border: 2px dashed #ddd;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.empty-state h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.empty-state p {
  color: #666;
  margin: 0;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.offers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.offer-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.offer-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.offer-header h3 {
  margin: 0;
  color: #333;
}

.offer-actions {
  display: flex;
  gap: 10px;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  border-radius: 3px;
  font-size: 1rem;
}

.btn-icon:hover {
  background: #f0f0f0;
}

.btn-icon.delete:hover {
  background: #ffebee;
}

.offer-description {
  color: #666;
  margin-bottom: 15px;
  line-height: 1.5;
}

.offer-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.offer-price {
  font-weight: bold;
  color: #007bff;
}

.offer-languages {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.language-tag {
  background: #e3f2fd;
  color: #007bff;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 0.8rem;
}

.preferences-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
}

.preference-item {
  margin-bottom: 15px;
}

.interests-tags {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.interest-tag {
  background: #f0f0f0;
  color: #333;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 0.8rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 10px;
  padding: 30px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

.form-group textarea {
  resize: vertical;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.languages-selector,
.interests-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.language-item,
.interest-item {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s ease;
}

.language-item:hover,
.interest-item:hover {
  background: #f0f0f0;
}

.language-item.active,
.interest-item.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .section-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .offers-grid {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>