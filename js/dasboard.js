
document.addEventListener("DOMContentLoaded", renderDashboard);

function renderDashboard() {
  const elProduk = document.getElementById("totalProduk");
  if (!elProduk) return; // ⛔ bukan dashboard

  const produk = getProduk();
  const transaksi = getTransaksi();

  let omzet = 0;
  let laba = 0;

  transaksi.forEach(t => {
    omzet += Number(t.total || 0);
    laba += Number(t.totalLaba || 0);
  });

  elProduk.innerText = produk.length;
  document.getElementById("totalTransaksi").innerText = transaksi.length;
  document.getElementById("totalOmzet").innerText = formatRupiah(omzet);
  document.getElementById("totalLaba").innerText = formatRupiah(laba);
}

function formatRupiah(n) {
  return "Rp " + n.toLocaleString("id-ID");
}








let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById("installBtn").style.display = "block";
});

document.getElementById("installBtn").addEventListener("click", () => {
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(choice => {
    if (choice.outcome === "accepted") {
      console.log("App installed");
    }
  });
});


/*window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("splash").style.display = "none";
  }, 1500);
});*/





/*document.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  }
});*/



function logoutKasir() {
  if (!confirm("Yakin ingin logout?")) return;

  localStorage.removeItem("kasirAktif");
  localStorage.removeItem("keranjang");

  // pakai replace, bukan href
  window.location.replace("login.html");
}


window.addEventListener("pageshow", function (event) {
  const kasir = JSON.parse(localStorage.getItem("kasirAktif"));

  if (!kasir) {
    window.location.replace("login.html");
  }
});


window.history.pushState(null, null, window.location.href);
window.onpopstate = function () {
  window.history.go(1);
};





window.addEventListener("pageshow", function (event) {
  const kasir = JSON.parse(localStorage.getItem("kasirAktif"));

  if (!kasir) {
    window.location.replace("login.html");
  }
});



(function cekLogin() {
  const kasir = JSON.parse(localStorage.getItem("kasirAktif"));

  if (!kasir) {
    window.location.replace("login.html");
  }
})();

















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




















/* ==========================================
   LOGIKA BACKUP & RESTORE TERPADU
   ========================================== */

// Daftar semua key localStorage yang ingin dibackup
const KEYS_BACKUP = [
  "produk", 
  "member", 
  "transaksi", 
  "kasirAktif", 
  "pengaturanToko", 
  "dataTokoMember",
  "kasirList" // Jika Anda punya daftar kasir
];

// 1. SIMPAN SEMUA DATA KE MEMORI (Trigger DOM save jika ada)
function simpanSemuaDataKeStorage() {
  // Karena data disimpan reaktif via localStorage di fungsi lain, 
  // ini hanya sebagai trigger paksa penyimpanan form yang belum tersimpan.
  alert("✅ Semua data telah tersinkronisasi di memori penyimpanan browser.");
}

