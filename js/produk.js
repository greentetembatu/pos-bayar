document.addEventListener("DOMContentLoaded", renderProduk);

/* =======================
   SIMPAN PRODUK
======================= */
function simpanProduk() {
  const produk = getProduk();

  const id = document.getElementById("produkId").value;
  const barcode = document.getElementById("barcodeProduk").value.trim();
  const nama = document.getElementById("namaProduk").value.trim();
  const modal = Number(document.getElementById("modalProduk").value);
  const harga_jual = Number(document.getElementById("hargaProduk").value);
  const stok = Number(document.getElementById("stokProduk").value);

  // Validasi Dasar
  if (!nama || modal <= 0 || harga_jual <= 0 || stok < 0) {
    alert("Lengkapi data dengan benar");
    return;
  }

  // --- TAMBAHAN: Validasi Barcode Ganda ---
  if (barcode !== "") {
    const isDuplicate = produk.some((p) => p.barcode === barcode && p.id != id);
    if (isDuplicate) {
      alert("⚠️ Barcode sudah digunakan oleh produk lain!");
      return;
    }
  }

  if (id) {
    // Edit Produk
    const dashboard = produk.findIndex((p) => p.id == id);
    if (dashboard === -1) return;

    produk[dashboard] = {
      ...produk[dashboard],
      barcode: barcode,
      nama,
      modal,
      harga_jual,
      stok,
    };
  } else {
    // Tambah Produk Baru
    produk.push({
      id: Date.now(),
      barcode: barcode,
      nama,
      modal,
      harga_jual,
      stok,
    });
  }

  saveProduk(produk);
  resetForm();
  renderProduk();
}
/* =======================
   EDIT PRODUK
======================= */
function editProduk(id) {
  const produk = getProduk();
  const p = produk.find((item) => item.id == id);
  if (!p) return;

  // Mengisi form dengan data yang ada
  document.getElementById("produkId").value = p.id;
  document.getElementById("barcodeProduk").value = p.barcode || "";
  document.getElementById("namaProduk").value = p.nama;
  document.getElementById("modalProduk").value = p.modal;
  document.getElementById("hargaProduk").value = p.harga_jual;
  document.getElementById("stokProduk").value = p.stok;

  // 🔥 TAMBAHAN: Muat foto ke dalam form preview
  const imgPreview = document.getElementById("imgPreview");
  if (p.foto) {
    fotoBase64 = p.foto; // Simpan ke variabel global agar tidak hilang saat disave
    imgPreview.src = p.foto;
    imgPreview.style.display = "block";
  } else {
    fotoBase64 = "";
    imgPreview.src = "";
    imgPreview.style.display = "none";
  }
}


/* =======================
   HAPUS PRODUK
======================= */
function hapusProduk(id) {
  if (!confirm("Hapus produk ini?")) return;

  let produk = getProduk();
  // 🔥 Gunakan == agar bisa menghapus ID bertipe String maupun Number
  produk = produk.filter((p) => p.id != id);

  saveProduk(produk);
  renderProduk();
}

/* =======================
   RESET FORM
======================= */
/* =======================
   RESET FORM
======================= */
function resetForm() {
  document.getElementById("produkId").value = "";
  document.getElementById("barcodeProduk").value = "";
  document.getElementById("namaProduk").value = "";
  document.getElementById("modalProduk").value = "";
  document.getElementById("hargaProduk").value = "";
  document.getElementById("stokProduk").value = "";

  // 🔥 TAMBAHAN: Bersihkan input file dan preview foto
  const fileInput = document.getElementById("fotoProduk");
  if (fileInput) fileInput.value = ""; // Reset input file agar bisa upload file yang sama

  const imgPreview = document.getElementById("imgPreview");
  if (imgPreview) {
    imgPreview.src = "";
    imgPreview.style.display = "none";
  }

  fotoBase64 = ""; // Kosongkan variabel global
}

/* =======================
   RENDER TABEL (Update: Tambah Barcode)
======================= */

let pageProduk = 1;
const limitProdukPerHal = 10;

