const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { parseFile } = require('music-metadata');
const { executeQuery } = require('../config/database');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const category = req.body.category || 'breakbeat';
        const uploadPath = path.join(__dirname, '../uploads', category);
        
        // Create directory if it doesn't exist
        fs.ensureDirSync(uploadPath);
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50000000 // 50MB
    },
    fileFilter: function (req, file, cb) {
        // Only allow MP3 files
        if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/mp3') {
            cb(null, true);
        } else {
            cb(new Error('Only MP3 files are allowed!'), false);
        }
    }
});

// Get all music
router.get('/', async (req, res) => {
    try {
        console.log('🔍 Getting all music...');
        const startTime = Date.now();
        
        const query = 'SELECT * FROM music ORDER BY created_at DESC';
        const results = await executeQuery(query);
        
        const queryTime = Date.now() - startTime;
        console.log(`✅ Query completed in ${queryTime}ms, found ${results.length} tracks`);
        
        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('❌ Get music error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch music'
        });
    }
});

// Get music by category
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const query = 'SELECT * FROM music WHERE category = ? ORDER BY title ASC';
        const results = await executeQuery(query, [category]);
        
        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('❌ Get music by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch music by category'
        });
    }
});

// Upload new music (Admin only)
router.post('/upload', verifyToken, requireAdmin, upload.single('musicFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }
        
        const { title, artist, album, genre, category } = req.body;
        const file = req.file;
        
        // Extract metadata from MP3 file
        let metadata = {};
        try {
            const musicMetadata = await parseFile(file.path);
            metadata = {
                title: title || musicMetadata.common.title || 'Unknown Title',
                artist: artist || musicMetadata.common.artist || 'Unknown Artist',
                album: album || musicMetadata.common.album || 'Unknown Album',
                genre: genre || musicMetadata.common.genre?.[0] || 'Unknown',
                duration: Math.floor(musicMetadata.format.duration) || 0
            };
        } catch (metaError) {
            console.log('⚠️ Could not extract metadata, using provided data');
            metadata = {
                title: title || 'Unknown Title',
                artist: artist || 'Unknown Artist',
                album: album || 'Unknown Album',
                genre: genre || 'Unknown',
                duration: 0
            };
        }
        
        // Save to database
        const query = `
            INSERT INTO music (title, artist, album, genre, category, filename, file_path, duration, file_size)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const relativePath = `${category}/${file.filename}`;
        
        // Copy file to assets/music folder for frontend access
        const frontendPath = path.join(__dirname, '../../assets/music', category);
        await fs.ensureDir(frontendPath);
        const frontendFilePath = path.join(frontendPath, file.filename);
        await fs.copy(file.path, frontendFilePath);
        
        console.log('✅ File copied to frontend:', frontendFilePath);
        
        const result = await executeQuery(query, [
            metadata.title,
            metadata.artist,
            metadata.album,
            metadata.genre,
            category,
            file.filename,
            relativePath,
            metadata.duration,
            file.size
        ]);
        
        // Generate updated music-list.js
        await generateMusicListJS();
        
        res.json({
            success: true,
            message: 'Music uploaded successfully',
            data: {
                id: result.insertId,
                ...metadata,
                category,
                filename: file.filename,
                file_path: relativePath
            }
        });
        
        console.log(`✅ Music uploaded: ${metadata.title} by ${metadata.artist}`);
        
    } catch (error) {
        console.error('❌ Upload error:', error);
        
        // Clean up uploaded file if database insert failed
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to upload music'
        });
    }
});

// Update music (Admin only)
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, artist, album, genre, category } = req.body;
        
        const query = `
            UPDATE music 
            SET title = ?, artist = ?, album = ?, genre = ?, category = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        await executeQuery(query, [title, artist, album, genre, category, id]);
        
        // Generate updated music-list.js
        await generateMusicListJS();
        
        res.json({
            success: true,
            message: 'Music updated successfully'
        });
        
        console.log(`✅ Music updated: ID ${id}`);
        
    } catch (error) {
        console.error('❌ Update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update music'
        });
    }
});

// Delete music (Admin only)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get file info before deleting
        const getQuery = 'SELECT * FROM music WHERE id = ?';
        const musicData = await executeQuery(getQuery, [id]);
        
        if (musicData.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Music not found'
            });
        }
        
        const music = musicData[0];
        
        // Delete from database
        const deleteQuery = 'DELETE FROM music WHERE id = ?';
        await executeQuery(deleteQuery, [id]);
        
        // Delete file from filesystem
        const filePath = path.join(__dirname, '../', music.file_path);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`🗑️ File deleted: ${filePath}`);
        }
        
        // Generate updated music-list.js
        await generateMusicListJS();
        
        res.json({
            success: true,
            message: 'Music deleted successfully'
        });
        
        console.log(`✅ Music deleted: ${music.title}`);
        
    } catch (error) {
        console.error('❌ Delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete music'
        });
    }
});

// Generate music-list.js for frontend
async function generateMusicListJS() {
    try {
        const query = 'SELECT * FROM music ORDER BY category, title ASC';
        const results = await executeQuery(query);
        
        // Convert database results to frontend format
        const musicList = results.map(music => ({
            filename: `${music.category}/${music.filename}`,
            title: music.title,
            artist: music.artist,
            album: music.album,
            genre: music.genre,
            category: music.category,
            duration: music.duration
        }));
        
        // Generate JavaScript file content
        const jsContent = `/**
 * Daftar musik yang tersedia di folder assets/music
 * File musik sudah diorganisir dalam folder berdasarkan kategori
 * Durasi sudah ditentukan untuk menghindari loading
 * Diurutkan berdasarkan abjad A-Z per kategori
 * 
 * Auto-generated from database: ${new Date().toISOString()}
 */

window.MUSIC_LIST = ${JSON.stringify(musicList, null, 4)};

/**
 * MUSIK SUDAH SIAP!
 * 
 * Total: ${musicList.length} tracks
 * - Breakbeat: ${musicList.filter(m => m.category === 'breakbeat').length} tracks
 * - For Revenge: ${musicList.filter(m => m.category === 'for-revenge').length} tracks
 * - Cigarettes After Sex: ${musicList.filter(m => m.category === 'cigarettes-after-sex').length} tracks
 * 
 * Struktur folder:
 * - assets/music/breakbeat/ (${musicList.filter(m => m.category === 'breakbeat').length} tracks)
 * - assets/music/for revenge/ (${musicList.filter(m => m.category === 'for-revenge').length} tracks)
 * - assets/music/Cigarettes After Sex/ (${musicList.filter(m => m.category === 'cigarettes-after-sex').length} tracks)
 * 
 * ✨ FITUR BARU: 
 * - Durasi musik sudah ditentukan (tanpa loading)
 * - Semua lagu diurutkan A-Z per kategori
 * - Auto-generated dari database
 * 
 * Buka index.html di browser untuk mulai streaming musik!
 */`;
        
        // Write to frontend assets folder
        const outputPath = path.join(__dirname, '../../assets/music/music-list.js');
        await fs.writeFile(outputPath, jsContent);
        
        console.log('✅ music-list.js generated successfully');
        
    } catch (error) {
        console.error('❌ Failed to generate music-list.js:', error);
    }
}

// Generate music-list.js endpoint (Admin only)
router.post('/generate-list', verifyToken, requireAdmin, async (req, res) => {
    try {
        await generateMusicListJS();
        res.json({
            success: true,
            message: 'music-list.js generated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to generate music-list.js'
        });
    }
});

module.exports = router;