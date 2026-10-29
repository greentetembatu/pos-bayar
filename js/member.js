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
  const waktu =
    now.getHours().toString().padStart(2, "0") +
    now.getMinutes().toString().padStart(2, "0") +
    now.getSeconds().toString().padStart(2, "0");
  const rand = Math.floor(Math.random() * 90)
    .toString()
    .padStart(2, "0");

  return `${tgl}${bln}${thn}${waktu}${rand}`;
}

//===================================//
//===================================//

function simpanDataMember() {
  const nama = document.getElementById("namaMember").value;
  const hp = document.getElementById("hpMember").value;
  const email = document.getElementById("emailMember").value;

  if (!nama || !hp || !email) return alert("Nama dan HP wajib diisi");

  // 1. Ambil data paling fresh dari localStorage sebelum memanipulasi
  let dataTerbaru = JSON.parse(localStorage.getItem("member")) || [];

  if (memberDitemukan) {
    // MODE UPDATE
    const index = dataTerbaru.findIndex((m) => m.no === memberDitemukan.no);
    if (index !== -1) {
      dataTerbaru[index].nama = nama;
      dataTerbaru[index].hp = hp;
      dataTerbaru[index].email = email;
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
      email: email,
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
  document.getElementById("cardEmailMember").innerText = "Email: " + d.email;
  document.getElementById("cardHpMember").innerText = "WA: " + d.hp;
  document.getElementById("cardNoMember").innerText = "ID: " + d.no;

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
      (d.email && d.email.toLowerCase().includes(key)) ||
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
    if (typeof updateTotalDiskon === "function") updateTotalDiskon();
  } else {
    memberDitemukan = null;
    localStorage.removeItem("memberAktif"); // Bersihkan jika tidak ketemu
    alert("Member tidak ditemukan!");
  }
}
//===================================//
//===================================//
let html5QrCodeMember;

function mulaiScanMember() {
  // 1. Pastikan container ada
  const container = document.getElementById("readerMember");
  if (!container) return alert("Elemen readerMember tidak ditemukan di HTML!");

  // 2. Inisialisasi jika belum ada
  if (!html5QrCodeMember) {
    html5QrCodeMember = new Html5Qrcode("readerMember");
  }

  const config = {
    fps: 20,
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1.0,
    formatsToSupport: [
      Html5QrcodeSupportedFormats.QR_CODE,
      Html5QrcodeSupportedFormats.EAN_13,
      Html5QrcodeSupportedFormats.CODE_128,
    ],
  };

  // 3. Gunakan FORMAT OBJEK { facingMode: "environment" } agar sama dengan Kasir
  html5QrCodeMember
    .start({ facingMode: "environment" }, config, (barcodeText) => {
      if (typeof playBeep === "function") playBeep();
      if (navigator.vibrate) navigator.vibrate(100);

      // Berhenti setelah dapet
      stopScanMember();

      // SINKRONISASI DATA
      // Gunakan variabel dataMember yang sudah ada di aplikasi Anda
      const mTerdaftar = dataMember.find((m) => m.no === barcodeText);

      if (mTerdaftar) {
        memberDitemukan = mTerdaftar;
        localStorage.setItem("memberAktif", JSON.stringify(mTerdaftar));

        const jumlahBelanja = hitungLoyalitasMember(mTerdaftar.no);
        tampilKartuMember(mTerdaftar);

        alert(
          `Member Ditemukan: ${mTerdaftar.nama}\nTotal Kunjungan: ${jumlahBelanja}x`,
        );

        if (typeof updateTotalDiskon === "function") updateTotalDiskon();
      } else {
        alert("Kartu Member tidak terdaftar!");
        const inputSearch = document.getElementById("searchMember");
        if (inputSearch) {
          inputSearch.value = barcodeText;
          inputSearch.focus();
        }
      }
    })
    .catch((err) => {
      console.error("Gagal akses kamera member:", err);
      alert(
        "Gagal akses kamera member. Pastikan ID 'readerMember' tersedia dan izin kamera diberikan.",
      );
    });
}

function stopScanMember() {
  if (html5QrCodeMember) {
    html5QrCodeMember
      .stop()
      .then(() => {
        // Bersihkan instance agar bisa dibuat ulang dengan bersih
        html5QrCodeMember = null;
        console.log("Scanner Member Berhenti.");
      })
      .catch((err) => console.error("Error stop scanner", err));
  }
}

//===================================//
//===================================//

function pemicuEditMember() {
  if (!memberDitemukan) return;
  document.getElementById("namaMember").value = memberDitemukan.nama;
  document.getElementById("hpMember").value = memberDitemukan.hp;
  document.getElementById("emailMember").value = memberDitemukan.email;
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
  document.getElementById("emailMember").value = "";
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

// --- FUNGSI BACKUP & RESTORE (CSV) ---

// 1. FUNGSI DOWNLOAD CSV
/* ==========================================
   UPLOAD DATA MEMBER (EXCEL)
========================================== */
function importDataMember(event) {
  if (typeof XLSX === "undefined") return alert("Library Excel belum dimuat.");

  const file = event.target.files[0];
  if (!file) return;

  if (
    !confirm(
      "Upload Excel:\n• Member dengan No Member sama akan diperbarui.\n• Member baru akan ditambahkan.\n\nLanjutkan?",
    )
  ) {
    event.target.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      // Ambil sheet pertama
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Konversi ke JSON
      const hasilImport = XLSX.utils.sheet_to_json(worksheet);

      if (hasilImport.length === 0) {
        alert("File Excel kosong atau format tidak valid.");
        return;
      }

      // Normalisasi data agar sesuai dengan format aplikasi
      const dataBersih = hasilImport.map((row) => ({
        tanggal: row["Tanggal"] || "-",
        kasir: row["Kasir"] || "-",
        nama: row["Nama Member"] || row["Nama"] || "-",
        email: row["Email"] || "-",
        hp: String(row["No HP"] || row["HP"] || "-"),
        no: String(row["No Member"] || row["ID"] || "-"),
      }));

      // === MERGE DATA ===
      let dataLama = JSON.parse(localStorage.getItem("member")) || [];

      const mapLama = new Map();
      dataLama.forEach((m, idx) => {
        if (m.no) mapLama.set(String(m.no).trim(), idx);
      });

      let jumlahUpdate = 0;
      let jumlahTambah = 0;

      dataBersih.forEach((mBaru) => {
        const key = String(mBaru.no).trim();

        if (key && key !== "-" && mapLama.has(key)) {
          // No Member sudah ada -> Update data
          const idx = mapLama.get(key);
          dataLama[idx] = { ...dataLama[idx], ...mBaru };
          jumlahUpdate++;
        } else {
          // No Member belum ada -> Tambah data baru
          dataLama.push(mBaru);
          if (key && key !== "-") mapLama.set(key, dataLama.length - 1);
          jumlahTambah++;
        }
      });

      // Simpan ke LocalStorage
      localStorage.setItem("member", JSON.stringify(dataLama));

      // Update variabel global & UI jika ada
      if (typeof dataMember !== "undefined") dataMember = dataLama;
      if (typeof updateCounterMember === "function") updateCounterMember();

      alert(
        `✅ Berhasil!\n• ${jumlahUpdate} data diperbarui.\n• ${jumlahTambah} data baru ditambahkan.`,
      );
      location.reload();
    } catch (err) {
      console.error(err);
      alert("Gagal memproses file Excel. Pastikan format file benar.");
    }
  };

  reader.readAsArrayBuffer(file);
  event.target.value = "";
}

/* ==========================================
   UPLOAD DATA MEMBER (EXCEL)
========================================== */
function importDataMember(event) {
  if (typeof XLSX === "undefined") return alert("Library Excel belum dimuat.");

  const file = event.target.files[0];
  if (!file) return;

  if (
    !confirm(
      "Upload Excel:\n• Member dengan No Member sama akan diperbarui.\n• Member baru akan ditambahkan.\n\nLanjutkan?",
    )
  ) {
    event.target.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      // Ambil sheet pertama
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Konversi ke JSON
      const hasilImport = XLSX.utils.sheet_to_json(worksheet);

      if (hasilImport.length === 0) {
        alert("File Excel kosong atau format tidak valid.");
        return;
      }

      // Normalisasi data agar sesuai dengan format aplikasi
      const dataBersih = hasilImport.map((row) => ({
        tanggal: row["Tanggal"] || "-",
        kasir: row["Kasir"] || "-",
        nama: row["Nama Member"] || row["Nama"] || "-",
        email: row["Email"] || "-",
        hp: String(row["No HP"] || row["HP"] || "-"),
        no: String(row["No Member"] || row["ID"] || "-"),
      }));

      // === MERGE DATA ===
      let dataLama = JSON.parse(localStorage.getItem("member")) || [];

      const mapLama = new Map();
      dataLama.forEach((m, idx) => {
        if (m.no) mapLama.set(String(m.no).trim(), idx);
      });

      let jumlahUpdate = 0;
      let jumlahTambah = 0;

      dataBersih.forEach((mBaru) => {
        const key = String(mBaru.no).trim();

        if (key && key !== "-" && mapLama.has(key)) {
          // No Member sudah ada -> Update data
          const idx = mapLama.get(key);
          dataLama[idx] = { ...dataLama[idx], ...mBaru };
          jumlahUpdate++;
        } else {
          // No Member belum ada -> Tambah data baru
          dataLama.push(mBaru);
          if (key && key !== "-") mapLama.set(key, dataLama.length - 1);
          jumlahTambah++;
        }
      });

      // Simpan ke LocalStorage
      localStorage.setItem("member", JSON.stringify(dataLama));

      // Update variabel global & UI jika ada
      if (typeof dataMember !== "undefined") dataMember = dataLama;
      if (typeof updateCounterMember === "function") updateCounterMember();

      alert(
        `✅ Berhasil!\n• ${jumlahUpdate} data diperbarui.\n• ${jumlahTambah} data baru ditambahkan.`,
      );
      location.reload();
    } catch (err) {
      console.error(err);
      alert("Gagal memproses file Excel. Pastikan format file benar.");
    }
  };

  reader.readAsArrayBuffer(file);
  event.target.value = "";
}

