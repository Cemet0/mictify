// Vercel Serverless Function - Health Check v2
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
            message: 'Mictify API is running on Vercel - Updated',
            timestamp: new Date().toISOString(),
            version: '1.0.1',
            platform: 'Vercel Serverless Functions',
            status: 'healthy'
        });
    } else {
        res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });
    }
}