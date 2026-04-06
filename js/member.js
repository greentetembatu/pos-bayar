// --- LOGIKA JAVASCRIPT ---
let dataMember = JSON.parse(localStorage.getItem("member")) || [];
let memberDitemukan = null;

window.addEventListener("DOMContentLoaded", () => {
  muatDataTokoMember();
  updateCounterMember(); // Tambahkan ini
});
//===================================//
//===================================//
function muatDataTokoMember() {
  const dataTersimpan = localStorage.getItem("dataTokoMember");
  if (dataTersimpan) {
    const dataToko = JSON.parse(dataTersimpan);
    if (document.getElementById("tokoNamaMember"))
      document.getElementById("tokoNamaMember").value =
        dataToko.tokoNamaMember || "";
    if (document.getElementById("tokoAlamatMember"))
      document.getElementById("tokoAlamatMember").value =
        dataToko.tokoAlamatMember || "";
    if (document.getElementById("tokoHpMember"))
      document.getElementById("tokoHpMember").value =
        dataToko.tokoHpMember || "";
    if (document.getElementById("kasirMember"))
      document.getElementById("kasirMember").value = dataToko.kasirMember || "";
  }
}
//===================================//
//===================================//

function simpanDataTokoMember() {
  const dataToko = {
    tokoNamaMember: document.getElementById("tokoNamaMember").value,
    tokoAlamatMember: document.getElementById("tokoAlamatMember").value,
    tokoHpMember: document.getElementById("tokoHpMember").value,
    kasirMember: document.getElementById("kasirMember").value,
  };
  localStorage.setItem("dataTokoMember", JSON.stringify(dataToko));
  alert("Data Toko Berhasil Disimpan!");
}
//===================================//
//===================================//



function generateNoMember() {
  const now = new Date();
  const tgl = now.getDate().toString().padStart(2, "0");
  const bln = (now.getMonth() + 1).toString().padStart(2, "0");
  const thn = now.getFullYear().toString().slice(-2);
  
  // Ambil JamMenitDetik (6 digit) + Random 2 digit
  const waktu = now.getHours().toString().padStart(2, "0") + 
                now.getMinutes().toString().padStart(2, "0") +
                now.getSeconds().toString().padStart(2, "0");
  const rand = Math.floor(Math.random() * 90).toString().padStart(2, "0");

  return `${tgl}${bln}${thn}${waktu}${rand}`;
}
















//===================================//
//===================================//

function simpanDataMember() {
  const nama = document.getElementById("namaMember").value;
  const hp = document.getElementById("hpMember").value;

  if (!nama || !hp) return alert("Nama dan HP wajib diisi");

  // 1. Ambil data paling fresh dari localStorage sebelum memanipulasi
  let dataTerbaru = JSON.parse(localStorage.getItem("member")) || [];

  if (memberDitemukan) {
    // MODE UPDATE
    const index = dataTerbaru.findIndex((m) => m.no === memberDitemukan.no);
    if (index !== -1) {
      dataTerbaru[index].nama = nama;
      dataTerbaru[index].hp = hp;
      alert("Data member berhasil diperbarui!");
    }
  } else {
    // MODE BARU
    let configToko = JSON.parse(localStorage.getItem("dataTokoMember")) || {};

    // Gunakan dataTerbaru.length agar nomor ID sinkron
    let nomorBaru = generateNoMember(dataTerbaru.length);

    let obj = {
      tanggal: new Date().toLocaleDateString("id-ID"),
      kasir: configToko.kasirMember || "-",
      nama: nama,
      hp: hp,
      no: nomorBaru,
    };

    // Tambahkan ke urutan paling atas (unshift) agar data baru muncul pertama di CSV
    dataTerbaru.unshift(obj);
    alert("Member baru berhasil terdaftar!");
  }

  // 2. Simpan kembali ke localStorage
  localStorage.setItem("member", JSON.stringify(dataTerbaru));

  // 3. Update variabel global dataMember agar sinkron dengan fungsi lain
  dataMember = dataTerbaru;

  // 4. Update UI
  updateCounterMember();
  tampilKartuMember(memberDitemukan || dataTerbaru[0]);
  batalEdit();
}
//===================================//
//===================================//

