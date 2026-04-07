const API = "http://localhost:3000/api";
let cotisationsActuelles = [];

// ==================== INITIALISATION ====================
window.addEventListener("DOMContentLoaded", () => {
  chargerCotisations();
  chargerMembresPourSelect();
  chargerProjetsEnCours();
});

// ==================== CHARGER COTISATIONS ====================
async function chargerCotisations() {
  document.getElementById("loading").style.display = "flex";
  document.getElementById("cotisationsTable").style.display = "none";
  document.getElementById("emptyState").style.display = "none";

  try {
    const res = await fetch(`${API}/cotisations-speciales`);
    const data = await res.json();

    if (data.success) {
      afficherCotisations(data.data || []);
    } else {
      afficherAlerte(data.message || "Erreur serveur", "error");
    }
  } catch (e) {
    console.error(e);
    afficherAlerte("Erreur de connexion au serveur", "error");
  } finally {
    document.getElementById("loading").style.display = "none";
  }
}

function afficherCotisations(liste) {
  const tbody = document.getElementById("cotisationsBody");
  tbody.innerHTML = "";

  if (liste.length === 0) {
    document.getElementById("emptyState").style.display = "block";
    document.getElementById("cotisationsTable").style.display = "none";
    return;
  }

  document.getElementById("cotisationsTable").style.display = "block";
  document.getElementById("emptyState").style.display = "none";

  cotisationsActuelles = liste;

  liste.forEach((c) => {
    const tr = document.createElement("tr");
    const statutBadge =
      {
        payee: '<span style="color:#388e3c;font-weight:600;">🟢 Payée</span>',
        en_attente:
          '<span style="color:#f57c00;font-weight:600;">🟡 En attente</span>',
        annule:
          '<span style="color:#d32f2f;font-weight:600;">🔴 Annulée</span>',
      }[c.statut] || c.statut;

    tr.innerHTML = `
      <td>${c.membre || "—"}</td>
      <td>${Number(c.montant || 0).toLocaleString("fr-FR")} FCFA</td>
      <td>${c.date_paiement ? new Date(c.date_paiement).toLocaleDateString("fr-FR") : "—"}</td>
      <td>${c.projet_nom || "—"}</td>
      <td>${statutBadge}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="ouvrirModalModification(${c.id})">✏️ Modifier</button>
        <button class="btn btn-sm btn-danger" onclick="supprimerCotisation(${c.id})">🗑️ Supprimer</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Charger membres
async function chargerMembresPourSelect() {
  try {
    const res = await fetch(`${API}/membres`);
    const data = await res.json();
    const select = document.getElementById("membreId");
    select.innerHTML = '<option value="">-- Choisir un membre --</option>';
    if (data.success && data.data) {
      data.data.forEach((m) => {
        select.innerHTML += `<option value="${m.id}">${m.nom} ${m.prenom}</option>`;
      });
    }
  } catch (e) {}
}

// Charger projets en cours
async function chargerProjetsEnCours() {
  try {
    const res = await fetch(`${API}/projets`);
    const data = await res.json();
    const select = document.getElementById("projetId");
    select.innerHTML = '<option value="">-- Aucun projet --</option>';

    if (data.success && data.data) {
      data.data
        .filter((p) => p.statut === "en_cours")
        .forEach((p) => {
          select.innerHTML += `<option value="${p.id}">${p.nom}</option>`;
        });
    }
  } catch (e) {
    console.error(e);
  }
}

// Modal Ajout
function ouvrirModalAjout() {
  document.getElementById("modalTitle").textContent =
    "Nouvelle cotisation spéciale";
  document.getElementById("cotisationForm").reset();
  document.getElementById("cotisationId").value = "";
  document.getElementById("modal").style.display = "flex";
}

// Modal Modification
async function ouvrirModalModification(id) {
  try {
    const res = await fetch(`${API}/cotisations-speciales/${id}`);
    const data = await res.json();

    if (data.success) {
      const c = data.data;
      document.getElementById("modalTitle").textContent =
        "Modifier la cotisation spéciale";
      document.getElementById("cotisationId").value = c.id;
      document.getElementById("membreId").value = c.membre_id;
      document.getElementById("projetId").value = c.projet_id || "";
      document.getElementById("montant").value = c.montant;
      document.getElementById("datePaiement").value = c.date_paiement
        ? c.date_paiement.split("T")[0]
        : "";
      document.getElementById("statut").value = c.statut;
      document.getElementById("note").value = c.note || "";
      document.getElementById("modal").style.display = "flex";
    }
  } catch (e) {
    afficherAlerte("Erreur lors du chargement", "error");
  }
}

function fermerModal() {
  document.getElementById("modal").style.display = "none";
}

// Soumission formulaire
document
  .getElementById("cotisationForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("cotisationId").value;

    const payload = {
      membre_id: parseInt(document.getElementById("membreId").value),
      projet_id: document.getElementById("projetId").value
        ? parseInt(document.getElementById("projetId").value)
        : null,
      montant: parseFloat(document.getElementById("montant").value),
      date_paiement: document.getElementById("datePaiement").value,
      statut: document.getElementById("statut").value,
      note: document.getElementById("note").value.trim(),
    };

    try {
      const url = id
        ? `${API}/cotisations-speciales/${id}`
        : `${API}/cotisations-speciales`;
      const method = id ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        afficherAlerte(
          id ? "Cotisation modifiée !" : "Cotisation ajoutée !",
          "success",
        );
        fermerModal();
        chargerCotisations();
      } else {
        afficherAlerte(data.message || "Erreur", "error");
      }
    } catch (e) {
      afficherAlerte("Erreur lors de l'enregistrement", "error");
    }
  });

// Suppression
async function supprimerCotisation(id) {
  if (!confirm("Supprimer cette cotisation spéciale ?")) return;

  try {
    const res = await fetch(`${API}/cotisations-speciales/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();

    if (data.success) {
      afficherAlerte("Cotisation supprimée", "success");
      chargerCotisations();
    } else {
      afficherAlerte(data.message, "error");
    }
  } catch (e) {
    afficherAlerte("Erreur lors de la suppression", "error");
  }
}

// Filtre
function filtrerCotisations() {
  const recherche = document.getElementById("filtreInput").value.toLowerCase();
  document.querySelectorAll("#cotisationsBody tr").forEach((tr) => {
    tr.style.display = tr.textContent.toLowerCase().includes(recherche)
      ? ""
      : "none";
  });
}

// Alerte
function afficherAlerte(msg, type) {
  const el = document.getElementById("alert");
  el.textContent = msg;
  el.className = `alert alert-${type}`;
  el.style.display = "block";
  setTimeout(() => (el.style.display = "none"), 4000);
}

// Fermeture modal dehors
window.onclick = (e) => {
  if (e.target.id === "modal") fermerModal();
};
