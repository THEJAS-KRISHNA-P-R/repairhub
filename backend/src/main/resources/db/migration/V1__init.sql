CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  bio TEXT,
  avatar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS badges (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  variant ENUM('DEFAULT','SECONDARY','OUTLINE') NOT NULL
);

CREATE TABLE IF NOT EXISTS user_badges (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  badge_id BIGINT NOT NULL,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, badge_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS repair_posts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  issue_description TEXT,
  repair_steps TEXT,
  success BOOLEAN DEFAULT FALSE,
  date DATE NOT NULL,
  images JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  repair_post_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  parent_id BIGINT,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (repair_post_id) REFERENCES repair_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS guides (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  guide_content TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO users (username, email, password)
VALUES ('testuser','test@example.com','x'),('john_doe','john@example.com','x')
ON DUPLICATE KEY UPDATE email=VALUES(email);

INSERT INTO badges (name, description, variant) VALUES
('First Repair','Created your first repair log','DEFAULT'),
('Contributor','Posted 5 repair logs','SECONDARY'),
('Helpful','Made 10 comments','OUTLINE')
ON DUPLICATE KEY UPDATE description=VALUES(description), variant=VALUES(variant);


