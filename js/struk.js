function cetakStruk(data) {
  const { jsPDF } = window.jspdf;

  // Hitung tinggi dinamis berdasarkan jumlah item
  // Dasar (header/footer) +- 100mm + (jumlah item * 10mm)
  const itemHeight = (data.items || []).length * 10;
  const dynamicHeight = Math.max(150, 100 + itemHeight);

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, dynamicHeight], // Lebar tetap 80mm, tinggi mengikuti isi
    putOnlyUsedFonts: true,
  });

  // Pengaturan Font Standar Struk
  doc.setFont("courier", "normal"); // Font monospaced agar angka sejajar rapi

  let y = 5;
  const toko = getPengaturanToko() || {};

  // HEADER
  doc.setFontSize(12);
  doc.text(toko.nama || "TOKO", 40, y, { align: "center" });
  y += 6;

  doc.setFontSize(9);
  doc.text(toko.alamat || "-", 40, y, { align: "center" });
  y += 5;

  doc.text(toko.additional || "-", 40, y, { align: "center" });
  y += 5;

  doc.text("====================================================", 40, y, {
    align: "center",
  });
  y += 5;

  // INFO
  doc.text(`Tanggal: ${new Date().toLocaleString("id-ID")}`, 4, y);
  y += 3;

  doc.text(`ID: ${data.id || "-"}`, 4, y);
  y += 3;

  doc.text(`Kasir: ${data.kasirNama || "-"}`, 4, y);
  y += 3;

  doc.text(`ID Kasir: ${data.kasirId || "-"}`, 4, y);
  y += 3;

  doc.text("====================================================", 40, y, {
    align: "center",
  });
  y += 5;

  // MEMBER (opsional)
// MEMBER
const member = data.member || {};

doc.text(`Member: ${member.nama || "-"}`, 3, y);
y += 3;

doc.text(`ID: ${member.no || "-"}`, 3, y);
y += 3;

doc.text(`Hp: ${member.hp || "-"}`, 3, y);
y += 3;

doc.text(`Email: ${member.email || "-"}`, 3, y);
y += 3;

  doc.text("====================================================", 40, y, {
    align: "center",
  });
  y += 6;

  // ITEM
  data.items.forEach((item) => {
    doc.text(item.nama, 5, y);
    y += 4;

    doc.text(`${item.qty} x Rp ${item.harga.toLocaleString("id-ID")}`, 5, y);

    doc.text(item.subtotal.toLocaleString("id-ID"), 75, y, { align: "right" });
    y += 5;
  });

  doc.text("====================================================", 40, y, {
    align: "center",
  });
  y += 5;

  // TOTAL
  doc.text("SUBTOTAL", 5, y);
  doc.text((data.totalAwal || 0).toLocaleString("id-ID"), 75, y, {
    align: "right",
  });
  y += 4;

  doc.text(`DISKON (${data.diskon || 0}%)`, 5, y);
  doc.text(`- ${(data.potongan || 0).toLocaleString("id-ID")}`, 75, y, {
    align: "right",
  });
  y += 4;

  doc.text("TOTAL", 5, y);
  doc.text((data.total || 0).toLocaleString("id-ID"), 75, y, {
    align: "right",
  });
  y += 4;

  doc.text("BAYAR", 5, y);
  doc.text((data.uang || 0).toLocaleString("id-ID"), 75, y, { align: "right" });
  y += 4;

  doc.text("KEMBALI", 5, y);
  doc.text((data.kembalian || 0).toLocaleString("id-ID"), 75, y, {
    align: "right",
  });
  y += 6;

  // ===== FOOTER =====
  doc.text("Terima kasih", 40, y, { align: "center" });
  y += 3;
  doc.text("Barang yang sudah dibeli", 40, y, { align: "center" });
  y += 3;
  doc.text("tidak dapat dikembalikan", 40, y, { align: "center" });
  y += 7;

  doc.text("Aplikasi ini dibuat oleh", 40, y, { align: "center" });
  y += 3;
  doc.text("Adi Mardani Dev", 40, y, { align: "center" });
  y += 3;
  doc.text("0852-1405-6596 ||greentetembatu@gmail.com", 40, y, {
    align: "center",
  });

  // ===== SIMPAN =====
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);

  // 2. Cari atau buat iframe tersembunyi (agar tidak menumpuk di memori)
  let iframe = document.getElementById("printFrame");
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.id = "printFrame";
    iframe.style.position = "fixed";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    document.body.appendChild(iframe);
  }

  // 3. Masukkan URL ke iframe
  iframe.src = url;

  // 4. Eksekusi Print setelah loading selesai
  // Bagian akhir fungsi cetakStruk untuk HP & Desktop
  iframe.onload = function () {
    setTimeout(() => {
      try {
        // Khusus iOS/Safari kadang butuh eksekusi langsung tanpa focus
        const frameWindow = iframe.contentWindow;
        frameWindow.focus();
        frameWindow.print();

        // Bersihkan memori
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      } catch (e) {
        // Fallback jika HP memblokir iframe (Buka di tab baru)
        window.open(url, "_blank");
      }
    }, 800); // Jeda sedikit lebih lama (800ms) untuk HP yang speknya rendah
  };
}
