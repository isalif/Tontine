let membresActuels = [];
let membreIdToDelete = null;

// Chargement
async function chargerMembres() {
  document.getElementById("loading").style.display = "flex";
  document.getElementById("membresTable").style.display = "none";
  document.getElementById("emptyState").classList.add("hidden");

  try {
    const data = await apiFetch("/membres?all=true");
    afficherMembres(data.data || []);
  } catch (e) {
    afficherAlert("Erreur de connexion au serveur", "danger");
  } finally {
    document.getElementById("loading").style.display = "none";
  }
}

function afficherMembres(membres) {
  const tbody = document.getElementById("membresBody");
  tbody.innerHTML = "";

  membresActuels = membres;
  afficherStatsMembres(membres);

  if (membres.length === 0) {
    document.getElementById("emptyState").classList.remove("hidden");
    document.getElementById("membresTable").style.display = "none";
    return;
  }

  document.getElementById("emptyState").classList.add("hidden");
  document.getElementById("membresTable").style.display = "block";

  membres.forEach((m) => {
    const estAbonne = !!m.abonne_annuel;
    const estActif = !!m.actif;

    const badgeAbonne = estAbonne
      ? '<span class="badge badge-info"><i class="fa-solid fa-circle badge-dot"></i>Abonné annuel</span>'
      : '<span class="badge badge-muted">Par réunion</span>';

    const badgeActif = estActif
      ? '<span class="badge badge-success">Actif</span>'
      : '<span class="badge badge-danger">Inactif</span>';

    const tr = document.createElement("tr");
    tr.style.opacity = estActif ? "1" : "0.6";
    tr.innerHTML = `
      <td>${m.nom}</td>
      <td>${m.prenom}</td>
      <td>${m.numero}</td>
      <td>${badgeAbonne}</td>
      <td>${badgeActif}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="ouvrirModalModification(${m.id})"><i class="fa-solid fa-pen"></i> Modifier</button>
        <button class="btn btn-sm btn-danger" onclick="ouvrirModalConfirmDelete(${m.id})"><i class="fa-solid fa-trash"></i> Supprimer</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function afficherStatsMembres(membres) {
  document.getElementById("statMembresTotal").textContent = membres.length;
  document.getElementById("statMembresActifs").textContent =
    membres.filter((m) => m.actif).length;
  document.getElementById("statMembresInactifs").textContent =
    membres.filter((m) => !m.actif).length;
  document.getElementById("statMembresAbonnes").textContent =
    membres.filter((m) => m.abonne_annuel).length;
}

function filtrerMembres() {
  const recherche = document.getElementById("filtreInput").value.toLowerCase();
  const lignes = document.querySelectorAll("#membresBody tr");

  lignes.forEach((ligne) => {
    const nom = ligne.cells[0]?.textContent.toLowerCase() || "";
    const prenom = ligne.cells[1]?.textContent.toLowerCase() || "";
    const tel = ligne.cells[2]?.textContent.toLowerCase() || "";

    ligne.style.display =
      nom.includes(recherche) || prenom.includes(recherche) || tel.includes(recherche)
        ? ""
        : "none";
  });
}

function majLabelActif() {
  const actif = document.getElementById("actif").checked;
  document.getElementById("actifLabel").textContent = actif ? "Actif" : "Inactif";
}

// Modal Ajout
function ouvrirModalAjout() {
  document.getElementById("modalTitle").textContent = "Ajouter un membre";
  document.getElementById("membreForm").reset();
  document.getElementById("membreId").value = "";
  document.getElementById("actif").checked = true;
  majLabelActif();
  openModal("modal");
}

// Modal Modification
function ouvrirModalModification(id) {
  const m = membresActuels.find((x) => x.id === id);
  if (!m) return;

  document.getElementById("modalTitle").textContent = "Modifier un membre";
  document.getElementById("membreId").value = m.id;
  document.getElementById("nom").value = m.nom;
  document.getElementById("prenom").value = m.prenom;
  document.getElementById("numero").value = m.numero;
  document.getElementById("abonneAnnuel").checked = !!m.abonne_annuel;
  document.getElementById("actif").checked = !!m.actif;
  majLabelActif();

  openModal("modal");
}

// Modal Confirmation Suppression
function ouvrirModalConfirmDelete(id) {
  membreIdToDelete = id;
  openModal("modalConfirmDelete");
}

async function confirmerSuppression() {
  if (!membreIdToDelete) return;

  try {
    const data = await apiFetch(`/membres/${membreIdToDelete}`, { method: "DELETE" });
    closeModal("modalConfirmDelete");

    if (data.success) {
      afficherAlert("Membre supprimé avec succès", "success");
      chargerMembres();
    } else {
      afficherAlert(data.message || "Impossible de supprimer ce membre", "danger");
    }
  } catch (e) {
    closeModal("modalConfirmDelete");
    afficherAlert("Erreur lors de la suppression", "danger");
  }
  membreIdToDelete = null;
}

// Soumission formulaire
document.getElementById("membreForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("membreId").value;

  const payload = {
    nom: document.getElementById("nom").value.trim(),
    prenom: document.getElementById("prenom").value.trim(),
    numero: document.getElementById("numero").value.trim(),
    abonne_annuel: document.getElementById("abonneAnnuel").checked,
    actif: document.getElementById("actif").checked,
  };

  try {
    const data = await apiFetch(`/membres${id ? "/" + id : ""}`, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload),
    });

    if (data.success) {
      afficherAlert(id ? "Membre modifié avec succès" : "Membre ajouté avec succès", "success");
      closeModal("modal");
      chargerMembres();
    } else {
      afficherAlert(data.message || "Erreur", "danger");
    }
  } catch (e) {
    afficherAlert("Erreur lors de l'enregistrement", "danger");
  }
});

async function toggleActif(id) {
  try {
    const data = await apiFetch(`/membres/${id}/toggle-actif`, { method: "PATCH" });
    if (data.success) {
      afficherAlert(data.message, "success");
      chargerMembres();
    } else {
      afficherAlert(data.message || "Erreur", "danger");
    }
  } catch (e) {
    afficherAlert("Erreur de connexion au serveur", "danger");
  }
}

document.getElementById("actif").addEventListener("change", majLabelActif);

chargerMembres();
