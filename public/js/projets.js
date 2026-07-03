window.addEventListener("DOMContentLoaded", () => {
  chargerProjets();
});

async function chargerProjets() {
  document.getElementById("loading").style.display = "flex";
  document.getElementById("projetsTable").style.display = "none";
  document.getElementById("emptyState").classList.add("hidden");

  try {
    const data = await apiFetch("/projets");
    afficherProjets(data.data || []);
  } catch (e) {
    afficherAlert("Erreur lors du chargement des projets", "danger");
  } finally {
    document.getElementById("loading").style.display = "none";
  }
}

const STATUT_BADGES = {
  en_cours: '<span class="badge badge-info"><i class="fa-solid fa-circle badge-dot"></i>En cours</span>',
  termine: '<span class="badge badge-success"><i class="fa-solid fa-circle badge-dot"></i>Terminé</span>',
  annule: '<span class="badge badge-danger"><i class="fa-solid fa-circle badge-dot"></i>Annulé</span>',
};

function afficherProjets(projets) {
  const tbody = document.getElementById("projetsBody");
  tbody.innerHTML = "";

  afficherStatsProjets(projets);

  if (projets.length === 0) {
    document.getElementById("emptyState").classList.remove("hidden");
    document.getElementById("projetsTable").style.display = "none";
    return;
  }

  document.getElementById("projetsTable").style.display = "block";
  document.getElementById("emptyState").classList.add("hidden");

  projets.forEach((p) => {
    const collecte = parseFloat(p.montant_collecte) || 0;
    const cible = parseFloat(p.montant_cible) || 0;
    const pct = cible > 0 ? Math.min(100, Math.round((collecte / cible) * 100)) : 0;
    const barClass = pct >= 100 ? "success" : pct >= 50 ? "warning" : "danger";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${p.nom}</strong></td>
      <td>${formatMontant(cible)} FCFA</td>
      <td>${formatMontant(collecte)} FCFA</td>
      <td>
        <div class="progress-cell">
          <div class="progress-label ${barClass}">${pct}%</div>
          <div class="progress-bar-container">
            <div class="progress-bar ${barClass}" style="width:${pct}%"></div>
          </div>
        </div>
      </td>
      <td>${p.date_fin ? formatDate(p.date_fin) : "—"}</td>
      <td>${STATUT_BADGES[p.statut] || p.statut}</td>
      <td>
        <button class="btn btn-info btn-sm" onclick="voirDetail(${p.id})"><i class="fa-solid fa-eye"></i> Détails</button>
        <button class="btn btn-secondary btn-sm" onclick="ouvrirModalModifier(${p.id})"><i class="fa-solid fa-pen"></i></button>
        <button class="btn btn-warning btn-sm" onclick="ouvrirModalConfig(${p.id})"><i class="fa-solid fa-gear"></i></button>
        <button class="btn btn-danger btn-sm" onclick="supprimerProjet(${p.id})"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function afficherStatsProjets(projets) {
  const collecteTotale = projets.reduce((sum, p) => sum + (Number(p.montant_collecte) || 0), 0);
  document.getElementById("statProjetsTotal").textContent = projets.length;
  document.getElementById("statProjetsEnCours").textContent =
    projets.filter((p) => p.statut === "en_cours").length;
  document.getElementById("statProjetsTermines").textContent =
    projets.filter((p) => p.statut === "termine").length;
  document.getElementById("statProjetsCollecte").textContent = formatMontant(collecteTotale);
}

function filtrerProjets() {
  const recherche = document.getElementById("filtreInput").value.toLowerCase();
  document.querySelectorAll("#projetsBody tr").forEach((tr) => {
    const nom = tr.cells[0]?.textContent.toLowerCase() || "";
    tr.style.display = nom.includes(recherche) ? "" : "none";
  });
}

// ====================== MODALS ======================
function ouvrirModalAjout() {
  document.getElementById("modalTitle").textContent = "Nouveau projet";
  document.getElementById("projetForm").reset();
  document.getElementById("projetId").value = "";
  openModal("modal");
}

async function ouvrirModalModifier(id) {
  try {
    const data = await apiFetch(`/projets/${id}`);
    const p = data.data;

    document.getElementById("modalTitle").textContent = "Modifier le projet";
    document.getElementById("projetId").value = p.id;
    document.getElementById("nom").value = p.nom;
    document.getElementById("description").value = p.description || "";
    document.getElementById("montantCible").value = p.montant_cible;
    document.getElementById("dateDebut").value = p.date_debut ? p.date_debut.split("T")[0] : "";
    document.getElementById("dateFin").value = p.date_fin ? p.date_fin.split("T")[0] : "";
    document.getElementById("statut").value = p.statut;

    openModal("modal");
  } catch (e) {
    afficherAlert("Erreur lors du chargement", "danger");
  }
}

// Soumission formulaire projet
document.getElementById("projetForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("projetId").value;

  const payload = {
    nom: document.getElementById("nom").value.trim(),
    description: document.getElementById("description").value.trim(),
    montantCible: Number(document.getElementById("montantCible").value),
    dateDebut: document.getElementById("dateDebut").value || null,
    dateFin: document.getElementById("dateFin").value || null,
    statut: document.getElementById("statut").value,
  };

  try {
    const data = await apiFetch(`/projets${id ? "/" + id : ""}`, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload),
    });

    if (data.success) {
      afficherAlert(id ? "Projet modifié !" : "Projet créé !", "success");
      closeModal("modal");
      chargerProjets();
    } else {
      afficherAlert(data.message || "Erreur", "danger");
    }
  } catch (e) {
    afficherAlert("Erreur lors de l'enregistrement", "danger");
  }
});

