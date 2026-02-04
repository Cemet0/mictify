// Vercel Serverless Function - Music CRUD
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    try {
        switch (req.method) {
            case 'GET':
                return await getMusicList(req, res);
            case 'POST':
                return await addMusic(req, res);
            case 'PUT':
                return await updateMusic(req, res);
            case 'DELETE':
                return await deleteMusic(req, res);
            default:
                res.status(405).json({
                    success: false,
                    message: 'Method not allowed'
                });
        }
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

// Get all music
async function getMusicList(req, res) {
    try {
        const { rows } = await sql`
            SELECT * FROM music 
            ORDER BY category, title ASC
        `;
        
        res.status(200).json({
            success: true,
            data: rows,
            count: rows.length
        });
    } catch (error) {
        // If table doesn't exist, return empty array
        if (error.message.includes('relation "music" does not exist')) {
            res.status(200).json({
                success: true,
                data: [],
                count: 0,
                message: 'Database not initialized'
            });
        } else {
            throw error;
        }
    }
}

// Add new music
async function addMusic(req, res) {
    const { title, artist, album, genre, category, filename, file_path, duration } = req.body;
    
    if (!title || !artist || !category || !filename || !file_path) {
        return res.status(400).json({
            success: false,
            message: 'Required fields: title, artist, category, filename, file_path'
        });
    }
    
    const { rows } = await sql`
        INSERT INTO music (title, artist, album, genre, category, filename, file_path, duration)
        VALUES (${title}, ${artist}, ${album || ''}, ${genre || ''}, ${category}, ${filename}, ${file_path}, ${duration || 0})
        RETURNING *
    `;
    
    res.status(201).json({
        success: true,
        message: 'Music added successfully',
        data: rows[0]
    });
}

// Update music
async function updateMusic(req, res) {
    const { id } = req.query;
    const { title, artist, album, genre, category, filename, file_path, duration } = req.body;
    
    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'Music ID required'
        });
    }
    
    const { rows } = await sql`
        UPDATE music 
        SET title = ${title}, artist = ${artist}, album = ${album}, genre = ${genre}, 
            category = ${category}, filename = ${filename}, file_path = ${file_path}, 
            duration = ${duration}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
    `;
    
    if (rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Music not found'
        });
    }
    
    res.status(200).json({
        success: true,
        message: 'Music updated successfully',
        data: rows[0]
    });
}

// Delete music
async function deleteMusic(req, res) {
    const { id } = req.query;
    
    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'Music ID required'
        });
    }
    
    const { rows } = await sql`
        DELETE FROM music WHERE id = ${id}
        RETURNING *
    `;
    
    if (rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Music not found'
        });
    }
    
    res.status(200).json({
        success: true,
        message: 'Music deleted successfully',
        data: rows[0]
    });
}