/**
 * Configuration for Mictify App - Vercel Deployment
 */

const CONFIG = {
    // App Info
    APP_NAME: 'Mictify',
    VERSION: '1.0.0',
    
    // Environment
    ENVIRONMENT: 'production',
    
    // API Configuration
    API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/api'  // Local development
        : '/api',                      // Vercel production (same domain)
    
    // Music Storage
    MUSIC_PATH: './assets/music/',
    
    // PWA Settings
    PWA_ENABLED: true,
    
    // Cache Settings
    CACHE_MUSIC: true,
    CACHE_DURATION: 86400, // 24 hours
    
    // Vercel Deployment
    VERCEL_URL: 'https://mictify.vercel.app', // Update with your domain
    
    // Features
    FEATURES: {
        BACKGROUND_PLAYBACK: true,
        OFFLINE_MODE: true,
        PWA_INSTALL: true,
        SEARCH: true,
        SHUFFLE: true,
        REPEAT: true,
        VOLUME_CONTROL: true,
        ADMIN_PANEL: true,  // Enabled with Vercel API
        DATABASE: true      // Vercel Postgres
    }
};

// Export for use in other files
window.CONFIG = CONFIG;