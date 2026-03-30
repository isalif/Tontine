const API_URL = "http://localhost:3000/api";
let reunions = [];

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
                <button class="btn btn-sm btn-success" onclick="genererRapportPDF(${reunion.id})">📥 Télécharger PDF</button>
                <a href="cotisations.html?reunion=${reunion.id}" class="btn btn-sm btn-info">👁️ Voir détails</a>
            </td>
        `;
    tbody.appendChild(tr);
  });
}

// Générer le rapport PDF
async function genererRapportPDF(reunionId) {
  try {
    afficherAlert("Génération du rapport en cours...", "info");

    // Récupérer les infos de la réunion
    const resReunion = await fetch(`${API_URL}/reunions/${reunionId}`);
    const dataReunion = await resReunion.json();

    if (!dataReunion.success) {
      afficherAlert("Erreur lors de la récupération de la réunion", "danger");
      return;
    }

    const reunion = dataReunion.data;
    const dateReunion = new Date(reunion.date_reunion);
    const dateFormatee = dateReunion.toLocaleDateString("fr-FR");

    // Récupérer les cotisations
    const resCotisations = await fetch(
      `${API_URL}/cotisations/reunion/${reunionId}`
    );
    const dataCotisations = await resCotisations.json();

    if (!dataCotisations.success) {
      afficherAlert("Erreur lors de la récupération des cotisations", "danger");
      return;
    }

    const cotisations = dataCotisations.data;

    // Calculer les totaux manuellement
    let totalMensuelle = 0;
    let totalSpeciale = 0;
    let totalPenalite = 0;
    let totalGeneral = 0;

    cotisations.forEach((c) => {
      const mensuelle = parseFloat(c.cotisation_mensuelle) || 0;
      const speciale = parseFloat(c.cotisation_speciale) || 0;
      const penalite = parseFloat(c.penalite) || 0;

      totalMensuelle += mensuelle;
      totalSpeciale += speciale;
      totalPenalite += penalite;
      totalGeneral += mensuelle + speciale + penalite;
    });

    console.log("Totaux calculés:", {
      totalMensuelle,
      totalSpeciale,
      totalPenalite,
      totalGeneral,
    });

    // Créer le PDF avec jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Titre du document
    doc.setFontSize(20);
    doc.setFont(undefined, "bold");
    doc.text("RAPPORT DE REUNION - RESSORTISSANT DE KALFOU", 105, 20, {
      align: "center",
    });

    // Date de la réunion
    doc.setFontSize(14);
    doc.setFont(undefined, "normal");
    doc.text("Date de la reunion : " + dateFormatee, 20, 35);
    doc.text(
      "Statut : " + (reunion.statut === "en_cours" ? "En cours" : "Cloturee"),
      20,
      42
    );

    // Date de génération
    doc.setFontSize(10);
    const dateGeneration = new Date().toLocaleDateString("fr-FR");
    doc.text("Genere le : " + dateGeneration, 20, 49);

    // Ligne de séparation
    doc.setLineWidth(0.5);
    doc.line(20, 53, 190, 53);

    // Tableau des cotisations
    const tableData = cotisations.map((c) => {
      const mensuelle = parseFloat(c.cotisation_mensuelle) || 0;
      const speciale = parseFloat(c.cotisation_speciale) || 0;
      const penalite = parseFloat(c.penalite) || 0;
      const total = parseFloat(c.total) || 0;

      return [
        `${c.nom} ${c.prenom}`,
        c.numero || "",
        c.present ? "Oui" : "Non",
        formatMontant(mensuelle) + " FCFA",
        formatMontant(speciale) + " FCFA",
        formatMontant(penalite) + " FCFA",
        formatMontant(total) + " FCFA",
      ];
    });

    doc.autoTable({
      startY: 58,
      head: [
        [
          "Membre",
          "Numero",
          "Present",
          "Cotis. Mensuelle",
          "Cotis. Speciale",
          "Penalite",
          "Total",
        ],
      ],
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: [102, 126, 234],
        fontSize: 10,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 30 },
        2: { cellWidth: 20, halign: "center" },
        3: { cellWidth: 25, halign: "right" },
        4: { cellWidth: 25, halign: "right" },
        5: { cellWidth: 20, halign: "right" },
        6: { cellWidth: 25, halign: "right", fontStyle: "bold" },
      },
    });

    // Position après le tableau
    let finalY = doc.lastAutoTable.finalY + 10;

    // Ligne de séparation
    doc.setLineWidth(0.5);
    doc.line(20, finalY, 190, finalY);
    finalY += 7;

    // Totaux
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("RECAPITULATIF DES MONTANTS", 20, finalY);
    finalY += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, "normal");

    // Ligne 1 : Cotisations mensuelles
    doc.text("Total cotisations mensuelles :", 20, finalY);
    doc.text(formatMontant(totalMensuelle) + " FCFA", 190, finalY, {
      align: "right",
    });
    finalY += 7;

    // Ligne 2 : Cotisations spéciales
    doc.text("Total cotisations speciales :", 20, finalY);
    doc.text(formatMontant(totalSpeciale) + " FCFA", 190, finalY, {
      align: "right",
    });
    finalY += 7;

    // Ligne 3 : Pénalités
    doc.text("Total penalites :", 20, finalY);
    doc.text(formatMontant(totalPenalite) + " FCFA", 190, finalY, {
      align: "right",
    });
    finalY += 10;

    // Ligne de séparation pour le total général
    doc.setLineWidth(1);
    doc.line(20, finalY, 190, finalY);
    finalY += 7;

    // Total général
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("TOTAL GENERAL :", 20, finalY);
    doc.text(formatMontant(totalGeneral) + " FCFA", 190, finalY, {
      align: "right",
    });

    // Ajouter le pied de page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont(undefined, "normal");
      doc.text("Page " + i + " sur " + pageCount, 105, 290, {
        align: "center",
      });
      doc.text("Application de Gestion de Tontine", 105, 285, {
        align: "center",
      });
    }

    // Sauvegarder le PDF
    const nomFichier =
      "rapport_tontine_" + dateReunion.toISOString().split("T")[0] + ".pdf";
    doc.save(nomFichier);

    afficherAlert("Rapport PDF généré avec succès !", "success");
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    afficherAlert(
      "Erreur lors de la génération du rapport PDF: " + error.message,
      "danger"
    );
  }
}

// Formater les montants (corrigé pour éviter les espaces entre caractères)
function formatMontant(montant) {
  if (!montant || isNaN(montant)) return "0";

  // Convertir en nombre
  const nombre = parseFloat(montant);

  // Formater avec des espaces (format français)
  return nombre.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
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
