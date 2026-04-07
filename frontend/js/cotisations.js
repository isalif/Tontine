const API_URL = "http://localhost:3000/api";
let reunionId = null;
let cotisations = [];
let reunionInfo = null;

// Récupérer l'ID de la réunion depuis l'URL
window.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  reunionId = urlParams.get("reunion");

  if (!reunionId) {
    afficherAlert("Aucune réunion sélectionnée", "danger");
    document.getElementById("loading").style.display = "none";
    document.getElementById("emptyState").style.display = "block";
    return;
  }

  chargerReunion();
  chargerCotisations();
  chargerConfiguration();
});

// ====================== MODALS ======================
function ouvrirModalModification(id) {
  const cotisation = cotisations.find((c) => c.id === id);
  if (!cotisation) return;

  document.getElementById("cotisationId").value = cotisation.id;
  document.getElementById("membreNom").textContent =
    `${cotisation.nom} ${cotisation.prenom}`;
  document.getElementById("cotisationMensuelle").value =
    cotisation.cotisation_mensuelle || 0;
  document.getElementById("penalite").value = cotisation.penalite || 0;

  document.getElementById("modalCotisation").style.display = "flex";
}

function fermerModalCotisation() {
  document.getElementById("modalCotisation").style.display = "none";
  document.getElementById("cotisationForm").reset();
}

function ouvrirModalConfiguration() {
  document.getElementById("modalConfig").style.display = "flex";
}

function fermerModalConfig() {
  document.getElementById("modalConfig").style.display = "none";
}

// ====================== SOUMISSION FORMULAIRE COTISATION ======================
document
  .getElementById("cotisationForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("cotisationId").value;
    const cotisationMensuelle =
      parseFloat(document.getElementById("cotisationMensuelle").value) || 0;
    const penalite = parseFloat(document.getElementById("penalite").value) || 0;

    try {
      const response = await fetch(`${API_URL}/cotisations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cotisation_mensuelle: cotisationMensuelle,
          penalite: penalite,
        }),
      });

      const data = await response.json();

      if (data.success) {
        afficherAlert(data.message, "success");
        fermerModalCotisation();
        chargerCotisations();
      } else {
        afficherAlert(data.message, "danger");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      afficherAlert("Erreur de connexion au serveur", "danger");
    }
  });

// ====================== CHARGEMENT ======================
async function chargerReunion() {
  try {
    const response = await fetch(`${API_URL}/reunions/${reunionId}`);
    const data = await response.json();

    if (data.success) {
      reunionInfo = data.data;
      const date = new Date(reunionInfo.date_reunion);
      document.getElementById("headerDate").textContent =
        `Réunion du ${date.toLocaleDateString("fr-FR")}`;

      if (reunionInfo.statut === "cloturee") {
        const btnCloture = document.getElementById("btnCloture");
        btnCloture.disabled = true;
        btnCloture.textContent = "🔒 Réunion clôturée";
        btnCloture.style.opacity = "0.6";
      }
    }
  } catch (error) {
    console.error("Erreur chargement réunion:", error);
  }
}

async function chargerCotisations() {
  try {
    const response = await fetch(`${API_URL}/cotisations/reunion/${reunionId}`);
    const data = await response.json();

    document.getElementById("loading").style.display = "none";

    if (data.success && data.data.length > 0) {
      cotisations = data.data;
      afficherCotisations(cotisations);
      document.getElementById("cotisationsTable").style.display = "block";
      document.getElementById("emptyState").style.display = "none";
    } else {
      document.getElementById("cotisationsTable").style.display = "none";
      document.getElementById("emptyState").style.display = "block";
    }
  } catch (error) {
    console.error("Erreur chargement cotisations:", error);
    document.getElementById("loading").style.display = "none";
    afficherAlert("Erreur de connexion au serveur", "danger");
  }
}

function afficherCotisations(liste) {
  const tbody = document.getElementById("cotisationsBody");
  tbody.innerHTML = "";

  liste.forEach((c) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${c.nom} ${c.prenom}</strong></td>
      <td>${c.numero}</td>
      <td>${formatMontant(c.cotisation_mensuelle)} FCFA</td>
      <td>${formatMontant(c.penalite)} FCFA</td>
      <td><strong>${formatMontant(c.total)} FCFA</strong></td>
      <td>
        ${
          reunionInfo && reunionInfo.statut === "en_cours"
            ? `<button class="btn btn-sm btn-warning" onclick="ouvrirModalModification(${c.id})">✏️ Modifier</button>`
            : '<span style="color: #6c757d;">Réunion clôturée</span>'
        }
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function formatMontant(montant) {
  return new Intl.NumberFormat("fr-FR").format(montant || 0);
}

async function cloturerReunion() {
  if (!confirm("Êtes-vous sûr de vouloir clôturer cette réunion ?")) return;

  try {
    const response = await fetch(`${API_URL}/reunions/${reunionId}/cloture`, {
      method: "PUT",
    });
    const data = await response.json();

    if (data.success) {
      afficherAlert(data.message, "success");
      setTimeout(() => location.reload(), 1500);
    } else {
      afficherAlert(data.message, "danger");
    }
  } catch (error) {
    afficherAlert("Erreur lors de la clôture", "danger");
  }
}

async function chargerConfiguration() {
  try {
    const response = await fetch(`${API_URL}/cotisations/configuration`);
    const data = await response.json();

    if (data.success) {
      document.getElementById("configMensuelle").value =
        data.data.cotisation_mensuelle_defaut || 0;
      document.getElementById("configPenalite").value =
        data.data.penalite_retard_defaut || 0;
    }
  } catch (error) {
    console.error("Erreur configuration:", error);
  }
}

// Soumission configuration
document.getElementById("configForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    await fetch(`${API_URL}/cotisations/configuration`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cle: "cotisation_mensuelle_defaut",
        valeur: document.getElementById("configMensuelle").value,
      }),
    });

    await fetch(`${API_URL}/cotisations/configuration`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cle: "penalite_retard_defaut",
        valeur: document.getElementById("configPenalite").value,
      }),
    });

    afficherAlert("Configuration mise à jour avec succès", "success");
    fermerModalConfig();
  } catch (error) {
    afficherAlert(
      "Erreur lors de la mise à jour de la configuration",
      "danger",
    );
  }
});

function afficherAlert(message, type) {
  const alert = document.getElementById("alert");
  alert.className = `alert alert-${type} show`;
  alert.textContent = message;

  setTimeout(() => {
    alert.classList.remove("show");
  }, 5000);
}

// Fermer les modals en cliquant à l'extérieur
window.addEventListener("click", (e) => {
  const modalCotisation = document.getElementById("modalCotisation");
  const modalConfig = document.getElementById("modalConfig");

  if (e.target === modalCotisation) fermerModalCotisation();
  if (e.target === modalConfig) fermerModalConfig();
});
