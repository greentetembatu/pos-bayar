
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
/*(function initProduk() {
  const produk = getProduk();

  if (produk.length === 0) {
    saveProduk([
      {
        id: Date.now(),
        nama: "Kopi Susu",
        modal: 8000,
        harga_jual: 12000,
        stok: 30,
        barcode: "899001"
      },
      {
        id: Date.now() + 1,
        nama: "Teh Manis",
        modal: 3000,
        harga_jual: 6000,
        stok: 20,
        barcode: "899002"
      }
    ]);
  }
})();*/










