// Service Worker для CryptoDash
const CACHE_NAME = 'cryptodash-v2.0';
const DATA_CACHE_NAME = 'cryptodash-data-v2.0';

// Статические ресурсы для кэширования
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/coin.html',
    '/manifest.json',
    '/assets/css/tokens.css',
    '/assets/css/base.css',
    '/assets/css/layout.css',
    '/assets/css/components.css',
    '/assets/css/pages/index.css',
    '/assets/css/pages/coin.css',
    '/assets/js/app.js',
    '/assets/img/favicon.svg'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Активация и очистка старых кэшей
self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            // Очистка старых кэшей
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Взятие контроля над всеми клиентами
            self.clients.claim()
        ])
    );
});

// Стратегия кэширования: Stale-While-Revalidate для данных, Cache First для статики
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Данные API - Stale-While-Revalidate
    if (url.pathname.startsWith('/data/')) {
        event.respondWith(
            caches.open(DATA_CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((cachedResponse) => {
                    // Всегда делаем сетевой запрос для обновления кэша
                    const fetchPromise = fetch(event.request)
                        .then((networkResponse) => {
                            if (networkResponse.ok) {
                                cache.put(event.request, networkResponse.clone());
                            }
                            return networkResponse;
                        })
                        .catch(() => {
                            // В случае ошибки сети, возвращаем кэшированный ответ
                            if (cachedResponse) {
                                return cachedResponse;
                            }
                            // Или fallback для специфичных данных
                            return createFallbackResponse(url);
                        });
                    
                    // Возвращаем кэшированный ответ сразу, если есть
                    return cachedResponse ? cachedResponse : fetchPromise;
                });
            })
        );
        return;
    }
    
    // Статические ресурсы - Cache First
    if (url.origin === self.location.origin) {
        event.respondWith(
            caches.match(event.request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        // Обновляем кэш в фоне
                        fetch(event.request)
                            .then((response) => {
                                if (response.ok) {
                                    caches.open(CACHE_NAME)
                                        .then((cache) => cache.put(event.request, response))
                                        .catch(console.error);
                                }
                            })
                            .catch(() => {});
                        return cachedResponse;
                    }
                    
                    return fetch(event.request)
                        .then((response) => {
                            if (!response || response.status !== 200 || response.type !== 'basic') {
                                return response;
                            }
                            
                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => cache.put(event.request, responseToCache))
                                .catch(console.error);
                            
                            return response;
                        })
                        .catch(() => {
                            // Fallback для страниц
                            if (event.request.mode === 'navigate') {
                                return caches.match('/index.html');
                            }
                            return new Response('Offline', { status: 503 });
                        });
                })
        );
        return;
    }
    
    // Внешние ресурсы - Network Only
    event.respondWith(fetch(event.request));
});

// Создание fallback ответа для данных
function createFallbackResponse(url) {
    if (url.pathname.startsWith('/data/coins/')) {
        return new Response(JSON.stringify({
            error: 'offline',
            message: 'Данные недоступны в офлайн-режиме'
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    return new Response('Offline', {
        status: 503,
        statusText: 'Service Unavailable'
    });
}

// Фоновая синхронизация
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

// Периодическая фоновая синхронизация
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'update-crypto-data') {
        event.waitUntil(updateCryptoData());
    }
});

async function syncData() {
    try {
        // Обновляем ключевые данные
        const urlsToSync = [
            '/data/global.json',
            '/data/markets/page-1.json',
            '/data/feargreed.json',
            '/data/generated.json'
        ];
        
        const cache = await caches.open(DATA_CACHE_NAME);
        const updates = [];
        
        for (const url of urlsToSync) {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    await cache.put(url, response);
                    updates.push(url);
                }
            } catch (error) {
                console.warn(`Failed to sync ${url}:`, error);
            }
        }
        
        // Уведомляем клиентов об обновлении
        if (updates.length > 0) {
            const clients = await self.clients.matchAll();
            clients.forEach(client => {
                client.postMessage({
                    type: 'DATA_UPDATED',
                    timestamp: Date.now(),
                    updated: updates.length
                });
            });
        }
        
        return updates.length;
    } catch (error) {
        console.error('Background sync failed:', error);
        return 0;
    }
}

async function updateCryptoData() {
    console.log('Periodic background sync');
    const updated = await syncData();
    return updated;
}

// Обработка сообщений от клиента
self.addEventListener('message', (event) => {
    if (event.data.type === 'CLEAR_CACHE') {
        caches.delete(DATA_CACHE_NAME)
            .then(() => {
                event.ports[0].postMessage({ success: true });
            })
            .catch(error => {
                event.ports[0].postMessage({ success: false, error: error.message });
            });
    }
    
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data.type === 'GET_CACHE_INFO') {
        caches.keys().then(cacheNames => {
            event.ports[0].postMessage({
                type: 'CACHE_INFO',
                caches: cacheNames
            });
        });
    }
});

// Пуш-уведомления (опционально)
self.addEventListener('push', (event) => {
    if (!event.data) return;
    
    const data = event.data.json();
    const options = {
        body: data.body || 'Новое уведомление',
        icon: '/assets/img/icon-192.png',
        badge: '/assets/img/badge-72.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/'
        }
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'CryptoDash', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientList => {
            for (const client of clientList) {
                if (client.url === event.notification.data.url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data.url);
            }
        })
    );
});