// 2. DOWNLOAD SEMUA DATA (JSON) - Untuk di-upload kembali
function downloadSemuaDataJSON() {
  const backupData = {};
  
  KEYS_BACKUP.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        backupData[key] = JSON.parse(data);
      } catch (e) {
        backupData[key] = data; // Jika string biasa
      }
    }
  });

  if (Object.keys(backupData).length === 0) {
    return alert("Tidak ada data untuk di-backup.");
  }

  const dataStr = JSON.stringify(backupData, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = `FULL-BACKUP-KASIR-${formatTanggalFile()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  catatWaktuBackup();
}

// 3. DOWNLOAD SEMUA DATA (EXCEL MULTI-SHEET VIA HTML)
function downloadSemuaDataExcel() {
  // 1. Ambil data
  const produk = JSON.parse(localStorage.getItem("produk")) || [];
  const member = JSON.parse(localStorage.getItem("member")) || [];
  const transaksi = JSON.parse(localStorage.getItem("transaksi")) || [];

  if (produk.length === 0 && member.length === 0 && transaksi.length === 0) {
    alert("Tidak ada data untuk diekspor.");
    return;
  }

  // 2. Format Data Produk (Paksa ID & Barcode jadi Teks agar tidak jadi notasi ilmiah)
  const dataProduk = produk.map(p => ({
    "ID": String(p.id || ""),
    "Barcode": String(p.barcode || ""),
    "Nama Produk": p.nama || "",
    "Modal": Number(p.modal) || 0,
    "Harga Jual": Number(p.harga_jual) || 0,
    "Stok": Number(p.stok) || 0,
    "Foto": p.foto ? "Ada Foto" : "Tidak Ada"
  }));

  // 3. Format Data Member
  const dataMember = member.map(m => ({
    "No Member": String(m.no || ""),
    "Nama": m.nama || "",
    "No HP": String(m.hp || ""),
    "Email": m.email || "",
    "Tgl Daftar": m.tanggal || "",
    "Kasir": m.kasir || ""
  }));

  // 4. Format Data Transaksi
  const dataTransaksi = transaksi.map(t => ({
    "ID Transaksi": String(t.id || ""),
    "Tanggal": t.tanggal || "",
    "Kasir": t.kasirNama || "",
    "Member": t.namaMember || "",
    "Total": Number(t.total) || 0,
    "Laba": Number(t.totalLaba) || 0,
    "Metode": t.metode || "cash",
    "Detail Item": (t.items || []).map(i => `${i.nama} (${i.qty})`).join(", ")
  }));

  // 5. Buat Workbook (Buku Kerja Excel)
  const wb = XLSX.utils.book_new();

  // 6. Buat Worksheet (Lembar Kerja) dari masing-masing data
  const wsProduk = XLSX.utils.json_to_sheet(dataProduk);
  const wsMember = XLSX.utils.json_to_sheet(dataMember);
  const wsTransaksi = XLSX.utils.json_to_sheet(dataTransaksi);

  // Opsional: Atur lebar kolom agar rapi saat dibuka
  wsProduk['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 10 }, { wch: 10 }, { wch: 8 }, { wch: 12 }];
  wsMember['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 12 }, { wch: 15 }];
  wsTransaksi['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 40 }];

  // 7. Masukkan Worksheet ke dalam Workbook dengan nama Sheet
  XLSX.utils.book_append_sheet(wb, wsProduk, "Daftar Produk");
  XLSX.utils.book_append_sheet(wb, wsMember, "Data Member");
  XLSX.utils.book_append_sheet(wb, wsTransaksi, "Riwayat Transaksi");

  // 8. Unduh File (.xlsx)
  const namaFile = `LAPORAN-KASIR-${formatTanggalFile()}.xlsx`;
  XLSX.writeFile(wb, namaFile);

  catatWaktuBackup();
}



// BAGIAN ZIP UPLOAD 
/*async function uploadDariZip(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (typeof JSZip === "undefined" || typeof XLSX === "undefined") {
    alert("Library ZIP / Excel belum dimuat.");
    return;
  }

  if (!confirm("⚠️ PERINGATAN!\nProses ini akan membaca file Excel dan Foto dari ZIP, lalu menggabungkannya dengan data saat ini.\n\nLanjutkan?")) {
    event.target.value = "";
    return;
  }

  try {
    // 1. Baca file ZIP
    const zip = await JSZip.loadAsync(file);
    
    // 2. Cari file Excel (.xlsx) di dalam ZIP
    const excelFile = Object.keys(zip.files).find(name => name.endsWith(".xlsx") && !name.startsWith("__MACOSX"));
    if (!excelFile) {
      alert("File Excel (.xlsx) tidak ditemukan di dalam ZIP.");
      return;
    }

    // 3. Baca data Excel
    const excelData = await zip.files[excelFile].async("arraybuffer");
    const workbook = XLSX.read(excelData, { type: "array" });

    // --- EKSTRAK DATA PRODUK DARI SHEET 1 ---
    const sheetProduk = workbook.Sheets["Daftar Produk"];
    const dataProdukExcel = XLSX.utils.sheet_to_json(sheetProduk);
    
    // --- EKSTRAK DATA MEMBER DARI SHEET 2 ---
    const sheetMember = workbook.Sheets["Data Member"];
    const dataMemberExcel = XLSX.utils.sheet_to_json(sheetMember);

    // --- EKSTRAK DATA TRANSAKSI DARI SHEET 3 ---
    const sheetTransaksi = workbook.Sheets["Riwayat Transaksi"];
    const dataTransaksiExcel = XLSX.utils.sheet_to_json(sheetTransaksi);

    // ==========================================
    // 4. PROSES FOTO DARI ZIP
    // ==========================================
    const fotoMap = {}; // Tempat menyimpan foto base64 sementara
    const fotoFiles = Object.keys(zip.files).filter(name => name.startsWith("Foto Produk/") && !name.endsWith("/") && !name.includes("__MACOSX"));

    for (const namaFile of fotoFiles) {
      // Ambil data base64
      const base64Data = await zip.files[namaFile].async("base64");
      
      // Dapatkan ekstensi file (jpeg/png)
      const ext = namaFile.split(".").pop();
      
      // Buat string Base64 lengkap
      const base64String = `data:image/${ext};base64,${base64Data}`;

      // Ambil ID dari nama file (contoh: "Foto Produk/produk_176858.jpg" -> "176858")
      const idMatch = namaFile.match(/produk_(.+)\./);
      if (idMatch && idMatch[1]) {
        fotoMap[idMatch[1]] = base64String;
      }
    }

    // ==========================================
    // 5. GABUNGKAN DENGAN DATA LAMA (MERGE)
    // ==========================================
    let produkLama = JSON.parse(localStorage.getItem("produk")) || [];
    
    // Gabungkan Produk
    dataProdukExcel.forEach((pExcel, index) => {
      const idProduk = String(pExcel["ID"]);
      
      // Cari apakah produk sudah ada di aplikasi
      const indexLama = produkLama.findIndex(p => String(p.id) === idProduk);

      // Ambil foto dari ZIP jika ada, jika tidak pakai foto lama
      const fotoBase64 = fotoMap[idProduk] || (indexLama !== -1 ? produkLama[indexLama].foto : "");

      const produkBaru = {
        id: idProduk,
        barcode: String(pExcel["Barcode"] || ""),
        nama: pExcel["Nama Produk"] || "",
        modal: Number(pExcel["Modal"]) || 0,
        harga_jual: Number(pExcel["Harga Jual"]) || 0,
        stok: Number(pExcel["Stok"]) || 0,
        foto: fotoBase64
      };

      if (indexLama !== -1) {
        produkLama[indexLama] = produkBaru; // Update
      } else {
        produkLama.push(produkBaru); // Tambah baru
      }
    });

    localStorage.setItem("produk", JSON.stringify(produkLama));

    // Gabungkan Member
    let memberLama = JSON.parse(localStorage.getItem("member")) || [];
    dataMemberExcel.forEach(mExcel => {
      const noMember = String(mExcel["No Member"]);
      const indexLama = memberLama.findIndex(m => String(m.no) === noMember);
      
      const memberBaru = {
        no: noMember,
        nama: mExcel["Nama"] || "",
        hp: String(mExcel["No HP"] || ""),
        email: mExcel["Email"] || "",
        tanggal: mExcel["Tgl Daftar"] || "",
        kasir: mExcel["Kasir"] || ""
      };

      if (indexLama !== -1) memberLama[indexLama] = memberBaru;
      else memberLama.push(memberBaru);
    });
    localStorage.setItem("member", JSON.stringify(memberLama));

    alert("✅ Berhasil! Data dari ZIP (Excel & Foto) telah dipulihkan/digabungkan.");
    location.reload();

  } catch (error) {
    console.error("Gagal membaca ZIP:", error);
    alert("❌ Gagal membaca file ZIP. Pastikan format sesuai.");
  }
  
  event.target.value = ""; // Reset input
}*/

// 4. UPLOAD & RESTORE SEMUA DATA (JSON) MENIMPA DATA LAMA 
/*function uploadSemuaDataJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!confirm("⚠️ PERINGATAN!\nMengunggah file backup akan MENGGANTI seluruh data saat ini.\n\nApakah Anda yakin?")) {
    event.target.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      
      let jumlahDipulihkan = 0;

      // Kembalikan setiap key ke localStorage
      Object.keys(data).forEach(key => {
        if (KEYS_BACKUP.includes(key)) {
          localStorage.setItem(key, JSON.stringify(data[key]));
          jumlahDipulihkan++;
        }
      });

      alert(`✅ Berhasil memulihkan ${jumlahDipulihkan} jenis data.\nHalaman akan dimuat ulang.`);
      location.reload();

    } catch (err) {
      console.error(err);
      alert("❌ File backup tidak valid atau rusak.");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}*/
//TIDAK MENIMPA DATA LAMA TETAPI MENAMBAHKAN 
function uploadSemuaDataJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!confirm("Mengunggah file ini akan MENGGABUNGKAN data baru dengan data lama.\nLanjutkan?")) {
    event.target.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const dataBaru = JSON.parse(e.target.result);
      let totalDitambah = 0;
      let totalDiperbarui = 0;

      // --- 1. MERGE PRODUK (Berdasarkan Barcode atau Nama) ---
      if (dataBaru.produk) {
        let produkLama = JSON.parse(localStorage.getItem("produk")) || [];
        
        dataBaru.produk.forEach(pBaru => {
          // Cari apakah produk sudah ada (berdasarkan ID atau Nama)
          const index = produkLama.findIndex(p => p.id === pBaru.id || p.nama === pBaru.nama);
          
          if (index !== -1) {
            // Jika ada, perbarui (kecuali ID agar tidak bentrok)
            produkLama[index] = { ...produkLama[index], ...pBaru, id: produkLama[index].id };
            totalDiperbarui++;
          } else {
            // Jika tidak ada, tambahkan
            produkLama.push(pBaru);
            totalDitambah++;
          }
        });
        localStorage.setItem("produk", JSON.stringify(produkLama));
      }

      // --- 2. MERGE MEMBER (Berdasarkan No Member) ---
      if (dataBaru.member) {
        let memberLama = JSON.parse(localStorage.getItem("member")) || [];
        
        dataBaru.member.forEach(mBaru => {
          const index = memberLama.findIndex(m => m.no === mBaru.no);
          
          if (index !== -1) {
            // Jika no member sama, timpa datanya
            memberLama[index] = { ...memberLama[index], ...mBaru };
            totalDiperbarui++;
          } else {
            memberLama.unshift(mBaru); // Tambah ke paling atas
            totalDitambah++;
          }
        });
        localStorage.setItem("member", JSON.stringify(memberLama));
      }

      // --- 3. MERGE TRANSAKSI (Berdasarkan ID Transaksi) ---
      if (dataBaru.transaksi) {
        let trxLama = JSON.parse(localStorage.getItem("transaksi")) || [];
        
        dataBaru.transaksi.forEach(tBaru => {
          const index = trxLama.findIndex(t => t.id === tBaru.id);
          if (index === -1) {
            trxLama.push(tBaru); // Hanya tambah jika ID belum ada
            totalDitambah++;
          }
        });
        localStorage.setItem("transaksi", JSON.stringify(trxLama));
      }

      // Data pengaturan (Toko/Kasir) biasanya ditimpa langsung karena hanya 1 objek
      if (dataBaru.pengaturanToko) {
        localStorage.setItem("pengaturanToko", JSON.stringify(dataBaru.pengaturanToko));
      }
      if (dataBaru.dataTokoMember) {
        localStorage.setItem("dataTokoMember", JSON.stringify(dataBaru.dataTokoMember));
      }

      alert(`✅ Berhasil Merge:\n• ${totalDitambah} data baru ditambahkan\n• ${totalDiperbarui} data diperbarui (karena sudah ada)\n\nHalaman akan dimuat ulang.`);
      location.reload();

    } catch (err) {
      console.error(err);
      alert("❌ File backup tidak valid atau rusak.");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

// ==========================================
// LOGIKA DOWNLOAD OTOMATIS (AUTO-BACKUP)
// ==========================================

// Fungsi helper untuk format nama file
function formatTanggalFile() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}`;
}

