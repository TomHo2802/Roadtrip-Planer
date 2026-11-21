const V = 'roadtrip-v123';
const CORE = ['./', 'index.html', 'assistent.html', 'ortwahl.js', 'fonts/Inter-Regular.woff', 'fonts/Inter-Medium.woff', 'fonts/Inter-SemiBold.woff', 'fonts/Inter-Bold.woff', 'fonts/SpaceGrotesk-Medium.woff2', 'fonts/SpaceGrotesk-Bold.woff2', 'leaflet/leaflet.js', 'leaflet/leaflet.css', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V && !k.startsWith('rt-tiles') && !k.startsWith('rt-ocr')).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const req = e.request; const url = new URL(req.url);
  // Texterkennung (Tesseract) vom CDN: einmal geladen, danach aus dem Speicher (auch offline)
  if (req.method === 'GET' && (/^https:\/\/cdn\.jsdelivr\.net\/npm\/(tesseract\.js|tesseract\.js-core|@tesseract\.js-data)/.test(req.url) || url.hostname === 'tessdata.projectnaptha.com')) {
    e.respondWith(caches.open('rt-ocr-v1').then((c) => c.match(req.url).then((hit) => hit || fetch(req).then((r) => { if (r && (r.ok || r.type === 'opaque')) c.put(req.url, r.clone()); return r; }))));
    return;
  }
  // Kartenkacheln: vorab geladene Ausschnitte aus dem Speicher, sonst Netz
  if (req.method === 'GET' && /(^|\.)tile\.openstreetmap\.org$/.test(url.hostname)) {
    const key = 'https://tile.openstreetmap.org' + url.pathname;
    e.respondWith(caches.open('rt-tiles-v1').then((c) => c.match(key)).then((hit) => hit || fetch(req)).catch(() => fetch(req)));
    return;
  }
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(V); const cached = await cache.match(req, { ignoreSearch: true });
    const net = fetch(req).then((r) => { if (r && r.ok) cache.put(req, r.clone()); return r; });
    if (!cached) return net;
    // Netzwerk zuerst (neue Version), aber max. 3 s warten, dann Cache
    return Promise.race([net.catch(() => cached), new Promise((res) => setTimeout(() => res(cached), 3000))]);
  })());
});
