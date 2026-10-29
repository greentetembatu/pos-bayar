document.addEventListener("DOMContentLoaded", () => {
  renderRiwayat();
  renderRankingMember(); // 🔥 TAMBAHAN
});

/* =======================
   RENDER RIWAYAT
======================= */
// --- VARIABEL NAVIGASI ---
// Gunakan nama unik agar tidak bentrok dengan currentPage milik fitur lain
let pageRiwayat = 1;
const limitPerHalaman = 10;

function renderRiwayat() {
  const tbody = document.getElementById("riwayatTable");
  if (!tbody) return;

  // Ambil data asli
  const semuaData = getTransaksi() || [];
  tbody.innerHTML = "";

  if (semuaData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center">Belum ada transaksi</td></tr>`;
    if (document.getElementById("navigasiRiwayat")) {
      document.getElementById("navigasiRiwayat").style.display = "none";
    }
    return;
  }

  // Tampilkan navigasi jika ada data
  const navRiwayat = document.getElementById("navigasiRiwayat");
  if (navRiwayat) navRiwayat.style.display = "flex";

  // --- LOGIKA POTONG DATA (PAGINATION) ---
  const mulaiDari = (pageRiwayat - 1) * limitPerHalaman;
  const sampaiKe = mulaiDari + limitPerHalaman;

  // Potong data untuk ditampilkan
  const dataHalamanIni = semuaData.slice(mulaiDari, sampaiKe);

  // Hitung total halaman
  const totalHal = Math.ceil(semuaData.length / limitPerHalaman);

  // Update Teks Info Halaman
  const infoHal = document.getElementById("infoHalamanRiwayat");
  if (infoHal) infoHal.innerText = `Hal. ${pageRiwayat} / ${totalHal}`;

  // Update Status Tombol
  const btnPrev = document.getElementById("btnPrevRiwayat");
  const btnNext = document.getElementById("btnNextRiwayat");

  if (btnPrev && btnNext) {
    btnPrev.disabled = pageRiwayat === 1;
    btnNext.disabled = pageRiwayat === totalHal;

    // Style visual tombol
    btnPrev.style.opacity = pageRiwayat === 1 ? "0.5" : "1";
    btnNext.style.opacity = pageRiwayat === totalHal ? "0.5" : "1";
  }

  // --- RENDER BARIS TABEL ---
  dataHalamanIni.forEach((t) => {
    const tr = document.createElement("tr");

    // Logika item produk (maksimal 3 baris)
    const items = (t.items || [])
      .slice(0, 3)
      .map((i) => `${i.nama} (${i.qty})`)
      .join("<br>");
    const more = t.items && t.items.length > 3 ? "<br>..." : "";

    tr.innerHTML = `
            <td><b>#${t.id}</b></td>
            <td>${t.tanggal || "-"}</td>
            <td>${t.kasirNama || "-"}</td>
            <td>${t.kasirId || "-"}</td>
            <td>${t.namaMember || "-"}<br><small>${t.hpMember || "-"}</small><br><small>${t.emailMember || "-"}</small><br><small>${t.idMember || "-"}</small></td>
            <td>${items}${more}</td>
            <td>Rp ${(t.total || 0).toLocaleString("id-ID")}<br><small>Disc: ${t.diskon || 0}%</small></td>
            <td>Rp ${(t.totalLaba || 0).toLocaleString("id-ID")}</td>
            <td>
                <button onclick="lihatDetail('${t.id}')">Detail</button>
                <button onclick="cetakStrukRiwayat('${t.id}')">🖨</button>
                <button onclick="hapusTransaksi('${t.id}')" style="background:#e53e3e; color:white">🗑</button>
            </td>
        `;
    tbody.appendChild(tr);
  });
}

// Fungsi navigasi khusus riwayat
function gantiHalamanRiwayat(arah) {
  pageRiwayat += arah;
  renderRiwayat();
  // Scroll ke judul riwayat agar posisi tetap nyaman
  document.getElementById("listRiwayat").scrollIntoView({ behavior: "smooth" });
}

