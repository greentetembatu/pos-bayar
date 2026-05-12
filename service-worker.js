/*const CACHE_NAME = "KASIR-V2";

const ASSETS = [
  "./",
  "./index.html",
  "./login.html",
  "./dashboard.html",
  "./produk.html",
  "./kasir.html",
  "./cetak-member.html",
  "./member.html",
  "./riwayat.html",
  "./style.css",
  "./riwayat.css",
  "./member.css",
  "./js/data.js",
  "./js/kasir.js",
  "./js/produk.js", 
  "./js/storage.js", 
  "./js/riwayat.js", 
  "./js/dasboard.js", 
  "./js/member.js", 
  "/manifest.json",
  "https://unpkg.com/html5-qrcode", 
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
];

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }

      return fetch(event.request)
        .then(networkResponse => {
          return networkResponse;
        })
        .catch(err => {
          console.log("Fetch failed; returning offline page or error", err);
          
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('Offline', { status: 503 });

        });
    })
  );
});*/




const CACHE_NAME = "KASIR-V2";

const ASSETS = [
  "./",
  "./index.html",
  "./login.html",
  "./dashboard.html",
  "./produk.html",
  "./kasir.html",
  "./cetak-member.html",
  "./member.html",
  "./riwayat.html",
  "./style.css",
  "./riwayat.css",
  "./member.css",
  "./js/data.js",
  "./js/kasir.js",
  "./js/produk.js", 
  "./js/storage.js", 
  "./js/riwayat.js", 
  "./js/dasboard.js", 
  "./js/member.js", 
  "/manifest.json",
  "https://unpkg.com/html5-qrcode", 
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
];

// ✅ INSTALL EVENT - Cache assets dan skip waiting
self.addEventListener("install", event => {
  console.log("Service Worker: Installing...");
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Service Worker: Caching assets");
      return cache.addAll(ASSETS);
    })
  );
  
  // 🔥 KUNCI 1: Langsung aktif tanpa menunggu
  self.skipWaiting();
});

// ✅ ACTIVATE EVENT - Claim control dan bersihkan cache lama
self.addEventListener("activate", event => {
  console.log("Service Worker: Activating...");
  
  event.waitUntil(
    (async () => {
      // Bersihkan cache lama (versi sebelumnya)
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log("Service Worker: Deleting old cache", cache);
            return caches.delete(cache);
          }
        })
      );
      
      // 🔥 KUNCI 2: Langsung ambil alih semua tab yang terbuka
      await self.clients.claim();
      console.log("Service Worker: Now controlling all clients");
    })()
  );
});

// ✅ FETCH EVENT - Cache first, fallback to network
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }

      return fetch(event.request)
        .then(networkResponse => {
          // Opsional: Simpan response baru ke cache
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(err => {
          console.log("Fetch failed:", err);
          
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('Offline', { status: 503 });
        });
    })
  );
});








