const API_URL = "http://localhost:3000/api";
let listes = [];
let tousLesMembres = [];

// ==================== CHARGEMENT DE LA PAGE ====================
window.addEventListener("DOMContentLoaded", () => {
  chargerListes();
  chargerMembres();

  // Soumission du formulaire
  const form = document.getElementById("listeForm");
  if (form) form.addEventListener("submit", creerListe);
});

// ====================== MODAL ======================
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

  // Affichage du modal (CORRECTION)
  document.getElementById("modal").style.display = "flex";
}

function fermerModal() {
  // Fermeture du modal (CORRECTION)
  document.getElementById("modal").style.display = "none";
  document.getElementById("listeForm").reset();
}

// ====================== CRÉATION D'UNE LISTE ======================
async function creerListe(e) {
  e.preventDefault();

  const dateListe = document.getElementById("dateListe").value;
  const titre = document.getElementById("titreListe").value || "Réunion";

  // Récupérer les membres cochés
  const checkboxes = document.querySelectorAll(
    '#membresCheckboxes input[type="checkbox"]:checked',
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
      setTimeout(() => {
        location.reload();
      }, 1200);
    } else {
      afficherAlert(data.message || "Erreur lors de la création", "danger");
    }
  } catch (error) {
    console.error("Erreur lors de la création:", error);
    afficherAlert("Erreur de connexion au serveur", "danger");
  }
}

// ====================== CHARGER LES LISTES ======================
async function chargerListes() {
  try {
    const response = await fetch(`${API_URL}/listes-presence`);
    const data = await response.json();

    document.getElementById("loading").style.display = "none";

    if (data.success && data.data.length > 0) {
      listes = data.data;
      afficherListes(listes);
      document.getElementById("listesTable").style.display = "block";
      document.getElementById("emptyState").style.display = "none";
    } else {
      document.getElementById("listesTable").style.display = "none";
      document.getElementById("emptyState").style.display = "block";
    }
  } catch (error) {
    console.error("Erreur lors du chargement des listes:", error);
    document.getElementById("loading").style.display = "none";
    afficherAlert("Erreur de connexion au serveur", "danger");
  }
}

// ====================== CHARGER LES MEMBRES ======================
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

// ====================== AFFICHAGE DU TABLEAU ======================
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
        <button class="btn btn-sm btn-success" onclick="telechargerPDF(${liste.id})">📥 Télécharger PDF</button>
        <button class="btn btn-sm btn-danger" onclick="supprimerListe(${liste.id})">🗑️ Supprimer</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ====================== TÉLÉCHARGER PDF ======================
async function telechargerPDF(listeId) {
  try {
    afficherAlert("Génération du PDF en cours...", "info");

    const response = await fetch(`${API_URL}/listes-presence/${listeId}`);
    const data = await response.json();

    if (!data.success) {
      afficherAlert("Erreur lors de la récupération de la liste", "danger");
      return;
    }

    const liste = data.data;
    const date = new Date(liste.date_liste);
    const dateFormatee = date.toLocaleDateString("fr-FR");

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setFont(undefined, "bold");
    doc.text("LISTE DE PRESENCE", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setFont(undefined, "normal");
    doc.text("Date : " + dateFormatee, 105, 30, { align: "center" });

    if (liste.titre && liste.titre !== "Réunion") {
      doc.text(liste.titre, 105, 37, { align: "center" });
    }

    doc.setLineWidth(0.5);
    doc.line(20, 42, 190, 42);

    let yPos = 52;

    doc.setFontSize(11);
    doc.setFont(undefined, "normal");

    liste.membres.forEach(function (membre, index) {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
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

    yPos += 5;
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);
    yPos += 7;

    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Total : " + liste.membres.length + " membres presents", 20, yPos);

    const nomFichier = "liste_presence_" + liste.date_liste + ".pdf";
    doc.save(nomFichier);

    afficherAlert("PDF téléchargé avec succès !", "success");
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    afficherAlert("Erreur lors de la génération du PDF", "danger");
  }
}

// ====================== SUPPRIMER UNE LISTE ======================
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

// ====================== ALERTES ======================
function afficherAlert(message, type) {
  const alert = document.getElementById("alert");
  alert.className = `alert alert-${type} show`;
  alert.textContent = message;

  setTimeout(() => {
    alert.classList.remove("show");
  }, 5000);
}

// ====================== FERMER MODAL EN CLIQUANT DEHORS ======================
window.addEventListener("click", (e) => {
  const modal = document.getElementById("modal");
  if (e.target === modal) {
    fermerModal();
  }
});
