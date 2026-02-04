/**
 * Configuration for Mictify App
 */

const CONFIG = {
    // API Base URL - ganti dengan URL backend production
    API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://127.0.0.1:3001/api'  // Development
        : 'https://mictify-production.up.railway.app/api', // Production
    
    // App Info
    APP_NAME: 'Mictify',
    VERSION: '1.0.0',
    
    // Features
    FEATURES: {
        ADMIN_PANEL: true,
        UPLOAD_MUSIC: true,
        PWA: true,
        BACKGROUND_PLAYBACK: true
    }
};

// Export for use in other files
window.CONFIG = CONFIG;