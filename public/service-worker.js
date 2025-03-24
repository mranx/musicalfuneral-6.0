const CACHE_NAME = 'video-cache-v1';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
const ASSETS_TO_CACHE = [
  '/assets/videos/test.mp4', // Video file
  '/assets/images/thumbnail.jpg', // Thumbnail image
  '/assets/videos/Sample Video.mp4',
];

// Function to store the cache creation time in IndexedDB
const storeCacheCreationTime = async () => {
  const now = Date.now();
  const db = await openIDB();
  const tx = db.transaction('cacheMetadata', 'readwrite');
  const store = tx.objectStore('cacheMetadata');
  await store.put({ id: 'creationTime', timestamp: now });
  await tx.done;
};

// Function to get the cache creation time from IndexedDB
const getCacheCreationTime = async () => {
  const db = await openIDB();
  const tx = db.transaction('cacheMetadata', 'readonly');
  const store = tx.objectStore('cacheMetadata');
  const result = await store.get('creationTime');
  await tx.done;
  return result ? result.timestamp : null;
};

// Function to open IndexedDB
const openIDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CacheMetadataDB', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('cacheMetadata')) {
        db.createObjectStore('cacheMetadata', { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

// Install event: Cache the video and thumbnail
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return Promise.all(
          ASSETS_TO_CACHE.map((asset) => {
            if (asset.startsWith('http://') || asset.startsWith('https://') || asset.startsWith('/')) {
              return fetch(asset, { mode: 'no-cors' })
                .then((response) => {
                  if (response.ok) {
                    return cache.put(asset, response);
                  }
                  return Promise.resolve();
                })
                .catch(() => {
                  return Promise.resolve();
                });
            } else {
              return Promise.resolve();
            }
          })
        );
      })
      .then(() => {
        return storeCacheCreationTime(); // Store the cache creation time
      })
      .catch(() => {
        // Silently handle errors
      })
  );
});

// Activate event: Clean up old caches and check cache age
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      // Check the age of the cache
      return getCacheCreationTime().then((timestamp) => {
        if (timestamp && (Date.now() - timestamp) > CACHE_DURATION) {
          return caches.delete(CACHE_NAME);
        }
      });
    })
  );
});

// Fetch event: Serve cached assets when available
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.ok) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch(() => {
            return new Response('Offline - No internet connection', {
              status: 503,
              statusText: 'Service Unavailable',
            });
          });
      })
  );
});