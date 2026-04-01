document.addEventListener("DOMContentLoaded", renderDashboard);

function renderDashboard() {
  const elProduk = document.getElementById("totalProduk");
  if (!elProduk) return; // ⛔ bukan dashboard

  const produk = getProduk();
  const transaksi = getTransaksi();

  let omzet = 0;
  let laba = 0;

  transaksi.forEach(t => {
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
  deferredPrompt.userChoice.then(choice => {
    if (choice.outcome === "accepted") {
      console.log("App installed");
    }
  });
});


/*window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("splash").style.display = "none";
  }, 1500);
});*/





/*document.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  }
});*/



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
  return data ? JSON.parse(data) : {
    nama: "",
    alamat: "",
    aditional: ""
  };
}

function savePengaturanToko(data) {
  localStorage.setItem("pengaturanToko", JSON.stringify(data));
}










function simpanPengaturanToko() {
  const nama = document.getElementById("namaToko").value;
  const alamat = document.getElementById("alamatToko").value;
  const additional = document.getElementById("additionalToko").value;

  if (!nama || !alamat) {
    alert("Nama dan alamat harus diisi");
    return;
  }

  savePengaturanToko({ nama, alamat, additional });

  alert("Pengaturan toko berhasil disimpan");
}












function loadPengaturanToko() {
  const toko = getPengaturanToko();

  document.getElementById("namaToko").value = toko.nama;
  document.getElementById("alamatToko").value = toko.alamat;
  document.getElementById("additionalToko").value = toko.additional;
}

document.addEventListener("DOMContentLoaded", loadPengaturanToko);