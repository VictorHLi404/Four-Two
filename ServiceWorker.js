const cacheName = "DefaultCompany-Four-Two-1.0";
const contentToCache = [
    "Build/Four-Two.loader.js",
    "Build/Four-Two.framework.js",
    "Build/Four-Two.data",
    "Build/Four-Two.wasm",
    "TemplateData/style.css"

];

self.addEventListener('install', function (e) {
    console.log('[Service Worker] Install');
    
    e.waitUntil((async function () {
      const cache = await caches.open(cacheName);
      console.log('[Service Worker] Caching all: app shell and content');
      await cache.addAll(contentToCache);
    })());
});

self.addEventListener('activate', event => {
  event.waitUntil(
      caches.keys().then(cacheNames => {
          return Promise.all(
              cacheNames.filter(name => name !== cacheName)
                  .map(name => caches.delete(name))
          );
      })
  );
});

self.addEventListener('fetch', function(e) {
  e.respondWith((async function() {
      if (e.request.method !== 'GET') {
          return fetch(e.request);
      }

      try {   
          const cachedResponse = await caches.match(e.request);
          if (cachedResponse) {
              console.log(`[Service Worker] Return cached: ${e.request.url}`);
              return cachedResponse;
          }
    
          const fetchResponse = await fetch(e.request);
             
          if (fetchResponse.status === 200 && isCacheable(fetchResponse)) {
              const cache = await caches.open(cacheName);
              console.log(`[Service Worker] Caching new: ${e.request.url}`);
              cache.put(e.request, fetchResponse.clone());
          }
          
          return fetchResponse;
      } catch (error) {
          console.log('[Service Worker] Fetch failed; returning offline page');
          return caches.match('offline.html'); 
      }
  })());
});

function isCacheable(response) {
  const contentType = response.headers.get('content-type') || '';
  return contentType.includes('application/javascript') ||
         contentType.includes('text/css') ||
         contentType.includes('application/wasm') ||
         contentType.includes('application/octet-stream');
}
