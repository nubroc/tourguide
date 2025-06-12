nubroc: fait moi le readme qui explique le principe de l'app

Workspace: Collecting workspace information# TourGuide - Plateforme de Tourisme Local

## 📖 Principe de l'application

TourGuide est une plateforme web qui met en relation des **guides locaux** avec des **touristes** souhaitant découvrir des expériences authentiques. L'application fonctionne selon un modèle de marketplace où chaque utilisateur a un rôle spécifique.

## 🎯 Concept principal

### Pour les Guides Locaux 🧭
- **Créer et gérer des offres** : Proposer des visites, activités ou expériences dans leur région
- **Définir les détails** : Prix, dates, nombre de participants, langues parlées, description détaillée
- **Suivre les performances** : Statistiques de vues, likes reçus, gestion du statut des offres
- **Dashboard complet** : Interface de gestion centralisée pour toutes leurs offres

### Pour les Touristes 🧳
- **Explorer les offres** : Rechercher et filtrer des expériences selon leurs critères
- **Système de favoris** : Sauvegarder les offres qui les intéressent
- **Recherche avancée** : Filtrer par ville, dates, prix, langues parlées
- **Interface intuitive** : Navigation facile avec système de like/unlike

## 🏗️ Architecture technique

### Frontend (Vue.js 3 + Vite)
```
frontend/
├── src/
│   ├── views/           # Pages principales
│   │   ├── Home.vue     # Page d'accueil
│   │   ├── Explorer.vue # Exploration des offres
│   │   ├── Dashboard.vue# Gestion pour guides
│   │   ├── Login.vue    # Connexion
│   │   └── Signup.vue   # Inscription
│   ├── components/      # Composants réutilisables
│   │   └── Navbar.vue   # Navigation
│   ├── services/        # Services API
│   │   └── api.js       # Gestion des données
│   └── router/          # Navigation
```

### Backend (Node.js + Express)
```
backend/
├── routes/
│   └── auth.js          # Authentification
├── config/
│   └── database.js      # Configuration BDD
├── middleware/          # Middlewares Express
└── server.js           # Serveur principal
```

## ✨ Fonctionnalités principales

### 🔐 Système d'authentification
- **Inscription multi-rôles** : Choix entre Guide ou Touriste
- **Connexion sécurisée** : JWT tokens pour l'authentification
- **Gestion des sessions** : Persistance avec localStorage

### 🎨 Interface utilisateur moderne
- **Design Airbnb-inspired** : Interface professionnelle et intuitive
- **Responsive design** : Adapté mobile et desktop
- **Animations fluides** : Transitions et effets visuels

### 🔍 Recherche et filtrage avancés
- **Recherche textuelle** : Par titre, description, lieu
- **Filtres multiples** : 
  - Localisation (ville)
  - Dates de disponibilité
  - Fourchette de prix
  - Langues parlées par le guide
- **Tri personnalisable** : Par date, prix, popularité

### 📊 Gestion des offres (Guides)
- **CRUD complet** : Créer, lire, modifier, supprimer
- **Upload d'images** : Photos pour illustrer les offres
- **Statut dynamique** : Activer/désactiver les offres
- **Statistiques** : Compteurs de vues et likes

### ❤️ Système de favoris (Touristes)
- **Like/Unlike** : Marquer les offres favorites
- **Dashboard personnel** : Centralisation des favoris
- **Gestion simplifiée** : Ajouter/retirer facilement

## 🛠️ Technologies utilisées

### Frontend
- **Vue.js 3** : Framework JavaScript progressif
- **Vite** : Build tool moderne et rapide
- **Vue Router** : Navigation SPA
- **CSS3** : Variables CSS, Flexbox, Grid
- **LocalStorage** : Persistance des données côté client

### Backend
- **Node.js** : Runtime JavaScript
- **Express.js** : Framework web minimaliste
- **JWT** : Authentification par tokens
- **bcrypt** : Hachage des mots de passe
- **MySQL** : Base de données relationnelle

### Outils de développement
- **ESLint** : Linting JavaScript
- **Git** : Contrôle de version
- **npm** : Gestionnaire de paquets

## 🚀 Démarrage rapide

### Prérequis
- Node.js (v16+)
- npm ou yarn
- MySQL (optionnel, utilise localStorage en développement)

### Installation

1. **Cloner le projet**
```bash
git clone <url-du-repo>
cd tourguide
```

2. **Backend**
```bash
cd backend
npm install
npm start
# Serveur sur http://localhost:3000
```

3. **Frontend**
```bash
cd frontend
npm install
npm run dev
# Interface sur http://localhost:5173
```

### Comptes de test
L'application utilise localStorage en mode développement, créez simplement des comptes via l'interface d'inscription.

## 📱 Utilisation

### Pour un Guide
1. **S'inscrire** en tant que "Guide Local"
2. **Se connecter** et accéder au Dashboard
3. **Créer une offre** avec tous les détails
4. **Gérer ses offres** : modification, activation/désactivation
5. **Suivre les statistiques** de performance

### Pour un Touriste
1. **S'inscrire** en tant que "Touriste"
2. **Explorer les offres** via la page dédiée
3. **Utiliser les filtres** pour affiner la recherche
4. **Ajouter aux favoris** les offres intéressantes
5. **Gérer ses favoris** depuis le Dashboard

## 🎨 Design et UX

L'interface s'inspire du design d'Airbnb avec :
- **Palette de couleurs harmonieuse** : Rouge primaire (#ff5a5f)
- **Typography claire** : Police Circular/system fonts
- **Espacement cohérent** : Variables CSS pour la constance
- **Cards élégantes** : Effets d'ombre et transitions
- **Navigation intuitive** : Menu responsive avec états visuels

## 🔄 Workflow de données

### Stockage local (Développement)
- **Offres** : `offers` dans localStorage
- **Favoris** : `likes_${userId}` par utilisateur
- **Authentification** : `authToken` et `user`

### API (Production)
- **RESTful endpoints** : CRUD standard
- **Authentification JWT** : Headers Authorization
- **Gestion d'erreurs** : Codes HTTP appropriés

## 🚀 Évolutions possibles

### Fonctionnalités avancées
- **Système de réservation** : Booking avec paiement
- **Chat en temps réel** : Communication guide-touriste
- **Géolocalisation** : Cartes interactives
- **Avis et notes** : Système de feedback
- **Notifications** : Push notifications
- **Multi-langues** : Internationalisation i18n

### Techniques
- **PWA** : Application web progressive
- **Tests automatisés** : Jest, Cypress
- **CI/CD** : Déploiement automatisé
- **Docker** : Containerisation
- **CDN** : Optimisation des images

## 📄 Licence

Ce projet est un prototype éducatif développé pour démontrer les concepts de développement web moderne avec Vue.js et Node.js.

---

**TourGuide** - Connecter les cultures, créer des souvenirs 🌍