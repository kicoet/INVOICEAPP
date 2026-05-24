// Kemala Profile Office — Service Worker
const CACHE = 'kemala-v10';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './data.js',
  './supabase-config.js',
  './icons.jsx',
  './charts.jsx',
  './tweaks-panel.jsx',
  './app.jsx',
  './screens/dashboard.jsx',
  './screens/invoices.jsx',
  './screens/pdf-kemala.jsx',
  './screens/pdf-preview.jsx',
  './screens/edit-template.jsx',
  './screens/products-stock.jsx',
  './screens/tasks.jsx',
  './screens/misc.jsx',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then(cached => {
      const fetcher = fetch(req).then(res => {
        if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{});
        }
        return res;
      }).catch(() => cached);
      return cached || fetcher;
    })
  );
});
