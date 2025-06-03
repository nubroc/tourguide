-- Base de données TourGuide pour MySQL (Version simplifiée)
CREATE DATABASE IF NOT EXISTS tourguide;
USE tourguide;

-- Table des utilisateurs (Essentielle)
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(191) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(191) NOT NULL,
  role ENUM('tourist', 'guide') NOT NULL,
  profile_photo_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
);

-- Table des langues parlées (Essentielle pour le matching)
CREATE TABLE user_languages (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  language_code VARCHAR(5) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_language (user_id, language_code)
);

-- Table des guides (Informations spécifiques guides)
CREATE TABLE guides (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) UNIQUE NOT NULL,
  cities TEXT NOT NULL,
  website_url VARCHAR(500),
  instagram_url VARCHAR(500),
  facebook_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des activités (Essentielle pour l'offre)
CREATE TABLE activities (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  guide_id VARCHAR(36) NOT NULL,
  title VARCHAR(191) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration DECIMAL(4,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (guide_id) REFERENCES guides(id) ON DELETE CASCADE,
  INDEX idx_activities_guide (guide_id),
  INDEX idx_activities_title (title(50))
);

-- Table des langues par activité (Pour le matching linguistique)
CREATE TABLE activity_languages (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  activity_id VARCHAR(36) NOT NULL,
  language_code VARCHAR(5) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  UNIQUE KEY unique_activity_language (activity_id, language_code)
);

-- Fonction UUID pour compatibilité
DELIMITER //
CREATE FUNCTION IF NOT EXISTS generate_uuid() RETURNS VARCHAR(36)
READS SQL DATA
DETERMINISTIC
BEGIN
  RETURN UUID();
END//
DELIMITER ;

-- Données de test
INSERT INTO users (id, email, password_hash, full_name, role) VALUES 
(UUID(), 'admin@tourguide.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewaBn7JYAW.5rKm6', 'Admin TourGuide', 'guide');

INSERT INTO users (id, email, password_hash, full_name, role) VALUES 
(UUID(), 'tourist@tourguide.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewaBn7JYAW.5rKm6', 'Tourist Test', 'tourist');