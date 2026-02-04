// Vercel Serverless Function - Health Check
export default function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method === 'GET') {
        res.status(200).json({
            success: true,
            message: 'Mictify API is running on Vercel',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            platform: 'Vercel Serverless Functions'
        });
    } else {
        res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });
    }
}