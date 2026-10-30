const CACHE_NAME = "KASIR-V5";

const ASSETS = [
  "./",
  //"./index.html",
  "./login.html",
  "./dashboard.html",
  "./produk.html",
  "./kasir.html",
  "./cetak-member.html",
  "./member.html",
  "./riwayat.html",
  "./buat-barcode.html",

  "./css/style.css",
  "./css/riwayat.css",
  "./css/kasir.css",
  "./css/member.css",
  "./css/produk.css",
  "./css/dashboard.css",

  "./js/barcode.js",
  "./js/cetak-member.js",
  "./js/dasboard.js",
  "./js/data.js",
  "./js/kasir.js",
  //"./js/login.js",
  "./js/member.js",
  "./js/produk.js",
  "./js/riwayat.js", 
  "./js/storage.js", 
  "./js/struk.js", 
  
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
// ✅ FETCH EVENT - Network First untuk HTML, Cache First untuk aset lainnya
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // 1. KHUSUS FILE HTML / NAVIGASI: Gunakan Network First
  // Ini memastikan setiap halaman diakses, browser mencoba ambil dari server dulu agar selalu fresh
  if (event.request.mode === "navigate" || url.pathname.endsWith(".html")) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // Jika berhasil dapat dari internet, update cache dengan yang terbaru
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return networkResponse;
        })
      .catch(() => {
        // Jika offline, fallback pakai cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return caches.match("./login.html");
        });
      })
    );
    return;
  }

  // 2. UNTUK ASET LAIN (CSS, JS, CDN, Gambar): Cache First dengan Background Update
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Ambil dari cache untuk kecepatan, tapi fetch di background untuk update cache berikutnya
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {});
        
        return cachedResponse;
      }

      // Jika belum ada di cache, ambil dari jaringan
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return networkResponse;
      });
    })
  );
});
