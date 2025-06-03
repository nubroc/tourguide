-- Base de données TourGuide pour MySQL (Version avec annonces)
CREATE DATABASE IF NOT EXISTS tourguide;
USE tourguide;

-- Table des utilisateurs (Existante - inchangée)
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

-- Table des langues parlées (Existante - inchangée)
CREATE TABLE user_languages (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  language_code VARCHAR(5) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_language (user_id, language_code)
);

-- Table des guides (Existante - inchangée)
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

-- ✨ NOUVELLE TABLE : Annonces de tours/visites
CREATE TABLE tour_offers (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  guide_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  photo_url VARCHAR(500),
  tour_date DATE NOT NULL,
  tour_time TIME,
  location VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  max_participants INT DEFAULT 10,
  current_participants INT DEFAULT 0,
  status ENUM('active', 'inactive', 'completed', 'cancelled') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (guide_id) REFERENCES guides(id) ON DELETE CASCADE,
  
  -- Index pour optimiser les recherches
  INDEX idx_tour_offers_guide (guide_id),
  INDEX idx_tour_offers_date (tour_date),
  INDEX idx_tour_offers_city (city),
  INDEX idx_tour_offers_status (status),
  INDEX idx_tour_offers_location (location),
  INDEX idx_tour_offers_price (price),
  
  -- Index composés pour les filtres combinés
  INDEX idx_tour_offers_city_date (city, tour_date),
  INDEX idx_tour_offers_date_status (tour_date, status),
  INDEX idx_tour_offers_city_price (city, price)
);

-- ✨ NOUVELLE TABLE : Langues disponibles pour chaque offre
CREATE TABLE tour_offer_languages (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  offer_id VARCHAR(36) NOT NULL,
  language_code VARCHAR(5) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (offer_id) REFERENCES tour_offers(id) ON DELETE CASCADE,
  UNIQUE KEY unique_offer_language (offer_id, language_code),
  INDEX idx_offer_languages_code (language_code)
);

