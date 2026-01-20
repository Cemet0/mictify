/**
 * Service Worker for Breakbeat Music Streaming
 * Enables background audio playback and offline capabilities
 */

const CACHE_NAME = 'breakbeat-music-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/src/main.js',
    '/css/main.css',
    '/css/reset.css',
    '/css/variables.css',
    '/css/responsive.css',
    '/assets/favicon.ico',
    '/assets/music/music-list.js'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    console.log('🎵 Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('🎵 Caching app resources');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.log('🎵 Cache failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('🎵 Service Worker activated');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🎵 Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            })
            .catch(() => {
                // If both cache and network fail, return offline page
                if (event.request.destination === 'document') {
                    return caches.match('/index.html');
                }
            })
    );
});

// Handle background sync for music playback
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-music') {
        console.log('🎵 Background sync for music playback');
        event.waitUntil(handleBackgroundMusic());
    }
});

// Handle background music playback
async function handleBackgroundMusic() {
    try {
        // Get current track from storage
        const clients = await self.clients.matchAll();
        if (clients.length > 0) {
            // Send message to client to continue playback
            clients[0].postMessage({
                type: 'CONTINUE_PLAYBACK'
            });
        }
    } catch (error) {
        console.log('🎵 Background music error:', error);
    }
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('🎵 Service Worker loaded successfully');