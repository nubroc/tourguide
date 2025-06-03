-- Base de données TourGuide simplifiée - Version authentification seule
CREATE DATABASE IF NOT EXISTS tourguide;
USE tourguide;

-- Table des utilisateurs (simplifiée)
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role ENUM('tourist', 'guide') NOT NULL DEFAULT 'tourist',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Index pour optimiser les requêtes
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
);
