let reunionId = null;
let cotisations = [];
let reunionInfo = null;

// Récupérer l'ID de la réunion depuis l'URL
window.addEventListener("DOMContentLoaded", async () => {
  await window.currentUserReady;
  const urlParams = new URLSearchParams(window.location.search);
  reunionId = urlParams.get("reunion");

  if (!reunionId) {
    afficherAlert("Aucune réunion sélectionnée", "danger");
    document.getElementById("loading").style.display = "none";
    document.getElementById("emptyState").classList.remove("hidden");
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
  document.getElementById("membreNom").textContent = `${cotisation.nom} ${cotisation.prenom}`;
  document.getElementById("cotisationMensuelle").value = cotisation.cotisation_mensuelle || 0;
  document.getElementById("penalite").value = cotisation.penalite || 0;

  openModal("modalCotisation");
}

// ====================== SOUMISSION FORMULAIRE COTISATION ======================
document.getElementById("cotisationForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("cotisationId").value;
  const cotisationMensuelle = parseFloat(document.getElementById("cotisationMensuelle").value) || 0;
  const penalite = parseFloat(document.getElementById("penalite").value) || 0;

  try {
    const data = await apiFetch(`/cotisations/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        cotisation_mensuelle: cotisationMensuelle,
        penalite: penalite,
      }),
    });

    if (data.success) {
      afficherAlert(data.message, "success");
      closeModal("modalCotisation");
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
    const data = await apiFetch(`/reunions/${reunionId}`);

    if (data.success) {
      reunionInfo = data.data;
      document.getElementById("headerDate").textContent =
        `Réunion du ${formatDate(reunionInfo.date_reunion)}${reunionInfo.titre ? " · " + reunionInfo.titre : ""}`;

      if (reunionInfo.statut === "cloturee") {
        const btnCloture = document.getElementById("btnCloture");
        btnCloture.disabled = true;
        btnCloture.innerHTML = '<i class="fa-solid fa-lock"></i> <span class="btn-label">Réunion clôturée</span>';
      }
    }
  } catch (error) {
    console.error("Erreur chargement réunion:", error);
  }
}

async function chargerCotisations() {
  try {
    const data = await apiFetch(`/cotisations/reunion/${reunionId}`);

    document.getElementById("loading").style.display = "none";

    if (data.success && data.data.length > 0) {
      cotisations = data.data;
      afficherCotisations(cotisations);
      afficherStatsCotisations(cotisations);
      document.getElementById("cotisationsTable").style.display = "block";
      document.getElementById("emptyState").classList.add("hidden");
    } else {
      document.getElementById("cotisationsTable").style.display = "none";
      document.getElementById("emptyState").classList.remove("hidden");
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
  const cloturee = reunionInfo && reunionInfo.statut === "cloturee";
  const isAdmin = window.currentUser?.role === "admin";

  liste.forEach((c) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${c.nom} ${c.prenom}</strong></td>
      <td>${c.numero}</td>
      <td>
        <input
          type="checkbox"
          class="presence-checkbox"
          ${c.present ? "checked" : ""}
          ${cloturee || !isAdmin ? "disabled" : ""}
          onchange="togglePresence(${c.membre_id}, this.checked)"
        />
      </td>
      <td>${formatMontant(c.cotisation_mensuelle)} FCFA</td>
      <td>${formatMontant(c.penalite)} FCFA</td>
      <td><strong>${formatMontant(c.total)} FCFA</strong></td>
      <td>
        ${
          isAdmin && !cloturee
            ? `<button class="btn btn-sm btn-warning" onclick="ouvrirModalModification(${c.id})"><i class="fa-solid fa-pen"></i> Modifier</button>`
            : cloturee
              ? '<span style="color: var(--color-text-muted);">Réunion clôturée</span>'
              : ""
        }
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function afficherStatsCotisations(liste) {
  const total = liste.reduce((sum, c) => sum + (Number(c.total) || 0), 0);
  const penalites = liste.reduce((sum, c) => sum + (Number(c.penalite) || 0), 0);
  const presents = liste.filter((c) => c.present).length;

  document.getElementById("statTotalCollecte").textContent = formatMontant(total);
  document.getElementById("statPresents").textContent = presents;
  document.getElementById("statAbsents").textContent = liste.length - presents;
  document.getElementById("statPenalites").textContent = formatMontant(penalites);
}

function filtrerCotisationsListe() {
  const recherche = document.getElementById("filtreInput").value.toLowerCase();
  document.querySelectorAll("#cotisationsBody tr").forEach((tr) => {
    tr.style.display = tr.textContent.toLowerCase().includes(recherche) ? "" : "none";
  });
}

async function togglePresence(membreId, present) {
  try {
    const data = await apiFetch(`/cotisations/presence/${reunionId}/${membreId}`, {
      method: "PUT",
      body: JSON.stringify({ present }),
    });
    if (data.success) {
      const c = cotisations.find((x) => x.membre_id === membreId);
      if (c) c.present = present;
      afficherStatsCotisations(cotisations);
      toast(present ? "Membre marqué présent" : "Membre marqué absent", "success");
    } else {
      afficherAlert(data.message, "danger");
    }
  } catch (e) {
    afficherAlert("Erreur lors de la mise à jour de la présence", "danger");
  }
}

async function cloturerReunion() {
  const ok = await confirmModal({
    title: "Clôturer la réunion",
    message: "Les cotisations et présences de cette réunion ne pourront plus être modifiées.",
    confirmText: "Clôturer",
  });
  if (!ok) return;

  try {
    const data = await apiFetch(`/reunions/${reunionId}/cloture`, { method: "PUT" });

    if (data.success) {
      afficherAlert(data.message, "success");
      reunionInfo.statut = "cloturee";
      chargerReunion();
      chargerCotisations();
    } else {
      afficherAlert(data.message, "danger");
    }
  } catch (error) {
    afficherAlert("Erreur lors de la clôture", "danger");
  }
}

async function chargerConfiguration() {
  try {
    const data = await apiFetch("/cotisations/configuration");

    if (data.success) {
      document.getElementById("configMensuelle").value = data.data.cotisation_mensuelle_defaut || 0;
      document.getElementById("configPenalite").value = data.data.penalite_retard_defaut || 0;
    }
  } catch (error) {
    console.error("Erreur configuration:", error);
  }
}

// Soumission configuration
document.getElementById("configForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    await apiFetch("/cotisations/configuration", {
      method: "PUT",
      body: JSON.stringify({
        cle: "cotisation_mensuelle_defaut",
        valeur: document.getElementById("configMensuelle").value,
      }),
    });

    await apiFetch("/cotisations/configuration", {
      method: "PUT",
      body: JSON.stringify({
        cle: "penalite_retard_defaut",
        valeur: document.getElementById("configPenalite").value,
      }),
    });

    afficherAlert("Configuration mise à jour avec succès", "success");
    closeModal("modalConfig");
  } catch (error) {
    afficherAlert("Erreur lors de la mise à jour de la configuration", "danger");
  }
});

// ====================== EXPORT PDF (feuille de présence) ======================
function exporterPDF() {
  if (!cotisations.length || !reunionInfo) {
    afficherAlert("Aucune donnée à exporter", "danger");
    return;
  }

  try {
    const dateFormatee = formatDate(reunionInfo.date_reunion);
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setFont(undefined, "bold");
    doc.text("LISTE DE PRESENCE", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setFont(undefined, "normal");
    doc.text("Date : " + dateFormatee, 105, 30, { align: "center" });

    if (reunionInfo.titre) {
      doc.text(reunionInfo.titre, 105, 37, { align: "center" });
    }

    doc.setLineWidth(0.5);
    doc.line(20, 42, 190, 42);

    let yPos = 52;
    doc.setFontSize(11);

    cotisations.forEach((c, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      const marque = c.present ? "[x]" : "[ ]";
      doc.text(`${index + 1}. ${marque} ${c.nom} ${c.prenom} - ${c.numero}`, 20, yPos);
      yPos += 7;
    });

    yPos += 5;
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);
    yPos += 7;

    const totalPresents = cotisations.filter((c) => c.present).length;
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text(`Total : ${totalPresents} / ${cotisations.length} membres présents`, 20, yPos);

    doc.save(`liste_presence_${reunionInfo.date_reunion}.pdf`);
    afficherAlert("PDF téléchargé avec succès !", "success");
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    afficherAlert("Erreur lors de la génération du PDF", "danger");
  }
}