function renderProduk() {
  const tbody = document.getElementById("produkTable");
  if (!tbody) return;

  // Ambil data produk terbaru dari storage
  const produk = getProduk() || [];
  const keyword =
    document.getElementById("searchProduk")?.value.toLowerCase() || "";
  const filter = document.getElementById("filterStok")?.value || "all";

  tbody.innerHTML = "";

  // --- STEP 1: FILTER DATA ---
  const hasilFilter = produk.filter((p) => {
    const nama = (p.nama || "").toString().toLowerCase().trim();
    const barcode = (p.barcode || "").toString().toLowerCase().trim();

    const cari = keyword.toLowerCase().trim();

    // 🔥 Pencarian sebagian kata
    const cocokNama = nama.includes(cari);

    // 🔥 Pencarian barcode
    const cocokBarcode = barcode.includes(cari);

    let cocokStok = true;

    if (filter === "tersedia") cocokStok = p.stok > 0;

    if (filter === "habis") cocokStok = p.stok === 0;

    if (filter === "menipis") cocokStok = p.stok > 0 && p.stok <= 5;

    return (cocokNama || cocokBarcode) && cocokStok;
  });

  // --- STEP 2: LOGIKA PAGINATION ---
  const totalHal = Math.ceil(hasilFilter.length / limitProdukPerHal) || 1;

  // Keamanan: Jika halaman saat ini lebih besar dari total halaman (misal setelah difilter), balik ke hal 1
  if (pageProduk > totalHal) pageProduk = 1;

  // Kontrol Tampilan Navigasi
  const navProduk = document.getElementById("navigasiProduk");
  if (navProduk) {
    navProduk.style.display =
      hasilFilter.length > limitProdukPerHal ? "flex" : "none";
  }

  // Teks Halaman
  const infoHal = document.getElementById("infoHalamanProduk");
  if (infoHal) infoHal.innerText = `Halaman ${pageProduk} dari ${totalHal}`;

  // Status Tombol
  const btnPrev = document.getElementById("btnPrevProduk");
  const btnNext = document.getElementById("btnNextProduk");
  if (btnPrev && btnNext) {
    btnPrev.disabled = pageProduk === 1;
    btnNext.disabled = pageProduk === totalHal;
    btnPrev.style.opacity = pageProduk === 1 ? "0.5" : "1";
    btnNext.style.opacity = pageProduk === totalHal ? "0.5" : "1";
  }

  // --- STEP 3: POTONG DATA (10 BARIS) ---
  const mulai = (pageProduk - 1) * limitProdukPerHal;
  const dataTampil = hasilFilter.slice(mulai, mulai + limitProdukPerHal);

  // --- STEP 4: RENDER KE TABEL ---
  if (dataTampil.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center">Produk tidak ditemukan</td></tr>`;
    return;
  }

  dataTampil.forEach((p) => {
    const tr = document.createElement("tr");
    let badge =
      p.stok === 0 ? "❌ Habis" : p.stok <= 5 ? "⚠️ Menipis" : "✅ Aman";

    tr.innerHTML = `
            <td><img src="${p.foto || "https://placehold.co/100x100"}" style="width:100px; height:100px; object-fit:cover; border-radius:5px;"></td>
            <td><code style="background: #0f0cd6c9; padding: 2px 5px; border-radius: 4px;">${p.barcode || "-"}</code></td>
            <td><strong>${p.nama}</strong></td>
            <td>Rp ${(p.modal || 0).toLocaleString("id-ID")}</td>
            <td>Rp ${(p.harga_jual || 0).toLocaleString("id-ID")}</td>
            <td>${p.stok} <br><small>${badge}</small></td>
            <td style= "display:flex; flex-direction:column;" >
                <button onclick="editProduk(${p.id})" style="background:#f37d0e; color:white; border:none; border-radius:4px; padding:4px 8px; cursor:pointer;">Edit</button>
                <button onclick="hapusProduk(${p.id})" style="background:#e53e3e; color:white; border:none; border-radius:4px; padding:4px 8px; cursor:pointer;">Hapus</button>
            </td>
        `;
    tbody.appendChild(tr);
  });
}

