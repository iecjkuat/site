// JKUAT Innovation Club - Service Worker for Push Notifications
const CACHE_NAME = 'jkuat-innovation-club-v1';
const urlsToCache = [
    '/',
    '/css/main.css',
    '/js/core/app.js',
    '/assets/images/logo.png',
    '/assets/images/badge.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching files');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('Service Worker: Installed successfully');
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Activated successfully');
            return self.clients.claim();
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
    );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push notification received');
    
    let notificationData = {};
    
    if (event.data) {
        try {
            notificationData = event.data.json();
        } catch (error) {
            console.error('Error parsing push notification data:', error);
            notificationData = {
                title: 'JKUAT Innovation Club',
                body: 'You have a new notification',
                icon: '/assets/images/logo.png',
                badge: '/assets/images/badge.png'
            };
        }
    }

    const notificationOptions = {
        body: notificationData.body || notificationData.message,
        icon: notificationData.icon || '/assets/images/logo.png',
        badge: notificationData.badge || '/assets/images/badge.png',
        image: notificationData.image,
        data: notificationData.data || {},
        actions: notificationData.actions || [],
        tag: notificationData.tag || 'jkuat-notification',
        renotify: true,
        requireInteraction: notificationData.requireInteraction || false,
        silent: notificationData.silent || false,
        vibrate: notificationData.vibrate || [200, 100, 200],
        timestamp: Date.now()
    };

    event.waitUntil(
        self.registration.showNotification(
            notificationData.title || 'JKUAT Innovation Club',
            notificationOptions
        )
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked');
    
    event.notification.close();
    
    const notificationData = event.notification.data;
    let urlToOpen = '/';
    
    // Determine URL to open based on notification data
    if (event.action === 'open' && notificationData.actionUrl) {
        urlToOpen = notificationData.actionUrl;
    } else if (notificationData.actionUrl) {
        urlToOpen = notificationData.actionUrl;
    } else {
        // Default URLs based on notification type
        switch (notificationData.type) {
            case 'event_reminder':
                urlToOpen = '/events';
                break;
            case 'meeting_schedule':
                urlToOpen = '/dashboard';
                break;
            case 'payment_reminder':
                urlToOpen = '/payment';
                break;
            case 'announcement':
                urlToOpen = '/dashboard';
                break;
            case 'idea_comment':
            case 'idea_collaboration':
                urlToOpen = '/ideas';
                break;
            case 'election_period':
                urlToOpen = '/leadership';
                break;
            default:
                urlToOpen = '/dashboard';
        }
    }
    
    // Open the URL
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if there's already a window/tab open with the target URL
                for (const client of clientList) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // If no existing window/tab, open a new one
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
            .then(() => {
                // Mark notification as opened (send to analytics if needed)
                if (notificationData.notificationId) {
                    return fetch('/api/notifications/analytics/opened', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            notificationId: notificationData.notificationId,
                            action: event.action || 'click'
                        })
                    }).catch(error => {
                        console.error('Error tracking notification click:', error);
                    });
                }
            })
    );
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
    console.log('Service Worker: Notification closed');
    
    const notificationData = event.notification.data;
    
    // Track notification dismissal (optional analytics)
    if (notificationData.notificationId) {
        fetch('/api/notifications/analytics/dismissed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                notificationId: notificationData.notificationId
            })
        }).catch(error => {
            console.error('Error tracking notification dismissal:', error);
        });
    }
});

// Background sync for offline notification actions
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync triggered');
    
    if (event.tag === 'notification-sync') {
        event.waitUntil(
            // Sync any pending notification interactions
            syncNotificationData()
        );
    }
});

// Sync notification data when back online
async function syncNotificationData() {
    try {
        // Get any pending notification data from IndexedDB
        const pendingData = await getPendingNotificationData();
        
        if (pendingData.length > 0) {
            // Send pending data to server
            for (const data of pendingData) {
                try {
                    await fetch('/api/notifications/sync', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    });
                    
                    // Remove from pending data
                    await removePendingNotificationData(data.id);
                } catch (error) {
                    console.error('Error syncing notification data:', error);
                }
            }
        }
    } catch (error) {
        console.error('Error in syncNotificationData:', error);
    }
}

// IndexedDB helpers for offline storage
async function getPendingNotificationData() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('jkuat-notifications', 1);
        
        request.onerror = () => reject(request.error);
        
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['pending'], 'readonly');
            const store = transaction.objectStore('pending');
            const getAllRequest = store.getAll();
            
            getAllRequest.onsuccess = () => resolve(getAllRequest.result);
            getAllRequest.onerror = () => reject(getAllRequest.error);
        };
        
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('pending')) {
                db.createObjectStore('pending', { keyPath: 'id' });
            }
        };
    });
}

async function removePendingNotificationData(id) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('jkuat-notifications', 1);
        
        request.onerror = () => reject(request.error);
        
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['pending'], 'readwrite');
            const store = transaction.objectStore('pending');
            const deleteRequest = store.delete(id);
            
            deleteRequest.onsuccess = () => resolve();
            deleteRequest.onerror = () => reject(deleteRequest.error);
        };
    });
}

// Message event - handle messages from main thread
self.addEventListener('message', (event) => {
    console.log('Service Worker: Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Error handling
self.addEventListener('error', (event) => {
    console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker unhandled rejection:', event.reason);
});

console.log('Service Worker: Script loaded successfully');