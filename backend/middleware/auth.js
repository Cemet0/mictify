const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware to verify JWT token
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Access denied. No token provided.' 
        });
    }
    
    try {
        // Remove 'Bearer ' prefix if present
        const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
        
        // Verify token
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ 
            success: false, 
            message: 'Invalid token.' 
        });
    }
}

// Middleware to check if user is admin
function requireAdmin(req, res, next) {
    if (!req.admin || req.admin.role !== 'admin') {
        return res.status(403).json({ 
            success: false, 
            message: 'Admin access required.' 
        });
    }
    next();
}

module.exports = {
    verifyToken,
    requireAdmin
};