function gantiHalamanProduk(arah) {
  const produk = getProduk() || [];
  const totalHal = Math.ceil(produk.length / limitProdukPerHal);

  // Update halaman
  pageProduk += arah;

  // Jalankan render ulang
  renderProduk();

  // Scroll otomatis ke judul daftar produk agar user tahu data sudah berganti
  const scrollTarget = document.querySelector("h3");
  if (scrollTarget)
    scrollTarget.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* =======================
   FUNGSI BARCODE SCANNER
======================= */
let html5QrCode;

function mulaiScan() {
  if (!html5QrCode) {
    html5QrCode = new Html5Qrcode("reader");
  }

  const config = {
    fps: 20,
    qrbox: { width: 280, height: 180 },
    aspectRatio: 1.0,
  };

  html5QrCode
    .start({ facingMode: "environment" }, config, (barcodeText) => {
      playBeep();
      if (navigator.vibrate) navigator.vibrate(100); // Getar HP
      if (navigator.vibrate) navigator.vibrate(100);
      stopScan();

      document.getElementById("barcodeProduk").value = barcodeText;

      const produk = getProduk();
      const pTerdaftar = produk.find((p) => p.barcode === barcodeText);

      if (pTerdaftar) {
        alert(
          "Produk ditemukan: " +
            pTerdaftar.nama +
            ". Mengalihkan ke mode Edit.",
        );
        isiFormProduk(pTerdaftar);
      } else {
        alert("Barang Baru terdeteksi!");
        // Simpan barcode, bersihkan field lain
        const currentBarcode = barcodeText;
        resetForm();
        document.getElementById("barcodeProduk").value = currentBarcode;
        document.getElementById("namaProduk").focus();
      }
    })
    .catch((err) => {
      alert("Gagal akses kamera: " + err);
    });
}

function stopScan() {
  if (html5QrCode) {
    html5QrCode
      .stop()
      .catch((err) => console.error("Error stopping scanner", err));
  }
}

// Fungsi pembantu untuk memindahkan data ke form
function isiFormProduk(p) {
  document.getElementById("produkId").value = p.id;
  document.getElementById("barcodeProduk").value = p.barcode || "";
  document.getElementById("namaProduk").value = p.nama;
  document.getElementById("modalProduk").value = p.modal;
  document.getElementById("hargaProduk").value = p.harga_jual;
  document.getElementById("stokProduk").value = p.stok;
}

/* =======================
   FUNGSI BUNYI BEEP
======================= */
function playBeep() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Kita buat dua oscillator sekaligus agar suaranya "tebal" seperti klakson
    [880, 440].forEach((freq) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      // 'sawtooth' memberikan tekstur kasar/nyaring seperti klakson
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.6, audioCtx.currentTime);

      // Durasi diperpanjang menjadi 0.6 detik agar mantap
      const durasi = 0.8;

      // Efek memudar perlahan
      gain.gain.exponentialRampToValueAtTime(
        0.05,
        audioCtx.currentTime + durasi,
      );

      osc.start();
      osc.stop(audioCtx.currentTime + durasi);
    });
  } catch (e) {
    console.log("Audio gagal: ", e);
  }
}

// Di dalam simpanProduk()
/* Variabel global untuk menampung gambar sementara */
let fotoBase64 = "";

// Fungsi untuk menangkap upload gambar & pratinjau
function previewImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function () {
    const output = document.getElementById("imgPreview");
    output.src = reader.result;
    output.style.display = "block";
    fotoBase64 = reader.result; // Hasil string base64
  };
  reader.readAsDataURL(file);
}

function simpanProduk() {
  const produk = getProduk() || []; // Proteksi jika data kosong

  // Ambil elemen secara aman
  const elId = document.getElementById("produkId");
  const elBarcode = document.getElementById("barcodeProduk");
  const elNama = document.getElementById("namaProduk");
  const elModal = document.getElementById("modalProduk");
  const elHarga = document.getElementById("hargaProduk");
  const elStok = document.getElementById("stokProduk");

  // Pastikan elemen ada sebelum mengambil .value (Cegah Error baris ini)
  if (!elNama || !elModal) {
    console.error("Elemen form tidak ditemukan di HTML");
    return;
  }

  const id = elId.value;
  const barcode = elBarcode ? elBarcode.value.trim() : "";
  const nama = elNama.value.trim();
  const modal = Number(elModal.value);
  const harga_jual = Number(elHarga.value);
  const stok = Number(elStok.value);

  // Validasi input
  if (!nama || modal <= 0 || harga_jual <= 0) {
    alert("Lengkapi data produk dengan benar!");
    return;
  }

  // Validasi Barcode Ganda
  if (barcode !== "") {
    const isDuplicate = produk.some((p) => p.barcode === barcode && p.id != id);
    if (isDuplicate) {
      alert("⚠️ Barcode ini sudah terdaftar pada produk lain!");
      return;
    }
  }

  if (id) {
    // --- PROSES EDIT ---
    const dashboard = produk.findIndex((p) => p.id == id);
    if (dashboard !== -1) {
      produk[dashboard] = {
        ...produk[dashboard],
        barcode: barcode,
        nama: nama,
        modal: modal,
        harga_jual: harga_jual,
        stok: stok,
        // Gunakan foto baru jika ada, jika tidak gunakan foto lama
        foto: fotoBase64 || produk[dashboard].foto || "",
      };
    }
  } else {
    // --- PROSES TAMBAH BARU ---
    produk.push({
      id: Date.now(),
      barcode: barcode,
      nama: nama,
      modal: modal,
      harga_jual: harga_jual,
      stok: stok,
      foto: fotoBase64 || "", // Placeholder kosong jika tidak ada foto
    });
  }

  saveProduk(produk);
  resetForm();
  renderProduk();

  // Reset status foto setelah simpan
  fotoBase64 = "";
  if (document.getElementById("imgPreview"))
    document.getElementById("imgPreview").style.display = "none";

  alert("Produk berhasil disimpan!");
}

