const API_URL = "http://localhost:3000/api";
let reunions = [];
let reunionASupprimer = null;

// Charger les réunions au chargement
window.addEventListener("DOMContentLoaded", () => {
  chargerReunions();
  chargerProjetsEnCours();
});

async function chargerCotisationDefaut() {
  try {
    const res = await fetch(`${API_URL}/cotisations/configuration`);
    const data = await res.json();
    if (data.success && data.data.cotisation_mensuelle_defaut) {
      document.getElementById("cotisationMensuelle").value =
        data.data.cotisation_mensuelle_defaut;
    }
  } catch (e) {
    console.error("Erreur chargement config cotisation", e);
  }
}

async function chargerReunions() {
  try {
    const response = await fetch(`${API_URL}/reunions`);
    const data = await response.json();

    document.getElementById("loading").style.display = "none";

    if (data.success && data.data) {
      reunions = data.data;
      afficherReunions(reunions);
      document.getElementById("reunionsTable").style.display = "block";
      document.getElementById("emptyState").style.display = "none";
    } else {
      document.getElementById("reunionsTable").style.display = "none";
      document.getElementById("emptyState").style.display = "block";
    }
  } catch (error) {
    console.error(error);
    document.getElementById("loading").style.display = "none";
    afficherAlert("Erreur de connexion au serveur", "danger");
  }
}