-- ✨ NOUVELLE TABLE : Système de likes/favoris
CREATE TABLE offer_likes (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  offer_id VARCHAR(36) NOT NULL,
  tourist_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (offer_id) REFERENCES tour_offers(id) ON DELETE CASCADE,
  FOREIGN KEY (tourist_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Un touriste ne peut liker qu'une fois la même offre
  UNIQUE KEY unique_tourist_like (tourist_id, offer_id),
  
  INDEX idx_offer_likes_offer (offer_id),
  INDEX idx_offer_likes_tourist (tourist_id)
);

-- ✨ NOUVELLE TABLE : Statistiques des offres (optionnelle)
CREATE TABLE offer_stats (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  offer_id VARCHAR(36) UNIQUE NOT NULL,
  views_count INT DEFAULT 0,
  likes_count INT DEFAULT 0,
  bookings_count INT DEFAULT 0,
  last_viewed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (offer_id) REFERENCES tour_offers(id) ON DELETE CASCADE,
  INDEX idx_offer_stats_views (views_count),
  INDEX idx_offer_stats_likes (likes_count)
);

-- Table des activités (Simplifiée - garde pour compatibilité)
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

-- Table des langues par activité (Garde pour compatibilité)
CREATE TABLE activity_languages (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  activity_id VARCHAR(36) NOT NULL,
  language_code VARCHAR(5) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  UNIQUE KEY unique_activity_language (activity_id, language_code)
);

-- ✨ TRIGGERS pour maintenir les statistiques automatiquement
DELIMITER //

-- Trigger pour incrémenter likes_count
CREATE TRIGGER increment_likes_count 
AFTER INSERT ON offer_likes
FOR EACH ROW
BEGIN
  INSERT INTO offer_stats (id, offer_id, likes_count) 
  VALUES (UUID(), NEW.offer_id, 1)
  ON DUPLICATE KEY UPDATE 
    likes_count = likes_count + 1,
    updated_at = CURRENT_TIMESTAMP;
END//

-- Trigger pour décrémenter likes_count
CREATE TRIGGER decrement_likes_count 
AFTER DELETE ON offer_likes
FOR EACH ROW
BEGIN
  UPDATE offer_stats 
  SET likes_count = GREATEST(likes_count - 1, 0),
      updated_at = CURRENT_TIMESTAMP
  WHERE offer_id = OLD.offer_id;
END//

DELIMITER ;

-- Fonction UUID pour compatibilité
DELIMITER //
CREATE FUNCTION IF NOT EXISTS generate_uuid() RETURNS VARCHAR(36)
READS SQL DATA
DETERMINISTIC
BEGIN
  RETURN UUID();
END//
DELIMITER ;

-- ✨ DONNÉES DE TEST pour les nouvelles tables
INSERT INTO users (id, email, password_hash, full_name, role) VALUES 
(UUID(), 'guide.paris@tourguide.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewaBn7JYAW.5rKm6', 'Marie Dubois', 'guide'),
(UUID(), 'guide.lyon@tourguide.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewaBn7JYAW.5rKm6', 'Pierre Martin', 'guide'),
(UUID(), 'tourist1@tourguide.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewaBn7JYAW.5rKm6', 'Sophie Touriste', 'tourist');

-- Insérer des guides de test
SET @guide1_user_id = (SELECT id FROM users WHERE email = 'guide.paris@tourguide.com');
SET @guide2_user_id = (SELECT id FROM users WHERE email = 'guide.lyon@tourguide.com');

INSERT INTO guides (id, user_id, cities) VALUES 
(UUID(), @guide1_user_id, 'Paris, Versailles'),
(UUID(), @guide2_user_id, 'Lyon, Annecy');

-- Insérer des offres de test
SET @guide1_id = (SELECT id FROM guides WHERE user_id = @guide1_user_id);
SET @guide2_id = (SELECT id FROM guides WHERE user_id = @guide2_user_id);

INSERT INTO tour_offers (id, guide_id, title, description, price, tour_date, tour_time, location, city, max_participants) VALUES 
(UUID(), @guide1_id, 'Visite des Champs-Élysées', 'Découvrez l\'avenue la plus célèbre de Paris avec ses boutiques de luxe et son histoire fascinante.', 25.00, '2025-06-15', '14:00:00', 'Arc de Triomphe', 'Paris', 15),
(UUID(), @guide1_id, 'Montmartre authentique', 'Explorez le quartier bohème de Montmartre, ses artistes et la basilique du Sacré-Cœur.', 30.00, '2025-06-20', '10:00:00', 'Place du Tertre', 'Paris', 12),
(UUID(), @guide2_id, 'Vieux Lyon Renaissance', 'Promenade dans le quartier Renaissance de Lyon classé UNESCO.', 20.00, '2025-06-18', '15:30:00', 'Place Bellecour', 'Lyon', 10);

-- Insérer des langues pour les offres
SET @offer1_id = (SELECT id FROM tour_offers WHERE title = 'Visite des Champs-Élysées');
SET @offer2_id = (SELECT id FROM tour_offers WHERE title = 'Montmartre authentique');
SET @offer3_id = (SELECT id FROM tour_offers WHERE title = 'Vieux Lyon Renaissance');

INSERT INTO tour_offer_languages (id, offer_id, language_code) VALUES 
(UUID(), @offer1_id, 'fr'),
(UUID(), @offer1_id, 'en'),
(UUID(), @offer2_id, 'fr'),
(UUID(), @offer2_id, 'en'),
(UUID(), @offer2_id, 'es'),
(UUID(), @offer3_id, 'fr'),
(UUID(), @offer3_id, 'en');

-- Insérer des likes de test
SET @tourist_id = (SELECT id FROM users WHERE email = 'tourist1@tourguide.com');

INSERT INTO offer_likes (id, offer_id, tourist_id) VALUES 
(UUID(), @offer1_id, @tourist_id),
(UUID(), @offer2_id, @tourist_id);