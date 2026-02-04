-- Mictify Database Setup for Production

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create music table
CREATE TABLE IF NOT EXISTS music (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    album VARCHAR(255),
    genre VARCHAR(100),
    category VARCHAR(50) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    duration INT DEFAULT 0,
    file_size BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert admin user (username: admin, password: 12345678)
INSERT INTO admins (username, password) 
VALUES ('admin', MD5('12345678'))
ON DUPLICATE KEY UPDATE password = MD5('12345678');

-- Insert sample music data (optional)
INSERT INTO music (title, artist, album, genre, category, filename, file_path, duration) VALUES
('Baby (Amapiano Remix)', 'Justin Bieber - Yukepo88Music', 'Remix Collection', 'Breakbeat', 'breakbeat', 'Baby - Justin Bieber -  Amapiano Remix - Yukepo88Music.mp3', 'breakbeat/Baby - Justin Bieber -  Amapiano Remix - Yukepo88Music.mp3', 180),
('Berubah Tenxi - Sudah Selesai Ceritapun Berakhir (Viral TikTok 2026)', 'DJ Jieng Fvnky', 'TikTok Viral 2026', 'Breakbeat', 'breakbeat', 'DJ BERUBAH TENXI  SUDAH SELESAI CERITAPUN BERAKHIR VIRAL TIKTOK TERBARU 2026 - Jieng Fvnky.mp3', 'breakbeat/DJ BERUBAH TENXI  SUDAH SELESAI CERITAPUN BERAKHIR VIRAL TIKTOK TERBARU 2026 - Jieng Fvnky.mp3', 195)
ON DUPLICATE KEY UPDATE title = VALUES(title);