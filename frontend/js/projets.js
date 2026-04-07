const API = "http://localhost:3000/api";

// Chargement initial
window.addEventListener("DOMContentLoaded", () => {
  chargerProjets();
});

async function chargerProjets() {
  document.getElementById("loading").style.display = "flex";
  document.getElementById("projetsTable").style.display = "none";
  document.getElementById("emptyState").style.display = "none";

  try {
    const res = await fetch(`${API}/projets`);
    const data = await res.json();
    afficherProjets(data.data || []);
  } catch (e) {
    afficherAlerte("Erreur lors du chargement des projets", "danger");
  } finally {
    document.getElementById("loading").style.display = "none";
  }
}

function afficherProjets(projets) {
  const tbody = document.getElementById("projetsBody");
  tbody.innerHTML = "";

  if (projets.length === 0) {
    document.getElementById("emptyState").style.display = "block";
    return;
  }

  document.getElementById("projetsTable").style.display = "block";
  document.getElementById("emptyState").style.display = "none";

  projets.forEach((p) => {
    const collecte = parseFloat(p.montant_collecte) || 0;
    const cible = parseFloat(p.montant_cible) || 0;
    const pct =
      cible > 0 ? Math.min(100, Math.round((collecte / cible) * 100)) : 0;

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
      <td>${p.description || "—"}</td>
      <td>${cible.toLocaleString("fr-FR")} FCFA</td>
      <td>${collecte.toLocaleString("fr-FR")} FCFA</td>
      <td>
        <div style="background:#e0e0e0;border-radius:6px;height:14px;overflow:hidden;">
          <div style="width:${pct}%;height:100%;background:#4CAF50;"></div>
        </div>
        <small>${pct}%</small>
      </td>
      <td>${p.date_debut ? new Date(p.date_debut).toLocaleDateString("fr-FR") : "—"}</td>
      <td>${p.date_fin ? new Date(p.date_fin).toLocaleDateString("fr-FR") : "—"}</td>
      <td>${statutBadge}</td>
      <td>
        <button class="btn btn-info btn-sm" onclick="voirDetail(${p.id})">👁 Détails</button>
        <button class="btn btn-secondary btn-sm" onclick="ouvrirModalModifier(${p.id})">✏️ Modifier</button>
        <button class="btn btn-warning btn-sm" onclick="ouvrirModalConfig(${p.id})">⚙️ Config</button>
        <button class="btn btn-danger btn-sm" onclick="supprimerProjet(${p.id})">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function filtrerProjets() {
  const recherche = document.getElementById("filtreInput").value.toLowerCase();
  document.querySelectorAll("#projetsBody tr").forEach((tr) => {
    const nom = tr.cells[0]?.textContent.toLowerCase() || "";
    const desc = tr.cells[1]?.textContent.toLowerCase() || "";
    tr.style.display =
      nom.includes(recherche) || desc.includes(recherche) ? "" : "none";
  });
}

// ====================== MODALS ======================
function ouvrirModalAjout() {
  document.getElementById("modalTitle").textContent = "Nouveau projet";
  document.getElementById("projetForm").reset();
  document.getElementById("projetId").value = "";
  document.getElementById("modal").style.display = "flex";
}

async function ouvrirModalModifier(id) {
  try {
    const res = await fetch(`${API}/projets/${id}`);
    const data = await res.json();
    const p = data.data;

    document.getElementById("modalTitle").textContent = "Modifier le projet";
    document.getElementById("projetId").value = p.id;
    document.getElementById("nom").value = p.nom;
    document.getElementById("description").value = p.description || "";
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
    afficherAlerte("Erreur lors du chargement", "danger");
  }
}

function fermerModal() {
  document.getElementById("modal").style.display = "none";
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
      afficherAlerte(data.message || "Erreur", "danger");
    }
  } catch (e) {
    afficherAlerte("Erreur lors de l'enregistrement", "danger");
  }
});

// ====================== CONFIGURATION ======================
async function ouvrirModalConfig(id) {
  try {
    const res = await fetch(`${API}/projets/${id}`);
    const data = await res.json();
    const p = data.data;

    document.getElementById("configTitle").textContent =
      `Configuration : ${p.nom}`;
    document.getElementById("configProjetId").value = p.id;

    document.getElementById("montantParReunion").value =
      p.montant_par_reunion || 5000;
    document.getElementById("montantAnnuel").value = p.montant_annuel || 60000;
    document.getElementById("penaliteRetard").value = p.penalite_retard || 1000;

    document.getElementById("modalConfig").style.display = "flex";
  } catch (e) {
    afficherAlerte("Erreur de chargement de la configuration", "danger");
  }
}

function fermerModalConfig() {
  document.getElementById("modalConfig").style.display = "none";
}

// Soumission configuration (CORRIGÉE)
document.getElementById("configForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const projetId = document.getElementById("configProjetId").value;
  if (!projetId) return afficherAlerte("Aucun projet sélectionné", "danger");

  const payload = {
    montant_par_reunion:
      parseFloat(document.getElementById("montantParReunion").value) || 0,
    montant_annuel:
      parseFloat(document.getElementById("montantAnnuel").value) || 0,
    penalite_retard:
      parseFloat(document.getElementById("penaliteRetard").value) || 0,
  };

  try {
    const res = await fetch(`${API}/projets/${projetId}/config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.success) {
      afficherAlerte("✅ Configuration enregistrée avec succès !", "success");
      fermerModalConfig();
      chargerProjets(); // Rafraîchit la liste
    } else {
      afficherAlerte(data.message || "Erreur inconnue", "danger");
    }
  } catch (error) {
    console.error("Erreur:", error);
    afficherAlerte("Erreur de connexion au serveur", "danger");
  }
});

async function supprimerProjet(id) {
  if (!confirm("Supprimer ce projet ?")) return;
  try {
    const res = await fetch(`${API}/projets/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      afficherAlerte("Projet supprimé", "success");
      chargerProjets();
    }
  } catch (e) {
    afficherAlerte("Erreur lors de la suppression", "danger");
  }
}

async function voirDetail(id) {
  try {
    const res = await fetch(`${API}/projets/${id}`);
    const data = await res.json();
    const p = data.data;

    let msg = `Nom : ${p.nom}\nDescription : ${p.description || "—"}\nMontant cible : ${Number(p.montant_cible).toLocaleString("fr-FR")} FCFA\nMontant collecté : ${Number(p.montant_collecte || 0).toLocaleString("fr-FR")} FCFA\n\n=== CONFIGURATION ===\nPar réunion : ${Number(p.montant_par_reunion || 0).toLocaleString("fr-FR")} FCFA\nAnnuel : ${Number(p.montant_annuel || 0).toLocaleString("fr-FR")} FCFA\nPénalité retard : ${Number(p.penalite_retard || 0).toLocaleString("fr-FR")} FCFA`;
    alert(msg);
  } catch (e) {
    afficherAlerte("Erreur de chargement du détail", "danger");
  }
}

function afficherAlerte(msg, type) {
  const el = document.getElementById("alert");
  el.textContent = msg;
  el.className = `alert alert-${type} show`;
  setTimeout(() => el.classList.remove("show"), 4000);
}

// Fermeture modals en cliquant dehors
window.addEventListener("click", (e) => {
  if (e.target.id === "modal") fermerModal();
  if (e.target.id === "modalConfig") fermerModalConfig();
});
