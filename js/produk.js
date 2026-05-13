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
    const isDuplicate = produk.some(p => p.barcode === barcode && p.id != id);
    if (isDuplicate) {
      alert("⚠️ Barcode sudah digunakan oleh produk lain!");
      return;
    }
  }

  if (id) {
    // Edit Produk
    const dashboard = produk.findDashboard(p => p.id == id);
    if (dashboard === -1) return;

    produk[dashboard] = {
      ...produk[dashboard],
      barcode: barcode, 
      nama,
      modal,
      harga_jual,
      stok
    };
  } else {
    // Tambah Produk Baru
    produk.push({
      id: Date.now(),
      barcode: barcode,
      nama,
      modal,
      harga_jual,
      stok
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
  const p = produk.find(item => item.id === id);
  if (!p) return;

  // Mengisi form dengan data yang ada
  document.getElementById("produkId").value = p.id;
  document.getElementById("barcodeProduk").value = p.barcode || "";
  document.getElementById("namaProduk").value = p.nama;
  document.getElementById("modalProduk").value = p.modal;
  document.getElementById("hargaProduk").value = p.harga_jual;
  document.getElementById("stokProduk").value = p.stok;
}

/* =======================
   HAPUS PRODUK
======================= */
function hapusProduk(id) {
  if (!confirm("Hapus produk ini?")) return;

  let produk = getProduk();
  produk = produk.filter(p => p.id !== id);

  saveProduk(produk);
  renderProduk();
}

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
    const keyword = document.getElementById("searchProduk")?.value.toLowerCase() || "";
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

    if (filter === "menipis")
        cocokStok = p.stok > 0 && p.stok <= 5;

    return (cocokNama || cocokBarcode) && cocokStok;
});

    // --- STEP 2: LOGIKA PAGINATION ---
    const totalHal = Math.ceil(hasilFilter.length / limitProdukPerHal) || 1;
    
    // Keamanan: Jika halaman saat ini lebih besar dari total halaman (misal setelah difilter), balik ke hal 1
    if (pageProduk > totalHal) pageProduk = 1;

    // Kontrol Tampilan Navigasi
    const navProduk = document.getElementById("navigasiProduk");
    if (navProduk) {
        navProduk.style.display = hasilFilter.length > limitProdukPerHal ? "flex" : "none";
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

    dataTampil.forEach(p => {
        const tr = document.createElement("tr");
        let badge = p.stok === 0 ? "❌ Habis" : (p.stok <= 5 ? "⚠️ Menipis" : "✅ Aman");

        tr.innerHTML = `
            <td><img src="${p.foto || 'https://placehold.co/50x50'}" style="width:50px; height:50px; object-fit:cover; border-radius:5px;"></td>
            <td><code style="background: #eee; padding: 2px 5px; border-radius: 4px;">${p.barcode || '-'}</code></td>
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
    const scrollTarget = document.querySelector('h3'); 
    if(scrollTarget) scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        aspectRatio: 1.0
    };

    html5QrCode.start(
        { facingMode: "environment" }, 
        config, 
        (barcodeText) => {
          playBeep(); 
            if (navigator.vibrate) navigator.vibrate(100); // Getar HP
            if (navigator.vibrate) navigator.vibrate(100);
            stopScan();

            document.getElementById("barcodeProduk").value = barcodeText;

            const produk = getProduk();
            const pTerdaftar = produk.find(p => p.barcode === barcodeText);

            if (pTerdaftar) {
                alert("Produk ditemukan: " + pTerdaftar.nama + ". Mengalihkan ke mode Edit.");
                isiFormProduk(pTerdaftar);
            } else {
                alert("Barang Baru terdeteksi!");
                // Simpan barcode, bersihkan field lain
                const currentBarcode = barcodeText;
                resetForm();
                document.getElementById("barcodeProduk").value = currentBarcode;
                document.getElementById("namaProduk").focus();
            }
        }
    ).catch(err => {
        alert("Gagal akses kamera: " + err);
    });
}

function stopScan() {
    if (html5QrCode) {
        html5QrCode.stop().catch(err => console.error("Error stopping scanner", err));
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
      gain.gain.exponentialRampToValueAtTime(0.05, audioCtx.currentTime + durasi);

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
    reader.onload = function() {
        const output = document.getElementById('imgPreview');
        output.src = reader.result;
        output.style.display = 'block';
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
        const isDuplicate = produk.some(p => p.barcode === barcode && p.id != id);
        if (isDuplicate) {
            alert("⚠️ Barcode ini sudah terdaftar pada produk lain!");
            return;
        }
    }

    if (id) {
        // --- PROSES EDIT ---
        const dashboard = produk.findIndex(p => p.id == id);
        if (dashboard !== -1) {
            produk[dashboard] = {
                ...produk[dashboard],
                barcode: barcode,
                nama: nama,
                modal: modal,
                harga_jual: harga_jual,
                stok: stok,
                // Gunakan foto baru jika ada, jika tidak gunakan foto lama
                foto: fotoBase64 || produk[dashboard].foto || "" 
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
            foto: fotoBase64 || "" // Placeholder kosong jika tidak ada foto
        });
    }

    saveProduk(produk);
    resetForm();
    renderProduk();
    
    // Reset status foto setelah simpan
    fotoBase64 = "";
    if(document.getElementById('imgPreview')) document.getElementById('imgPreview').style.display = 'none';
    
    alert("Produk berhasil disimpan!");
}

























/* =======================
   EKSPOR DATA PRODUK (JSON)
======================= */
function eksporDataProduk() {
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
}

/* =======================
   IMPOR DATA PRODUK (JSON)
======================= */
function imporDataProduk(event) {
    const file = event.target.files[0];
    if (!file) return;

    const konfirmasi = confirm("PENTING: Mengimpor data akan menimpa data produk yang ada saat ini. Lanjutkan?");
    if (!konfirmasi) {
        event.target.value = ""; // Reset input file
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const dataImpor = JSON.parse(e.target.result);

            // Validasi sederhana: pastikan data berupa Array
            if (Array.isArray(dataImpor)) {
                // Simpan ke localStorage melalui fungsi saveProduk Anda
                saveProduk(dataImpor);
                
                // Refresh tampilan
                pageProduk = 1; // Reset ke halaman 1
                renderProduk();
                
                alert("Berhasil mengimpor " + dataImpor.length + " produk!");
            } else {
                alert("Format file tidak valid. Pastikan file adalah hasil ekspor produk.");
            }
        } catch (err) {
            console.error("Gagal membaca JSON:", err);
            alert("Terjadi kesalahan saat membaca file. Pastikan file berformat .json");
        }
        event.target.value = ""; // Reset input file agar bisa pilih file yang sama lagi
    };
    
    reader.readAsText(file);
}











/* =======================
   EKSPOR DATA PRODUK (CSV)
======================= */
function eksporCSVProduk() {

    const data = getProduk() || [];

    if (data.length === 0) {
        alert("Tidak ada data produk");
        return;
    }

    // Header CSV
    let csv = "id;barcode;nama;modal;harga_jual;stok;foto\n";

    // Isi data
    data.forEach((p) => {

        csv += [
            p.id || "",
            p.barcode || "",
            p.nama || "",
            p.modal || 0,
            p.harga_jual || 0,
            p.stok || 0,
            p.foto || ""
        ].join(";") + "\n";

    });

    // Tambahkan UTF-8 BOM agar Excel tidak rusak
    const blob = new Blob(
        ["\uFEFF" + csv],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    const tanggal = new Date()
        .toISOString()
        .slice(0, 10);

    link.href = url;
    link.download = `backup-produk-${tanggal}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    alert("Data CSV berhasil diekspor");
}











/* =======================
   IMPOR DATA PRODUK (CSV)
======================= */
function imporCSVProduk(event) {

    const file = event.target.files[0];

    if (!file) return;

    const konfirmasi = confirm(
        "Mengimpor CSV akan menimpa data produk lama. Lanjutkan?"
    );

    if (!konfirmasi) {
        event.target.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {

        try {

            const text = e.target.result;

            // Pecah per baris
            const rows = text.split("\n");

            // Ambil header
            const headers = rows[0]
                .trim()
                .split(";");

            const hasil = [];

            // Mulai dari baris ke-2
            for (let i = 1; i < rows.length; i++) {

                const row = rows[i].trim();

                if (!row) continue;

                const cols = row.split(";");

                let obj = {};

                headers.forEach((h, index) => {

                    obj[h] = cols[index];

                });

                // konversi number
                obj.id = Number(obj.id) || Date.now() + i;
                obj.modal = Number(obj.modal) || 0;
                obj.harga_jual = Number(obj.harga_jual) || 0;
                obj.stok = Number(obj.stok) || 0;

                hasil.push(obj);
            }

            // simpan
            saveProduk(hasil);

            // refresh
            pageProduk = 1;

            renderProduk();

            alert(
                `Berhasil impor ${hasil.length} produk dari CSV`
            );

        } catch (err) {

            console.error(err);

            alert("Gagal membaca file CSV");

        }

        event.target.value = "";
    };

    reader.readAsText(file);
}


















const searchInput = document.getElementById("searchProduk");
const hasilBox = document.getElementById("hasilPencarianProduk");

if (searchInput && hasilBox) {

    searchInput.addEventListener("input", function () {

        const keyword = this.value
            .toLowerCase()
            .replace(/\s+/g, "")
            .trim();

        hasilBox.innerHTML = "";

        if (!keyword) {
            hasilBox.style.display = "none";
            renderProduk();
            return;
        }

        const produk = getProduk() || [];

        const hasil = produk
            .filter((p) => {

                const nama = (p.nama || "")
                    .toLowerCase()
                    .replace(/\s+/g, "");

                const barcode = (p.barcode || "")
                    .toString()
                    .toLowerCase();

                return (
                    nama.includes(keyword) ||
                    barcode.includes(keyword)
                );
            })
            .slice(0, 5);

        if (hasil.length === 0) {
            hasilBox.style.display = "none";
            return;
        }

        hasil.forEach((p) => {

            const div = document.createElement("div");

            div.className = "hasil-item";

            div.innerHTML = `
                <img src="${p.foto || 'https://placehold.co/50x50'}">

                <div class="hasil-info">
                    <h4>${p.nama}</h4>

                    <small>
                        Rp ${(p.harga_jual || 0).toLocaleString("id-ID")}
                        •
                        Stok: ${p.stok}
                    </small>
                </div>
            `;

            div.onclick = () => {

                searchInput.value = p.nama;

                hasilBox.style.display = "none";

                pageProduk = 1;

                renderProduk();
            };

            hasilBox.appendChild(div);
        });

        hasilBox.style.display = "block";
    });

    document.addEventListener("click", (e) => {

        if (!e.target.closest(".card")) {
            hasilBox.style.display = "none";
        }

    });
}