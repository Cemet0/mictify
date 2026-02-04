// Vercel Serverless Function - Database Setup
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed. Use POST to setup database.'
        });
    }
    
    try {
        // Create admins table
        await sql`
            CREATE TABLE IF NOT EXISTS admins (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        // Create music table
        await sql`
            CREATE TABLE IF NOT EXISTS music (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                artist VARCHAR(255) NOT NULL,
                album VARCHAR(255),
                genre VARCHAR(100),
                category VARCHAR(50) NOT NULL,
                filename VARCHAR(255) NOT NULL,
                file_path VARCHAR(500) NOT NULL,
                duration INTEGER DEFAULT 0,
                file_size BIGINT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        // Insert admin user (username: admin, password: 12345678)
        await sql`
            INSERT INTO admins (username, password) 
            VALUES ('admin', MD5('12345678'))
            ON CONFLICT (username) DO NOTHING
        `;
        
        // Insert sample music data from current music-list.js
        const sampleMusic = [
            {
                title: 'Baby (Amapiano Remix)',
                artist: 'Justin Bieber - Yukepo88Music',
                album: 'Remix Collection',
                genre: 'Breakbeat',
                category: 'breakbeat',
                filename: 'Baby - Justin Bieber -  Amapiano Remix - Yukepo88Music.mp3',
                file_path: 'breakbeat/Baby - Justin Bieber -  Amapiano Remix - Yukepo88Music.mp3',
                duration: 180
            },
            {
                title: 'Apocalypse',
                artist: 'Cigarettes After Sex',
                album: 'Cigarettes After Sex',
                genre: 'Dream Pop',
                category: 'cigarettes-after-sex',
                filename: 'Apocalypse - Cigarettes After Sex - Cigarettes After Sex.mp3',
                file_path: 'Cigarettes After Sex/Apocalypse - Cigarettes After Sex - Cigarettes After Sex.mp3',
                duration: 201
            },
            {
                title: 'Ada Selamanya',
                artist: 'For Revenge & Fiersa Besari',
                album: 'For Revenge',
                genre: 'Alternative Rock',
                category: 'for-revenge',
                filename: 'For Revenge & Fiersa Besari - Ada Selamanya (Official Music Video) - DIDI MUSIC RECORDS.mp3',
                file_path: 'for revenge/For Revenge & Fiersa Besari - Ada Selamanya (Official Music Video) - DIDI MUSIC RECORDS.mp3',
                duration: 245
            }
        ];
        
        // Insert sample data
        for (const music of sampleMusic) {
            await sql`
                INSERT INTO music (title, artist, album, genre, category, filename, file_path, duration)
                VALUES (${music.title}, ${music.artist}, ${music.album}, ${music.genre}, ${music.category}, ${music.filename}, ${music.file_path}, ${music.duration})
                ON CONFLICT DO NOTHING
            `;
        }
        
        // Get table counts
        const { rows: adminCount } = await sql`SELECT COUNT(*) FROM admins`;
        const { rows: musicCount } = await sql`SELECT COUNT(*) FROM music`;
        
        res.status(200).json({
            success: true,
            message: 'Database setup completed successfully',
            tables: {
                admins: parseInt(adminCount[0].count),
                music: parseInt(musicCount[0].count)
            }
        });
        
    } catch (error) {
        console.error('Database setup error:', error);
        res.status(500).json({
            success: false,
            message: 'Database setup failed',
            error: error.message
        });
    }
}