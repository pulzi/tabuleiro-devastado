/* Service worker simples: guarda os arquivos do site para funcionar sem internet.
   Ao mudar qualquer arquivo, troque a versão abaixo (v1 → v2) para atualizar os celulares. */
const CACHE = 'tabuleiro-devastado-v2';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.webmanifest',
  './icon.svg',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE)
      .then(function (cache) { return cache.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

// Responde na hora com a cópia guardada e atualiza a cópia pela rede em segundo plano.
self.addEventListener('fetch', function (event) {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  // Uma cópia por arquivo: "./?qr=1" e "./" usam a mesma entrada.
  const key = new URL(req.url);
  key.search = '';
  key.hash = '';

  event.respondWith(caches.open(CACHE).then(function (cache) {
    return cache.match(key.href).then(function (cached) {
      const network = fetch(req)
        .then(function (res) {
          if (res && res.ok) cache.put(key.href, res.clone());
          return res;
        })
        .catch(function () {
          return cached || (req.mode === 'navigate' ? cache.match('./index.html') : Response.error());
        });
      event.waitUntil(network.catch(function () {}));
      return cached || network;
    });
  }));
});
