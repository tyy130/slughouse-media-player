CREATE DATABASE IF NOT EXISTS slughouse_media;

USE slughouse_media;

CREATE TABLE IF NOT EXISTS tracks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    album VARCHAR(255),
    duration INT,
    file_path VARCHAR(500) NOT NULL,
    artwork_path VARCHAR(500),
    track_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create default admin user (password: admin123)
-- Hash generated with bcryptjs for 'admin123'
INSERT INTO admin_users (username, password_hash) 
VALUES ('admin', '$2a$10$xZvV3h1Z8WQG3YqZWVJXLO8E6uRx8aOoQxLzN8kKHQZLPQXcWQXGW')
ON DUPLICATE KEY UPDATE username=username;