// Mencatat kapan terakhir kali user mendownload backup
function catatWaktuBackup() {
  localStorage.setItem("lastAutoBackup", Date.now());
  updateStatusAutoBackupUI();
}

// Mengatur interval auto-backup
function aturAutoBackup(jam) {
  const ms = jam * 60 * 60 * 1000;
  localStorage.setItem("autoBackupInterval", ms);
  alert(`✅ Auto-Backup diatur setiap ${jam} jam.\nBrowser akan otomatis mengunduh file cadangan jika Anda membuka aplikasi setelah waktu tersebut terlewati.`);
  cekAutoBackup();
  updateStatusAutoBackupUI();
}

// Mematikan auto-backup
function batalkanAutoBackup() {
  localStorage.removeItem("autoBackupInterval");
  localStorage.removeItem("lastAutoBackup");
  updateStatusAutoBackupUI();
  alert("Auto-Backup dimatikan.");
}

// Cek apakah sudah waktunya auto-backup (Dipanggil saat aplikasi dimuat)
function cekAutoBackup() {
  const interval = localStorage.getItem("autoBackupInterval");
  const lastBackup = localStorage.getItem("lastAutoBackup");

  // Jika auto-backup tidak diaktifkan, hentikan fungsi
  if (!interval) return;

  const sekarang = Date.now();
  
  // Jika belum pernah backup sama sekali, anggap waktu terakhir adalah 0 (langsung backup)
  const waktuTerakhir = lastBackup ? parseInt(lastBackup) : 0;

  // Jika selisih waktu sekarang dengan terakhir backup > interval
  if (sekarang - waktuTerakhir > parseInt(interval)) {
    console.log("⏰ Waktunya Auto-Backup!");
    
    // Beri jeda 2 detik agar UI web selesai dimuat dulu
    setTimeout(() => {
      downloadSemuaDataExcel(); // Unduh otomatis format Excel
      alert("⏰ AUTO-BACKUP: Waktu interval telah tercapai. File Excel laporan telah diunduh otomatis ke perangkat Anda.");
    }, 2000);
  }
}

// Update teks status di UI
function updateStatusAutoBackupUI() {
  const el = document.getElementById("statusAutoBackup");
  if (!el) return;

  const interval = localStorage.getItem("autoBackupInterval");
  const lastBackup = localStorage.getItem("lastAutoBackup");

  if (!interval) {
    el.innerText = "Status: Auto-Backup Tidak Aktif";
    el.style.color = "#e53e3e";
    return;
  }

  const jam = parseInt(interval) / (60 * 60 * 1000);
  const waktuTerakhir = lastBackup ? new Date(parseInt(lastBackup)).toLocaleString("id-ID") : "Belum pernah";
  
  el.innerText = `Status: Aktif (Setiap ${jam} Jam) | Backup terakhir: ${waktuTerakhir}`;
  el.style.color = "#16a34a";
}

// Jalankan pengecekan saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  cekAutoBackup();
  updateStatusAutoBackupUI();
});