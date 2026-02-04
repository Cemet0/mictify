/**
 * Configuration for Mictify App - Frontend Only
 * Updated: 2026-02-04T02:30:00.000Z
 */

const CONFIG = {
    // App Info
    APP_NAME: 'Mictify',
    VERSION: '1.0.0',
    
    // Environment
    ENVIRONMENT: 'production',
    
    // Frontend-only mode (no backend)
    FRONTEND_ONLY: true,
    
    // Music Storage
    MUSIC_PATH: './assets/music/',
    
    // PWA Settings
    PWA_ENABLED: true,
    
    // Cache Settings
    CACHE_MUSIC: true,
    CACHE_DURATION: 86400, // 24 hours
    
    // Vercel Deployment
    VERCEL_URL: 'https://mictify.vercel.app',
    
    // Features
    FEATURES: {
        BACKGROUND_PLAYBACK: true,
        OFFLINE_MODE: true,
        PWA_INSTALL: true,
        SEARCH: true,
        SHUFFLE: true,
        REPEAT: true,
        VOLUME_CONTROL: true,
        ADMIN_PANEL: false,  // Disabled - frontend only
        DATABASE: false      // No database
    }
};

// Export for use in other files
window.CONFIG = CONFIG;