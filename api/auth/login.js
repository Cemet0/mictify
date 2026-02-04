// Vercel Serverless Function - Admin Login
import crypto from 'crypto';

// Simple admin credentials (nanti bisa dari database)
const ADMIN_USER = {
    username: 'admin',
    password: crypto.createHash('md5').update('12345678').digest('hex')
};

export default function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method === 'POST') {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password required'
            });
        }
        
        // Hash password dengan MD5
        const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
        
        // Check credentials
        if (username === ADMIN_USER.username && hashedPassword === ADMIN_USER.password) {
            // Generate simple token
            const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
            
            res.status(200).json({
                success: true,
                message: 'Login successful',
                token: token,
                user: {
                    username: username,
                    role: 'admin'
                }
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
    } else {
        res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });
    }
}