function afficherReunions(reunions) {
  const tbody = document.getElementById("reunionsBody");
  tbody.innerHTML = "";

  reunions.forEach((r) => {
    const dateFormatee = new Date(r.date_reunion).toLocaleDateString("fr-FR");
    const statutBadge =
      r.statut === "en_cours"
        ? '<span style="padding: 5px 10px; background: #28a745; color: white; border-radius: 5px;">En cours</span>'
        : '<span style="padding: 5px 10px; background: #6c757d; color: white; border-radius: 5px;">Clôturée</span>';

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${r.titre || "Sans titre"}</strong></td>
      <td>${dateFormatee}</td>
      <td>${r.projet_nom || "—"}</td>
      <td>${statutBadge}</td>
      <td>
        <a href="cotisations.html?reunion=${r.id}" class="btn btn-sm btn-info">📝 Cotisations</a>
        ${
          r.statut === "en_cours"
            ? `
          <button class="btn btn-sm btn-warning" onclick="ouvrirModalModification(${r.id})">✏️ Modifier</button>
          <button class="btn btn-sm btn-warning" onclick="cloturerReunion(${r.id})">🔒 Clôturer</button>
        `
            : ""
        }
        <button class="btn btn-sm btn-danger" onclick="ouvrirModalSuppression(${r.id})">🗑️ Supprimer</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Charger les projets en cours pour le select
async function chargerProjetsEnCours() {
  try {
    const res = await fetch(`${API_URL}/projets`);
    const data = await res.json();
    const select = document.getElementById("projetId");
    select.innerHTML = '<option value="">-- Aucun projet --</option>';

    if (data.success && data.data) {
      data.data
        .filter((p) => p.statut === "en_cours")
        .forEach((p) => {
          select.innerHTML += `<option value="${p.id}">${p.nom}</option>`;
        });
    }
  } catch (e) {
    console.error("Erreur chargement projets", e);
  }
}

// Modal Création
function ouvrirModalCreation() {
  document.getElementById("modalTitle").textContent =
    "Créer une nouvelle réunion";
  document.getElementById("reunionId").value = "";
  document.getElementById("titre").value = "";
  document.getElementById("dateReunion").value = new Date()
    .toISOString()
    .split("T")[0];
  document.getElementById("projetId").value = "";
  document.getElementById("cotisationMensuelle").value = "";
  document.getElementById("champCotisation").style.display = "block";
  document.getElementById("btnSubmit").textContent = "Créer la réunion";
  chargerCotisationDefaut();
  document.getElementById("modal").style.display = "flex";
}

// Modal Modification
async function ouvrirModalModification(id) {
  try {
    const res = await fetch(`${API_URL}/reunions/${id}`);
    const data = await res.json();

    if (data.success) {
      const r = data.data;
      document.getElementById("modalTitle").textContent = "Modifier la réunion";
      document.getElementById("reunionId").value = r.id;
      document.getElementById("titre").value = r.titre || "";
      document.getElementById("dateReunion").value = r.date_reunion;
      document.getElementById("projetId").value = r.projet_id || "";
      document.getElementById("champCotisation").style.display = "none";
      document.getElementById("btnSubmit").textContent =
        "Enregistrer les modifications";
      document.getElementById("modal").style.display = "flex";
    }
  } catch (e) {
    afficherAlert("Erreur lors du chargement", "danger");
  }
}

function fermerModal() {
  document.getElementById("modal").style.display = "none";
  document.getElementById("reunionForm").reset();
}

function ouvrirModalSuppression(id) {
  reunionASupprimer = id;
  document.getElementById("modalConfirm").style.display = "flex";
}

function fermerModalConfirm() {
  reunionASupprimer = null;
  document.getElementById("modalConfirm").style.display = "none";
}

// Soumission du formulaire (Créer ou Modifier)
document.getElementById("reunionForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("reunionId").value;
  const titre = document.getElementById("titre").value.trim();
  const dateReunion = document.getElementById("dateReunion").value;
  const projetId = document.getElementById("projetId").value || null;
  const cotisationMensuelle = id
    ? null
    : parseFloat(document.getElementById("cotisationMensuelle").value) || null;

  if (!dateReunion) {
    afficherAlert("La date est obligatoire", "danger");
    return;
  }

  try {
    const url = id ? `${API_URL}/reunions/${id}` : `${API_URL}/reunions`;
    const method = id ? "PUT" : "POST";

    const body = { titre, date_reunion: dateReunion, projet_id: projetId };
    if (!id && cotisationMensuelle !== null) {
      body.cotisation_mensuelle = cotisationMensuelle;
    }

    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (data.success) {
      afficherAlert(data.message, "success");
      fermerModal();
      setTimeout(() => location.reload(), 1200);
    } else {
      afficherAlert(data.message, "danger");
    }
  } catch (error) {
    console.error("Erreur:", error);
    afficherAlert("Erreur de connexion au serveur", "danger");
  }
});

// Clôturer réunion
async function cloturerReunion(id) {
  if (!confirm("Clôturer cette réunion ?")) return;

  try {
    const res = await fetch(`${API_URL}/reunions/${id}/cloture`, {
      method: "PUT",
    });
    const data = await res.json();

    if (data.success) {
      afficherAlert(data.message, "success");
      chargerReunions();
    } else {
      afficherAlert(data.message, "danger");
    }
  } catch (e) {
    afficherAlert("Erreur lors de la clôture", "danger");
  }
}

// Confirmation suppression
async function confirmerSuppression() {
  if (!reunionASupprimer) return;

  try {
    const res = await fetch(`${API_URL}/reunions/${reunionASupprimer}`, {
      method: "DELETE",
    });
    const data = await res.json();

    if (data.success) {
      afficherAlert(data.message, "success");
      fermerModalConfirm();
      chargerReunions();
    } else {
      afficherAlert(data.message, "danger");
    }
  } catch (e) {
    afficherAlert("Erreur lors de la suppression", "danger");
  }
}

function afficherAlert(message, type) {
  const alert = document.getElementById("alert");
  alert.className = `alert alert-${type} show`;
  alert.textContent = message;
  setTimeout(() => alert.classList.remove("show"), 5000);
}

// Fermer modals en cliquant dehors
window.addEventListener("click", (e) => {
  if (e.target.id === "modal") fermerModal();
  if (e.target.id === "modalConfirm") fermerModalConfirm();
});