function tampilKartuMember(d) {
  let configToko = JSON.parse(localStorage.getItem("dataTokoMember")) || {};
  const kartuElMember = document.getElementById("kartuMember");

  // Tampilkan Kontainer Utama & Tombol-tombol
  kartuElMember.style.display = "block";
  document.getElementById("btnPrintMember").style.display = "inline-block";
  document.getElementById("aksiMember").style.display = "flex"; // Munculkan tombol Edit & Hapus

  document.getElementById("cardTokoMember").innerText =
    configToko.tokoNamaMember || "NAMA TOKO";
  document.getElementById("cardAlamatMember").innerText =
    configToko.tokoAlamatMember || "Alamat belum diatur";
  document.getElementById("cardHpTokoMember").innerText =
    "Telp: " + (configToko.tokoHpMember || "-");
  document.getElementById("cardNamaMember").innerText = "Nama: " + d.nama;
  document.getElementById("cardHpMember").innerText = "WhatsApp: " + d.hp;
  document.getElementById("cardNoMember").innerText = "ID Member: " + d.no;

  JsBarcode("#barcodeMember", d.no, {
    format: "CODE128",
    width: 2,
    height: 40,
    displayValue: false,
    background: "#ffffff",
  });
}
//===================================//
//===================================//

function cariDataMember() {
  let key = document.getElementById("searchMember").value.toLowerCase().trim();
  if (!key) return alert("Masukkan nama/ID/HP");

  let found = dataMember.find(
    (d) =>
      (d.nama && d.nama.toLowerCase().includes(key)) ||
      (d.no && d.no.toLowerCase().includes(key)) ||
      (d.hp && d.hp.includes(key)),
  );

if (found) {
    memberDitemukan = found;
    tampilKartuMember(found);

    // 🔥 TAMBAHKAN BARIS INI:
    localStorage.setItem("memberAktif", JSON.stringify(found)); 
    alert("Member Terpilih: " + found.nama);
    
    // Jika ada fungsi update diskon otomatis, panggil di sini
    if(typeof updateTotalDiskon === "function") updateTotalDiskon();

  } else {
    memberDitemukan = null;
    localStorage.removeItem("memberAktif"); // Bersihkan jika tidak ketemu
    alert("Member tidak ditemukan!");
  }
  
}
//===================================//
//===================================//

let scannerMember; // Gunakan nama yang spesifik agar tidak tabrakan dengan scanner produk

function startScannerMember() {
  if (scannerMember) return; // Mencegah buka kamera ganda
  
  scannerMember = new Html5Qrcode("readerMember");
  
  // Gunakan "environment" sebagai string untuk fleksibilitas HP/Laptop
  scannerMember.start(
    "environment", 
    { fps: 10, qrbox: 250 }, 
    (txt) => {
      // Cari data member berdasarkan hasil scan barcode kartu
      let found = dataMember.find((d) => d.no === txt);

      if (found) {
        // 1. Tampilkan kartu secara visual
        tampilKartuMember(found);
        
        // 2. Simpan ke sistem kasir (Sama seperti fungsi cariDataMember)
        memberDitemukan = found;
        localStorage.setItem("memberAktif", JSON.stringify(found));
        
        // 3. Update diskon otomatis jika ada
        if (typeof updateTotalDiskon === "function") updateTotalDiskon();
        
        alert("Member Terdeteksi: " + found.nama);
      } else {
        alert("Kartu tidak terdaftar: " + txt);
      }

      // Hentikan kamera setelah berhasil scan
      scannerMember.stop().then(() => {
        scannerMember = null;
      });
    }
  )
  .catch((err) => {
    console.error(err);
    alert("Kamera Error: Pastikan izin diberikan dan HTTPS aktif.");
    scannerMember = null;
  });
}

//===================================//
//===================================//


function pemicuEditMember() {
  if (!memberDitemukan) return;
  document.getElementById("namaMember").value = memberDitemukan.nama;
  document.getElementById("hpMember").value = memberDitemukan.hp;
  //getElementById("judulFormMember").innerText = "Edit Data Member";
  document.getElementById("btnSimpanMember").innerText = "Update & Simpan";
  document.getElementById("btnSimpanMember").style.background = "#ed8936";
  document.getElementById("btnBatalEdit").style.display = "inline-block";
  document.getElementById("namaMember").focus();
}
//===================================//
//===================================//

