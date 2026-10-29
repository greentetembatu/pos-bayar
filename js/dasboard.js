document.addEventListener("DOMContentLoaded", renderDashboard);

function renderDashboard() {
  const elProduk = document.getElementById("totalProduk");
  if (!elProduk) return; 

  const produk = getProduk();
  const transaksi = getTransaksi();

  let omzet = 0;
  let laba = 0;

  transaksi.forEach((t) => {
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
  deferredPrompt.userChoice.then((choice) => {
    if (choice.outcome === "accepted") {
      console.log("App installed");
    }
  });
});

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
   FUNGSI BANTU (Base64 ke Blob)
========================================== */
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
   1. DOWNLOAD EXCEL / ZIP (BACKUP)
========================================== */
async function downloadDataExcel(includeFoto = false) {
  if (typeof XLSX === "undefined") return alert("Library Excel belum dimuat.");
  if (includeFoto && typeof JSZip === "undefined")
    return alert("Library ZIP belum dimuat.");

  // Ambil Semua Data
  const produk = JSON.parse(localStorage.getItem("produk")) || [];
  const member = JSON.parse(localStorage.getItem("member")) || [];
  const transaksi = JSON.parse(localStorage.getItem("transaksi")) || [];
  const pengaturan = JSON.parse(localStorage.getItem("pengaturanToko")) || {};
  const dataTokoMember =
    JSON.parse(localStorage.getItem("dataTokoMember")) || {};
  const kasirAktif = JSON.parse(localStorage.getItem("kasirAktif")) || {};
  const kasirList = JSON.parse(localStorage.getItem("kasirList")) || []; // Jika ada list kasir

  // Siapkan Workbook
  const wb = XLSX.utils.book_new();

  // --- Sheet 1: Pengaturan Toko ---
  const dataPengaturan = [
    { Keterangan: "Nama Toko", Nilai: pengaturan.nama || "" },
    { Keterangan: "Alamat", Nilai: pengaturan.alamat || "" },
    { Keterangan: "Tambahan", Nilai: pengaturan.additional || "" },
    {
      Keterangan: "Nama Toko (Member)",
      Nilai: dataTokoMember.tokoNamaMember || "",
    },
    {
      Keterangan: "Alamat Toko (Member)",
      Nilai: dataTokoMember.tokoAlamatMember || "",
    },
    {
      Keterangan: "HP Toko (Member)",
      Nilai: dataTokoMember.tokoHpMember || "",
    },
  ];
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(dataPengaturan),
    "Pengaturan Toko",
  );

  // --- Sheet 2: Data Kasir ---
  let dataKasir = [];
  if (kasirList.length > 0) {
    dataKasir = kasirList.map((k) => ({
      "ID Kasir": String(k.id || ""),
      "Nama Kasir": k.nama || "",
    }));
  } else if (kasirAktif.nama) {
    dataKasir = [
      {
        "ID Kasir": String(kasirAktif.id || ""),
        "Nama Kasir": kasirAktif.nama || "",
      },
    ];
  }
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(dataKasir),
    "Data Kasir",
  );

  // --- Sheet 3: Produk ---
  const dataProduk = produk.map((p) => ({
    ID: String(p.id || ""),
    Barcode: String(p.barcode || ""),
    "Nama Produk": p.nama || "",
    Modal: Number(p.modal) || 0,
    "Harga Jual": Number(p.harga_jual) || 0,
    Stok: Number(p.stok) || 0,
    "Nama File Foto": p.foto ? `foto_${p.id}.jpg` : "-", // Hanya penanda
  }));
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(dataProduk),
    "Daftar Produk",
  );

  // --- Sheet 4: Member ---
  const dataMember = member.map((m) => ({
    "No Member": String(m.no || ""),
    Nama: m.nama || "",
    "No HP": String(m.hp || ""),
    Email: m.email || "",
    "Tgl Daftar": m.tanggal || "",
    Kasir: m.kasir || "",
  }));
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(dataMember),
    "Data Member",
  );

  // --- Sheet 5: Transaksi ---
  const dataTransaksi = transaksi.map((t) => ({
    "ID Transaksi": String(t.id || ""),
    Tanggal: t.tanggal || "",
    Kasir: t.kasirNama || "",
    Member: t.namaMember || "",
    Total: Number(t.total) || 0,
    Laba: Number(t.totalLaba) || 0,
    Metode: t.metode || "cash",
    "Detail Item": (t.items || [])
      .map((i) => `${i.nama} (${i.qty})`)
      .join(", "),
  }));
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(dataTransaksi),
    "Riwayat Transaksi",
  );

  const tanggalFile = new Date().toISOString().slice(0, 10);

  // === PROSES DOWNLOAD ===
  if (!includeFoto) {
    // DOWNLOAD EXCEL SAJA
    XLSX.writeFile(wb, `BACKUP-DATA-${tanggalFile}.xlsx`);
    catatWaktuBackup();
  } else {
    // DOWNLOAD ZIP (EXCEL + FOTO)
    const btn = event.target;
    const textAsli = btn.innerText;
    btn.innerText = "Memproses ZIP...";
    btn.disabled = true;

    try {
      const zip = new JSZip();

      // 1. Masukkan Excel ke ZIP
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      zip.file(`DATA-KASIR-${tanggalFile}.xlsx`, excelBuffer);

      // 2. Masukkan Foto Produk ke ZIP
      const folderFoto = zip.folder("Foto Produk");
      let adaFoto = false;

      produk.forEach((p) => {
        if (p.foto && p.foto.startsWith("data:image")) {
          const parts = p.foto.split(",");
          const header = parts[0];
          const base64Data = parts[1];

          let ekstensi = "jpg";
          if (header.includes("image/png")) ekstensi = "png";

          try {
            const mime = header.split(":")[1].split(";")[0];
            const blob = base64ToBlob(base64Data, mime);
            folderFoto.file(`foto_${p.id}.${ekstensi}`, blob);
            adaFoto = true;
          } catch (err) {
            console.error("Gagal proses foto", p.id, err);
          }
        }
      });

      // 3. Download ZIP
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `BACKUP-ZIP-${tanggalFile}.zip`;
      link.click();
      URL.revokeObjectURL(link.href);

      catatWaktuBackup();
      alert(
        `✅ Berhasil mendownload ZIP (Excel + ${adaFoto ? "Foto" : "Tanpa Foto"}).`,
      );
    } catch (err) {
      console.error(err);
      alert("Gagal membuat ZIP.");
    } finally {
      btn.innerText = textAsli;
      btn.disabled = false;
    }
  }
}


