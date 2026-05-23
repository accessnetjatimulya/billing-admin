// ==========================================
// CONFIG: PASTE URL WEB APP APPS SCRIPT DI SINI
// ==========================================
const URL_APPS_SCRIPT = "https://script.google.com/macros/s/AKfycbwdx5oSOQvTu4hu3OzdsXU3K5WMRpKlltRcKtjUNoX_tOSexfjKwyGndU8-zwlC_jWt/exec";

// Fungsi Global Jembatan API
function callAPI(action, data, onSuccess, onFailure) {
  const payload = { action: action, data: data };
  fetch(URL_APPS_SCRIPT, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(response => {
    if (response.status === "error") {
      if (onFailure) onFailure(response.message);
      else alert("Error: " + response.message);
    } else {
      if (onSuccess) onSuccess(response.data);
    }
  })
  .catch(err => {
    console.error(err);
    if (onFailure) onFailure(err);
    else alert("Gagal terhubung ke server backend.");
  });
}

// Fungsi Otomatis Render Topbar & Sidebar di setiap halaman
function renderNavigation(activeMenu) {
  const topbarHtml = `
    <div class="mobile-topbar">
      <h5 class="mb-0">ACCESSNET</h5>
      <button class="btn btn-outline-light btn-sm" type="button" onclick="toggleSidebar()">☰ Menu</button>
    </div>
  `;

  const sidebarHtml = `
    <div class="sidebar" id="sidebarMenu">
      <h4 class="text-center mb-4 d-none d-lg-block">ACCESSNET</h4>
      <hr class="text-white d-none d-lg-block">
      <a href="index.html" class="btn btn-sidebar ${activeMenu === 'dashboard' ? 'active' : ''}">📊 Dashboard</a>
      <a href="pelanggan.html" class="btn btn-sidebar ${activeMenu === 'pelanggan' ? 'active' : ''}">👥 Data Pelanggan</a>
      <a href="invoice-tagihan.html" class="btn btn-sidebar ${activeMenu === 'invoice-tagihan' ? 'active' : ''}">🧾 Invoice Tagihan</a>
      <a href="data-invoice.html" class="btn btn-sidebar ${activeMenu === 'data-invoice' ? 'active' : ''}">📁 Data Invoice Tersimpan</a>
	  <button onclick="logoutAccessnet()" class="btn btn-sidebar text-danger">🚪 Logout</button>
    </div>
  `;

  document.body.insertAdjacentHTML('afterbegin', sidebarHtml);
  document.body.insertAdjacentHTML('afterbegin', topbarHtml);
}

function toggleSidebar() {
  document.getElementById('sidebarMenu').classList.toggle('show');
}

// ==========================================
// SESSION LOGIN ACCESSNET
// ==========================================

function checkLogin() {

  const session = localStorage.getItem('ACCESSNET_LOGIN');
  const currentPage = window.location.pathname.split("/").pop() || 'index.html';

  if(currentPage === 'login.html'){

    if(session === 'LOGIN_OK'){
      window.location.replace('index.html');
      return false;
    }

    return true;
  }

  if(session !== 'LOGIN_OK'){
    window.location.replace('login.html');
    return false;
  }

  return true;
}

function logoutAccessnet() {
  localStorage.removeItem('ACCESSNET_LOGIN');
  window.location.replace('login.html');
}
