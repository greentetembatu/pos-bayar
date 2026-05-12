
function getPengaturanToko() {
  const data = localStorage.getItem("pengaturanToko");
  return data
    ? JSON.parse(data)
    : {
        nama: "",
        alamat: "",
        aditional: "",
      };
}

function savePengaturanToko(data) {
  localStorage.setItem("pengaturanToko", JSON.stringify(data));
}

function simpanPengaturanToko() {
  const nama = document.getElementById("namaToko").value;
  const alamat = document.getElementById("alamatToko").value;
  const additional = document.getElementById("additionalToko").value;

  if (!nama || !alamat || !additional) {
    alert("Nama dan alamat harus diisi");
    return;
  }

  savePengaturanToko({ nama, alamat, additional });

  alert("Pengaturan toko berhasil disimpan");
}

function loadPengaturanToko() {
  const toko = getPengaturanToko() || {};
  
  // Cek apakah elemen ada sebelum mengisi value
  const namaInput = document.getElementById("namaToko");
  const alamatInput = document.getElementById("alamatToko");
  const additionalInput = document.getElementById("additionalToko");
  
  if (namaInput) namaInput.value = toko.nama || "";
  if (alamatInput) alamatInput.value = toko.alamat || "";
  if (additionalInput) additionalInput.value = toko.additional || "";
}
document.addEventListener("DOMContentLoaded", loadPengaturanToko);