/* ==========================================
   UPLOAD EXCEL / ZIP (RESTORE / MERGE)
========================================== */
async function uploadDataExcel(event, isZip = false) {
  const file = event.target.files[0];
  if (!file) return;

  // === LAPISAN KEAMANAN 1: PILIHAN MODE ===
  const mode = prompt(
    "PILIH MODE RESTORE:\n\n" +
      "1 = TIMPA TOTAL (Hapus data lama, ganti dengan file ini)\n" +
      "2 = GABUNGKAN (Tambah data baru, perbarui data yang sama)\n\n" +
      "Ketik angka 1 atau 2:",
    "2",
  );

  if (mode !== "1" && mode !== "2") {
    alert("Upload dibatalkan.");
    event.target.value = "";
    return;
  }

  const isOverwrite = mode === "1";

  // === LAPISAN KEAMANAN 2: KONFIRMASI FINAL ===
  const pesanKonfirmasi = isOverwrite
    ? "⚠️ PERINGATAN KERAS!\nAnda memilih TIMPA TOTAL.\nSeluruh data lama di aplikasi ini akan DIHAPUS dan diganti dengan file backup.\n\nApakah Anda yakin?"
    : "Upload GABUNGKAN:\nData dengan ID/Nama sama akan diperbarui.\nData baru akan ditambahkan.\nData lama tetap aman.\n\nLanjutkan?";

  if (!confirm(pesanKonfirmasi)) {
    event.target.value = "";
    return;
  }

  const labelId = isZip ? "uploadZip" : "uploadExcel";
  const label = document.querySelector(`label[for='${labelId}']`);
  const textAsli = label.innerText;
  label.innerText = "Memproses...";

  try {
    let excelFileBuffer;
    let fotoZip = null;

    // 1. BACA FILE (JIKA ZIP, EKSTRAK DULU)
    if (isZip) {
      if (typeof JSZip === "undefined")
        throw new Error("Library ZIP tidak ditemukan.");
      const zip = await JSZip.loadAsync(file);

      const xlsxName = Object.keys(zip.files).find(
        (name) => name.endsWith(".xlsx") && !name.includes("__MACOSX"),
      );
      if (!xlsxName)
        throw new Error("File .xlsx tidak ditemukan di dalam ZIP.");

      excelFileBuffer = await zip.files[xlsxName].async("arraybuffer");
      fotoZip = zip;
    } else {
      excelFileBuffer = await file.arrayBuffer();
    }

    // 2. BACA DATA EXCEL
    const wb = XLSX.read(excelFileBuffer, { type: "array" });

    // A. PENGATURAN TOKO (Selalu ditimpa karena ini pengaturan global)
    if (wb.Sheets["Pengaturan Toko"]) {
      const pengaturanArr = XLSX.utils.sheet_to_json(
        wb.Sheets["Pengaturan Toko"],
      );
      let newPengaturan = { nama: "", alamat: "", additional: "" };
      let newTokoMember = {
        tokoNamaMember: "",
        tokoAlamatMember: "",
        tokoHpMember: "",
      };

      pengaturanArr.forEach((item) => {
        if (item.Keterangan === "Nama Toko") newPengaturan.nama = item.Nilai;
        if (item.Keterangan === "Alamat") newPengaturan.alamat = item.Nilai;
        if (item.Keterangan === "Tambahan")
          newPengaturan.additional = item.Nilai;
        if (item.Keterangan === "Nama Toko (Member)")
          newTokoMember.tokoNamaMember = item.Nilai;
        if (item.Keterangan === "Alamat Toko (Member)")
          newTokoMember.tokoAlamatMember = item.Nilai;
        if (item.Keterangan === "HP Toko (Member)")
          newTokoMember.tokoHpMember = item.Nilai;
      });
      localStorage.setItem("pengaturanToko", JSON.stringify(newPengaturan));
      localStorage.setItem("dataTokoMember", JSON.stringify(newTokoMember));
    }

    // B. DATA KASIR
    if (wb.Sheets["Data Kasir"]) {
      const kasirArr = XLSX.utils.sheet_to_json(wb.Sheets["Data Kasir"]);
      if (kasirArr.length > 0) {
        const dataKasirBaru = kasirArr.map((k) => ({
          id: k["ID Kasir"],
          nama: k["Nama Kasir"],
        }));

        if (isOverwrite) {
          localStorage.setItem("kasirList", JSON.stringify(dataKasirBaru));
        } else {
          let kasirLama = JSON.parse(localStorage.getItem("kasirList")) || [];
          dataKasirBaru.forEach((kBaru) => {
            const idx = kasirLama.findIndex(
              (k) => String(k.id) === String(kBaru.id),
            );
            if (idx !== -1) kasirLama[idx] = kBaru;
            else kasirLama.push(kBaru);
          });
          localStorage.setItem("kasirList", JSON.stringify(kasirLama));
        }
      }
    }

    // C. PRODUK & FOTO
    if (wb.Sheets["Daftar Produk"]) {
      const produkArr = XLSX.utils.sheet_to_json(wb.Sheets["Daftar Produk"]);
      let produkHasil = isOverwrite
        ? []
        : JSON.parse(localStorage.getItem("produk")) || [];

      for (const p of produkArr) {
        let fotoBase64 = "";
        const namaFile = p["Nama File Foto"];

        // Ambil foto dari ZIP jika ada
        if (isZip && namaFile && namaFile !== "-") {
          const imgFile =
            fotoZip.file(`Foto Produk/${namaFile}`) || fotoZip.file(namaFile);
          if (imgFile) {
            const base64Data = await imgFile.async("base64");
            let mime = namaFile.endsWith(".png") ? "image/png" : "image/jpeg";
            fotoBase64 = `data:${mime};base64,${base64Data}`;
          }
        }
        // Jika upload Excel saja, pertahankan foto lama
        else if (!isZip && !isOverwrite) {
          const found = produkHasil.find(
            (op) =>
              String(op.id) === String(p["ID"]) || op.nama === p["Nama Produk"],
          );
          if (found) fotoBase64 = found.foto || "";
        }

        const produkBaru = {
          id: String(p["ID"]),
          barcode: String(p["Barcode"] || ""),
          nama: p["Nama Produk"] || "",
          modal: Number(p["Modal"]) || 0,
          harga_jual: Number(p["Harga Jual"]) || 0,
          stok: Number(p["Stok"]) || 0,
          foto: fotoBase64,
        };

        if (isOverwrite) {
          produkHasil.push(produkBaru);
        } else {
          // Mode Gabungkan (Merge)
          const idx = produkHasil.findIndex(
            (old) =>
              String(old.id) === String(produkBaru.id) ||
              old.nama === produkBaru.nama,
          );
          if (idx !== -1) {
            produkHasil[idx] = { ...produkHasil[idx], ...produkBaru };
            if (!produkBaru.foto)
              produkHasil[idx].foto = produkHasil[idx].foto || "";
          } else {
            produkHasil.push(produkBaru);
          }
        }
      }
      localStorage.setItem("produk", JSON.stringify(produkHasil));
    }

    // D. MEMBER
    if (wb.Sheets["Data Member"]) {
      const memberArr = XLSX.utils.sheet_to_json(wb.Sheets["Data Member"]);
      let memberHasil = isOverwrite
        ? []
        : JSON.parse(localStorage.getItem("member")) || [];

      memberArr.forEach((m) => {
        const memberBaru = {
          no: String(m["No Member"]),
          nama: m["Nama"],
          hp: String(m["No HP"]),
          email: m["Email"],
          tanggal: m["Tgl Daftar"],
          kasir: m["Kasir"],
        };

        if (isOverwrite) {
          memberHasil.push(memberBaru);
        } else {
          const idx = memberHasil.findIndex(
            (old) => String(old.no) === String(memberBaru.no),
          );
          if (idx !== -1)
            memberHasil[idx] = { ...memberHasil[idx], ...memberBaru };
          else memberHasil.push(memberBaru);
        }
      });
      localStorage.setItem("member", JSON.stringify(memberHasil));
    }

    // E. TRANSAKSI
    if (wb.Sheets["Riwayat Transaksi"]) {
      const trxArr = XLSX.utils.sheet_to_json(wb.Sheets["Riwayat Transaksi"]);
      let trxHasil = isOverwrite
        ? []
        : JSON.parse(localStorage.getItem("transaksi")) || [];

      trxArr.forEach((t) => {
        const trxBaru = {
          id: String(t["ID Transaksi"]),
          tanggal: t["Tanggal"],
          kasirNama: t["Kasir"],
          namaMember: t["Member"],
          total: Number(t["Total"]),
          totalLaba: Number(t["Laba"]),
          metode: t["Metode"],
          items: [
            {
              nama: t["Detail Item"],
              qty: 1,
              harga: Number(t["Total"]),
              subtotal: Number(t["Total"]),
            },
          ],
        };

        if (isOverwrite) {
          trxHasil.push(trxBaru);
        } else {
          const idx = trxHasil.findIndex(
            (old) => String(old.id) === String(trxBaru.id),
          );
          if (idx === -1) {
            // Transaksi biasanya tidak diedit, hanya ditambah jika belum ada
            trxHasil.push(trxBaru);
          }
        }
      });
      localStorage.setItem("transaksi", JSON.stringify(trxHasil));
    }

    alert(
      `✅ Berhasil Restore Mode: ${isOverwrite ? "TIMPA TOTAL" : "GABUNGKAN"}!\nHalaman akan dimuat ulang.`,
    );
    location.reload();
  } catch (err) {
    console.error(err);
    alert("❌ Gagal Restore: " + err.message);
  } finally {
    label.innerText = textAsli;
    event.target.value = "";
  }
}

