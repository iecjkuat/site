// JKUAT Innovation Club - Service Worker

const CACHE_NAME = 'jkuat-innovation-v1.0.0';
const urlsToCache = [
    '/',
    '/css/main.css',
    '/js/core/app.js',
    '/js/components/auth.js',
    '/js/components/navigation.js',
    '/js/pages/home.js',
    '/assets/images/logo.svg',
    '/templates/components/navigation.html',
    'https://cdn.jsdelivr.net/npm/tailwindcss@3.4.0/dist/tailwind.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('🔧 Service Worker: Caching files');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('🔧 Service Worker: Installation complete');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('🔧 Service Worker: Installation failed', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('🔧 Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🔧 Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('🔧 Service Worker: Activation complete');
            return self.clients.claim();
        })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip API requests (let them go to network)
    if (event.request.url.includes('/api/')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version if available
                if (response) {
                    console.log('🔧 Service Worker: Serving from cache', event.request.url);
                    return response;
                }

                // Otherwise fetch from network
                console.log('🔧 Service Worker: Fetching from network', event.request.url);
                return fetch(event.request).then((response) => {
                    // Don't cache if not a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response
                    const responseToCache = response.clone();

                    // Add to cache for future use
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
            .catch((error) => {
                console.error('🔧 Service Worker: Fetch failed', error);
                
                // Return offline page for navigation requests
                if (event.request.mode === 'navigate') {
                    return caches.match('/offline.html');
                }
            })
    );
});

// Background sync for analytics
self.addEventListener('sync', (event) => {
    if (event.tag === 'analytics-sync') {
        console.log('🔧 Service Worker: Syncing analytics data');
        event.waitUntil(syncAnalyticsData());
    }
});

// Sync analytics data when online
async function syncAnalyticsData() {
    try {
        // Get stored analytics data
        const cache = await caches.open('analytics-data');
        const requests = await cache.keys();
        
        for (const request of requests) {
            try {
                await fetch(request);
                await cache.delete(request);
                console.log('🔧 Service Worker: Analytics data synced');
            } catch (error) {
                console.error('🔧 Service Worker: Failed to sync analytics', error);
            }
        }
    } catch (error) {
        console.error('🔧 Service Worker: Sync failed', error);
    }
}

// Push notification handling
self.addEventListener('push', (event) => {
    console.log('🔧 Service Worker: Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New update from JKUAT Innovation Club!',
        icon: '/assets/images/logo.svg',
        badge: '/assets/images/logo.svg',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Details',
                icon: '/assets/images/logo.svg'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/assets/images/logo.svg'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('JKUAT Innovation Club', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    console.log('🔧 Service Worker: Notification clicked');
    
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
    console.log('🔧 Service Worker: Message received', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('🔧 Service Worker: Script loaded');