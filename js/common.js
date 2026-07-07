/* Fonctions partagées par toutes les pages : API, toasts, modales, formatage. */

const API = "/api";

async function apiFetch(path, options = {}) {
  const { headers, ...rest } = options;
  const isFormData = rest.body instanceof FormData;
  const finalHeaders = isFormData
    ? { ...headers }
    : { "Content-Type": "application/json", ...headers };

  const response = await fetch(`${API}${path}`, {
    headers: finalHeaders,
    ...rest,
  });

  const isAuthEndpoint = path.startsWith("/auth/login") || path.startsWith("/auth/register");
  if (response.status === 401 && !isAuthEndpoint) {
    window.location.href = "/login";
  }

  return response.json();
}

function formatMontant(montant) {
  return new Intl.NumberFormat("fr-FR").format(Number(montant) || 0);
}

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-FR");
}

/* ---------------------------- Toasts ---------------------------- */

const TOAST_ICONS = {
  success: '<i class="fa-solid fa-check"></i>',
  danger: '<i class="fa-solid fa-xmark"></i>',
  warning: '<i class="fa-solid fa-triangle-exclamation"></i>',
  info: '<i class="fa-solid fa-circle-info"></i>',
};

function toast(message, type = "info") {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span>${TOAST_ICONS[type] || ""}</span><span>${message}</span>`;
  container.appendChild(el);

  setTimeout(() => {
    el.classList.add("leaving");
    setTimeout(() => el.remove(), 200);
  }, 4000);
}

// Compat avec l'ancien système d'alerte en bandeau (#alert), si présent sur la page.
function afficherAlert(message, type) {
  const alertEl = document.getElementById("alert");
  if (alertEl) {
    alertEl.className = `alert alert-${type} show`;
    alertEl.textContent = message;
    setTimeout(() => alertEl.classList.remove("show"), 5000);
  }
  toast(message, type === "error" ? "danger" : type);
}

/* ---------------------------- Modales ---------------------------- */

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = "flex";
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = "none";
}

document.addEventListener("click", (e) => {
  if (e.target.classList && e.target.classList.contains("modal")) {
    closeModal(e.target.id);
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal").forEach((modal) => {
      if (modal.style.display === "flex") modal.style.display = "none";
    });
  }
});

// Modale de confirmation générique, injectée une seule fois dans le DOM.
function ensureConfirmModal() {
  if (document.getElementById("__confirmModal")) return;

  const modal = document.createElement("div");
  modal.id = "__confirmModal";
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content modal-small">
      <div class="modal-header">
        <h2 id="__confirmTitle">Confirmation</h2>
        <button type="button" class="modal-close" data-close="__confirmModal"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="modal-body-center">
        <p id="__confirmMessage" class="text-lg"></p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" id="__confirmCancel">Annuler</button>
        <button type="button" class="btn btn-danger" id="__confirmOk">Confirmer</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function confirmModal({ title = "Confirmation", message, confirmText = "Confirmer" } = {}) {
  ensureConfirmModal();
  const modal = document.getElementById("__confirmModal");
  document.getElementById("__confirmTitle").textContent = title;
  document.getElementById("__confirmMessage").textContent = message || "";
  const okBtn = document.getElementById("__confirmOk");
  okBtn.textContent = confirmText;

  return new Promise((resolve) => {
    const cleanup = (result) => {
      modal.style.display = "none";
      okBtn.removeEventListener("click", onOk);
      cancelBtn.removeEventListener("click", onCancel);
      closeBtn.removeEventListener("click", onCancel);
      resolve(result);
    };
    const onOk = () => cleanup(true);
    const onCancel = () => cleanup(false);

    const cancelBtn = document.getElementById("__confirmCancel");
    const closeBtn = modal.querySelector(".modal-close");

    okBtn.addEventListener("click", onOk);
    cancelBtn.addEventListener("click", onCancel);
    closeBtn.addEventListener("click", onCancel);

    modal.style.display = "flex";
  });
}

/* Boutons de fermeture génériques : <button data-close="modalId"> */
document.addEventListener("click", (e) => {
  const closeTarget = e.target.closest("[data-close]");
  if (closeTarget) closeModal(closeTarget.dataset.close);
});

/* ---------------------------- Sidebar ---------------------------- */

function initSidebar() {
  const shell = document.querySelector(".app-shell");
  const toggle = document.getElementById("sidebarToggle");
  const backdrop = document.querySelector(".sidebar-backdrop");

  if (toggle && shell) {
    toggle.addEventListener("click", () => shell.classList.toggle("sidebar-open"));
  }
  if (backdrop && shell) {
    backdrop.addEventListener("click", () => shell.classList.remove("sidebar-open"));
  }

  const currentPage = document.body.dataset.page;
  document.querySelectorAll(".nav-link").forEach((link) => {
    if (link.dataset.page === currentPage) link.classList.add("active");
  });
}

function initials(nom, prenom) {
  return `${(prenom || "").charAt(0)}${(nom || "").charAt(0)}`.toUpperCase() || "?";
}

// Lancé immédiatement (avant même DOMContentLoaded) pour que le rôle soit connu
// le plus tôt possible. Les scripts de page font `await window.currentUserReady`
// avant de décider quoi afficher, pour éviter un flash d'éléments admin.
window.currentUserReady = (async () => {
  try {
    const data = await apiFetch("/auth/me");
    window.currentUser = data.success ? data.data : null;
  } catch (e) {
    window.currentUser = null;
  }
  return window.currentUser;
})();

function renderSidebarUser(user) {
  const nameEl = document.getElementById("sidebarUserName");
  const avatarEl = document.getElementById("sidebarUserAvatar");
  const logoutBtn = document.getElementById("sidebarLogout");
  if (!nameEl && !avatarEl && !logoutBtn) return;

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await apiFetch("/auth/logout", { method: "POST" });
      window.location.href = "/login";
    });
  }

  if (!user) return;

  if (nameEl) nameEl.textContent = `${user.prenom} ${user.nom}`;
  if (avatarEl) {
    if (user.photo) {
      avatarEl.outerHTML = `<img src="/uploads/avatars/${user.photo}" alt="" class="sidebar-user-avatar" id="sidebarUserAvatar" />`;
    } else {
      avatarEl.textContent = initials(user.nom, user.prenom);
    }
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  initSidebar();
  renderSidebarUser(await window.currentUserReady);
});
