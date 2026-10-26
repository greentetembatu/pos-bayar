/* =======================
   GENERATOR BARCODE MANDIRI
   - Bisa dipakai untuk produk tanpa barcode
   - Hasil bisa: copy, print, simpan PNG
======================= */

// Variabel global penampung kode barcode aktif
let barcodeAktif = "";


/* ------------------------------------
   1. GENERATE KODE BARCODE (LOGIKA)
   EAN-13 : 13 digit numerik + checksum valid
   CODE128: prefix "PRD" + timestamp
------------------------------------ */
function generateKodeBarcode(format) {

    const produk = getProduk() || [];

    // Set barcode yang sudah dipakai (biar tidak bentrok)
    const terpakai = new Set(
        produk
            .map(p => (p.barcode || "").toString().trim())
            .filter(b => b !== "")
    );

    // --- EAN-13 ---
    if (format === "EAN13") {

        let kode;
        do {
            // Prefix "200" = internal use (aman, tidak bentrok GS1)
            // 9 digit dari timestamp + random
            const unik = String(
                Date.now() + Math.floor(Math.random() * 999)
            ).slice(-9);

            const base = "200" + unik; // 12 digit

            // Hitung checksum EAN-13
            let sum = 0;
            for (let i = 0; i < 12; i++) {
                sum += Number(base[i]) * (i % 2 === 0 ? 1 : 3);
            }
            const checksum = (10 - (sum % 10)) % 10;

            kode = base + checksum; // 13 digit valid

        } while (terpakai.has(kode));

        return kode;
    }

    // --- CODE128 ---
    let kode;
    do {
        // Format: PRD + YYMMDDHHMMSS + random 3 digit
        const now = new Date();
        const pad = n => String(n).padStart(2, "0");
        const stamp =
            String(now.getFullYear()).slice(-2) +
            pad(now.getMonth() + 1) +
            pad(now.getDate()) +
            pad(now.getHours()) +
            pad(now.getMinutes()) +
            pad(now.getSeconds());

        const rand = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
        kode = "PRD" + stamp + rand;

    } while (terpakai.has(kode));

    return kode;
}


/* ------------------------------------
   2. BUAT BARCODE BARU (TOMBOL UTAMA)
   Render ke canvas + tampilkan preview
------------------------------------ */
function buatBarcodeBaru() {

    const canvas = document.getElementById("barcodeCanvas");
    const box    = document.getElementById("previewBarcodeBox");
    const label  = document.getElementById("barcodeTextLabel");

    if (!canvas || !box || !label) {
        alert("Elemen preview barcode tidak ditemukan di HTML");
        return;
    }

    // Cek library JsBarcode
    if (typeof JsBarcode === "undefined") {
        alert("Library JsBarcode belum dimuat. Pastikan <script src='...jsbarcode...'> sudah ada di <head>.");
        return;
    }

    // Ambil format yang dipilih
    const formatRadio = document.querySelector('input[name="formatBarcode"]:checked');
    const format = formatRadio ? formatRadio.value : "EAN13";

    // Generate kode
    barcodeAktif = generateKodeBarcode(format);

    // Render ke canvas
    try {
        JsBarcode(canvas, barcodeAktif, {
            format: format,
            width: 2.5,
            height: 90,
            displayValue: true,
            fontSize: 16,
            margin: 10,
            background: "#ffffff",
            lineColor: "#000000"
        });
    } catch (err) {
        console.error(err);
        alert("Gagal membuat barcode: " + err.message);
        return;
    }

    // Tampilkan label & preview
    label.textContent = barcodeAktif;
    box.style.display = "flex";
}


/* ------------------------------------
   3. COPY KODE BARCODE KE CLIPBOARD
------------------------------------ */
function copyBarcodeKeClipboard() {

    if (!barcodeAktif) {
        alert("Belum ada barcode. Klik 'Buat Barcode Baru' dulu.");
        return;
    }

    // Prioritas: Clipboard API modern
    if (navigator.clipboard && navigator.clipboard.writeText) {

        navigator.clipboard.writeText(barcodeAktif)
            .then(() => alert("✅ Kode barcode disalin:\n" + barcodeAktif))
            .catch(() => fallbackCopy(barcodeAktif));

    } else {
        fallbackCopy(barcodeAktif);
    }
}

// Fallback untuk browser lama / http
function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand("copy");
        alert("✅ Kode barcode disalin:\n" + text);
    } catch (e) {
        alert("Gagal menyalin. Salin manual:\n" + text);
    }
    document.body.removeChild(ta);
}


/* ------------------------------------
   4. PRINT BARCODE
   Buka window baru berisi gambar barcode saja
------------------------------------ */
function printBarcode() {

    if (!barcodeAktif) {
        alert("Belum ada barcode untuk diprint.");
        return;
    }

    const canvas = document.getElementById("barcodeCanvas");
    if (!canvas) return;

    const dataURL = canvas.toDataURL("image/png");

    const win = window.open("", "_blank", "width=500,height=400");

    win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Print Barcode - ${barcodeAktif}</title>
            <style>
                body {
                    font-family: sans-serif;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    margin: 0;
                }
                img {
                    max-width: 100%;
                    height: auto;
                }
                .kode {
                    margin-top: 8px;
                    font-family: monospace;
                    font-size: 18px;
                    font-weight: bold;
                    letter-spacing: 2px;
                }
                @media print {
                    body { padding: 0; }
                    button { display: none; }
                }
            </style>
        </head>
        <body>
            <img src="${dataURL}" alt="Barcode">
            <div class="kode">${barcodeAktif}</div>
            <button onclick="window.print()" style="
                margin-top: 20px;
                padding: 10px 20px;
                background: #2563eb;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            ">🖨️ Print Sekarang</button>
            <script>
                // Auto-print setelah gambar load
                window.onload = function() {
                    setTimeout(function(){ window.print(); }, 300);
                };
            <\/script>
        </body>
        </html>
    `);

    win.document.close();
}


/* ------------------------------------
   5. DOWNLOAD BARCODE SEBAGAI PNG
------------------------------------ */
function downloadBarcodePNG() {

    if (!barcodeAktif) {
        alert("Belum ada barcode untuk disimpan.");
        return;
    }

    const canvas = document.getElementById("barcodeCanvas");
    if (!canvas) return;

    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");

    link.href = dataURL;
    link.download = `barcode-${barcodeAktif}.png`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}