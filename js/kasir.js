let keranjang = [];

/* =========================
   AUTOCOMPLETE PRODUK
========================= */
const produkInput = document.getElementById("produkInput");
const produkList = document.getElementById("produkList");
const produkIdInp = document.getElementById("produkId");

if (produkInput && produkList && produkIdInp) {
  let currentFocus = -1;

  function addActive(items) {
    if (!items.length) return;
    removeActive(items);
    if (currentFocus >= items.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = items.length - 1;
    items[currentFocus].classList.add("autocomplete-active");
    items[currentFocus].scrollIntoView({ block: "nearest" });
  }

  function removeActive(items) {
    Array.from(items).forEach((item) => {
      item.classList.remove("autocomplete-active");
    });
  }

  // Mencari produk
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
        (p.nama || "").toLowerCase().includes(keyword) ||
        String(p.barcode || "").toLowerCase().includes(keyword)
    );

    if (hasil.length === 0) {
      produkList.style.display = "none";
      return;
    }

    hasil.forEach((p) => {
      const div = document.createElement("div");
      div.className = "autocomplete-item";

      // FOTO
      const fotoBox = document.createElement("div");
      fotoBox.className = "autocomplete-foto";
      const img = document.createElement("img");
      img.src = p.foto || "https://placehold.co/80x80";
      img.alt = p.nama || "Foto produk";
      img.onerror = function () {
        this.onerror = null;
        this.src = "https://placehold.co/80x80";
      };
      fotoBox.appendChild(img);

      // INFO
      const infoBox = document.createElement("div");
      infoBox.className = "autocomplete-info";
      
      const nama = document.createElement("strong");
      nama.className = "autocomplete-nama";
      nama.textContent = p.nama || "Tanpa nama";
      
      // 1. Harga
      const harga = document.createElement("small");
      harga.className = "autocomplete-harga";
      harga.textContent = `Rp ${Number(p.harga_jual || 0).toLocaleString("id-ID")}`;

      // 🔥 2. TAMBAHKAN BARCODE DI SINI
      const barcode = document.createElement("small");
      barcode.className = "autocomplete-barcode"; // Anda bisa tambahkan CSS jika ingin diatur
      barcode.style.display = "block"; // Agar turun ke bawah
      barcode.style.fontSize = "11px"; // Ukuran lebih kecil
      barcode.style.color = "#555"; // Warna abu-abu
      barcode.textContent = `Barcode: ${p.barcode || "-"}`;
      
      infoBox.appendChild(nama);
      infoBox.appendChild(harga);
      infoBox.appendChild(barcode); // Tambahkan barcode ke dalam kotak info

      div.appendChild(fotoBox);
      div.appendChild(infoBox);

      // PILIH PRODUK
      div.addEventListener("click", () => {
        pilihProduk(p);
        produkList.style.display = "none";
        currentFocus = -1;
      });

      produkList.appendChild(div);
    });
    
    produkList.style.display = "block";
  });

  // Navigasi keyboard
  produkInput.addEventListener("keydown", function (e) {
    const listItems = produkList.querySelectorAll(".autocomplete-item");

    if (e.key === "ArrowDown") {
      if (!listItems.length) return;
      e.preventDefault();
      currentFocus++;
      addActive(listItems);
    } else if (e.key === "ArrowUp") {
      if (!listItems.length) return;
      e.preventDefault();
      currentFocus--;
      addActive(listItems);
    } else if (e.key === "Enter") {
      if (produkList.style.display === "block" && listItems.length) {
        e.preventDefault();
        e.stopImmediatePropagation();
        const index = currentFocus >= 0 ? currentFocus : 0;
        listItems[index].click();
      }
    } else if (e.key === "Escape") {
      produkList.style.display = "none";
      currentFocus = -1;
    }
  });
}

/* =========================
   PILIH PRODUK
========================= */
function pilihProduk(p) {
  produkInput.value = p.nama;
  produkIdInp.value = p.id;
  produkList.style.display = "none";
  document.getElementById("qty").focus();
}

/* =========================
   ENTER = TAMBAH (Jika list tertutup)
========================= */
if (produkInput) {
  produkInput.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    if (produkList && produkList.style.display === "block") return;
    e.preventDefault();
    tambahKeKeranjang();
  });
}

document.addEventListener("click", (e) => {
  if (!produkList) return;
  if (!e.target.closest(".autocomplete")) {
    produkList.style.display = "none";
  }
});