/* =======================
   EKSPOR DATA PRODUK (CSV)
======================= */
/*function eksporCSVProduk() {
  const data = getProduk() || [];

  if (data.length === 0) {
    alert("Tidak ada data produk");
    return;
  }

  // Header CSV
  let csv = "id;barcode;nama;modal;harga_jual;stok;foto\n";

  // Isi data
  data.forEach((p) => {
    csv +=
      [
        p.id || "",
        p.barcode || "",
        p.nama || "",
        p.modal || 0,
        p.harga_jual || 0,
        p.stok || 0,
        p.foto || "",
      ].join(";") + "\n";
  });

  // Tambahkan UTF-8 BOM agar Excel tidak rusak
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  const tanggal = new Date().toISOString().slice(0, 10);

  link.href = url;
  link.download = `backup-produk-${tanggal}.csv`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);

  alert("Data CSV berhasil diekspor");
}*/

/* =======================
   IMPOR DATA PRODUK (CSV)
======================= */
/*function imporCSVProduk(event) {
  const file = event.target.files[0];
  if (!file) return;

  const konfirmasi = confirm(
    "Impor CSV:\n" +
      "• Produk dengan NAMA SAMA akan ditimpa\n" +
      "• Produk dengan NAMA BERBEDA akan ditambahkan\n" +
      "• Data lama tidak dihapus\n\nLanjutkan?",
  );

  if (!konfirmasi) {
    event.target.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const text = e.target.result;

      // Pecah per baris (aman untuk CRLF & LF)
      const rows = text.split(/\r?\n/);

      // Header
      const headers = rows[0]
        .trim()
        .split(";")
        .map((h) => h.trim().toLowerCase());

      const hasil = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!row) continue;

        const cols = row.split(";");

        let obj = {};

        headers.forEach((h, index) => {
          obj[h] = (cols[index] || "").trim();
        });

        // Konversi tipe
        obj.id = Number(obj.id) || Date.now() + i;
        obj.modal = Number(obj.modal) || 0;
        obj.harga_jual = Number(obj.harga_jual) || 0;
        obj.stok = Number(obj.stok) || 0;

        hasil.push(obj);
      }

      // === MERGE ===
      const { dataBaru, jumlahUpdate, jumlahTambah } = mergeProduk(hasil);

      saveProduk(dataBaru);

      pageProduk = 1;
      renderProduk();

      alert(
        `Impor CSV selesai:\n` +
          `• ${jumlahUpdate} produk diperbarui (nama sama)\n` +
          `• ${jumlahTambah} produk baru ditambahkan\n` +
          `• Total produk sekarang: ${dataBaru.length}`,
      );
    } catch (err) {
      console.error(err);
      alert("Gagal membaca file CSV");
    }

    event.target.value = "";
  };

  reader.readAsText(file);
}*/

/* =======================
   MERGE PRODUK
======================= */
/*function mergeProduk(dataImpor) {
  const dataLama = getProduk() || [];

  // Map nama → index
  const mapLama = new Map();
  dataLama.forEach((p, idx) => {
    const key = (p.nama || "").toString().toLowerCase().trim();
    if (key) mapLama.set(key, idx);
  });

  const dataBaru = [...dataLama];
  let jumlahUpdate = 0;
  let jumlahTambah = 0;

  dataImpor.forEach((item) => {
    const key = (item.nama || "").toString().toLowerCase().trim();

    if (key && mapLama.has(key)) {
      // NAMA SAMA → timpa field dari impor, pertahankan id lama
      const idx = mapLama.get(key);

      dataBaru[idx] = {
        ...dataLama[idx], // field lama tetap (foto, dll)
        ...item, // field impor menimpa
        id: dataLama[idx].id, // id lama dipertahankan
      };

      jumlahUpdate++;
    } else {
      // NAMA BARU → tambah
      dataBaru.push(item);

      if (key) mapLama.set(key, dataBaru.length - 1);
      jumlahTambah++;
    }
  });

  return { dataBaru, jumlahUpdate, jumlahTambah };
}*/

// Fungsi bantuan untuk mengubah Base64 menjadi File Biner (Blob)
function base64ToBlob(base64Data, contentType) {
  contentType = contentType || "";
  const sliceSize = 1024;
  const byteCharacters = atob(base64Data);
  const bytesLength = byteCharacters.length;
  const slicesCount = Math.ceil(bytesLength / sliceSize);
  const byteArrays = new Array(slicesCount);

  for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    const begin = sliceIndex * sliceSize;
    const end = Math.min(begin + sliceSize, bytesLength);

    const bytes = new Array(end - begin);
    for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0);
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes);
  }
  return new Blob(byteArrays, { type: contentType });
}

