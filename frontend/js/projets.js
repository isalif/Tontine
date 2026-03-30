const API = "http://localhost:3000/api";
let projetCourant = null;

// ===== CHARGEMENT =====
async function chargerProjets() {
  document.getElementById("loading").style.display = "flex";
  document.getElementById("projetsTable").style.display = "none";
  document.getElementById("emptyState").style.display = "none";

  try {
    const res = await fetch(`${API}/projets`);
    const data = await res.json();
    afficherProjets(data.data || []);
  } catch (e) {
    afficherAlerte("Erreur lors du chargement des projets", "error");
  } finally {
    document.getElementById("loading").style.display = "none";
  }
}

function afficherProjets(projets) {
  const tbody = document.getElementById("projetsBody");
  tbody.innerHTML = "";

  if (projets.length === 0) {
    document.getElementById("emptyState").style.display = "block";
    document.getElementById("projetsTable").style.display = "none";
    return;
  }

  document.getElementById("projetsTable").style.display = "block";
  document.getElementById("emptyState").style.display = "none";

  projets.forEach((p) => {
    const collecte = p.montant_collecte || 0;
    const pct =
      p.montant_cible > 0
        ? Math.min(100, Math.round((collecte / p.montant_cible) * 100))
        : 0;

    const statutBadge =
      {
        en_cours:
          '<span style="color:#1976d2;font-weight:600;">🔵 En cours</span>',
        termine:
          '<span style="color:#388e3c;font-weight:600;">🟢 Terminé</span>',
        annule: '<span style="color:#d32f2f;font-weight:600;">🔴 Annulé</span>',
      }[p.statut] || p.statut;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${p.nom}</strong></td>
      <td>${p.description}</td>
      <td>${Number(p.montant_cible).toLocaleString("fr-FR")} FCFA</td>
      <td>${Number(collecte).toLocaleString("fr-FR")} FCFA</td>
      <td>
        <div style="background:#e0e0e0;border-radius:6px;height:14px;overflow:hidden;min-width:80px;">
          <div style="width:${pct}%;height:100%;background:#4CAF50;border-radius:6px;"></div>
        </div>
        <small>${pct}%</small>
      </td>
      <td>${p.date_debut ? new Date(p.date_debut).toLocaleDateString("fr-FR") : "—"}</td>
      <td>${p.date_fin ? new Date(p.date_fin).toLocaleDateString("fr-FR") : "—"}</td>
      <td>${statutBadge}</td>
      <td>
        <button class="btn btn-secondary" onclick="voirDetail(${p.id})">👁 Détail</button>
        <button class="btn btn-secondary" onclick="ouvrirModalModifier(${p.id})">✏️</button>
        <button class="btn btn-danger"    onclick="supprimerProjet(${p.id})">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ===== FILTRE =====
function filtrerProjets() {
  const recherche = document.getElementById("filtreInput").value.toLowerCase();
  document.querySelectorAll("#projetsBody tr").forEach((ligne) => {
    const nom = ligne.cells[0]?.textContent.toLowerCase() || "";
    const desc = ligne.cells[1]?.textContent.toLowerCase() || "";
    ligne.style.display =
      nom.includes(recherche) || desc.includes(recherche) ? "" : "none";
  });
}

// ===== MODAL AJOUTER =====
function ouvrirModalAjout() {
  document.getElementById("modalTitle").textContent = "Nouveau projet";
  document.getElementById("projetForm").reset();
  document.getElementById("projetId").value = "";
  document.getElementById("modal").style.display = "flex";
}

// ===== MODAL MODIFIER =====
async function ouvrirModalModifier(id) {
  try {
    const res = await fetch(`${API}/projets/${id}`);
    const data = await res.json();
    const p = data.data;

    document.getElementById("modalTitle").textContent = "Modifier le projet";
    document.getElementById("projetId").value = p.id;
    document.getElementById("nom").value = p.nom;
    document.getElementById("description").value = p.description;
    document.getElementById("montantCible").value = p.montant_cible;
    document.getElementById("dateDebut").value = p.date_debut
      ? p.date_debut.split("T")[0]
      : "";
    document.getElementById("dateFin").value = p.date_fin
      ? p.date_fin.split("T")[0]
      : "";
    document.getElementById("statut").value = p.statut;

    document.getElementById("modal").style.display = "flex";
  } catch (e) {
    afficherAlerte("Erreur lors du chargement du projet", "error");
  }
}

function fermerModal() {
  document.getElementById("modal").style.display = "none";
}

// ===== SUBMIT FORMULAIRE =====
document.getElementById("projetForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("projetId").value;

  const payload = {
    nom: document.getElementById("nom").value,
    description: document.getElementById("description").value,
    montantCible: Number(document.getElementById("montantCible").value),
    dateDebut: document.getElementById("dateDebut").value || null,
    dateFin: document.getElementById("dateFin").value || null,
    statut: document.getElementById("statut").value,
  };

  try {
    const res = await fetch(`${API}/projets${id ? "/" + id : ""}`, {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.success) {
      afficherAlerte(id ? "Projet modifié !" : "Projet créé !", "success");
      fermerModal();
      chargerProjets();
    } else {
      afficherAlerte(data.message || "Erreur", "error");
    }
  } catch (e) {
    afficherAlerte("Erreur lors de l'enregistrement", "error");
  }
});

// ===== SUPPRIMER =====
async function supprimerProjet(id) {
  if (!confirm("Supprimer ce projet ?")) return;
  try {
    const res = await fetch(`${API}/projets/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      afficherAlerte("Projet supprimé", "success");
      chargerProjets();
    } else {
      afficherAlerte(data.message || "Erreur", "error");
    }
  } catch (e) {
    afficherAlerte("Erreur lors de la suppression", "error");
  }
}

// ===== DÉTAIL =====
async function voirDetail(id) {
  try {
    const res = await fetch(`${API}/projets/${id}`);
    const data = await res.json();
    const p = data.data;
    projetCourant = p;

    document.getElementById("detailTitre").textContent = p.nom;

    const collecte = p.montant_collecte || 0;
    const pct =
      p.montant_cible > 0
        ? Math.min(100, Math.round((collecte / p.montant_cible) * 100))
        : 0;

    document.getElementById("detailInfos").innerHTML = `
      <p><strong>Description :</strong> ${p.description}</p>
      <p><strong>Montant cible :</strong> ${Number(p.montant_cible).toLocaleString("fr-FR")} FCFA</p>
      <p><strong>Montant collecté :</strong> ${Number(collecte).toLocaleString("fr-FR")} FCFA</p>
      <p><strong>Date début :</strong> ${p.date_debut ? new Date(p.date_debut).toLocaleDateString("fr-FR") : "—"}</p>
      <p><strong>Date fin :</strong> ${p.date_fin ? new Date(p.date_fin).toLocaleDateString("fr-FR") : "—"}</p>
      <p><strong>Statut :</strong> ${p.statut}</p>
    `;

    document.getElementById("barreProgression").style.width = pct + "%";
    document.getElementById("pourcentageTexte").textContent = pct + "%";

    await chargerCotisationsAffectees(id);
    document.getElementById("modalDetail").style.display = "flex";
  } catch (e) {
    afficherAlerte("Erreur lors du chargement du détail", "error");
  }
}

function fermerModalDetail() {
  document.getElementById("modalDetail").style.display = "none";
  projetCourant = null;
}

// ===== COTISATIONS AFFECTÉES =====
async function chargerCotisationsAffectees(projetId) {
  try {
    const res = await fetch(`${API}/projets/${projetId}/cotisations`);
    const data = await res.json();
    const cotisations = data.data || [];
    const tbody = document.getElementById("cotisationsAffectees");
    tbody.innerHTML = "";

    if (cotisations.length === 0) {
      document.getElementById("emptyCotisations").style.display = "block";
      return;
    }

    document.getElementById("emptyCotisations").style.display = "none";
    cotisations.forEach((c) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.membre || "—"}</td>
        <td>${Number(c.montant).toLocaleString("fr-FR")} FCFA</td>
        <td>${new Date(c.date_paiement).toLocaleDateString("fr-FR")}</td>
        <td>
          <button class="btn btn-danger"
            onclick="retirerCotisation(${projetCourant.id}, ${c.id})">
            🗑️
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {
    afficherAlerte("Erreur chargement cotisations", "error");
  }
}

// ===== AFFECTER COTISATION =====
async function ouvrirModalAffectation() {
  try {
    const res = await fetch(`${API}/cotisations`);
    const data = await res.json();
    const cotisations = data.data || [];

    const select = document.getElementById("selectCotisation");
    select.innerHTML = '<option value="">-- Choisir une cotisation --</option>';
    cotisations.forEach((c) => {
      select.innerHTML += `
        <option value="${c.id}">
          ${c.membre || "Membre"} — ${Number(c.montant).toLocaleString("fr-FR")} FCFA
        </option>
      `;
    });

    document.getElementById("modalAffectation").style.display = "flex";
  } catch (e) {
    afficherAlerte("Erreur chargement cotisations", "error");
  }
}

function fermerModalAffectation() {
  document.getElementById("modalAffectation").style.display = "none";
}

document
  .getElementById("affectationForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const cotisationId = document.getElementById("selectCotisation").value;
    if (!cotisationId || !projetCourant) return;

    try {
      const res = await fetch(
        `${API}/projets/${projetCourant.id}/cotisations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cotisationId: Number(cotisationId) }),
        },
      );
      const data = await res.json();

      if (data.success) {
        afficherAlerte("Cotisation affectée !", "success");
        fermerModalAffectation();
        await chargerCotisationsAffectees(projetCourant.id);
      } else {
        afficherAlerte(data.message || "Erreur", "error");
      }
    } catch (e) {
      afficherAlerte("Erreur lors de l'affectation", "error");
    }
  });

async function retirerCotisation(projetId, cotisationId) {
  if (!confirm("Retirer cette cotisation du projet ?")) return;
  try {
    const res = await fetch(
      `${API}/projets/${projetId}/cotisations/${cotisationId}`,
      { method: "DELETE" },
    );
    const data = await res.json();
    if (data.success) {
      afficherAlerte("Cotisation retirée", "success");
      await chargerCotisationsAffectees(projetId);
    } else {
      afficherAlerte(data.message || "Erreur", "error");
    }
  } catch (e) {
    afficherAlerte("Erreur lors du retrait", "error");
  }
}

// ===== UTILITAIRES =====
function afficherAlerte(msg, type) {
  const el = document.getElementById("alert");
  el.textContent = msg;
  el.className = `alert alert-${type}`;
  el.style.display = "block";
  setTimeout(() => {
    el.style.display = "none";
  }, 3000);
}

// Fermer modals en cliquant dehors
window.onclick = (e) => {
  if (e.target.id === "modal") fermerModal();
  if (e.target.id === "modalDetail") fermerModalDetail();
  if (e.target.id === "modalAffectation") fermerModalAffectation();
};

// Init
chargerProjets();