/* =======================
   DETAIL TRANSAKSI
======================= */
function lihatDetail(id) {
  const transaksi = getTransaksi();
  const t = transaksi.find((x) => x.id === id);

  if (!t) {
    alert("Transaksi tidak ditemukan");
    return;
  }

  let info = `🧾 DETAIL TRANSAKSI\n\n`;

  info += `ID: #${t.id}\n`; // 🔥 TAMBAHAN
  info += `Tanggal: ${t.tanggal || "-"}\n\n`;
  info += `Member: ${t.namaMember || "-"}\n`;
  info += `ID: ${t.idMember || "-"}\n`;
  info += `HP: ${t.hpMember || "-"}\n`;
  info += `Email: ${t.emailMember || "-"}\n\n`;

  if (Array.isArray(t.items) && t.items.length > 0) {
    t.items.forEach((i) => {
      const harga = Number(i.harga || 0);
      const subtotal = Number(i.subtotal || 0);

      info += `• ${i.nama}\n`;
      info += `  ${i.qty} x Rp ${harga.toLocaleString("id-ID")}\n`;
      info += `  Subtotal: Rp ${subtotal.toLocaleString("id-ID")}\n\n`;
    });
  } else {
    info += "(Tidak ada detail item)\n\n";
  }

  const totalAwal = Number(t.totalAwal || t.total || 0);
  const diskon = Number(t.diskon || 0);
  const potongan = Number(t.potongan || 0);
  const total = Number(t.total || 0);
  const laba = Number(t.totalLaba || 0);

  info += `SUBTOTAL: Rp ${totalAwal.toLocaleString("id-ID")}\n`;
  info += `DISKON: ${diskon}%\n`;
  info += `POTONGAN: Rp ${potongan.toLocaleString("id-ID")}\n`;
  info += `TOTAL: Rp ${total.toLocaleString("id-ID")}\n`;
  info += `LABA: Rp ${laba.toLocaleString("id-ID")}`;

  alert(info);
}

function cetakStrukRiwayat(id) {
  const transaksi = getTransaksi();
  const t = transaksi.find((x) => x.id === id);

  if (!t) {
    alert("Transaksi tidak ditemukan");
    return;
  }

  // Bungkus kembali data agar sesuai dengan struktur yang diminta fungsi cetakStruk
  const dataUntukCetak = {
    id: t.id,
    kasirNama: t.kasirNama,
    kasirId: t.kasirId,

    // 🔥 BAGIAN PENTING: Bungkus dalam objek 'member'
    // Cek dulu apakah di riwayat ada namaMember, jika tidak ada jangan buat objek member
    member:
      t.namaMember && t.namaMember !== "Umum/Non-Member"
        ? {
            nama: t.namaMember,
            no: t.idMember,
            hp: t.hpMember,
            email: t.emailMember, // Gunakan emailMember (sudah diperbaiki dari typo emaiMember)
          }
        : null,

    items: t.items,
    totalAwal: t.totalAwal || t.total,
    diskon: t.diskon || 0,
    potongan: t.potongan || 0,
    total: t.total,
    uang: t.uang,
    kembalian: t.kembalian,
  };

  // Panggil fungsi cetakStruk yang sudah ada di bagian kasir
  cetakStruk(dataUntukCetak);
}

function hapusTransaksi(id) {
  if (
    !confirm(
      "Yakin ingin menghapus transaksi ini?\nData tidak bisa dikembalikan.",
    )
  ) {
    return;
  }

  let transaksi = getTransaksi();
  const sebelum = transaksi.length;

  transaksi = transaksi.filter((t) => t.id !== id);

  if (transaksi.length === sebelum) {
    alert("Transaksi tidak ditemukan");
    return;
  }

  saveTransaksi(transaksi);
  renderRiwayat();

  alert("Transaksi berhasil dihapus");
}

function hapusTransaksiDanRollback(id) {
  if (!confirm("INI AKAN MENGEMBALIKAN STOK!\nYakin?")) return;

  let transaksi = getTransaksi();
  const t = transaksi.find((x) => x.id === id);
  if (!t) return;

  const produk = getProduk();

  t.items.forEach((i) => {
    const p = produk.find((x) => x.id === i.id);
    if (p) p.stok += i.qty;
  });

  saveProduk(produk);
  saveTransaksi(transaksi.filter((x) => x.id !== id));
  renderRiwayat();

  alert("Transaksi & stok berhasil dikembalikan");
}

