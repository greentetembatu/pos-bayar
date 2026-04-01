document.addEventListener("DOMContentLoaded", renderRiwayat);

/* =======================
   RENDER RIWAYAT
======================= */
function renderRiwayat() {
  const tbody = document.getElementById("riwayatTable");
  if (!tbody) return;

  const transaksi = getTransaksi();
  tbody.innerHTML = "";

  if (!transaksi || transaksi.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center">
          Belum ada transaksi
        </td>
      </tr>
    `;
    return;
  }

  transaksi.forEach(t => {
    const tr = document.createElement("tr");

    const items = (t.items || [])
      .slice(0, 3)
      .map(i => `${i.nama} (${i.qty})`)
      .join("<br>");

    const more = (t.items && t.items.length > 3) ? "<br>..." : "";

tr.innerHTML = `
  <td><b>#${t.id}</b></td>

  <td>${t.tanggal || "-"}</td>

  <!-- 🔥 TAMBAHAN KASIR -->
  <td>${t.kasirNama || "-"}</td>
  <td>${t.kasirId || "-"}</td>

  <td>
    ${items || "-"}
    ${more}
  </td>
<td>
  Rp ${(t.total || 0).toLocaleString("id-ID")}
  <br><small>Diskon: ${t.diskon || 0}%</small>
</td>
  <td>Rp ${(t.totalLaba || 0).toLocaleString("id-ID")}</td>

  <td>
    <button onclick="lihatDetail('${t.id}')">Detail</button>
    <button onclick="cetakStrukRiwayat('${t.id}')">🖨 Cetak</button>
    <button onclick="hapusTransaksi('${t.id}')" style="color:red">🗑 Hapus</button>
  </td>
`;

    tbody.appendChild(tr);
  });
}
/* =======================
   DETAIL TRANSAKSI
======================= */
function lihatDetail(id) {
  const transaksi = getTransaksi();
  const t = transaksi.find(x => x.id === id);

  if (!t) {
    alert("Transaksi tidak ditemukan");
    return;
  }

  let info = `🧾 DETAIL TRANSAKSI\n\n`;

  info += `ID: #${t.id}\n`; // 🔥 TAMBAHAN
  info += `Tanggal: ${t.tanggal || "-"}\n\n`;
  

  if (Array.isArray(t.items) && t.items.length > 0) {
    t.items.forEach(i => {
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

info += `SUBTOTAL: Rp ${totalAwal.toLocaleString("id-ID")}\n`;
info += `DISKON: ${diskon}%\n`;
info += `POTONGAN: Rp ${potongan.toLocaleString("id-ID")}\n`;
info += `TOTAL: Rp ${total.toLocaleString("id-ID")}\n`;
info += `LABA: Rp ${laba.toLocaleString("id-ID")}`;

  alert(info);
}












function cetakStrukRiwayat(id) {
  const transaksi = getTransaksi();
  const t = transaksi.find(x => x.id === id);

  if (!t) {
    alert("Transaksi tidak ditemukan");
    return;
  }

cetakStruk({
  id: t.id,
  items: t.items,
  total: t.total,
  uang: t.uang,
  kembalian: t.kembalian,

  // 🔥 DISKON (WAJIB)
  totalAwal: t.totalAwal || t.total,
  diskon: t.diskon || 0,
  potongan: t.potongan || 0,

  // kasir
  kasirNama: t.kasirNama,
  kasirId: t.kasirId
});
}








function hapusTransaksi(id) {
  if (!confirm("Yakin ingin menghapus transaksi ini?\nData tidak bisa dikembalikan.")) {
    return;
  }

  let transaksi = getTransaksi();
  const sebelum = transaksi.length;

  transaksi = transaksi.filter(t => t.id !== id);

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
  const t = transaksi.find(x => x.id === id);
  if (!t) return;

  const produk = getProduk();

  t.items.forEach(i => {
    const p = produk.find(x => x.id === i.id);
    if (p) p.stok += i.qty;
  });

  saveProduk(produk);
  saveTransaksi(transaksi.filter(x => x.id !== id));
  renderRiwayat();

  alert("Transaksi & stok berhasil dikembalikan");
}















function downloadJSON() {
  const transaksi = getTransaksi();

  if (!transaksi || transaksi.length === 0) {
    alert("Tidak ada data untuk didownload");
    return;
  }

  const dataStr = JSON.stringify(transaksi, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "data-transaksi.json";
  a.click();
}










function downloadCSV() {
  const transaksi = getTransaksi();

  if (!transaksi || transaksi.length === 0) {
    alert("Tidak ada data untuk didownload");
    return;
  }

  let csv = "Tanggal;ID Transaksi;Kasir;ID Kasir;Nama Produk;Qty;Harga;Subtotal Item;Subtotal Transaksi;Diskon (%);Potongan;Total Akhir;Laba\n";

  transaksi.forEach(t => {
    const tanggal = t.tanggal || "-";

    const totalAwal = t.totalAwal || t.total || 0;
    const diskon = t.diskon || 0;
    const potongan = t.potongan || 0;
    const totalAkhir = t.total || 0;
    const laba = t.totalLaba || 0;

    const kasirNama = t.kasirNama || "-";
    const kasirId = t.kasirId || "-";

    if (Array.isArray(t.items) && t.items.length > 0) {
      t.items.forEach(i => {
        const nama = `"${i.nama}"`;
        const qty = i.qty || 0;
        const harga = i.harga || 0;
        const subtotal = i.subtotal || 0;

        csv += `${tanggal};${t.id};${kasirNama};${kasirId};${nama};${qty};${harga};${subtotal};${totalAwal};${diskon};${potongan};${totalAkhir};${laba}\n`;
      });
    } else {
      csv += `${tanggal};${t.id};${kasirNama};${kasirId};-;0;0;0;${totalAwal};${diskon};${potongan};${totalAkhir};${laba}\n`;
    }
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  const now = new Date();

// format tanggal
const tanggal = now.toLocaleDateString("id-ID").replace(/\//g, "");

// format jam
const jam = now.toLocaleTimeString("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
}).replace(":", ".");

// gabungkan
a.download = `laporan-transaksi-${tanggal}-${jam}.csv`;
  a.click();
}






function cariTransaksi() {
  const keyword = document
    .getElementById("searchTransaksi")
    .value
    .toLowerCase()
    .trim();

  const data = getTransaksi();

  // ✅ RESET ke tabel normal
  if (keyword === "") {
    renderRiwayat();
    return;
  }

  const hasil = data.filter(trx => {
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
        <td colspan="8" style="text-align:center">
          Tidak ditemukan transaksi
        </td>
      </tr>
    `;
    return;
  }

  data.forEach(t => {
    const tr = document.createElement("tr");

    const items = (t.items || [])
      .slice(0, 3)
      .map(i => `${i.nama} (${i.qty})`)
      .join("<br>");

    const more = (t.items && t.items.length > 3) ? "<br>..." : "";

    tr.innerHTML = `
      <td><b>#${t.id}</b></td>
      <td>${t.tanggal || "-"}</td>
      <td>${t.kasirNama || "-"}</td>
      <td>${t.kasirId || "-"}</td>
      <td>${items || "-"} ${more}</td>
      <td>Rp ${(t.total || 0).toLocaleString("id-ID")}</td>
      <td>Rp ${(t.totalLaba || 0).toLocaleString("id-ID")}</td>
      <td>
        <button onclick="lihatDetail('${t.id}')">Detail</button>
        <button onclick="cetakStrukRiwayat('${t.id}')">🖨 Cetak</button>
        <button onclick="hapusTransaksi('${t.id}')" style="color:red">🗑 Hapus</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}