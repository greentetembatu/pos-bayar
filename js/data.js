
/* ======================
   STORAGE KEY
====================== */
const PRODUK_KEY = "produk";
const TRANSAKSI_KEY = "transaksi";

/* ======================
   PRODUK
====================== */
function getProduk() {
  return JSON.parse(localStorage.getItem(PRODUK_KEY)) || [];
}

function saveProduk(data) {
  localStorage.setItem(PRODUK_KEY, JSON.stringify(data));
}

/* ======================
   TRANSAKSI
====================== */
function getTransaksi() {
  return JSON.parse(localStorage.getItem(TRANSAKSI_KEY)) || [];
}

function saveTransaksi(data) {
  localStorage.setItem(TRANSAKSI_KEY, JSON.stringify(data));
}

/* ======================
   DATA AWAL (OPTIONAL)
====================== */