/* ==========================================
   DOWNLOAD DATA TRANSAKSI (EXCEL)
========================================== */
function downloadExcelTransaksi() {
  if (typeof XLSX === "undefined") return alert("Library Excel belum dimuat.");

  const transaksi = getTransaksi();

  if (!transaksi || transaksi.length === 0) {
    alert("Tidak ada data untuk didownload");
    return;
  }

  // Siapkan array objek untuk diubah ke Excel
  const dataExcel = transaksi.map((t) => {
    const totalAwal = t.totalAwal || t.total || 0;
    const diskon = t.diskon || 0;
    const potongan = t.potongan || 0;
    const totalAkhir = t.total || 0;
    const laba = t.totalLaba || 0;

    // Gabungkan detail item menjadi satu teks
    let detailItems = "-";
    if (Array.isArray(t.items) && t.items.length > 0) {
      detailItems = t.items.map((i) => `${i.nama} (${i.qty})`).join(" | ");
    }

    return {
      Tanggal: t.tanggal || "-",
      "ID Transaksi": String(t.id || "-"),
      Kasir: t.kasirNama || "-",
      "ID Kasir": String(t.kasirId || "-"),
      "Nama Member": t.namaMember || "-",
      "ID Member": String(t.idMember || "-"),
      HP: String(t.hpMember || "-"),
      Email: t.emailMember || "-",
      "Detail Item": detailItems,
      Subtotal: Number(totalAwal),
      "Diskon (%)": Number(diskon),
      Potongan: Number(potongan),
      "Total Akhir": Number(totalAkhir),
      Laba: Number(laba),
    };
  });

  // Buat Workbook dan Worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(dataExcel);

  // Atur lebar kolom agar rapi saat dibuka
  ws["!cols"] = [
    { wch: 20 }, // Tanggal
    { wch: 20 }, // ID Transaksi
    { wch: 15 }, // Kasir
    { wch: 15 }, // ID Kasir
    { wch: 20 }, // Nama Member
    { wch: 15 }, // ID Member
    { wch: 15 }, // HP
    { wch: 25 }, // Email
    { wch: 40 }, // Detail Item
    { wch: 12 }, // Subtotal
    { wch: 10 }, // Diskon
    { wch: 12 }, // Potongan
    { wch: 12 }, // Total Akhir
    { wch: 12 }, // Laba
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Riwayat Transaksi");

  // Unduh File
  const now = new Date();
  const tanggal = now.toLocaleDateString("id-ID").replace(/\//g, "-");
  const jam = now
    .toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(":", ".");

  XLSX.writeFile(wb, `laporan-transaksi-${tanggal}-${jam}.xlsx`);
}

/* ==========================================
   UPLOAD DATA TRANSAKSI (EXCEL)
========================================== */
function uploadExcelTransaksi(event) {
  if (typeof XLSX === "undefined") return alert("Library Excel belum dimuat.");

  const file = event.target.files[0];
  if (!file) return;

  if (
    !confirm(
      "Upload Excel Transaksi:\n• Transaksi dengan ID yang sudah ada akan dilewati.\n• Transaksi baru akan ditambahkan.\n\nLanjutkan?",
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

      // Bentuk ulang struktur objek Transaksi
      const transaksiBaru = hasilImport.map((row) => ({
        id: String(row["ID Transaksi"] || row["id"] || "-"),
        tanggal: row["Tanggal"] || "-",
        kasirNama: row["Kasir"] || "-",
        kasirId: String(row["ID Kasir"] || "-"),
        namaMember: row["Nama Member"] || "-",
        idMember: String(row["ID Member"] || "-"),
        hpMember: String(row["HP"] || "-"),
        emailMember: row["Email"] || "-",
        // Karena Excel hanya menyimpan teks, kita masukkan sebagai 1 item keterangan
        items: [
          {
            nama: row["Detail Item"] || "-",
            qty: 1,
            harga: Number(row["Total Akhir"]) || 0,
            subtotal: Number(row["Total Akhir"]) || 0,
          },
        ],
        totalAwal: Number(row["Subtotal"]) || 0,
        diskon: Number(row["Diskon (%)"] || row["Diskon"]) || 0,
        potongan: Number(row["Potongan"]) || 0,
        total: Number(row["Total Akhir"]) || 0,
        totalLaba: Number(row["Laba"]) || 0,
        metode: "cash",
      }));

      // === MERGE DATA ===
      let transaksiLama = getTransaksi() || [];

      const mapLama = new Map();
      transaksiLama.forEach((t, idx) => {
        if (t.id) mapLama.set(String(t.id).trim(), idx);
      });

      let jumlahTambah = 0;
      let jumlahSkip = 0;

      transaksiBaru.forEach((tBaru) => {
        const key = String(tBaru.id).trim();

        if (key && mapLama.has(key)) {
          jumlahSkip++; // Lewati jika ID sudah ada
        } else {
          transaksiLama.push(tBaru); // Tambahkan transaksi baru
          if (key) mapLama.set(key, transaksiLama.length - 1);
          jumlahTambah++;
        }
      });

      // Simpan ke LocalStorage
      saveTransaksi(transaksiLama);

      // Render ulang tabel riwayat
      if (typeof renderRiwayat === "function") renderRiwayat();
      if (typeof renderRankingMember === "function") renderRankingMember();

      alert(
        `✅ Berhasil!\n• ${jumlahTambah} transaksi baru ditambahkan.\n• ${jumlahSkip} transaksi dilewati (ID sudah ada).`,
      );
    } catch (err) {
      console.error(err);
      alert("Gagal memproses file Excel. Pastikan format file benar.");
    }
  };

  reader.readAsArrayBuffer(file);
  event.target.value = "";
}

function cariTransaksi() {
  const keyword = document
    .getElementById("searchTransaksi")
    .value.toLowerCase()
    .trim();

  const data = getTransaksi();

  // ✅ RESET ke tabel normal
  if (keyword === "") {
    renderRiwayat();
    return;
  }

  const hasil = data.filter((trx) => {
    const semuaData = JSON.stringify(trx).toLowerCase();
    return semuaData.includes(keyword);
  });

  renderRiwayatCustom(hasil);
}

function renderRiwayatCustom(data) {
  const tbody = document.getElementById("riwayatTable");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!data || data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align:center">
          Tidak ditemukan transaksi
        </td>
      </tr>
    `;
    return;
  }

  data.forEach((t) => {
    const tr = document.createElement("tr");

    const items = (t.items || [])
      .slice(0, 3)
      .map((i) => `${i.nama} (${i.qty})`)
      .join("<br>");

    const more = t.items && t.items.length > 3 ? "<br>..." : "";

    tr.innerHTML = `
      <td><b>#${t.id}</b></td>
      <td>${t.tanggal || "-"}</td>

      <td>${t.kasirNama || "-"}</td>
      <td>${t.kasirId || "-"}</td>

      <!-- 🔥 MEMBER -->
      <td>
        ${t.namaMember || "-"}<br>
        <small>${t.hpMember || "-"}</small>
        <small>${t.emilMember || "-"}</small>
        <small>${t.idMember || "-"}</small>
      </td>

      <td>${items || "-"} ${more}</td>

      <td>Rp ${(t.total || 0).toLocaleString("id-ID")}</td>
      <td>Rp ${(t.totalLaba || 0).toLocaleString("id-ID")}</td>

      <td>
        <button onclick="lihatDetail('${t.id}')">Detail</button>
        <button onclick="cetakStrukRiwayat('${t.id}')">🖨 Cetak</button>
        <button onclick="hapusTransaksi('${t.id}')" style="color:white">🗑 Hapus</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

let currentPage = 1;
let perPage = 10;

function hitungRankingMember() {
  const transaksi = getTransaksi();
  if (!transaksi || transaksi.length === 0) return [];

  const map = {};

  transaksi.forEach((t) => {
    const id = t.idMember;

    // skip jika tidak ada member
    if (!id) return;

    if (!map[id]) {
      map[id] = {
        idMember: id,
        nama: t.namaMember || "-",
        hp: t.hpMember || "-",
        emal: t.emailMember || "-",
        jumlahTransaksi: 0,
        totalBelanja: 0,
        totalLaba: 0,
      };
    }

    map[id].jumlahTransaksi += 1;
    map[id].totalBelanja += Number(t.total || 0);
    map[id].totalLaba += Number(t.totalLaba || 0);
  });

  return Object.values(map).sort(
    (a, b) => b.jumlahTransaksi - a.jumlahTransaksi,
  );
}

function renderPagination(totalData) {
  const totalPage = Math.ceil(totalData / perPage) || 1;
  const info = document.getElementById("pageInfo");

  if (info) {
    info.innerText = `Halaman ${currentPage} dari ${totalPage}`;
  }
}

function renderRankingMember() {
  const tbody = document.getElementById("rankingMember");
  if (!tbody) return;

  const data = hitungRankingMember();
  tbody.innerHTML = "";

  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center">
          Belum ada data member
        </td>
      </tr>
    `;
    return;
  }

  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const pageData = data.slice(start, end);

  pageData.forEach((m, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>🏅 ${start + index + 1}</td>
      <td>${m.nama}</td>
      <td>${m.idMember}</td>
      <td>${m.hp}</td>
      <td>${m.jumlahTransaksi}</td>
      <td>Rp ${m.totalBelanja.toLocaleString("id-ID")}</td>
      <td>Rp ${m.totalLaba.toLocaleString("id-ID")}</td>
    `;

    tbody.appendChild(tr);
  });

  renderPagination(data.length);
}

function nextPage() {
  const totalData = hitungRankingMember().length;
  const totalPage = Math.ceil(totalData / perPage);

  if (currentPage < totalPage) {
    currentPage++;
    renderRankingMember();
  }
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderRankingMember();
  }
}

// 🔥 WAJIB: panggil saat load
renderRankingMember();

function nextPage() {
  const totalPage = Math.ceil(rankingData.length / perPage);

  if (currentPage < totalPage) {
    currentPage++;
    renderRankingMember();
  }
}

function renderPagination(totalData) {
  const totalPage = Math.ceil(totalData / perPage);
  const info = document.getElementById("pageInfo");

  if (info) {
    info.innerText = `Halaman ${currentPage} dari ${totalPage}`;
  }

  const prevBtn = document.querySelector("button[onclick='prevPage()']");
  const nextBtn = document.querySelector("button[onclick='nextPage()']");

  if (prevBtn) prevBtn.disabled = currentPage === 1;
  if (nextBtn) nextBtn.disabled = currentPage === totalPage;
}
