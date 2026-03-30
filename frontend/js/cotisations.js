const API_URL = "http://localhost:3000/api";
let reunionId = null;
let cotisations = [];
let reunionInfo = null;
let cotisationSelectionnee = null;

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

// Charger les infos de la réunion
async function chargerReunion() {
  try {
    const response = await fetch(`${API_URL}/reunions/${reunionId}`);
    const data = await response.json();

    if (data.success) {
      reunionInfo = data.data;
      const date = new Date(reunionInfo.date_reunion);
      const dateFormatee = date.toLocaleDateString("fr-FR");
      document.getElementById(
        "headerDate"
      ).textContent = `Réunion du ${dateFormatee}`;

      // Désactiver le bouton clôture si déjà clôturée
      if (reunionInfo.statut === "cloturee") {
        const btnCloture = document.getElementById("btnCloture");
        btnCloture.disabled = true;
        btnCloture.textContent = "🔒 Réunion clôturée";
        btnCloture.style.opacity = "0.6";
        btnCloture.style.cursor = "not-allowed";
      }
    }
  } catch (error) {
    console.error("Erreur lors du chargement de la réunion:", error);
  }
}

// Charger les cotisations
async function chargerCotisations() {
  try {
    const response = await fetch(`${API_URL}/cotisations/reunion/${reunionId}`);
    const data = await response.json();

    document.getElementById("loading").style.display = "none";

    if (data.success && data.data.length > 0) {
      cotisations = data.data;
      afficherCotisations(cotisations);
      calculerTotaux();
      document.getElementById("cotisationsTable").style.display = "block";
    } else {
      document.getElementById("emptyState").style.display = "block";
    }
  } catch (error) {
    console.error("Erreur lors du chargement des cotisations:", error);
    document.getElementById("loading").style.display = "none";
    afficherAlert("Erreur de connexion au serveur", "danger");
  }
}

