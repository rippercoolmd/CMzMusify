const CACHE_NAME = 'cmzmusify-v1';
const ASSETS = ['/', '/index.html', '/style.css', '/script.js', '/manifest.json', '/logo.jpg'];

self.addEventListener('install', e => {
  console.log('📦 SW Installing...');
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(ASSETS.map(url => cache.add(url).catch(() => {})));
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  console.log('✅ SW Activated');
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // Skip YouTube, Google API, Lyrics API
  if (url.includes('youtube.com') || url.includes('googlevideo.com') ||
    url.includes('googleapis.com') || url.includes('lyrics.ovh') ||
    url.includes('firebase') || url.includes('gstatic.com')) {
    return;
  }
  
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(res => {
        if (e.request.method === 'GET' && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
