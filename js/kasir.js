/* =========================
   STATE
========================= */
let keranjang = [];

/* =========================
   AUTOCOMPLETE PRODUK
========================= */
const produkInput = document.getElementById("produkInput");
const produkList = document.getElementById("produkList");
const produkIdInp = document.getElementById("produkId");

// pastikan element ada
if (produkInput && produkList && produkIdInp) {

  // --- TAMBAHAN: Variabel untuk melacak posisi fokus ---
  let currentFocus = -1;

  produkInput.addEventListener("input", () => {

    const keyword = produkInput.value.toLowerCase().trim();
    produkList.innerHTML = "";

    currentFocus = -1;

    if (!keyword) {
      produkList.style.display = "none";
      return;
    }

    const hasil = getProduk().filter(
      (p) =>
        p.nama.toLowerCase().includes(keyword) ||
        (p.barcode && p.barcode.includes(keyword))
    );

    if (hasil.length === 0) {
      produkList.style.display = "none";
      return;
    }

    hasil.forEach((p) => {

      const div = document.createElement("div");

      div.className = "autocomplete-item";

      div.innerHTML = `
        <strong>${p.nama}</strong>
        <br>
        <small>Rp ${p.harga_jual}</small>
      `;

      div.onclick = () => pilihProduk(p);

      produkList.appendChild(div);
    });

    produkList.style.display = "block";
  });

  // keyboard
  produkInput.addEventListener("keydown", function (e) {

    let listItems = produkList.getElementsByTagName("div");

    if (e.keyCode == 40) {

      currentFocus++;
      addActive(listItems);

    } else if (e.keyCode == 38) {

      currentFocus--;
      addActive(listItems);

    } else if (e.keyCode == 13) {

      e.preventDefault();

      if (currentFocus > -1) {
        if (listItems[currentFocus]) {
          listItems[currentFocus].click();
        }
      }
    }
  });

}








function addActive(items) {
  if (!items) return false;
  removeActive(items);
  if (currentFocus >= items.length) currentFocus = 0;
  if (currentFocus < 0) currentFocus = items.length - 1;

  items[currentFocus].classList.add("autocomplete-active");

  // Agar item yang dipilih otomatis scroll jika list panjang
  items[currentFocus].scrollIntoView({ block: "nearest" });
}

function removeActive(items) {
  for (let i = 0; i < items.length; i++) {
    items[i].classList.remove("autocomplete-active");
  }
}

function pilihProduk(p) {
  produkInput.value = p.nama;
  produkIdInp.value = p.id;
  produkList.style.display = "none";
  // Pindahkan fokus ke input Qty setelah pilih produk (opsional)
  document.getElementById("qty").focus();
}

/* ENTER = TAMBAH */
/* ENTER = TAMBAH */
if (produkInput) {

  produkInput.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

      e.preventDefault();

      tambahKeKeranjang();
    }
  });

}

