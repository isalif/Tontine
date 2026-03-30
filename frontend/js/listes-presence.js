const API_URL = "http://localhost:3000/api";
let listes = [];
let tousLesMembres = [];

// Charger les listes au chargement de la page
window.addEventListener("DOMContentLoaded", () => {
  chargerListes();
  chargerMembres();
});

// Charger toutes les listes
async function chargerListes() {
  try {
    const response = await fetch(`${API_URL}/listes-presence`);
    const data = await response.json();

    document.getElementById("loading").style.display = "none";

    if (data.success && data.data.length > 0) {
      listes = data.data;
      afficherListes(listes);
      document.getElementById("listesTable").style.display = "block";
    } else {
      document.getElementById("emptyState").style.display = "block";
    }
  } catch (error) {
    console.error("Erreur lors du chargement des listes:", error);
    document.getElementById("loading").style.display = "none";
    afficherAlert("Erreur de connexion au serveur", "danger");
  }
}

// Charger tous les membres
async function chargerMembres() {
  try {
    const response = await fetch(`${API_URL}/membres`);
    const data = await response.json();

    if (data.success) {
      tousLesMembres = data.data;
    }
  } catch (error) {
    console.error("Erreur lors du chargement des membres:", error);
  }
}

// Afficher les listes dans le tableau
function afficherListes(listes) {
  const tbody = document.getElementById("listesBody");
  tbody.innerHTML = "";

  listes.forEach((liste) => {
    const date = new Date(liste.date_liste);
    const dateFormatee = date.toLocaleDateString("fr-FR");

    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td><strong>${dateFormatee}</strong></td>
            <td>${liste.titre || "Réunion"}</td>
            <td>${liste.nombre_membres} membre(s)</td>
            <td>
                <button class="btn btn-sm btn-success" onclick="telechargerPDF(${
                  liste.id
                })">📥 Télécharger PDF</button>
                <button class="btn btn-sm btn-danger" onclick="supprimerListe(${
                  liste.id
                })">🗑️ Supprimer</button>
            </td>
        `;
    tbody.appendChild(tr);
  });
}

// Ouvrir le modal de création
function ouvrirModalCreation() {
  // Pré-remplir la date avec aujourd'hui
  const aujourdhui = new Date().toISOString().split("T")[0];
  document.getElementById("dateListe").value = aujourdhui;
  document.getElementById("titreListe").value = "";

  // Afficher les checkboxes des membres
  const container = document.getElementById("membresCheckboxes");
  container.innerHTML = "";

  if (tousLesMembres.length === 0) {
    container.innerHTML =
      '<p style="color: #dc3545;">Aucun membre disponible. Ajoutez d\'abord des membres.</p>';
  } else {
    tousLesMembres.forEach((membre) => {
      const div = document.createElement("div");
      div.style.marginBottom = "10px";
      div.innerHTML = `
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" value="${membre.id}" style="margin-right: 10px; width: 18px; height: 18px;">
                    <span><strong>${membre.nom} ${membre.prenom}</strong> - ${membre.numero}</span>
                </label>
            `;
      container.appendChild(div);
    });
  }

  document.getElementById("modal").classList.add("show");
}

// Fermer le modal
function fermerModal() {
  document.getElementById("modal").classList.remove("show");
  document.getElementById("listeForm").reset();
}

// Soumettre le formulaire
document.getElementById("listeForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const dateListe = document.getElementById("dateListe").value;
  const titre = document.getElementById("titreListe").value || "Réunion";

  // Récupérer les membres cochés
  const checkboxes = document.querySelectorAll(
    '#membresCheckboxes input[type="checkbox"]:checked'
  );
  const membresIds = Array.from(checkboxes).map((cb) => parseInt(cb.value));

  // Validation
  if (membresIds.length === 0) {
    afficherAlert("Veuillez sélectionner au moins un membre", "danger");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/listes-presence`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date_liste: dateListe,
        titre: titre,
        membres_ids: membresIds,
      }),
    });

    const data = await response.json();

    if (data.success) {
      afficherAlert(data.message, "success");
      fermerModal();
      // Recharger la page
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

// Télécharger le PDF
async function telechargerPDF(listeId) {
  try {
    afficherAlert("Génération du PDF en cours...", "info");

    // Récupérer les détails de la liste
    const response = await fetch(`${API_URL}/listes-presence/${listeId}`);
    const data = await response.json();

    if (!data.success) {
      afficherAlert("Erreur lors de la récupération de la liste", "danger");
      return;
    }

    const liste = data.data;
    const date = new Date(liste.date_liste);
    const dateFormatee = date.toLocaleDateString("fr-FR");

    // Créer le PDF avec jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Titre du document
    doc.setFontSize(20);
    doc.setFont(undefined, "bold");
    doc.text("LISTE DE PRESENCE", 105, 20, { align: "center" });

    // Date
    doc.setFontSize(12);
    doc.setFont(undefined, "normal");
    doc.text("Date : " + dateFormatee, 105, 30, { align: "center" });

    // Titre de la réunion (si existe)
    if (liste.titre && liste.titre !== "Réunion") {
      doc.text(liste.titre, 105, 37, { align: "center" });
    }

    // Ligne de séparation
    doc.setLineWidth(0.5);
    doc.line(20, 42, 190, 42);

    // Position de départ
    let yPos = 52;

    // Liste des membres
    doc.setFontSize(11);
    doc.setFont(undefined, "normal");

    liste.membres.forEach(function (membre, index) {
      // Vérifier si on doit créer une nouvelle page
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      // Numéro, nom, prénom et téléphone
      const texte =
        index +
        1 +
        ". " +
        membre.nom +
        " " +
        membre.prenom +
        " - " +
        membre.numero;
      doc.text(texte, 20, yPos);
      yPos += 7;
    });

    // Ligne de séparation finale
    yPos += 5;
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);
    yPos += 7;

    // Total
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Total : " + liste.membres.length + " membres presents", 20, yPos);

    // Sauvegarder le PDF
    const nomFichier = "liste_presence_" + liste.date_liste + ".pdf";
    doc.save(nomFichier);

    afficherAlert("PDF téléchargé avec succès !", "success");
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    afficherAlert("Erreur lors de la génération du PDF", "danger");
  }
}

// Supprimer une liste
async function supprimerListe(id) {
  if (
    !confirm("Êtes-vous sûr de vouloir supprimer cette liste de présence ?")
  ) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/listes-presence/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (data.success) {
      afficherAlert(data.message, "success");
      chargerListes();
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

// Fermer le modal en cliquant à l'extérieur
window.addEventListener("click", (e) => {
  const modal = document.getElementById("modal");
  if (e.target === modal) {
    fermerModal();
  }
});
