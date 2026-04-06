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
    const hasilFilter = produk.filter(p => {
        const cocokNama = (p.nama || "").toLowerCase().includes(keyword);
        const cocokBarcode = (p.barcode || "").toLowerCase().includes(keyword);

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
            <td><img src="${p.foto || 'https://via.placeholder.com/50'}" style="width:50px; height:50px; object-fit:cover; border-radius:5px;"></td>
            <td><code style="background: #eee; padding: 2px 5px; border-radius: 4px;">${p.barcode || '-'}</code></td>
            <td><strong>${p.nama}</strong></td>
            <td>Rp ${(p.modal || 0).toLocaleString("id-ID")}</td>
            <td>Rp ${(p.harga_jual || 0).toLocaleString("id-ID")}</td>
            <td>${p.stok} <br><small>${badge}</small></td>
            <td>
                <button onclick="editProduk(${p.id})">Edit</button>
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
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        // Frekuensi 660Hz (suara beep scanner standar)
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(660, audioCtx.currentTime);
        
        // Atur volume dan durasi
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime); // Volume 20%
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.1); // Menghilang dalam 0.1 detik

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
        console.log("Audio API tidak didukung atau diblokir browser");
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