/* =========================
   TAMBAH KE KERANJANG
========================= */
function tambahKeKeranjang() {
  const produkId = String(produkIdInp.value || "").trim(); // Gunakan String
  const qty = Number(document.getElementById("qty").value);

  if (!produkId || produkId === "") {
    alert("Pilih produk terlebih dahulu");
    return;
  }

  const produk = getProduk();
  // Gunakan == agar tipe data String dan Number bisa cocok
  const item = produk.find((p) => p.id == produkId);

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

  const existing = keranjang.find((k) => k.id == item.id);
  if (existing) {
    existing.qty += qty;
    existing.subtotal += subtotal;
    existing.modal = item.modal;
    existing.laba += laba;
  } else {
    keranjang.push({
      id: item.id,
      nama: item.nama,
      barcode: item.barcode || "-", // 🔥 TAMBAHKAN INI
      foto: item.foto || "",
      qty,
      harga: item.harga_jual,
      modal: item.modal,
      subtotal,
      laba,
    });
  }

  // Reset input
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

  keranjang.forEach((item, i) => {
    total += item.subtotal;
    const tr = document.createElement("tr");
    const fotoUrl = item.foto || "https://placehold.co/50x50";

    tr.innerHTML = `
      <td style="display: flex; align-items: center; gap: 10px;">
        <img src="${fotoUrl}" style="width: 90px; height: 90px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;">
        <span>${item.nama}</span>
      </td>
      <td><code style="background: #eee; padding: 2px 5px; border-radius: 4px; color: #333;">${item.barcode || "-"}</code></td>
      
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

  document.getElementById("totalBelanja").innerText = "Rp " + total.toLocaleString("id-ID");
  updateTotalDiskon();
}

function updateTotalDiskon() {
  const subtotal = keranjang.reduce((s, i) => s + (Number(i.subtotal) || 0), 0);
  const totalModal = keranjang.reduce((s, i) => s + (Number(i.modal) || 0) * (Number(i.qty) || 0), 0);

  const diskonInput = document.getElementById("diskonPersen");
  const nilaiDiskonEl = document.getElementById("nilaiDiskon");
  const totalAkhirEl = document.getElementById("totalAkhir");
  const totalLabaEl = document.getElementById("totalLaba");

  const persen = Number(diskonInput?.value) || 0;
  const potongan = subtotal * (persen / 100);
  const totalAkhir = subtotal - potongan;

  const labaKotor = subtotal - totalModal;
  const labaBersih = labaKotor - potongan;

  if (nilaiDiskonEl) nilaiDiskonEl.innerText = "Rp " + potongan.toLocaleString("id-ID");
  if (totalAkhirEl) totalAkhirEl.innerText = "Rp " + totalAkhir.toLocaleString("id-ID");
  if (totalLabaEl) totalLabaEl.innerText = "Rp " + labaBersih.toLocaleString("id-ID");
}

function ubahQty(index, qtyBaru) {
  qtyBaru = Number(qtyBaru);
  if (qtyBaru <= 0) return;
  const item = keranjang[index];
  item.qty = qtyBaru;
  item.subtotal = item.harga * qtyBaru;
  renderKeranjang();
}

function hapusItem(index) {
  if (!confirm("Hapus item dari keranjang?")) return;
  keranjang.splice(index, 1);
  renderKeranjang();
}

/* =======================
   SIMPAN TRANSAKSI
======================= */
function simpanTransaksi(uang, kembalian, id, diskonData, dataMember) {
  const transaksi = getTransaksi() || [];
  if (!keranjang || keranjang.length === 0) return null;

  const totalModal = keranjang.reduce((s, i) => s + (Number(i.modal) || 0) * (Number(i.qty) || 0), 0);
  const totalAwal = diskonData?.totalAwal || 0;
  const potongan = diskonData?.potongan || 0;
  const totalLaba = totalAwal - totalModal - potongan;

  const kasir = JSON.parse(localStorage.getItem("kasirAktif")) || {};

  const memberData = dataMember ? {
    nama: dataMember.nama || "-",
    no: dataMember.no || dataMember.id || "-",
    hp: dataMember.hp || dataMember.telepon || "-",
    email: dataMember.email || "-",
  } : { nama: "-", no: "-", hp: "-", email: "-" };

  const detailTransaksi = {
    id, tanggal: new Date().toLocaleString("id-ID"), tanggalISO: new Date().toISOString(),
    items: [...keranjang],
    totalAwal, diskon: diskonData?.diskon || 0, potongan, total: diskonData?.totalAkhir || 0,
    totalModal, totalLaba, uang, kembalian,
    kasirId: kasir.id || "-", kasirNama: kasir.nama || "-",
    member: memberData,
    namaMember: memberData.nama, idMember: memberData.no, hpMember: memberData.hp, emailMember: memberData.email,
    metode: "cash",
  };

  transaksi.push(detailTransaksi);
  localStorage.setItem("transaksi", JSON.stringify(transaksi));
  return detailTransaksi;
}

function kurangiStok() {
  if (!keranjang || keranjang.length === 0) return;
  const produk = getProduk() || [];

  keranjang.forEach((item) => {
    const p = produk.find((pr) => pr.id == item.id);
    if (p) p.stok = Math.max(0, p.stok - item.qty);
  });
  saveProduk(produk);
}

function generateId() {
  const now = new Date();
  const tanggal = now.getFullYear() + String(now.getMonth() + 1).padStart(2, "0") + String(now.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `ADI-${tanggal}-${random}`;
}

function hitungDiskon(total) {
  const persen = Number(document.getElementById("diskonPersen").value) || 0;
  const potongan = total * (persen / 100);
  return { totalAwal: total, diskon: persen, potongan: potongan, totalAkhir: total - potongan };
}

/* =======================
   BAYAR
======================= */
function bayar() {
  if (!keranjang || keranjang.length === 0) return alert("Keranjang kosong");

  const dataMember = JSON.parse(localStorage.getItem("memberAktif")) || null;
  const total = keranjang.reduce((sum, item) => sum + item.subtotal, 0);
  const diskonData = hitungDiskon(total);

  const uang = Number(prompt(`Total belanja: Rp ${diskonData.totalAkhir.toLocaleString("id-ID")}\nMasukkan uang bayar:`));
  if (isNaN(uang) || uang < diskonData.totalAkhir) return alert("Uang tidak cukup atau tidak valid");

  const kembalian = uang - diskonData.totalAkhir;
  const idTransaksi = generateId();

  kurangiStok();
  const transaksi = simpanTransaksi(uang, kembalian, idTransaksi, diskonData, dataMember);
  const kasir = JSON.parse(localStorage.getItem("kasirAktif")) || {};

  const konfirmasi = confirm(
    `Pembayaran berhasil!\n\n` +
    `ID: ${idTransaksi}\n` +
    `Member: ${dataMember?.nama || "-"}\n` +
    `---------------------------\n` +
    `Subtotal: Rp ${diskonData.totalAwal.toLocaleString("id-ID")}\n` +
    `Diskon: ${diskonData.diskon}%\n` +
    `Potongan: Rp ${diskonData.potongan.toLocaleString("id-ID")}\n` +
    `Total: Rp ${diskonData.totalAkhir.toLocaleString("id-ID")}\n` +
    `Bayar: Rp ${uang.toLocaleString("id-ID")}\n` +
    `Kembali: Rp ${kembalian.toLocaleString("id-ID")}\n` +
    `Laba Transaksi: Rp ${transaksi.totalLaba.toLocaleString("id-ID")}\n\n` +
    `Cetak struk?`
  );

  if (konfirmasi && transaksi) {
    cetakStruk({
      id: idTransaksi, total: diskonData.totalAkhir, totalAwal: diskonData.totalAwal,
      diskon: diskonData.diskon, potongan: diskonData.potongan, uang, kembalian,
      items: [...keranjang], kasirNama: kasir.nama, kasirId: kasir.id,
      member: dataMember ? { nama: dataMember.nama, no: dataMember.no || dataMember.id, hp: dataMember.hp, email: dataMember.email } : null,
      laba: transaksi.totalLaba,
    });
  }

  keranjang = [];
  renderKeranjang();
  localStorage.removeItem("memberAktif");
  if (document.getElementById("diskonPersen")) document.getElementById("diskonPersen").value = "";
  updateTotalDiskon();
}

/* =======================
   FUNGSI BUNYI BEEP
======================= */
function playBeep() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    [880, 440].forEach((freq) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.7, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.05, audioCtx.currentTime + 0.9);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.9);
    });
  } catch (e) { console.log("Audio gagal: ", e); }
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
  const config = { fps: 20, qrbox: { width: 250, height: 150 }, aspectRatio: 1.0 };

  html5QrCodeKasir.start({ facingMode: "environment" }, config, (barcodeText) => {
    playBeep();
    if (navigator.vibrate) navigator.vibrate(100);
    const produk = getProduk();
    const pFound = produk.find((p) => p.barcode === barcodeText);

    if (pFound) {
      document.getElementById("produkId").value = pFound.id;
      document.getElementById("produkInput").value = pFound.nama;
      document.getElementById("qty").value = 1;
      tambahKeKeranjang();
      html5QrCodeKasir.pause();
      setTimeout(() => html5QrCodeKasir.resume(), 1500);
    } else {
      console.log("Barcode tidak terdaftar: " + barcodeText);
    }
  }).catch((err) => {
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
   MEMBER & LOYALITAS
======================= */
function hitungLoyalitasMember(idMember) {
  const semuaTransaksi = JSON.parse(localStorage.getItem("transaksi")) || [];
  return semuaTransaksi.filter((t) => t.idMember === idMember).length;
}

function cariDataMember() {
  let key = document.getElementById("searchMember").value.toLowerCase().trim();
  if (!key) return alert("Masukkan nama/ID/HP");

  // 🔥 PERBAIKAN: Ambil data member dari localStorage
  const semuaMember = JSON.parse(localStorage.getItem("member")) || [];

  let found = semuaMember.find(
    (d) =>
      (d.nama && d.nama.toLowerCase().includes(key)) ||
      (d.no && d.no.toLowerCase().includes(key)) ||
      (d.hp && d.hp.includes(key))
  );

  if (found) {
    localStorage.setItem("memberAktif", JSON.stringify(found));
    const jumlahBelanja = hitungLoyalitasMember(found.no);
    
    if (typeof tampilKartuMember === "function") tampilKartuMember(found);
    
    if (jumlahBelanja >= 10) {
      alert(`🔥 PELANGGAN SETIA!\n${found.nama} sudah berbelanja sebanyak ${jumlahBelanja} kali.`);
    } else {
      alert(`Member Ditemukan: ${found.nama}\nTotal Kunjungan: ${jumlahBelanja}x`);
    }

    const elStatus = document.getElementById("statusLoyalitas");
    if (elStatus) {
      elStatus.innerText = `Total Kunjungan: ${jumlahBelanja}x`;
      elStatus.style.color = jumlahBelanja >= 10 ? "#48bb78" : "#fac812";
    }
    
    if (typeof updateTotalDiskon === "function") updateTotalDiskon();
  } else {
    alert("Member tidak ditemukan!");
  }
}

let html5QrCodeMemberKasir;

function mulaiScanMemberKasir() {
  if (!html5QrCodeMemberKasir) html5QrCodeMemberKasir = new Html5Qrcode("readerMember");
  
  const config = { fps: 20, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 };

  html5QrCodeMemberKasir.start({ facingMode: "environment" }, config, (barcodeText) => {
    if (typeof playBeep === "function") playBeep();
    if (navigator.vibrate) navigator.vibrate(100);
    stopScanMemberKasir();

    // 🔥 PERBAIKAN: Ambil data member dari localStorage
    const semuaMember = JSON.parse(localStorage.getItem("member")) || [];
    const found = semuaMember.find((m) => m.no === barcodeText);

    if (found) {
      localStorage.setItem("memberAktif", JSON.stringify(found));
      const jumlahBelanja = hitungLoyalitasMember(found.no);
      
      if (typeof tampilKartuMember === "function") tampilKartuMember(found);
      
      if (jumlahBelanja >= 10) {
        alert(`🔥 PELANGGAN SETIA!\n${found.nama} sudah belanja ${jumlahBelanja} kali.`);
      } else {
        alert(`Member Terdeteksi: ${found.nama}\nTotal Kunjungan: ${jumlahBelanja}x`);
      }

      const elStatus = document.getElementById("statusLoyalitas");
      if (elStatus) {
        elStatus.innerText = `Total Kunjungan: ${jumlahBelanja}x`;
        elStatus.style.color = jumlahBelanja >= 10 ? "#48bb78" : "#fac812";
      }
      if (typeof updateTotalDiskon === "function") updateTotalDiskon();
    } else {
      alert("Kartu Member Tidak Terdaftar!");
      const inputSearch = document.getElementById("searchMember");
      if (inputSearch) {
        inputSearch.value = barcodeText;
        inputSearch.focus();
      }
      localStorage.removeItem("memberAktif");
      if (typeof updateTotalDiskon === "function") updateTotalDiskon();
    }
  }).catch((err) => {
    console.error("Gagal kamera member kasir:", err);
    alert("Gagal akses kamera: " + err);
  });
}

function stopScanMemberKasir() {
  if (html5QrCodeMemberKasir) {
    html5QrCodeMemberKasir.stop().then(() => {
      html5QrCodeMemberKasir = null;
    }).catch((err) => console.error("Error stop scanner member kasir", err));
  }
}