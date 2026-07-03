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
  document.getElementById("emptyState").classList.add("hidden");

  try {
    const data = await apiFetch("/cotisations-speciales");

    if (data.success) {
      afficherCotisations(data.data || []);
    } else {
      afficherAlert(data.message || "Erreur serveur", "danger");
    }
  } catch (e) {
    console.error(e);
    afficherAlert("Erreur de connexion au serveur", "danger");
  } finally {
    document.getElementById("loading").style.display = "none";
  }
}

const STATUT_BADGES = {
  payee: '<span class="badge badge-success"><i class="fa-solid fa-circle badge-dot"></i>Payée</span>',
  en_attente: '<span class="badge badge-warning" style="background:var(--color-warning-soft);color:var(--color-warning)"><i class="fa-solid fa-circle badge-dot"></i>En attente</span>',
  annule: '<span class="badge badge-danger"><i class="fa-solid fa-circle badge-dot"></i>Annulée</span>',
};

function afficherCotisations(liste) {
  const tbody = document.getElementById("cotisationsBody");
  tbody.innerHTML = "";

  if (liste.length === 0) {
    document.getElementById("emptyState").classList.remove("hidden");
    document.getElementById("cotisationsTable").style.display = "none";
    return;
  }

  document.getElementById("cotisationsTable").style.display = "block";
  document.getElementById("emptyState").classList.add("hidden");

  cotisationsActuelles = liste;

  liste.forEach((c) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.membre || "—"}</td>
      <td>${formatMontant(c.montant)} FCFA</td>
      <td>${formatDate(c.date_paiement)}</td>
      <td>${c.projet_nom || "—"}</td>
      <td>${STATUT_BADGES[c.statut] || c.statut}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="ouvrirModalModification(${c.id})"><i class="fa-solid fa-pen"></i> Modifier</button>
        <button class="btn btn-sm btn-danger" onclick="supprimerCotisation(${c.id})"><i class="fa-solid fa-trash"></i> Supprimer</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Charger membres
async function chargerMembresPourSelect() {
  try {
    const data = await apiFetch("/membres");
    const select = document.getElementById("membreId");
    select.innerHTML = '<option value="">-- Choisir un membre --</option>';
    if (data.success && data.data) {
      data.data.forEach((m) => {
        select.innerHTML += `<option value="${m.id}">${m.nom} ${m.prenom}</option>`;
      });
    }
  } catch (e) {
    console.error(e);
  }
}

// Charger projets en cours
async function chargerProjetsEnCours() {
  try {
    const data = await apiFetch("/projets");
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
  document.getElementById("modalTitle").textContent = "Nouvelle cotisation spéciale";
  document.getElementById("cotisationForm").reset();
  document.getElementById("cotisationId").value = "";
  openModal("modal");
}

// Modal Modification
async function ouvrirModalModification(id) {
  try {
    const data = await apiFetch(`/cotisations-speciales/${id}`);

    if (data.success) {
      const c = data.data;
      document.getElementById("modalTitle").textContent = "Modifier la cotisation spéciale";
      document.getElementById("cotisationId").value = c.id;
      document.getElementById("membreId").value = c.membre_id;
      document.getElementById("projetId").value = c.projet_id || "";
      document.getElementById("montant").value = c.montant;
      document.getElementById("datePaiement").value = c.date_paiement ? c.date_paiement.split("T")[0] : "";
      document.getElementById("statut").value = c.statut;
      document.getElementById("note").value = c.note || "";
      openModal("modal");
    }
  } catch (e) {
    afficherAlert("Erreur lors du chargement", "danger");
  }
}

// Soumission formulaire
document.getElementById("cotisationForm").addEventListener("submit", async (e) => {
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
    const data = await apiFetch(`/cotisations-speciales${id ? "/" + id : ""}`, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload),
    });

    if (data.success) {
      afficherAlert(id ? "Cotisation modifiée !" : "Cotisation ajoutée !", "success");
      closeModal("modal");
      chargerCotisations();
    } else {
      afficherAlert(data.message || "Erreur", "danger");
    }
  } catch (e) {
    afficherAlert("Erreur lors de l'enregistrement", "danger");
  }
});

// Suppression
async function supprimerCotisation(id) {
  const ok = await confirmModal({
    title: "Supprimer la cotisation",
    message: "Cette action est irréversible.",
    confirmText: "Supprimer",
  });
  if (!ok) return;

  try {
    const data = await apiFetch(`/cotisations-speciales/${id}`, { method: "DELETE" });

    if (data.success) {
      afficherAlert("Cotisation supprimée", "success");
      chargerCotisations();
    } else {
      afficherAlert(data.message, "danger");
    }
  } catch (e) {
    afficherAlert("Erreur lors de la suppression", "danger");
  }
}

// Filtre
function filtrerCotisations() {
  const recherche = document.getElementById("filtreInput").value.toLowerCase();
  document.querySelectorAll("#cotisationsBody tr").forEach((tr) => {
    tr.style.display = tr.textContent.toLowerCase().includes(recherche) ? "" : "none";
  });
}