function afficherCotisations(cotisations) {
  const tbody = document.getElementById("cotisationsBody");
  tbody.innerHTML = "";

  cotisations.forEach((cotisation) => {
    const presenceBadge = cotisation.present
      ? '<span style="padding: 5px 10px; background: #28a745; color: white; border-radius: 5px;">✓ Présent</span>'
      : '<span style="padding: 5px 10px; background: #dc3545; color: white; border-radius: 5px;">✗ Absent</span>';

    // Vérifier si le membre est abonné annuel
    const estAbonneAnnuel =
      cotisation.abonne_annuel === 1 || cotisation.abonne_annuel === true;

    // Affichage pour cotisation mensuelle
    let affichageMensuelle;
    if (estAbonneAnnuel) {
      affichageMensuelle =
        '<span style="padding: 5px 10px; background: #17a2b8; color: white; border-radius: 5px; font-weight: bold;">PAYÉ</span>';
    } else {
      affichageMensuelle =
        formatMontant(cotisation.cotisation_mensuelle) + " FCFA";
    }
    // Affichage pour cotisation spéciale
    const estCotisationSpecialePayee =
      cotisation.cotisation_speciale_payee === 1 ||
      cotisation.cotisation_speciale_payee === true;

    let affichageSpeciale;
    if (estCotisationSpecialePayee) {
      affichageSpeciale =
        '<span style="padding: 5px 10px; background: #17a2b8; color: white; border-radius: 5px; font-weight: bold;">PAYÉ</span>';
    } else {
      affichageSpeciale =
        formatMontant(cotisation.cotisation_speciale) + " FCFA";
    }
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td><strong>${cotisation.nom} ${cotisation.prenom}</strong></td>
            <td>${cotisation.numero}</td>
            <td>${presenceBadge}</td>
            <td>${affichageMensuelle}</td>
            <td>${affichageSpeciale}</td>
            <td>${formatMontant(cotisation.penalite)} FCFA</td>
            <td><strong>${formatMontant(cotisation.total)} FCFA</strong></td>
            <td>
                ${
                  reunionInfo && reunionInfo.statut === "en_cours"
                    ? `
                    <button class="btn btn-sm btn-warning" onclick="ouvrirModalModification(${
                      cotisation.id
                    })">✏️ Modifier</button>
                    <button class="btn btn-sm ${
                      cotisation.present ? "btn-danger" : "btn-success"
                    }" 
                            onclick="togglePresence(${reunionId}, ${
                        cotisation.membre_id
                      }, ${!cotisation.present})">
                        ${
                          cotisation.present
                            ? "✗ Marquer absent"
                            : "✓ Marquer présent"
                        }
                    </button>
                `
                    : '<span style="color: #6c757d;">Réunion clôturée</span>'
                }
            </td>
        `;
    tbody.appendChild(tr);
  });
}

// Calculer les totaux
function calculerTotaux() {
  let totalMensuelle = 0;
  let totalSpeciale = 0;
  let totalPenalite = 0;
  let totalGeneral = 0;

  cotisations.forEach((c) => {
    totalMensuelle += parseFloat(c.cotisation_mensuelle) || 0;
    totalSpeciale += parseFloat(c.cotisation_speciale) || 0;
    totalPenalite += parseFloat(c.penalite) || 0;
    totalGeneral += parseFloat(c.total) || 0;
  });

  document.getElementById("totalMensuelle").textContent = `${formatMontant(
    totalMensuelle
  )} FCFA`;
  document.getElementById("totalSpeciale").textContent = `${formatMontant(
    totalSpeciale
  )} FCFA`;
  document.getElementById("totalPenalite").textContent = `${formatMontant(
    totalPenalite
  )} FCFA`;
  document.getElementById("totalGeneral").textContent = `${formatMontant(
    totalGeneral
  )} FCFA`;
}

// Formater les montants
function formatMontant(montant) {
  return new Intl.NumberFormat("fr-FR").format(montant);
}

// Ouvrir le modal de modification
function ouvrirModalModification(id) {
  const cotisation = cotisations.find((c) => c.id === id);
  if (!cotisation) return;

  cotisationSelectionnee = cotisation;

  document.getElementById("cotisationId").value = cotisation.id;
  document.getElementById(
    "membreNom"
  ).textContent = `${cotisation.nom} ${cotisation.prenom}`;
  document.getElementById("cotisationMensuelle").value =
    cotisation.cotisation_mensuelle;
  document.getElementById("cotisationSpeciale").value =
    cotisation.cotisation_speciale;
  document.getElementById("penalite").value = cotisation.penalite;
  document.getElementById("modalCotisation").classList.add("show");
}

// Fermer le modal de cotisation
function fermerModalCotisation() {
  document.getElementById("modalCotisation").classList.remove("show");
  document.getElementById("cotisationForm").reset();
  cotisationSelectionnee = null;
}

// Soumettre le formulaire de cotisation
document
  .getElementById("cotisationForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("cotisationId").value;
    const cotisationMensuelle = parseFloat(
      document.getElementById("cotisationMensuelle").value
    );
    const cotisationSpeciale = parseFloat(
      document.getElementById("cotisationSpeciale").value
    );
    const penalite = parseFloat(document.getElementById("penalite").value);

    try {
      const response = await fetch(`${API_URL}/cotisations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cotisation_mensuelle: cotisationMensuelle,
          cotisation_speciale: cotisationSpeciale,
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

// Toggle présence
async function togglePresence(reunionId, membreId, present) {
  try {
    const response = await fetch(
      `${API_URL}/cotisations/presence/${reunionId}/${membreId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ present }),
      }
    );

    const data = await response.json();

    if (data.success) {
      afficherAlert(data.message, "success");
      chargerCotisations();
    } else {
      afficherAlert(data.message, "danger");
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la présence:", error);
    afficherAlert("Erreur de connexion au serveur", "danger");
  }
}

// Clôturer la réunion
async function cloturerReunion() {
  if (
    !confirm(
      "Êtes-vous sûr de vouloir clôturer cette réunion ? Elle ne pourra plus être modifiée."
    )
  ) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/reunions/${reunionId}/cloture`, {
      method: "PUT",
    });

    const data = await response.json();

    if (data.success) {
      afficherAlert(data.message, "success");
      setTimeout(() => {
        location.reload();
      }, 1500);
    } else {
      afficherAlert(data.message, "danger");
    }
  } catch (error) {
    console.error("Erreur lors de la clôture:", error);
    afficherAlert("Erreur de connexion au serveur", "danger");
  }
}

// Charger la configuration
async function chargerConfiguration() {
  try {
    const response = await fetch(`${API_URL}/cotisations/configuration`);
    const data = await response.json();

    if (data.success) {
      // Pré-remplir le modal de configuration
      document.getElementById("configMensuelle").value =
        data.data.cotisation_mensuelle_defaut || 0;
      document.getElementById("configSpeciale").value =
        data.data.cotisation_speciale_defaut || 0;
      document.getElementById("configPenalite").value =
        data.data.penalite_retard_defaut || 0;
    }
  } catch (error) {
    console.error("Erreur lors du chargement de la configuration:", error);
  }
}

// Ouvrir le modal de configuration
function ouvrirModalConfiguration() {
  document.getElementById("modalConfig").classList.add("show");
}

// Fermer le modal de configuration
function fermerModalConfig() {
  document.getElementById("modalConfig").classList.remove("show");
}

// Soumettre le formulaire de configuration
document.getElementById("configForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const configMensuelle = document.getElementById("configMensuelle").value;
  const configSpeciale = document.getElementById("configSpeciale").value;
  const configPenalite = document.getElementById("configPenalite").value;

  try {
    // Mettre à jour chaque configuration
    await fetch(`${API_URL}/cotisations/configuration`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cle: "cotisation_mensuelle_defaut",
        valeur: configMensuelle,
      }),
    });

    await fetch(`${API_URL}/cotisations/configuration`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cle: "cotisation_speciale_defaut",
        valeur: configSpeciale,
      }),
    });

    await fetch(`${API_URL}/cotisations/configuration`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cle: "penalite_retard_defaut",
        valeur: configPenalite,
      }),
    });

    afficherAlert("Configuration mise à jour avec succès", "success");
    fermerModalConfig();
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la configuration:", error);
    afficherAlert("Erreur de connexion au serveur", "danger");
  }
});

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
  const modalCotisation = document.getElementById("modalCotisation");
  const modalConfig = document.getElementById("modalConfig");

  if (e.target === modalCotisation) {
    fermerModalCotisation();
  }

  if (e.target === modalConfig) {
    fermerModalConfig();
  }
});
