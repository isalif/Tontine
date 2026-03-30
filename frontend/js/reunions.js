const API_URL = "http://localhost:3000/api";
let reunions = [];
let reunionASupprimer = null;

// Charger les réunions au chargement de la page
window.addEventListener("DOMContentLoaded", () => {
  chargerReunions();
});

// Charger toutes les réunions
async function chargerReunions() {
  try {
    const response = await fetch(`${API_URL}/reunions`);
    const data = await response.json();

    document.getElementById("loading").style.display = "none";

    if (data.success && data.data.length > 0) {
      reunions = data.data;
      afficherReunions(reunions);
      document.getElementById("reunionsTable").style.display = "block";
    } else {
      document.getElementById("emptyState").style.display = "block";
    }
  } catch (error) {
    console.error("Erreur lors du chargement des réunions:", error);
    document.getElementById("loading").style.display = "none";
    afficherAlert("Erreur de connexion au serveur", "danger");
  }
}

// Afficher les réunions dans le tableau
function afficherReunions(reunions) {
  const tbody = document.getElementById("reunionsBody");
  tbody.innerHTML = "";

  reunions.forEach((reunion) => {
    const date = new Date(reunion.date_reunion);
    const dateFormatee = date.toLocaleDateString("fr-FR");

    const statutBadge =
      reunion.statut === "en_cours"
        ? '<span style="padding: 5px 10px; background: #28a745; color: white; border-radius: 5px; font-size: 0.9rem;">En cours</span>'
        : '<span style="padding: 5px 10px; background: #6c757d; color: white; border-radius: 5px; font-size: 0.9rem;">Clôturée</span>';

    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td><strong>${dateFormatee}</strong></td>
            <td>${statutBadge}</td>
            <td>
                <a href="cotisations.html?reunion=${
                  reunion.id
                }" class="btn btn-sm btn-info">📝 Gérer les cotisations</a>
                ${
                  reunion.statut === "en_cours"
                    ? `<button class="btn btn-sm btn-warning" onclick="cloturerReunion(${reunion.id})">🔒 Clôturer</button>`
                    : ""
                }
                <button class="btn btn-sm btn-danger" onclick="ouvrirModalSuppression(${
                  reunion.id
                })">🗑️ Supprimer</button>
            </td>
        `;
    tbody.appendChild(tr);
  });
}

// Ouvrir le modal de création
function ouvrirModalCreation() {
  document.getElementById("reunionForm").reset();
  document.getElementById("modal").classList.add("show");
}

// Fermer le modal
function fermerModal() {
  document.getElementById("modal").classList.remove("show");
  document.getElementById("reunionForm").reset();
}

// Soumettre le formulaire de création
document.getElementById("reunionForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const dateReunion = document.getElementById("dateReunion").value;

  if (!dateReunion) {
    afficherAlert("Veuillez sélectionner une date", "danger");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/reunions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ date_reunion: dateReunion }),
    });

    const data = await response.json();

    if (data.success) {
      afficherAlert(data.message, "success");
      fermerModal();
      // Recharger la page pour afficher la nouvelle réunion
      setTimeout(() => {
        location.reload();
      }, 1500);
    } else {
      afficherAlert(data.message, "danger");
    }
  } catch (error) {
    console.error("Erreur lors de la création:", error);
    afficherAlert("Erreur de connexion au serveur", "danger");
  }
});

// Clôturer une réunion
async function cloturerReunion(id) {
  if (
    !confirm(
      "Êtes-vous sûr de vouloir clôturer cette réunion ? Elle ne pourra plus être modifiée."
    )
  ) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/reunions/${id}/cloture`, {
      method: "PUT",
    });

    const data = await response.json();

    if (data.success) {
      afficherAlert(data.message, "success");
      chargerReunions();
    } else {
      afficherAlert(data.message, "danger");
    }
  } catch (error) {
    console.error("Erreur lors de la clôture:", error);
    afficherAlert("Erreur de connexion au serveur", "danger");
  }
}

// Ouvrir le modal de confirmation de suppression
function ouvrirModalSuppression(id) {
  reunionASupprimer = id;
  document.getElementById("modalConfirm").classList.add("show");
}

// Fermer le modal de confirmation
function fermerModalConfirm() {
  reunionASupprimer = null;
  document.getElementById("modalConfirm").classList.remove("show");
}

// Confirmer la suppression
async function confirmerSuppression() {
  if (!reunionASupprimer) return;

  try {
    const response = await fetch(`${API_URL}/reunions/${reunionASupprimer}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (data.success) {
      afficherAlert(data.message, "success");
      fermerModalConfirm();
      chargerReunions();
    } else {
      afficherAlert(data.message, "danger");
    }
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    afficherAlert("Erreur de connexion au serveur", "danger");
  }
}

// Afficher une alerte
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
  const modal = document.getElementById("modal");
  const modalConfirm = document.getElementById("modalConfirm");

  if (e.target === modal) {
    fermerModal();
  }

  if (e.target === modalConfirm) {
    fermerModalConfirm();
  }
});
