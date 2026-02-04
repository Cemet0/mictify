const express = require('express');
const md5 = require('md5');
const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');
const router = express.Router();

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }
        
        // Hash the input password with MD5
        const hashedPassword = md5(password);
        
        // Check admin credentials
        const query = 'SELECT * FROM admins WHERE username = ? AND password_hash = ?';
        const results = await executeQuery(query, [username, hashedPassword]);
        
        if (results.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }
        
        const admin = results[0];
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                id: admin.id, 
                username: admin.username, 
                role: 'admin' 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            success: true,
            message: 'Login successful',
            token: token,
            admin: {
                id: admin.id,
                username: admin.username
            }
        });
        
        console.log(`✅ Admin login successful: ${username}`);
        
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Verify token endpoint
router.get('/verify', async (req, res) => {
    const token = req.headers['authorization'];
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'No token provided'
        });
    }
    
    try {
        const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
        
        res.json({
            success: true,
            admin: {
                id: decoded.id,
                username: decoded.username
            }
        });
    } catch (error) {
        res.status(403).json({
            success: false,
            message: 'Invalid token'
        });
    }
});

module.exports = router;