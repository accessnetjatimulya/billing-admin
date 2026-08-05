// ==========================================
// CONFIG: PASTE URL WEB APP APPS SCRIPT DI SINI
// ==========================================
const URL_APPS_SCRIPT = "https://script.google.com/macros/s/AKfycbypxb5ZltraXavUnGyWMneAGWnncXTPJZO3QnB6Z74HsYNi_boxx5zhlg85--tB2A-S/exec";

// ==========================================
// FUNGSI GLOBAL JEMBATAN API (PERBAIKAN BUG CACHE KOSONG)
// ==========================================
function callAPI(action, data, onSuccess, onFailure) {
  const CACHEABLE_ACTIONS = ['getPelangganData', 'getDataInvoice', 'getPaket', 'getRevenueStats'];
  const MUTATION_ACTIONS = [
    'savePelanggan', 'deletePelanggan', 
    'simpanInvoice', 'deleteInvoice', 'rollbackInvoice', 
    'savePaket', 'deletePaket'
  ];

  const cacheKey = "CACHE_APP_" + action;

  // 1. Invalidasi cache jika ada mutasi
  if (MUTATION_ACTIONS.includes(action)) {
    CACHEABLE_ACTIONS.forEach(act => localStorage.removeItem("CACHE_APP_" + act));
  }

  // 2. Cek Cache LocalStorage
  let hasServedFromCache = false;
  if (CACHEABLE_ACTIONS.includes(action)) {
    const localData = localStorage.getItem(cacheKey);
    if (localData) {
      try {
        const parsedData = JSON.parse(localData);
        if (parsedData && Array.isArray(parsedData) && parsedData.length > 0) {
          hasServedFromCache = true;
          if (typeof onSuccess === 'function') onSuccess(parsedData);
        }
      } catch (e) {
        localStorage.removeItem(cacheKey);
      }
    }
  }

  // 3. Fetch ke Google Apps Script
  const payload = { action: action, data: data };

  fetch(URL_APPS_SCRIPT, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  })
  .then(async res => {
    const textResponse = await res.text();
    if (textResponse.trim().startsWith("<")) {
      throw new Error("Server Apps Script mengembalikan HTML. Cek akses deployment 'Anyone'.");
    }
    try {
      return JSON.parse(textResponse);
    } catch (e) {
      throw new Error("Gagal menguraikan JSON: " + e.message);
    }
  })
  .then(response => {
    if (response.status === "error") {
      if (onFailure) onFailure(response.message);
      else alert("Error Server: " + response.message);
    } else {
      // Simpan ke Cache
      if (CACHEABLE_ACTIONS.includes(action)) {
        try {
          localStorage.setItem(cacheKey, JSON.stringify(response.data));
        } catch (e) {
          console.warn("Storage Penuh:", e);
        }
      }

      // Panggil onSuccess JIKA belum disajikan dari cache ATAU jika data server ada
      if (!hasServedFromCache || (response.data && response.data.length > 0)) {
        if (onSuccess) onSuccess(response.data);
      }
    }
  })
  .catch(err => {
    console.error("Detail Error API:", err);
    if (!hasServedFromCache) {
      if (onFailure) onFailure(err.message || err);
    }
  });
}

// Fungsi Otomatis Render Topbar & Sidebar di setiap halaman
function renderNavigation(activeMenu) {
  const topbarHtml = `
    <div class="mobile-topbar">
      <img src="logo-accessnet.png" alt="ACCESSNET Logo" style="height: 32px; object-fit: contain;">
      <button class="btn btn-outline-light btn-sm" type="button" onclick="toggleSidebar()">☰ Menu</button>
    </div>
  `;

  const sidebarHtml = `
    <div class="sidebar" id="sidebarMenu">
      <div class="text-center mb-4 d-none d-lg-block">
        <img src="logo-accessnet.png" alt="ACCESSNET Logo" style="max-width: 80%; height: auto;">
      </div>
      <hr class="text-white d-none d-lg-block">
      <a href="index.html" class="btn btn-sidebar ${activeMenu === 'dashboard' ? 'active' : ''}">📊 Dashboard</a>
      <a href="pelanggan.html" class="btn btn-sidebar ${activeMenu === 'pelanggan' ? 'active' : ''}">👥 Data Pelanggan</a>
      <a href="paketinternet.html" class="btn btn-sidebar ${activeMenu === 'paket-internet' ? 'active' : ''}">📦 Paket Internet</a>
      <a href="invoice-tagihan.html" class="btn btn-sidebar ${activeMenu === 'invoice-tagihan' ? 'active' : ''}">📄 Invoice Tagihan</a>
      <a href="data-invoice.html" class="btn btn-sidebar ${activeMenu === 'data-invoice' ? 'active' : ''}">📁 Data Invoice</a>
      <button onclick="logoutAccessnet()" class="btn btn-sidebar text-danger">🚪 Logout</button>
	  <div class="mt-4 pt-3 border-top text-white-50 small text-left" style="font-size: 0.78rem; line-height: 1.4;">
        <span class="d-block fw-bold fst-italic text-light ">Lakukan refres halaman setelah edit,hapus,tambah karena adanya batasan loading beberapa detik dari Google Script</span>
      </div>	  
	  <div class="mt-4 pt-3 border-top text-white-50 small text-center" style="font-size: 0.78rem; line-height: 1.4;">
        <span class="d-block fw-bold text-light">ACCESSNET BILLING</span>
        <span>Version 2.0 &bull; Cloud System</span><br>
        <span class="fst-italic">&copy; 2026 All Rights Reserved</span>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('afterbegin', sidebarHtml);
  document.body.insertAdjacentHTML('afterbegin', topbarHtml);
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebarMenu');
  if (sidebar) sidebar.classList.toggle('show');
}

// ==========================================
// SESSION LOGIN ACCESSNET
// ==========================================

function checkLogin() {
  const session = localStorage.getItem('ACCESSNET_LOGIN');
  const currentPage = window.location.pathname.split("/").pop() || 'index.html';

  if (currentPage === 'login.html') {
    if (session === 'LOGIN_OK') {
      window.location.replace('index.html');
      return false;
    }
    return true;
  }

  if (session !== 'LOGIN_OK') {
    window.location.replace('login.html');
    return false;
  }

  return true;
}

function logoutAccessnet() {
  localStorage.removeItem('ACCESSNET_LOGIN');
  window.location.replace('login.html');
}