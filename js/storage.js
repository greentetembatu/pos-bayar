/* =========================
   TRANSAKSI
========================= */
function getTransaksi() {
  return JSON.parse(localStorage.getItem("transaksi")) || [];
}

function saveTransaksi(data) {
  localStorage.setItem("transaksi", JSON.stringify(data));
}

/* =========================
   PENGATURAN TOKO
========================= */
function getPengaturanToko() {
  const data = localStorage.getItem("pengaturanToko");

  return data
    ? JSON.parse(data)
    : {
        nama: "",
        alamat: "",
        additional: "",
      };
}

function savePengaturanToko(data) {
  localStorage.setItem("pengaturanToko", JSON.stringify(data));
}