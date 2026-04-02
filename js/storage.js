function getTransaksi() {
  return JSON.parse(localStorage.getItem("transaksi")) || [];
}

function saveTransaksi(data) {
  localStorage.setItem("transaksi", JSON.stringify(data));
}













/* ==========================================
   FUNGSI EKSPOR DATA (DOWNLOAD JSON)
   ========================================== */
/*function eksporData() {
    try {
        const dataProduk = localStorage.getItem("produk") || "[]";
        const dataTransaksi = localStorage.getItem("transaksi") || "[]";

        const backupData = {
            produk: JSON.parse(dataProduk),
            transaksi: JSON.parse(dataTransaksi),
            app: "POS-UMKM",
            waktu_backup: new Date().toISOString()
        };

        const dataStr = JSON.stringify(backupData);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const fileName = `backup_pos_full_${new Date().toISOString().slice(0,10)}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', fileName);
        linkElement.click();
        
        alert("Ekspor berhasil! Simpan file ini baik-baik.");
    } catch (error) {
        alert("Gagal ekspor: " + error.message);
    }
}

/* ==========================================
   FUNGSI IMPOR DATA (REPLACE & MERGE)
   ========================================== */
/*function imporData(event, mode) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);

            // Validasi file
            if (!importedData.produk || !importedData.transaksi) {
                throw new Error("Format file backup tidak dikenali.");
            }

            if (mode === 'REPLACE') {
                prosesReplace(importedData);
            } else if (mode === 'MERGE') {
                prosesMerge(importedData);
            }

        } catch (err) {
            alert("Gagal impor: " + err.message);
        }
        // Reset input file agar bisa pilih file yang sama lagi jika perlu
        event.target.value = '';
    };
    reader.readAsText(file);
}

// STRATEGI 1: REPLACE (Menghapus data lama, ganti total)
function prosesReplace(dataBaru) {
    const konfirmasi = confirm("PERINGATAN!\nSeluruh data di HP ini akan DIHAPUS dan diganti dengan data dari file. Lanjutkan?");
    if (konfirmasi) {
        localStorage.setItem("produk", JSON.stringify(dataBaru.produk));
        localStorage.setItem("transaksi", JSON.stringify(dataBaru.transaksi));
        alert("Data berhasil diganti total!");
        window.location.reload();
    }
}

// STRATEGI 2: MERGE (Menambah yang belum ada)
function prosesMerge(dataBaru) {
    const konfirmasi = confirm("Gabungkan data? Produk dengan Barcode/ID yang sama akan dilewati.");
    if (!konfirmasi) return;

    // 1. Merge Produk
    const produkLokal = JSON.parse(localStorage.getItem("produk") || "[]");
    let countProduk = 0;

    dataBaru.produk.forEach(pBaru => {
        // Cek apakah barcode atau ID sudah ada
        const ada = produkLokal.find(pLama => 
            (pBaru.barcode && pLama.barcode === pBaru.barcode) || 
            (pLama.id === pBaru.id)
        );

        if (!ada) {
            produkLokal.push(pBaru);
            countProduk++;
        }
    });

    // 2. Merge Transaksi (Berdasarkan ID Waktu)
    const transaksiLokal = JSON.parse(localStorage.getItem("transaksi") || "[]");
    let countTrx = 0;

    dataBaru.transaksi.forEach(tBaru => {
        const adaTrx = transaksiLokal.find(tLama => tLama.id === tBaru.id);
        if (!adaTrx) {
            transaksiLokal.push(tBaru);
            countTrx++;
        }
    });

    localStorage.setItem("produk", JSON.stringify(produkLokal));
    localStorage.setItem("transaksi", JSON.stringify(transaksiLokal));

    alert(`Berhasil menggabungkan:\n- ${countProduk} Produk baru dimasukkan\n- ${countTrx} Riwayat transaksi baru dimasukkan`);
    window.location.reload();
}




























/* ==========================================
   EKSPOR DATA KE CSV (FULL BACKUP)
========================================== */
/*function eksporCSV() {
  try {
    const produk = JSON.parse(localStorage.getItem("produk") || "[]");
    const transaksi = JSON.parse(localStorage.getItem("transaksi") || "[]");

    let csv = "TYPE;DATA\n";

    // ===== PRODUK =====
    produk.forEach(p => {
      csv += `PRODUK;${encodeURIComponent(JSON.stringify(p))}\n`;
    });

    // ===== TRANSAKSI =====
    transaksi.forEach(t => {
      csv += `TRANSAKSI;${encodeURIComponent(JSON.stringify(t))}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const now = new Date();
    const tanggal = `${now.getDate().toString().padStart(2, "0")}${
      (now.getMonth() + 1).toString().padStart(2, "0")
    }${now.getFullYear()}`;

    const jam = `${now.getHours().toString().padStart(2, "0")}.${
      now.getMinutes().toString().padStart(2, "0")
    }`;

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `backup-pos-${tanggal}-${jam}.csv`;
    a.click();

    alert("Ekspor CSV berhasil!");
  } catch (err) {
    alert("Gagal ekspor: " + err.message);
  }
}












/* ==========================================
   IMPORT DATA CSV
========================================== */
/*function imporCSV(event, mode) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      const text = e.target.result;
      const lines = text.split("\n");

      let produkBaru = [];
      let transaksiBaru = [];

      lines.forEach(line => {
        if (!line.trim()) return;

        const [type, data] = line.split(";");

        if (!data) return;

        const parsed = JSON.parse(decodeURIComponent(data));

        if (type === "PRODUK") {
          produkBaru.push(parsed);
        }

        if (type === "TRANSAKSI") {
          transaksiBaru.push(parsed);
        }
      });

      if (mode === "REPLACE") {
        prosesReplaceCSV(produkBaru, transaksiBaru);
      } else {
        prosesMergeCSV(produkBaru, transaksiBaru);
      }

    } catch (err) {
      alert("Gagal impor CSV: " + err.message);
    }

    event.target.value = "";
  };

  reader.readAsText(file);
}













function prosesReplaceCSV(produkBaru, transaksiBaru) {
  const konfirmasi = confirm("Semua data akan diganti. Lanjutkan?");
  if (!konfirmasi) return;

  localStorage.setItem("produk", JSON.stringify(produkBaru));
  localStorage.setItem("transaksi", JSON.stringify(transaksiBaru));

  alert("Data berhasil di-replace!");
  location.reload();
}











function prosesMergeCSV(produkBaru, transaksiBaru) {
  const konfirmasi = confirm("Gabungkan data?");
  if (!konfirmasi) return;

  const produkLama = JSON.parse(localStorage.getItem("produk") || "[]");
  const transaksiLama = JSON.parse(localStorage.getItem("transaksi") || "[]");

  let countProduk = 0;
  let countTrx = 0;

  // ===== MERGE PRODUK =====
  produkBaru.forEach(p => {
    const ada = produkLama.find(x =>
      (p.barcode && x.barcode === p.barcode) ||
      x.id === p.id
    );

    if (!ada) {
      produkLama.push(p);
      countProduk++;
    }
  });

  // ===== MERGE TRANSAKSI =====
  transaksiBaru.forEach(t => {
    const ada = transaksiLama.find(x => x.id === t.id);

    if (!ada) {
      transaksiLama.push(t);
      countTrx++;
    }
  });

  localStorage.setItem("produk", JSON.stringify(produkLama));
  localStorage.setItem("transaksi", JSON.stringify(transaksiLama));

  alert(`Merge berhasil:
- ${countProduk} produk baru
- ${countTrx} transaksi baru`);

  location.reload();
}*/