// ====================== CONFIGURATION ======================
async function ouvrirModalConfig(id) {
  try {
    const data = await apiFetch(`/projets/${id}`);
    const p = data.data;

    document.getElementById("configTitle").textContent = `Configuration : ${p.nom}`;
    document.getElementById("configProjetId").value = p.id;

    document.getElementById("montantParReunion").value = p.montant_par_reunion || 5000;
    document.getElementById("montantAnnuel").value = p.montant_annuel || 60000;
    document.getElementById("penaliteRetard").value = p.penalite_retard || 1000;

    openModal("modalConfig");
  } catch (e) {
    afficherAlert("Erreur de chargement de la configuration", "danger");
  }
}

document.getElementById("configForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const projetId = document.getElementById("configProjetId").value;
  if (!projetId) return afficherAlert("Aucun projet sélectionné", "danger");

  const payload = {
    montant_par_reunion: parseFloat(document.getElementById("montantParReunion").value) || 0,
    montant_annuel: parseFloat(document.getElementById("montantAnnuel").value) || 0,
    penalite_retard: parseFloat(document.getElementById("penaliteRetard").value) || 0,
  };

  try {
    const data = await apiFetch(`/projets/${projetId}/config`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    if (data.success) {
      afficherAlert("Configuration enregistrée avec succès !", "success");
      closeModal("modalConfig");
      chargerProjets();
    } else {
      afficherAlert(data.message || "Erreur inconnue", "danger");
    }
  } catch (error) {
    afficherAlert("Erreur de connexion au serveur", "danger");
  }
});

async function supprimerProjet(id) {
  const ok = await confirmModal({
    title: "Supprimer le projet",
    message: "Cette action est irréversible.",
    confirmText: "Supprimer",
  });
  if (!ok) return;

  try {
    const data = await apiFetch(`/projets/${id}`, { method: "DELETE" });
    if (data.success) {
      afficherAlert("Projet supprimé", "success");
      chargerProjets();
    } else {
      afficherAlert(data.message || "Erreur", "danger");
    }
  } catch (e) {
    afficherAlert("Erreur lors de la suppression", "danger");
  }
}

async function voirDetail(id) {
  try {
    const data = await apiFetch(`/projets/${id}`);
    const p = data.data;
    const collecte = Number(p.montant_collecte || 0);
    const cible = Number(p.montant_cible || 0);
    const restant = Math.max(0, cible - collecte);

    document.getElementById("detailTitle").textContent = p.nom;
    document.getElementById("detailBody").innerHTML = `
      <p>${p.description || "Aucune description."}</p>
      <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 18px 0;">
        <div style="background:var(--color-primary-soft);padding:14px;border-radius:var(--radius-md);text-align:center;">
          <small>Cible</small>
          <h3 style="color:var(--color-primary);margin:6px 0 0;font-size:1.15rem;">${formatMontant(cible)} FCFA</h3>
        </div>
        <div style="background:var(--color-success-soft);padding:14px;border-radius:var(--radius-md);text-align:center;">
          <small>Collecté</small>
          <h3 style="color:var(--color-success);margin:6px 0 0;font-size:1.15rem;">${formatMontant(collecte)} FCFA</h3>
        </div>
        <div style="background:var(--color-danger-soft);padding:14px;border-radius:var(--radius-md);text-align:center;">
          <small>Restant</small>
          <h3 style="color:var(--color-danger);margin:6px 0 0;font-size:1.15rem;">${formatMontant(restant)} FCFA</h3>
        </div>
      </div>
      <p><strong>Période :</strong> ${p.date_debut ? formatDate(p.date_debut) : "—"} <i class="fa-solid fa-arrow-right"></i> ${p.date_fin ? formatDate(p.date_fin) : "—"}</p>
      <p class="mt-10"><strong>Configuration</strong></p>
      <p>Montant par réunion : ${formatMontant(p.montant_par_reunion)} FCFA</p>
      <p>Montant annuel : ${formatMontant(p.montant_annuel)} FCFA</p>
      <p>Pénalité de retard : ${formatMontant(p.penalite_retard)} FCFA</p>
    `;
    openModal("modalDetail");
  } catch (e) {
    afficherAlert("Erreur de chargement du détail", "danger");
  }
}