document.addEventListener("click", (e) => {

  // pastikan produkList ada
  if (!produkList) return;

  // jika klik di luar autocomplete
  if (!e.target.closest(".autocomplete")) {

    produkList.style.display = "none";

  }

});
/* =========================
   TAMBAH KE KERANJANG
========================= */
function tambahKeKeranjang() {
  const produkId = Number(produkIdInp.value);
  const qty = Number(document.getElementById("qty").value);

  if (!produkId) {
    alert("Pilih produk terlebih dahulu");
    return;
  }

  const produk = getProduk();
  const item = produk.find((p) => p.id === produkId);

  if (!item) {
    alert("Produk tidak ditemukan");
    return;
  }

  if (item.stok < qty) {
    alert("Stok tidak mencukupi");
    return;
  }

  const subtotal = item.harga_jual * qty;
  const laba = (item.harga_jual - item.modal) * qty;

  const existing = keranjang.find((k) => k.id === item.id);
  if (existing) {
    existing.qty += qty;
    existing.subtotal += subtotal;
    existing.modal = item.modal; // 🔥 pastikan ada
    existing.laba += laba;
  } else {
    keranjang.push({
      id: item.id,
      nama: item.nama,
      foto: item.foto || "", // TAMBAHKAN INI: Mengambil foto dari data produk
      qty,
      harga: item.harga_jual,
      modal: item.modal, // 🔥 TAMBAHAN PENTING
      subtotal,
      laba,
    });
  }

  // Reset input setelah tambah
  produkInput.value = "";
  produkIdInp.value = "";
  document.getElementById("qty").value = 1;

  renderKeranjang();
}
/* =========================
   RENDER KERANJANG
========================= */
function renderKeranjang() {
  const tbody = document.querySelector("#keranjangTable tbody");
  tbody.innerHTML = "";

  let total = 0;
  let totalLabaHalaman = 0; // Tambahkan variabel penampung

  keranjang.forEach((item, i) => {
    total += item.subtotal;
    totalLabaHalaman += item.laba; // Tambahkan laba dari tiap item

    const tr = document.createElement("tr");
    const fotoUrl = item.foto || "https://placehold.co/50x50";

    tr.innerHTML = `
      <td style="display: flex; align-items: center; gap: 10px;">
        <img src="${fotoUrl}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;">
        <span>${item.nama}</span>
      </td>
      <td>
        <input type="number" value="${item.qty}" min="1"
          onchange="ubahQty(${i}, this.value)"
          style="width:50px; padding: 4px;">
      </td>
      <td>Rp ${item.subtotal.toLocaleString("id-ID")}</td>
      <td style="text-align: left;">
        <button onclick="hapusItem(${i})" style="background:none; border:none; cursor:pointer; font-size: 1.2rem;">❌</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("totalBelanja").innerText =
    "Rp " + total.toLocaleString("id-ID");

  // Panggil fungsi update diskon agar laba bersih terhitung otomatis
  updateTotalDiskon();
}

/*function hitungDiskon(total) {
  const persen = Number(document.getElementById("diskonPersen").value) || 0;

  const potongan = total * (persen / 100);
  const totalAkhir = total - potongan;

  return {
    totalAwal: total,
    diskonPersen: persen,
    potongan: potongan,
    totalAkhir: totalAkhir
  };
}*/

function updateTotalDiskon() {

  const subtotal = keranjang.reduce(
    (s, i) => s + (Number(i.subtotal) || 0),
    0
  );

  const totalModal = keranjang.reduce(
    (s, i) =>
      s + (Number(i.modal) || 0) * (Number(i.qty) || 0),
    0
  );

  // ambil element dulu
  const diskonInput = document.getElementById("diskonPersen");
  const nilaiDiskonEl = document.getElementById("nilaiDiskon");
  const totalAkhirEl = document.getElementById("totalAkhir");
  const totalLabaEl = document.getElementById("totalLaba");

  // aman jika element tidak ada
  const persen = Number(diskonInput?.value) || 0;

  const potongan = subtotal * (persen / 100);

  const totalAkhir = subtotal - potongan;

  // laba
  const labaKotor = subtotal - totalModal;
  const labaBersih = labaKotor - potongan;

  // update UI jika element ada
  if (nilaiDiskonEl) {
    nilaiDiskonEl.innerText =
      "Rp " + potongan.toLocaleString("id-ID");
  }

  if (totalAkhirEl) {
    totalAkhirEl.innerText =
      "Rp " + totalAkhir.toLocaleString("id-ID");
  }

  if (totalLabaEl) {
    totalLabaEl.innerText =
      "Rp " + labaBersih.toLocaleString("id-ID");
  }
}
/* =======================
   UBAH QTY
======================= */
function ubahQty(index, qtyBaru) {
  qtyBaru = Number(qtyBaru);
  if (qtyBaru <= 0) return;

  const item = keranjang[index];

  item.qty = qtyBaru;
  item.subtotal = item.harga * qtyBaru;

  renderKeranjang();
}

/* =======================
   HAPUS ITEM
======================= */
function hapusItem(dashboard) {
  if (!confirm("Hapus item dari keranjang?")) return;
  keranjang.splice(dashboard, 1);
  renderKeranjang();
}

function hitungLaba(totalAwal, totalModal, potonganDiskon) {
  return (
    (Number(totalAwal) || 0) -
    (Number(totalModal) || 0) -
    (Number(potonganDiskon) || 0)
  );
}

/* =======================
   SIMPAN TRANSAKSI
======================= */
/* =======================
   SIMPAN TRANSAKSI
======================= */
/* =======================
   SIMPAN TRANSAKSI
======================= */
function simpanTransaksi(uang, kembalian, id, diskonData, dataMember) {
  const transaksi = getTransaksi() || [];

  if (!keranjang || keranjang.length === 0) return null;

  const totalModal = keranjang.reduce(
    (s, i) => s + (Number(i.modal) || 0) * (Number(i.qty) || 0),
    0,
  );

  const totalAwal = diskonData?.totalAwal || 0;
  const potongan = diskonData?.potongan || 0;

  const labaKotor = totalAwal - totalModal;
  const totalLaba = labaKotor - potongan;

  const kasir = JSON.parse(localStorage.getItem("kasirAktif")) || {};

  // =========================
  // FORMAT DATA MEMBER
  // =========================
  const memberData = dataMember
    ? {
        nama: dataMember.nama || "-",
        no: dataMember.no || dataMember.id || "-",
        hp: dataMember.hp || dataMember.telepon || "-",
        email: dataMember.email || "-",
      }
    : {
        nama: "-",
        no: "-",
        hp: "-",
        email: "-",
      };

  const detailTransaksi = {
    id: id,
    tanggal: new Date().toLocaleString("id-ID"),
    tanggalISO: new Date().toISOString(),

    // ITEM
    items: [...keranjang],

    // KEUANGAN
    totalAwal: diskonData?.totalAwal || 0,
    diskon: diskonData?.diskon || 0,
    potongan: diskonData?.potongan || 0,
    total: diskonData?.totalAkhir || 0,
    totalModal: totalModal,
    totalLaba: totalLaba,
    uang: uang,
    kembalian: kembalian,

    // KASIR
    kasirId: kasir.id || "-",
    kasirNama: kasir.nama || "-",

    // MEMBER
    member: memberData,

    // MEMBER FLAT (UNTUK RIWAYAT)
    namaMember: memberData.nama,
    idMember: memberData.no,
    hpMember: memberData.hp,
    emailMember: memberData.email,

    // TAMBAHAN
    metode: "cash",
  };

  transaksi.push(detailTransaksi);

  localStorage.setItem(
    "transaksi",
    JSON.stringify(transaksi)
  );

  return detailTransaksi;
}

/* =======================
   KURANGI STOK
======================= */
function kurangiStok() {
  if (!keranjang || keranjang.length === 0) return;

  const produk = getProduk() || [];

  keranjang.forEach((item) => {
    const p = produk.find((pr) => pr.id === item.id);
    if (p) {
      p.stok = Math.max(0, p.stok - item.qty); // 🔥 anti minus
    }
  });

  saveProduk(produk);
}

/* =======================
   GENERATE ID
======================= */
function generateId() {
  const now = new Date();

  const tanggal =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");

  const random = Math.floor(Math.random() * 9000) + 1000;

  return `ADI-${tanggal}-${random}`;
}

/* =======================
   HITUNG DISKON
======================= */

function hitungDiskon(total) {
  const persen = Number(document.getElementById("diskonPersen").value) || 0;

  const potongan = total * (persen / 100);
  const totalAkhir = total - potongan;

  return {
    totalAwal: total,
    diskon: persen, // 🔥 ganti ini
    potongan: potongan,
    totalAkhir: totalAkhir,
  };
}

/* =======================
   BAYAR
======================= */
function bayar() {
  if (!keranjang || keranjang.length === 0) {
    alert("Keranjang kosong");
    return;
  }

  const dataMember = JSON.parse(localStorage.getItem("memberAktif")) || null;
  const total = keranjang.reduce((sum, item) => sum + item.subtotal, 0);
  const diskonData = hitungDiskon(total);

  const uang = Number(
    prompt(
      `Total belanja: Rp ${diskonData.totalAkhir.toLocaleString("id-ID")}\nMasukkan uang bayar:`,
    ),
  );

  if (isNaN(uang) || uang < diskonData.totalAkhir) {
    alert("Uang tidak cukup atau tidak valid");
    return;
  }

  const kembalian = uang - diskonData.totalAkhir;
  const idTransaksi = generateId();

  kurangiStok();

  // 🔥 Ambil objek transaksi hasil simpan
  const transaksi = simpanTransaksi(
    uang,
    kembalian,
    idTransaksi,
    diskonData,
    dataMember,
  );

  const kasir = JSON.parse(localStorage.getItem("kasirAktif")) || {};

  // 🔥 TAMPILKAN LABA DI KONFIRMASI
  const konfirmasi = confirm(
    `Pembayaran berhasil!\n\n` +
      `ID: ${idTransaksi}\n` +
      `Member: ${dataMember?.nama || "-"}\n` +
      `ID Member: ${dataMember?.no || "-"}\n` +
      `HP: ${dataMember?.hp || "-"}\n` +
      `Email: ${dataMember?.email || "-"}\n` +
      `---------------------------\n` +
      `Subtotal: Rp ${diskonData.totalAwal.toLocaleString("id-ID")}\n` +
      `Diskon: ${diskonData.diskon}%\n` +
      `Potongan: Rp ${diskonData.potongan.toLocaleString("id-ID")}\n` +
      `Total: Rp ${diskonData.totalAkhir.toLocaleString("id-ID")}\n` +
      `---------------------------\n` +
      `Bayar: Rp ${uang.toLocaleString("id-ID")}\n` +
      `Kembali: Rp ${kembalian.toLocaleString("id-ID")}\n` +
      `Laba Transaksi: Rp ${transaksi.totalLaba.toLocaleString("id-ID")}\n\n` + // 🔥 Baris Laba
      `Cetak struk?`,
  );

if (konfirmasi && transaksi) {

  cetakStruk({

    id: idTransaksi,

    total: diskonData.totalAkhir,
    totalAwal: diskonData.totalAwal,

    diskon: diskonData.diskon,
    potongan: diskonData.potongan,

    uang,
    kembalian,

    items: [...keranjang],

    kasirNama: kasir.nama,
    kasirId: kasir.id,

    member: dataMember
      ? {
          nama: dataMember.nama || "-",
          no: dataMember.no || dataMember.id || "-",
          hp: dataMember.hp || dataMember.telepon || "-",
          email: dataMember.email || "-"
        }
      : null,

    laba: transaksi.totalLaba,
  });

}
  // RESET
  keranjang = [];
  renderKeranjang();

  // Bersihkan data member dari storage agar tidak terbawa ke transaksi berikutnya
  localStorage.removeItem("memberAktif");

  if (document.getElementById("diskonPersen"))
    document.getElementById("diskonPersen").value = "";
  updateTotalDiskon();
}


/* =======================
   FUNGSI BUNYI BEEP (Scanner)
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

      gain.gain.setValueAtTime(0.7, audioCtx.currentTime);

      // Durasi diperpanjang menjadi 0.6 detik agar mantap
      const durasi = 0.9;

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
/* =======================
   SCANNER KASIR
======================= */
let html5QrCodeKasir;
let scannerActive = false;

function toggleScannerKasir() {
  const container = document.getElementById("scannerContainerKasir");
  if (scannerActive) {
    stopScanKasir();
    container.style.display = "none";
  } else {
    container.style.display = "block";
    startScanKasir();
  }
}

function startScanKasir() {
  scannerActive = true;
  html5QrCodeKasir = new Html5Qrcode("readerKasir");

  const config = {
    fps: 20,
    qrbox: { width: 250, height: 150 },
    aspectRatio: 1.0,
    // Mendukung format barcode produk umum
    formatsToSupport: [
      Html5QrcodeSupportedFormats.EAN_13,
      Html5QrcodeSupportedFormats.EAN_8,
      Html5QrcodeSupportedFormats.CODE_128,
    ],
  };

  html5QrCodeKasir
    .start({ facingMode: "environment" }, config, (barcodeText) => {
      playBeep();
      if (navigator.vibrate) navigator.vibrate(100);

      const produk = getProduk();
      const pFound = produk.find((p) => p.barcode === barcodeText);

      if (pFound) {
        // Set nilai ke input agar fungsi tambahKeKeranjang bisa membacanya
        document.getElementById("produkId").value = pFound.id;
        document.getElementById("produkInput").value = pFound.nama;
        document.getElementById("qty").value = 1;

        // Panggil fungsi yang sudah ada
        tambahKeKeranjang();

        // Jeda sebentar agar tidak menscan barang yang sama berkali-kali secara instan
        html5QrCodeKasir.pause();
        setTimeout(() => html5QrCodeKasir.resume(), 1500);
      } else {
        console.log("Barcode tidak terdaftar: " + barcodeText);
      }
    })
    .catch((err) => {
      console.error("Kamera Error:", err);
      alert("Gagal akses kamera. Pastikan menggunakan HTTPS.");
    });
}

function stopScanKasir() {
  if (html5QrCodeKasir) {
    html5QrCodeKasir.stop().then(() => {
      scannerActive = false;
      document.getElementById("scannerContainerKasir").style.display = "none";
    });
  }
}

/* =======================
   PENYEMPURNAAN TAMBAH KE KERANJANG
   (Tetap menggunakan fungsi lama Anda dengan perbaikan reset)
======================= */
function resetInputKasir() {
  document.getElementById("produkInput").value = "";
  document.getElementById("produkId").value = "";
  document.getElementById("qty").value = 1;
}

// Fungsi tambahKeKeranjang Anda tetap sama, namun pastikan
// pemanggilan resetInputKasir() dilakukan DI AKHIR proses.

function generateIdTransaksi() {
  const now = new Date();

  const tahun = now.getFullYear();
  const bulan = String(now.getMonth() + 1).padStart(2, "0");
  const tanggal = String(now.getDate()).padStart(2, "0");

  const jam = String(now.getHours()).padStart(2, "0");
  const menit = String(now.getMinutes()).padStart(2, "0");
  const detik = String(now.getSeconds()).padStart(2, "0");

  // angka random 4 digit
  const random = Math.floor(1000 + Math.random() * 9000);

  return `${tahun}${bulan}${tanggal}-${jam}${menit}${detik}-${random}`;
}

function hitungLoyalitasMember(idMember) {
  // 1. Ambil semua riwayat transaksi
  const semuaTransaksi = JSON.parse(localStorage.getItem("transaksi")) || [];

  // 2. Filter transaksi yang ID Member-nya cocok
  const riwayatMember = semuaTransaksi.filter((t) => t.idMember === idMember);

  // 3. Kembalikan jumlah (count)
  return riwayatMember.length;
}

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

    // 🔥 HITUNG JUMLAH BELANJA
    const jumlahBelanja = hitungLoyalitasMember(found.no);

    // Tampilkan kartu member
    tampilKartuMember(found);

    // 🔥 BERI NOTIFIKASI KHUSUS JIKA SUDAH 10 KALI
    if (jumlahBelanja >= 10) {
      alert(
        `🔥 PELANGGAN SETIA!\n${found.nama} sudah berbelanja sebanyak ${jumlahBelanja} kali.`,
      );
    } else {
      console.log(`${found.nama} baru belanja ${jumlahBelanja} kali.`);
    }

    // Simpan sebagai member aktif transaksi ini
    localStorage.setItem("memberAktif", JSON.stringify(found));

    // Update tampilan teks di kartu (Opsional: Tambahkan elemen ID ini di HTML kartu)
    const elStatus = document.getElementById("statusLoyalitas");
    if (elStatus) {
      elStatus.innerText = `Total Kunjungan: ${jumlahBelanja}x`;
      elStatus.style.color = jumlahBelanja >= 10 ? "#48bb78" : "#fac812";
    }
  } else {
    alert("Member tidak ditemukan!");
  }
}

let html5QrCodeMemberKasir;

function mulaiScanMemberKasir() {
  // 1. Inisialisasi Scanner (Gunakan ID container 'readerMember')
  if (!html5QrCodeMemberKasir) {
    html5QrCodeMemberKasir = new Html5Qrcode("readerMember");
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

  // 2. Gunakan FORMAT OBJEK { facingMode: "environment" }
  // agar kompatibel dengan Laptop dan HP (seperti script kasir produk)
  html5QrCodeMemberKasir
    .start({ facingMode: "environment" }, config, (barcodeText) => {
      // FEEDBACK: Suara & Getar
      if (typeof playBeep === "function") playBeep();
      if (navigator.vibrate) navigator.vibrate(100);

      // STOP SCANNER segera setelah data didapat
      stopScanMemberKasir();

      // 3. CARI DATA MEMBER
      // Pastikan dataMember adalah array global yang berisi database member Anda
      const found = dataMember.find((m) => m.no === barcodeText);

      if (found) {
        // LOGIKA: MEMBER TERDAFTAR
        memberDitemukan = found;
        localStorage.setItem("memberAktif", JSON.stringify(found));

        // HITUNG LOYALITAS (Cek berapa kali belanja)
        const jumlahBelanja = hitungLoyalitasMember(found.no);

        // TAMPILKAN KARTU SECARA VISUAL
        tampilKartuMember(found);

        // NOTIFIKASI KHUSUS LOYALITAS
        if (jumlahBelanja >= 10) {
          alert(
            `🔥 PELANGGAN SETIA!\n${found.nama} sudah belanja ${jumlahBelanja} kali.`,
          );
        } else {
          alert(
            `Member Terdeteksi: ${found.nama}\nTotal Kunjungan: ${jumlahBelanja}x`,
          );
        }

        // UPDATE STATUS TEKS DI KARTU
        const elStatus = document.getElementById("statusLoyalitas");
        if (elStatus) {
          elStatus.innerText = `Total Kunjungan: ${jumlahBelanja}x`;
          elStatus.style.color = jumlahBelanja >= 10 ? "#48bb78" : "#fac812";
        }

        // JALANKAN DISKON OTOMATIS
        if (typeof updateTotalDiskon === "function") updateTotalDiskon();
      } else {
        // LOGIKA: MEMBER TIDAK DIKENAL
        alert("Kartu Member Tidak Terdaftar!");

        // Masukkan kode ke input pencarian agar kasir bisa langsung mendaftarkan
        const inputSearch = document.getElementById("searchMember");
        if (inputSearch) {
          inputSearch.value = barcodeText;
          inputSearch.focus();
        }

        // Reset data member aktif jika sebelumnya ada
        localStorage.removeItem("memberAktif");
        if (typeof updateTotalDiskon === "function") updateTotalDiskon();
      }
    })
    .catch((err) => {
      console.error("Gagal kamera member kasir:", err);
      alert("Gagal akses kamera: " + err);
    });
}

function stopScanMemberKasir() {
  if (html5QrCodeMemberKasir) {
    html5QrCodeMemberKasir
      .stop()
      .then(() => {
        // Sangat penting: Reset variabel ke null agar bisa dibuka kembali dengan lancar
        html5QrCodeMemberKasir = null;
        console.log("Scanner Member Berhenti.");
      })
      .catch((err) => console.error("Error stop scanner member kasir", err));
  }
}




































