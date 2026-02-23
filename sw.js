// Synapz Service Worker - Offline Support
const CACHE_NAME = 'synapz-v1';
const STATIC_CACHE = 'synapz-static-v1';
const API_CACHE = 'synapz-api-v1';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/feed',
  '/profile',
  '/login',
  '/register',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== API_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // API requests - Stale While Revalidate
  if (url.pathname.startsWith('/api/facts')) {
    event.respondWith(staleWhileRevalidate(request, API_CACHE));
    return;
  }

  // User API - Network First (fresh data is important)
  if (url.pathname.startsWith('/api/users') || url.pathname.startsWith('/api/auth')) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // Static assets - Cache First
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Navigation requests - Network First with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirst(request, STATIC_CACHE).catch(() => {
        return caches.match('/') || caches.match('/offline');
      })
    );
    return;
  }

  // Default - Network First
  event.respondWith(networkFirst(request, STATIC_CACHE));
});

// Caching Strategies

// Cache First - good for static assets
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      // Clone immediately before any async operations
      const responseToCache = response.clone();
      const cache = await caches.open(cacheName);
      await cache.put(request, responseToCache);
    }
    return response;
  } catch (error) {
    console.log('[SW] Cache first failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network First - good for dynamic content
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      // Clone immediately before any async operations
      const responseToCache = response.clone();
      const cache = await caches.open(cacheName);
      await cache.put(request, responseToCache);
    }
    return response;
  } catch (error) {
    console.log('[SW] Network first failed, trying cache:', error);
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    return new Response(JSON.stringify({ error: 'Offline', message: 'Please check your internet connection' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Stale While Revalidate - good for facts API
async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request);
  
  // Start network request in background
  const fetchPromise = fetch(request).then(async (response) => {
    if (response.ok) {
      // Clone immediately
      const responseToCache = response.clone();
      const cache = await caches.open(cacheName);
      await cache.put(request, responseToCache);
    }
    return response;
  }).catch((error) => {
    console.log('[SW] SWR network fetch failed:', error);
    return null;
  });

  // Return cached immediately if available
  if (cached) {
    // Still update cache in background (don't await)
    fetchPromise.catch(() => {});
    return cached;
  }

  // No cache, wait for network
  const networkResponse = await fetchPromise;
  if (networkResponse) {
    return networkResponse;
  }

  return new Response(JSON.stringify({ error: 'Offline', facts: [] }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Helper to check if static asset
function isStaticAsset(pathname) {
  const staticExtensions = ['.js', '.css', '.woff', '.woff2', '.ttf', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico'];
  return staticExtensions.some((ext) => pathname.endsWith(ext));
}

// Handle push notifications (future feature)
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'Synapz';
  const options = {
    body: data.body || 'You have a new fact to discover!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey || 1,
      url: data.url || '/feed',
    },
    actions: [
      { action: 'explore', title: 'View Fact', icon: '/icon-192.png' },
      { action: 'close', title: 'Close', icon: '/icon-192.png' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    const urlToOpen = event.notification.data?.url || '/feed';
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
    );
  }
});

// Handle skip waiting message from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] Synapz Service Worker loaded');