function pemicuHapusMember() {
  if (!memberDitemukan) return;
  if (confirm(`Hapus member ${memberDitemukan.nama} permanent?`)) {
    dataMember = dataMember.filter((m) => m.no !== memberDitemukan.no);
    localStorage.setItem("member", JSON.stringify(dataMember));
    alert("Member dihapus");

    // Sembunyikan semua elemen preview
    document.getElementById("kartuMember").style.display = "none";
    document.getElementById("btnPrintMember").style.display = "none";
    document.getElementById("aksiMember").style.display = "none"; // Sembunyikan tombol Edit/Hapus

    batalEdit();
  }
}
//===================================//
//===================================//

function batalEdit() {
  memberDitemukan = null;
  document.getElementById("namaMember").value = "";
  document.getElementById("hpMember").value = "";
  //document.getElementById("judulFormMember").innerText = "Input Member Baru";

  const btnSimpan = document.getElementById("btnSimpanMember");
  btnSimpan.innerText = "Simpan & Buat Kartu";
  btnSimpan.style.background = "#667eea";

  document.getElementById("btnBatalEdit").style.display = "none";

  // Sembunyikan kembali aksi jika kartu sedang tidak tampil
  if (document.getElementById("kartuMember").style.display === "none") {
    document.getElementById("aksiMember").style.display = "none";
  }
}
//===================================//
//===================================//

// --- FUNGSI UPDATE JUMLAH MEMBER ---
function updateCounterMember() {
  const elJumlah = document.getElementById("jumlahMember");
  if (elJumlah) {
    const total = dataMember.length;
    elJumlah.innerText = total;

    // Jika sedang edit (memberDitemukan tidak null), beri warna berbeda jika mau
    if (
      document.getElementById("btnBatalEdit").style.display === "inline-block"
    ) {
      elJumlah.style.background =
        "linear-gradient(135deg, #ed8936 0%, #f6ad55 100%)";
    } else {
      elJumlah.style.background =
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    }
  }
}
//===================================//
//===================================//

// --- FUNGSI TAMBAHAN (BACKUP, CSV, SCAN) ---
function backupDataMember() {
  if (dataMember.length === 0) return alert("Data kosong");
  const dataStr = JSON.stringify(dataMember, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `backup-member-${new Date().toISOString().split("T")[0]}.json`;
  link.click();
}
//===================================//
//===================================//

function importDataMember(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        if (confirm("Gabungkan data?")) {
          const ids = new Set(dataMember.map((m) => m.no));
          const barus = imported.filter((m) => !ids.has(m.no));
          dataMember = [...dataMember, ...barus];
        } else {
          dataMember = imported;
        }
        localStorage.setItem("member", JSON.stringify(dataMember));
        location.reload();
      }
    } catch (err) {
      alert("File tidak valid");
    }
  };
  reader.readAsText(file);
}
//===================================//
//===================================//

function downloadCSVMember() {
  // Ambil paksa data terbaru dari storage
  const dataUntukDownload = JSON.parse(localStorage.getItem("member")) || [];

  if (dataUntukDownload.length === 0) {
    return alert("Tidak ada data member untuk didownload");
  }

  let csv = "Tanggal;Kasir;Nama Member;No HP;No Member\n";

  dataUntukDownload.forEach((d) => {
    // Gunakan fallback "" jika data undefined agar CSV tidak rusak
    let tgl = d.tanggal || "-";
    let ksr = d.kasir || "-";
    let nm = d.nama || "-";
    let telp = d.hp || "-";
    let idm = d.no || "-";

    csv += `${tgl};${ksr};${nm};'${telp};'${idm}\n`;
  });
 
  // Proses download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  // Beri nama file yang unik dengan tanggal agar tidak tertukar
  const tgl = new Date().toLocaleDateString("id-ID").replace(/\//g, "-");

  link.href = url;
  link.download = `data-member-${tgl}.csv`;
  link.click();

  // Hapus URL object dari memori setelah digunakan
  URL.revokeObjectURL(url);
}
//===================================//
//===================================//

function printKartuMember() {
  const params = new URLSearchParams({
    noMember: document
      .getElementById("cardNoMember")
      .innerText.replace("ID Member: ", ""),
    tokoMember: document.getElementById("cardTokoMember").innerText,
    alamatMember: document.getElementById("cardAlamatMember").innerText,
    hpTokoMember: document.getElementById("cardHpTokoMember").innerText,
    namaMember: document
      .getElementById("cardNamaMember")
      .innerText.replace("Nama: ", ""),
    hpMember: document
      .getElementById("cardHpMember")
      .innerText.replace("WhatsApp: ", ""),
  });
  window.open("cetak-member.html?" + params.toString(), "_blank");
}