// 3. FUNGSI CETAK KARTU (PERBAIKAN)
function printKartuMember() {
  // Perbaikan: replace() disesuaikan dengan teks yang ada di HTML (ID: dan WA:)
  const params = new URLSearchParams({
    noMember: document
      .getElementById("cardNoMember")
      .innerText.replace("ID: ", ""),
    tokoMember: document.getElementById("cardTokoMember").innerText,
    alamatMember: document.getElementById("cardAlamatMember").innerText,
    hpTokoMember: document
      .getElementById("cardHpTokoMember")
      .innerText.replace("Telp: ", ""),
    namaMember: document
      .getElementById("cardNamaMember")
      .innerText.replace("Nama: ", ""),
    hpMember: document
      .getElementById("cardHpMember")
      .innerText.replace("WA: ", ""),
    emailMember: document
      .getElementById("cardEmailMember")
      .innerText.replace("Email: ", ""),
  });
  window.open("cetak-member.html?" + params.toString(), "_blank");
}

// --- FUNGSI TAMBAHAN (BACKUP, CSV, SCAN) ---
/*function backupDataMember() {
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

      if (!Array.isArray(imported)) {
        alert("File tidak valid: harus berupa array.");
        event.target.value = "";
        return;
      }

      // Pastikan dataMember diambil dari storage (kalau variabel global kosong)
      const dataLama = (typeof dataMember !== "undefined" && Array.isArray(dataMember) && dataMember.length)
        ? dataMember
        : (JSON.parse(localStorage.getItem("member")) || []);

      // === MERGE: data lama TIDAK PERNAH dihapus ===
      // Kunci pembanding: no member (fallback ke nama+hp kalau no kosong)
      const mapLama = new Map();

      dataLama.forEach((m, idx) => {
        const key = (m.no || "").toString().trim();
        if (key) mapLama.set(key, idx);
      });

      const dataBaru = [...dataLama];
      let jumlahUpdate = 0;
      let jumlahTambah = 0;

      imported.forEach((item) => {
        const key = (item.no || "").toString().trim();

        if (key && mapLama.has(key)) {
          // No member sama → timpa data lama
          const idx = mapLama.get(key);
          dataBaru[idx] = { ...dataLama[idx], ...item };
          jumlahUpdate++;
        } else {
          // No member baru → tambah
          dataBaru.push(item);
          if (key) mapLama.set(key, dataBaru.length - 1);
          jumlahTambah++;
        }
      });

      // Konfirmasi hasil merge
      const konfirmasi = confirm(
        `Impor selesai:\n` +
        `• ${jumlahUpdate} member diperbarui (no sama)\n` +
        `• ${jumlahTambah} member baru ditambahkan\n` +
        `• Total member sekarang: ${dataBaru.length}\n\n` +
        `Data lama tidak ada yang dihapus.\n\nSimpan perubahan?`
      );

      if (!konfirmasi) {
        event.target.value = "";
        return;
      }

      // Simpan hasil gabungan
      dataMember = dataBaru;
      localStorage.setItem("member", JSON.stringify(dataMember));

      alert(
        `✅ Berhasil disimpan:\n` +
        `• ${jumlahUpdate} diperbarui\n` +
        `• ${jumlahTambah} ditambahkan\n` +
        `• Total: ${dataMember.length} member`
      );

      location.reload();

    } catch (err) {
      console.error(err);
      alert("File tidak valid atau gagal dibaca.");
    }

    event.target.value = "";
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

  let csv = "Tanggal;Kasir;Nama Member;Email;No HP;No Member\n";

  dataUntukDownload.forEach((d) => {
    // Gunakan fallback "" jika data undefined agar CSV tidak rusak
    let tgl = d.tanggal || "-";
    let ksr = d.kasir || "-";
    let nm = d.nama || "-";
    let email = d.email || "-";
    let telp = d.hp || "-";
    let idm = d.no || "-";

    csv += `${tgl};${ksr};${nm};${email};'${telp};'${idm}\n`;
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
    emailMember: document.getElementById("cardEmailMember").innerText,
    namaMember: document
      .getElementById("cardNamaMember")
      .innerText.replace("Nama: ", ""),
    hpMember: document
      .getElementById("cardHpMember")
      .innerText.replace("WhatsApp: ", ""),
    emailMember: document
      .getElementById("cardEmailMember")
      .innerText.replace("Email: ", ""),
  });
  window.open("cetak-member.html?" + params.toString(), "_blank");
}*/
