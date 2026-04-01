const CACHE_NAME = "KASIR";

const ASSETS = [
  "./",
  "/dashboard.html",
  "/produk.html", // Pastikan file ini ada
  "/kasir.html",
  "/riwayat.html", // Pastikan file ini ada
  "/style.css",
  "./js/data.js",
  "./js/kasir.js",
  "./js/produk.js", // Tambahkan ini
  "./js/storage.js", // Tambahkan ini
  "./js/riwayat.js", // Tambahkan ini
  "./js/dasboard.js", // Tambahkan ini
  "/manifest.json",
  "https://unpkg.com/html5-qrcode", // Cache library eksternal
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
];

// INSTALL
// FETCH - Strategi Cache First, falling back to Network
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Jika ada di cache, kembalikan dari cache
      if (response) {
        return response;
      }

      // Jika tidak ada di cache, coba ambil dari internet
      return fetch(event.request)
        .then(networkResponse => {
          return networkResponse;
        })
        .catch(err => {
          // DI SINI ERROR TERJADI SEBELUMNYA. 
          // Sekarang kita tangkap error-nya.
          console.log("Fetch failed; returning offline page or error", err);
          
          // Jika request adalah navigasi halaman, bisa arahkan ke dashboard.html
          if (event.request.mode === 'navigate') {
            return caches.match('./dashboard.html');
          }
        });
    })
  );
});










