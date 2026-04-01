// Gunakan let untuk variabel global agar bisa diupdate
let dataMember = JSON.parse(localStorage.getItem("member")) || [];

function muatDataTokoMember() {
  const dataTersimpan = localStorage.getItem("dataTokoMember");

  if (dataTersimpan) {
    const dataToko = JSON.parse(dataTersimpan);

    // Mengisi kembali nilai input jika elemennya ada di halaman
    if (document.getElementById("tokoNamaMember")) {
      document.getElementById("tokoNamaMember").value = dataToko.tokoNamaMember || "";
    }
    if (document.getElementById("tokoAlamatMember")) {
      document.getElementById("tokoAlamatMember").value = dataToko.tokoAlamatMember || "";
    }
    if (document.getElementById("tokoHpMember")) {
      document.getElementById("tokoHpMember").value = dataToko.tokoHpMember || "";
    }
    if (document.getElementById("kasirMember")) {
      document.getElementById("kasirMember").value = dataToko.kasirMember || "";
    }
    
    // Opsional: Jalankan fungsi update tampilan kartu member jika ada
    // updateTampilanKartu(dataToko); 
  }
}

// Jalankan fungsi ini setiap kali halaman di-refresh
window.addEventListener("DOMContentLoaded", muatDataTokoMember);



function generateNoMember() {
  let now = new Date();
  let tgl = now.getDate().toString().padStart(2, "0");
  let bln = (now.getMonth() + 1).toString().padStart(2, "0");
  let thn = now.getFullYear().toString().slice(-2);
  let urut = (dataMember.length + 1).toString().padStart(4, "0");
  return `${tgl}${bln}${thn}${urut}`;
}

function simpanDataMember() {
  const inpNamaMember = document.getElementById("namaMember");
  const inpHpMember = document.getElementById("hpMember");

  if (!inpNamaMember.value || !inpHpMember.value) return alert("Isi nama dan HP!");

  let configToko = JSON.parse(localStorage.getItem("dataTokoMember")) || {};

  // KONSISTENSI: Gunakan nama, hp, no
  let obj = {
    tanggal: new Date().toLocaleDateString("id-ID"),
    kasir: configToko.kasirMember || "-",
    nama: inpNamaMember.value,
    hp: inpHpMember.value,
    no: generateNoMember(),
  };

  dataMember.push(obj);
  localStorage.setItem("member", JSON.stringify(dataMember));

  tampilKartuMember(obj);
  
  inpNamaMember.value = "";
  inpHpMember.value = "";
}

function tampilKartuMember(d) {
  let configToko = JSON.parse(localStorage.getItem("dataTokoMember")) || {};
  const kartuElMember = document.getElementById("kartuMember");

  kartuElMember.style.display = "block";
  document.getElementById("btnPrintMember").style.display = "inline-block";

  document.getElementById("cardTokoMember").innerText = configToko.tokoNamaMember || "NAMA TOKO";
  document.getElementById("cardAlamatMember").innerText = configToko.tokoAlamatMember || "Alamat belum diatur";
  document.getElementById("cardHpTokoMember").innerText = "Telp: " + (configToko.tokoHpMember || "-");

  document.getElementById("cardNamaMember").innerText = "Nama: " + d.nama;
  document.getElementById("cardHpMember").innerText = "WhatsApp: " + d.hp;
  document.getElementById("cardNoMember").innerText = "ID Member: " + d.no;

  // 🔥 INI YANG PENTING
  localStorage.setItem("memberAktif", JSON.stringify(d));

  JsBarcode("#barcodeMember", d.no, {
    format: "CODE128",
    width: 2,
    height: 40,
    displayValue: false,
    background: "#ffffff"
  });
}





function downloadCSVMember() {
  // PERBAIKAN: Nama variabel yang benar
  if (dataMember.length === 0) return alert("Belum ada data member");
  
  let csv = "Tanggal;Kasir;Nama Member;No HP;No Member\n";
  dataMember.forEach((d) => {
    csv += `${d.tanggal};${d.kasir};${d.nama};'${d.hp};${d.no}\n`;
  });

  let skrg = new Date();
  let formatTanggal = `${skrg.getDate()}-${skrg.getMonth()+1}-${skrg.getFullYear()}`;

  let blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `data-member-${formatTanggal}.csv`;
  link.click();
}

function cariDataMember() {
  let key = document.getElementById("searchMember").value.toLowerCase().trim(); // Tambahkan .trim() untuk hapus spasi tak sengaja
  
  if (!key) return alert("Masukkan kata kunci");
  
  let found = dataMember.find((d) => 
    (d.nama && d.nama.toLowerCase().includes(key)) || 
    (d.no && d.no.toLowerCase().includes(key)) ||   
    (d.hp && d.hp.includes(key))
  );

  if (found) {
    tampilKartuMember(found);
  } else {
    alert("Member tidak ditemukan!");
  }
}






let scanner = null;

function startScannerMember() { // Pastikan namanya startScanner
  if (scanner) return;
  
  // Pastikan ID 'readerMember' sesuai dengan yang ada di HTML
  scanner = new Html5Qrcode("readerMember"); 
  
  scanner.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    (decodedText) => {
      // Logic jika scan berhasil
      let found = dataMember.find((d) => d.no === decodedText);
      if (found) {
          tampilKartuMember(found);
      } else {
          alert("ID Member tidak ditemukan: " + decodedText);
      }
      scanner.stop().then(() => { scanner = null; });
    }
  ).catch(err => alert("Kamera bermasalah atau izin ditolak"));
}









function printKartuMember() {
    const cardNoMember = document.getElementById("cardNoMember").innerText.replace("ID Member: ", "");
    const cardTokoMember = document.getElementById("cardTokoMember").innerText;
    const cardAlamatMember = document.getElementById("cardAlamatMember").innerText;
    const cardHpTokoMember = document.getElementById("cardHpTokoMember").innerText;
    const cardNamaMember = document.getElementById("cardNamaMember").innerText.replace("Nama: ", "");
    const cardHpMember = document.getElementById("cardHpMember").innerText.replace("WhatsApp: ", "");

    // PERBAIKAN: Cek variabel yang benar
    if (!cardNoMember) {
        alert("Pilih atau buat kartu member terlebih dahulu!");
        return;
    }

    const params = new URLSearchParams({
        noMember: cardNoMember,
        tokoMember: cardTokoMember,
        alamatMember: cardAlamatMember,
        hpTokoMember: cardHpTokoMember,
        namaMember: cardNamaMember,
        hpMember: cardHpMember
    });

    window.open("cetak-member.html?" + params.toString(), "_blank");
}