/* ==========================================
   AUTO BACKUP
========================================== */
function formatTanggalFile() {
  return new Date().toISOString().slice(0, 10);
}
function catatWaktuBackup() {
  localStorage.setItem("lastAutoBackup", Date.now());
  updateStatusAutoBackupUI();
}
function aturAutoBackup(jam) {
  localStorage.setItem("autoBackupInterval", jam * 60 * 60 * 1000);
  alert(`✅ Auto-Backup diatur setiap ${jam} jam.`);
  updateStatusAutoBackupUI();
}
function batalkanAutoBackup() {
  localStorage.removeItem("autoBackupInterval");
  localStorage.removeItem("lastAutoBackup");
  updateStatusAutoBackupUI();
}
function cekAutoBackup() {
  const interval = localStorage.getItem("autoBackupInterval");
  const lastBackup = localStorage.getItem("lastAutoBackup");
  if (!interval) return;

  const sekarang = Date.now();
  const waktuTerakhir = lastBackup ? parseInt(lastBackup) : 0;

  if (sekarang - waktuTerakhir > parseInt(interval)) {
    setTimeout(() => {
      downloadDataExcel(true); // Auto download ZIP + Foto
      alert("⏰ AUTO-BACKUP: File ZIP Laporan telah diunduh otomatis.");
    }, 2000);
  }
}
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
  const waktuTerakhir = lastBackup
    ? new Date(parseInt(lastBackup)).toLocaleString("id-ID")
    : "Belum pernah";
  el.innerText = `Status: Aktif (Setiap ${jam} Jam) | Backup terakhir: ${waktuTerakhir}`;
  el.style.color = "#16a34a";
}

document.addEventListener("DOMContentLoaded", () => {
  cekAutoBackup();
  updateStatusAutoBackupUI();
});
