/* Fonctions partagées par toutes les pages : API, toasts, modales, formatage. */

const API = "/api";

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
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
  success: "✓",
  danger: "✕",
  warning: "⚠",
  info: "ℹ",
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
        <button type="button" class="modal-close" data-close="__confirmModal">✕</button>
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

document.addEventListener("DOMContentLoaded", initSidebar);