/* ==========================================
   1. DOWNLOAD EXCEL (TANPA FOTO)
========================================== */
function eksporExcelProduk() {
  if (typeof XLSX === "undefined") return alert("Library Excel belum dimuat.");

  const data = getProduk() || [];
  if (data.length === 0) return alert("Tidak ada data produk");

  // Siapkan data untuk Excel
  const dataExcel = data.map((p) => ({
    ID: String(p.id || ""),
    Barcode: String(p.barcode || ""),
    "Nama Produk": p.nama || "",
    Modal: Number(p.modal) || 0,
    "Harga Jual": Number(p.harga_jual) || 0,
    Stok: Number(p.stok) || 0,
    "Nama File Foto": p.foto ? `foto_${p.id}.jpg` : "-",
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(dataExcel);

  // Atur lebar kolom agar rapi
  ws["!cols"] = [
    { wch: 15 },
    { wch: 15 },
    { wch: 30 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Daftar Produk");

  const tanggal = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `backup-produk-tanpa-foto-${tanggal}.xlsx`);
}

/* ==========================================
   2. UPLOAD EXCEL (TANPA FOTO)
========================================== */
function imporExcelProduk(event) {
  if (typeof XLSX === "undefined") return alert("Library Excel belum dimuat.");

  const file = event.target.files[0];
  if (!file) return;

  if (
    !confirm(
      "Impor Excel?\nProduk dengan NAMA SAMA akan ditimpa (Foto lama tetap aman).",
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
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const hasil = XLSX.utils.sheet_to_json(worksheet);

      if (hasil.length === 0) throw new Error("File Excel kosong.");

      // Normalisasi tipe data
      const dataBersih = hasil.map((row, i) => ({
        // 🔥 Gunakan String() bukan Number(), agar ID yang panjang tidak rusak
        id: String(row["ID"] || Date.now() + i),
        barcode: String(row["Barcode"] || ""),
        nama: row["Nama Produk"] || "",
        modal: Number(row["Modal"]) || 0,
        harga_jual: Number(row["Harga Jual"]) || 0,
        stok: Number(row["Stok"]) || 0,
        foto: "", // Jika upload Excel teks saja, biarkan kosong agar fungsi merge mengambil foto lama
      }));

      const { dataBaru, jumlahUpdate, jumlahTambah } = mergeProduk(dataBersih);

      saveProduk(dataBaru);
      pageProduk = 1;
      renderProduk();

      alert(
        `✅ Berhasil!\n• ${jumlahUpdate} produk diperbarui\n• ${jumlahTambah} produk baru ditambahkan`,
      );
    } catch (err) {
      console.error(err);
      alert("Gagal membaca Excel: " + err.message);
    }
    event.target.value = "";
  };
  reader.readAsArrayBuffer(file);
}
/* ==========================================
   3. DOWNLOAD ZIP (EXCEL + FOTO)
========================================== */
async function eksporZipProduk(event) {
  if (typeof JSZip === "undefined" || typeof XLSX === "undefined") {
    return alert("Library ZIP atau Excel belum dimuat.");
  }

  const data = getProduk() || [];
  if (data.length === 0) return alert("Tidak ada data produk untuk didownload");

  const btn = event.target;
  const textAsli = btn.innerText;
  btn.innerText = "Memproses ZIP...";
  btn.disabled = true;

  try {
    const zip = new JSZip();

    // 1. Siapkan data Excel
    const dataExcel = data.map((p) => ({
      ID: String(p.id || ""),
      Barcode: String(p.barcode || ""),
      "Nama Produk": p.nama || "",
      Modal: Number(p.modal) || 0,
      "Harga Jual": Number(p.harga_jual) || 0,
      Stok: Number(p.stok) || 0,
      "Nama File Foto": p.foto ? `foto_${p.id}.jpg` : "-",
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dataExcel);
    ws["!cols"] = [
      { wch: 15 },
      { wch: 15 },
      { wch: 30 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Daftar Produk");

    // 2. Konversi Excel ke Biner dan masukkan ke ZIP
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    zip.file("data-produk.xlsx", excelBuffer);

    // 3. Proses Foto dan masukkan ke folder ZIP
    const folderFoto = zip.folder("Foto Produk");

    data.forEach((p) => {
      if (p.foto && p.foto.startsWith("data:image")) {
        const parts = p.foto.split(",");
        const header = parts[0];
        const base64Data = parts[1];

        let ekstensi = "jpg";
        if (header.includes("image/png")) ekstensi = "png";
        else if (header.includes("image/webp")) ekstensi = "webp";

        const mime = header.split(":")[1].split(";")[0];

        try {
          const blob = base64ToBlob(base64Data, mime);
          folderFoto.file(`foto_${p.id}.${ekstensi}`, blob);
        } catch (err) {
          console.error("Gagal konversi foto ID: " + p.id, err);
        }
      }
    });

    // 4. Generate ZIP
    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = `backup-produk-foto-${new Date().toISOString().slice(0, 10)}.zip`;
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (err) {
    console.error(err);
    alert("Gagal membuat ZIP: " + err.message);
  } finally {
    btn.innerText = textAsli;
    btn.disabled = false;
  }
}

/* ==========================================
   4. UPLOAD ZIP (EXCEL + FOTO)
========================================== */
async function imporZipProduk(event) {
  if (typeof JSZip === "undefined" || typeof XLSX === "undefined") {
    return alert("Library ZIP atau Excel belum dimuat.");
  }

  const file = event.target.files[0];
  if (!file) return;

  if (
    !confirm(
      "Impor ZIP + Foto?\nData lama tidak dihapus. Data dengan nama sama akan ditimpa.",
    )
  ) {
    event.target.value = "";
    return;
  }

  const label = event.target.previousElementSibling; // Mengambil label tombol
  const textAsli = label ? label.innerText : "Upload ZIP";
  if (label) label.innerText = "Memproses ZIP...";

  try {
    const zip = await JSZip.loadAsync(file);

    // 1. Cari file Excel di dalam ZIP
    const xlsxName = Object.keys(zip.files).find(
      (name) => name.endsWith(".xlsx") && !name.includes("__MACOSX"),
    );
    if (!xlsxName)
      throw new Error("File Excel (.xlsx) tidak ditemukan di dalam ZIP.");

    // 2. Baca Excel
    const excelData = await zip.files[xlsxName].async("arraybuffer");
    const workbook = XLSX.read(excelData, { type: "array" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const hasil = XLSX.utils.sheet_to_json(worksheet);

    if (hasil.length === 0)
      throw new Error("Data produk di dalam Excel kosong.");

    const hasilProduk = [];

    // 3. Looping produk dan cari fotonya di ZIP
    for (let i = 0; i < hasil.length; i++) {
      const row = hasil[i];
      let fotoBase64 = "";
      const namaFile = row["Nama File Foto"];

      if (namaFile && namaFile !== "-") {
        // Cari di dalam folder "Foto Produk" atau di root ZIP
        const imgFile =
          zip.file(`Foto Produk/${namaFile}`) || zip.file(namaFile);

        if (imgFile) {
          const base64Data = await imgFile.async("base64");
          let mime = "image/jpeg";
          if (namaFile.endsWith(".png")) mime = "image/png";
          else if (namaFile.endsWith(".webp")) mime = "image/webp";

          fotoBase64 = `data:${mime};base64,${base64Data}`;
        }
      }

      hasilProduk.push({
        id: Number(row["ID"]) || Date.now() + i,
        barcode: String(row["Barcode"] || ""),
        nama: row["Nama Produk"] || "",
        modal: Number(row["Modal"]) || 0,
        harga_jual: Number(row["Harga Jual"]) || 0,
        stok: Number(row["Stok"]) || 0,
        foto: fotoBase64,
      });
    }

    // 4. Gabungkan dengan data lama
    const { dataBaru, jumlahUpdate, jumlahTambah } = mergeProduk(hasilProduk);

    saveProduk(dataBaru);
    pageProduk = 1;
    renderProduk();

    alert(
      `✅ Berhasil Impor ZIP!\n• ${jumlahUpdate} produk diperbarui.\n• ${jumlahTambah} produk baru ditambahkan.`,
    );
  } catch (err) {
    console.error(err);
    alert("❌ Gagal membaca ZIP. Error: " + err.message);
  } finally {
    if (label) label.innerText = textAsli;
    event.target.value = "";
  }
}

/* ==========================================
   5. FUNGSI BANTU (MERGE)
========================================== */
function mergeProduk(dataImpor) {
  const dataLama = getProduk() || [];
  const mapLama = new Map();
  dataLama.forEach((p, idx) => {
    const key = (p.nama || "").toString().toLowerCase().trim();
    if (key) mapLama.set(key, idx);
  });

  const dataBaru = [...dataLama];
  let jumlahUpdate = 0;
  let jumlahTambah = 0;

  dataImpor.forEach((item) => {
    const key = (item.nama || "").toString().toLowerCase().trim();

    if (key && mapLama.has(key)) {
      const idx = mapLama.get(key);

      // Timpa data lama dengan data baru
      dataBaru[idx] = {
        ...dataLama[idx],
        ...item,
        id: dataLama[idx].id,
      };

      // 🔥 KUNCI PENTING:
      // Jika impor CSV tidak membawa foto, pertahankan foto lama
      if (!item.foto) {
        dataBaru[idx].foto = dataLama[idx].foto || "";
      }

      jumlahUpdate++;
    } else {
      dataBaru.push(item);
      if (key) mapLama.set(key, dataBaru.length - 1);
      jumlahTambah++;
    }
  });

  return { dataBaru, jumlahUpdate, jumlahTambah };
}

/*function mergeProduk(dataImpor) {
  const dataLama = getProduk() || [];
  const mapLama = new Map();
  dataLama.forEach((p, idx) => {
    const key = (p.nama || "").toString().toLowerCase().trim();
    if (key) mapLama.set(key, idx);
  });

  const dataBaru = [...dataLama];
  let jumlahUpdate = 0;
  let jumlahTambah = 0;

  dataImpor.forEach((item) => {
    const key = (item.nama || "").toString().toLowerCase().trim();

    if (key && mapLama.has(key)) {
      const idx = mapLama.get(key);
      dataBaru[idx] = {
        ...dataLama[idx], 
        ...item, 
        id: dataLama[idx].id // ID lama dipertahankan
      };
      // Jika CSV tidak punya foto, jangan hapus foto lama
      if (!item.foto) {
        dataBaru[idx].foto = dataLama[idx].foto || "";
      }
      jumlahUpdate++;
    } else {
      dataBaru.push(item);
      if (key) mapLama.set(key, dataBaru.length - 1);
      jumlahTambah++;
    }
  });

  return { dataBaru, jumlahUpdate, jumlahTambah };
}*/

const searchInput = document.getElementById("searchProduk");
const hasilBox = document.getElementById("hasilPencarianProduk");

if (searchInput && hasilBox) {
  let currentFocus = -1;

  // =========================
  // FUNGSI NAVIGASI KEYBOARD
  // =========================
  function aktifkanPilihan(items) {
    items.forEach((item) => {
      item.classList.remove("hasil-item-active");
    });

    if (!items.length) {
      currentFocus = -1;
      return;
    }

    // Jika melewati batas daftar, kembali ke awal/akhir
    if (currentFocus >= items.length) {
      currentFocus = 0;
    }

    if (currentFocus < 0) {
      currentFocus = items.length - 1;
    }

    items[currentFocus].classList.add("hasil-item-active");

    // Gulir otomatis jika item berada di luar area tampilan
    items[currentFocus].scrollIntoView({
      block: "nearest",
    });
  }

  // =========================
  // PENCARIAN PRODUK
  // =========================
  searchInput.addEventListener("input", function () {
    const keyword = this.value.toLowerCase().replace(/\s+/g, "").trim();

    hasilBox.innerHTML = "";
    currentFocus = -1;

    if (!keyword) {
      hasilBox.style.display = "none";
      renderProduk();
      return;
    }

    const produk = getProduk() || [];

    const hasil = produk.filter((p) => {
      const nama = (p.nama || "").toLowerCase().replace(/\s+/g, "");

      const barcode = (p.barcode || "")
        .toString()
        .toLowerCase()
        .replace(/\s+/g, "");

      return nama.includes(keyword) || barcode.includes(keyword);
    });
    //.slice(0, 10);

    if (hasil.length === 0) {
      hasilBox.style.display = "none";
      return;
    }

    hasil.forEach((p) => {
      const div = document.createElement("div");
      div.className = "hasil-item";

      const img = document.createElement("img");
      img.src = p.foto || "https://placehold.co/80x80";
      img.alt = p.nama || "Produk";

      const info = document.createElement("div");
      info.className = "hasil-info";

      const nama = document.createElement("h4");
      nama.textContent = p.nama || "Tanpa nama";

      // 1. Harga & Stok
      const detail = document.createElement("small");
      detail.textContent = `Rp ${(Number(p.harga_jual) || 0).toLocaleString("id-ID")} • Stok: ${p.stok ?? 0}`;

      // 🔥 2. TAMBAHKAN BARCODE DI SINI
      const barcode = document.createElement("small");
      barcode.style.display = "block";
      barcode.style.fontSize = "11px";
      barcode.style.color = "#ff0101";
      barcode.textContent = `Barcode: ${p.barcode || "-"}`;

      info.appendChild(nama);
      info.appendChild(detail);
      info.appendChild(barcode); // Masukkan barcode ke dalam info

      div.appendChild(img);
      div.appendChild(info);

      // Klik mouse untuk memilih produk
      div.addEventListener("click", () => {
        pilihHasilProduk(p);
      });

      hasilBox.appendChild(div);
    });

    hasilBox.style.display = "block";
  });

  // =========================
  // PILIH PRODUK
  // =========================
  function pilihHasilProduk(p) {
    searchInput.value = p.nama;

    hasilBox.style.display = "none";
    currentFocus = -1;

    pageProduk = 1;

    renderProduk();
  }

  // =========================
  // KONTROL KEYBOARD
  // =========================
  searchInput.addEventListener("keydown", function (e) {
    const items = hasilBox.querySelectorAll(".hasil-item");

    // Panah bawah
    if (e.key === "ArrowDown") {
      if (hasilBox.style.display === "none" || !items.length) {
        return;
      }

      e.preventDefault();
      currentFocus++;
      aktifkanPilihan(items);
    }

    // Panah atas
    else if (e.key === "ArrowUp") {
      if (hasilBox.style.display === "none" || !items.length) {
        return;
      }

      e.preventDefault();
      currentFocus--;
      aktifkanPilihan(items);
    }

    // Enter untuk memilih hasil aktif
    else if (e.key === "Enter") {
      if (
        hasilBox.style.display !== "none" &&
        currentFocus >= 0 &&
        items[currentFocus]
      ) {
        e.preventDefault();
        items[currentFocus].click();
      }
    }

    // Escape untuk menutup daftar
    else if (e.key === "Escape") {
      hasilBox.style.display = "none";
      currentFocus = -1;
    }
  });

  // =========================
  // KLIK DI LUAR PENCARIAN
  // =========================
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".card") || !e.target.closest("#searchProduk")) {
      // Tidak langsung menutup jika klik di dalam area hasil
      if (
        !e.target.closest("#hasilPencarianProduk") &&
        !e.target.closest("#searchProduk")
      ) {
        hasilBox.style.display = "none";
        currentFocus = -1;
      }
    }
  });
}

/* =======================
   EKSPOR DATA PRODUK (JSON)
======================= */
/*function eksporDataProduk() {
    const data = getProduk() || [];
    
    if (data.length === 0) return alert("Tidak ada data produk untuk diekspor");

    // Mengubah array objek menjadi string JSON
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    
    // Membuat link download otomatis
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    
    const tanggal = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `backup-produk-${tanggal}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert("Data berhasil diekspor ke file .json");
}*/

/* =======================
   IMPOR DATA PRODUK (JSON)
   Format JSON yang didukung:
   - Array of object: [ {nama:"...", modal:1000, ...}, ... ]
   - Atau object wrapper: { produk: [ ... ] }
======================= */
/*function imporJSONProduk(event) {

    const file = event.target.files[0];
    if (!file) return;

    const konfirmasi = confirm(
        "Impor JSON:\n" +
        "• Produk dengan NAMA SAMA akan ditimpa\n" +
        "• Produk dengan NAMA BERBEDA akan ditambahkan\n" +
        "• Data lama tidak dihapus\n\nLanjutkan?"
    );

    if (!konfirmasi) {
        event.target.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {

        try {

            const parsed = JSON.parse(e.target.result);

            // Dukung array langsung atau {produk:[...]}
            const rawList = Array.isArray(parsed)
                ? parsed
                : (Array.isArray(parsed.produk) ? parsed.produk : null);

            if (!rawList) {
                alert("Format JSON tidak valid. Harus array atau { produk: [...] }");
                event.target.value = "";
                return;
            }

            const hasil = rawList.map((item, i) => {

                const obj = {};

                // Normalisasi key ke lowercase
                Object.keys(item || {}).forEach(k => {
                    obj[k.toLowerCase().trim()] = item[k];
                });

                obj.id         = Number(obj.id) || Date.now() + i;
                obj.modal      = Number(obj.modal) || 0;
                obj.harga_jual = Number(obj.harga_jual) || 0;
                obj.stok       = Number(obj.stok) || 0;

                // Pastikan string field trim
                if (typeof obj.nama === "string") obj.nama = obj.nama.trim();
                if (typeof obj.barcode !== "undefined" && obj.barcode !== null) {
                    obj.barcode = String(obj.barcode).trim();
                }

                return obj;
            });

            // === MERGE ===
            const { dataBaru, jumlahUpdate, jumlahTambah } =
                mergeProduk(hasil);

            saveProduk(dataBaru);

            pageProduk = 1;
            renderProduk();

            alert(
                `Impor JSON selesai:\n` +
                `• ${jumlahUpdate} produk diperbarui (nama sama)\n` +
                `• ${jumlahTambah} produk baru ditambahkan\n` +
                `• Total produk sekarang: ${dataBaru.length}`
            );

        } catch (err) {
            console.error(err);
            alert("Gagal membaca file JSON. Pastikan format JSON valid.");
        }

        event.target.value = "";
    };

    reader.readAsText(file);
}*/
