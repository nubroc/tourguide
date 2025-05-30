-- Base de données TourGuide pour MySQL
CREATE DATABASE IF NOT EXISTS tourguide;
USE tourguide;

-- Table des utilisateurs
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(191) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(191) NOT NULL,
  role ENUM('tourist', 'guide') NOT NULL,
  profile_photo_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des langues parlées par les utilisateurs
CREATE TABLE user_languages (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  language_code VARCHAR(5) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_language (user_id, language_code)
);

-- Table des touristes (informations spécifiques)
CREATE TABLE tourists (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) UNIQUE NOT NULL,
  country VARCHAR(100) NOT NULL,
  destination VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des centres d'intérêt des touristes
CREATE TABLE tourist_interests (
  id VARCHAR(36) PRIMARY KEY,
  tourist_id VARCHAR(36) NOT NULL,
  interest VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tourist_id) REFERENCES tourists(id) ON DELETE CASCADE,
  INDEX idx_tourist_interests (tourist_id)
);

-- Table des guides (informations spécifiques)
CREATE TABLE guides (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) UNIQUE NOT NULL,
  cities TEXT NOT NULL,
  website_url VARCHAR(500),
  instagram_url VARCHAR(500),
  facebook_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des activités proposées par les guides
CREATE TABLE activities (
  id VARCHAR(36) PRIMARY KEY,
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

-- Table des langues disponibles pour chaque activité
CREATE TABLE activity_languages (
  id VARCHAR(36) PRIMARY KEY,
  activity_id VARCHAR(36) NOT NULL,
  language_code VARCHAR(5) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  UNIQUE KEY unique_activity_language (activity_id, language_code)
);

-- Table des disponibilités des guides
CREATE TABLE guide_availability (
  id VARCHAR(36) PRIMARY KEY,
  guide_id VARCHAR(36) NOT NULL,
  day_of_week INT CHECK (day_of_week BETWEEN 1 AND 7),
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (guide_id) REFERENCES guides(id) ON DELETE CASCADE,
  INDEX idx_guide_availability (guide_id, day_of_week)
);

-- Table des sessions/réservations
CREATE TABLE sessions (
  id VARCHAR(36) PRIMARY KEY,
  tourist_id VARCHAR(36) NOT NULL,
  activity_id VARCHAR(36) NOT NULL,
  guide_id VARCHAR(36) NOT NULL,
  session_date DATE NOT NULL,
  session_time TIME NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tourist_id) REFERENCES tourists(id) ON DELETE CASCADE,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  FOREIGN KEY (guide_id) REFERENCES guides(id) ON DELETE CASCADE,
  INDEX idx_sessions_tourist (tourist_id),
  INDEX idx_sessions_guide (guide_id),
  INDEX idx_sessions_date (session_date),
  INDEX idx_sessions_status (status)
);

-- Index optimisés pour les performances
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created ON users(created_at);

-- Procédure pour insérer un utilisateur avec UUID automatique
DELIMITER //
CREATE FUNCTION generate_uuid() RETURNS VARCHAR(36)
READS SQL DATA
DETERMINISTIC
BEGIN
  RETURN UUID();
END//
DELIMITER ;

-- Modifier les tables pour utiliser la fonction UUID
ALTER TABLE users MODIFY id VARCHAR(36) DEFAULT (UUID());
ALTER TABLE user_languages MODIFY id VARCHAR(36) DEFAULT (UUID());
ALTER TABLE tourists MODIFY id VARCHAR(36) DEFAULT (UUID());
ALTER TABLE tourist_interests MODIFY id VARCHAR(36) DEFAULT (UUID());
ALTER TABLE guides MODIFY id VARCHAR(36) DEFAULT (UUID());
ALTER TABLE activities MODIFY id VARCHAR(36) DEFAULT (UUID());
ALTER TABLE activity_languages MODIFY id VARCHAR(36) DEFAULT (UUID());
ALTER TABLE guide_availability MODIFY id VARCHAR(36) DEFAULT (UUID());
ALTER TABLE sessions MODIFY id VARCHAR(36) DEFAULT (UUID());

-- Données de test (optionnel)
INSERT INTO users (id, email, password_hash, full_name, role) VALUES 
(UUID(), 'admin@tourguide.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewaBn7JYAW.5rKm6', 'Admin TourGuide', 'guide');