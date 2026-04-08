const API = "http://localhost:3000/api";
let membresActuels = [];
let membreIdToDelete = null;

// Chargement
async function chargerMembres() {
  document.getElementById("loading").style.display = "flex";
  document.getElementById("membresTable").style.display = "none";
  document.getElementById("emptyState").style.display = "none";

  try {
    const res = await fetch(`${API}/membres?all=true`);
    const data = await res.json();
    afficherMembres(data.data || []);
  } catch (e) {
    afficherAlerte("Erreur de connexion au serveur", "error");
  } finally {
    document.getElementById("loading").style.display = "none";
  }
}

function afficherMembres(membres) {
  const tbody = document.getElementById("membresBody");
  tbody.innerHTML = "";

  if (membres.length === 0) {
    document.getElementById("emptyState").style.display = "block";
    document.getElementById("membresTable").style.display = "none";
    return;
  }

  document.getElementById("emptyState").style.display = "none";
  document.getElementById("membresTable").style.display = "block";

  membresActuels = membres;

  membres.forEach((m) => {
    const estAbonne = !!m.abonne_annuel;
    const estActif = !!m.actif;

    const badgeAbonne = estAbonne
      ? '<span style="padding: 5px 10px; background: #17a2b8; color: white; border-radius: 5px; font-weight: bold;">🟢 Abonné Annuel</span>'
      : '<span style="padding: 5px 10px; background: #6c757d; color: white; border-radius: 5px;">Par réunion</span>';

    const badgeActif = estActif
      ? '<span style="padding: 5px 10px; background: #28a745; color: white; border-radius: 5px; font-weight: bold;">Actif</span>'
      : '<span style="padding: 5px 10px; background: #dc3545; color: white; border-radius: 5px; font-weight: bold;">Inactif</span>';

    const tr = document.createElement("tr");
    tr.style.opacity = estActif ? "1" : "0.6";
    tr.innerHTML = `
      <td>${m.nom}</td>
      <td>${m.prenom}</td>
      <td>${m.numero}</td>
      <td>${badgeAbonne}</td>
      <td>${badgeActif}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="ouvrirModalModification(${m.id})">✏️ Modifier</button>
        <button class="btn btn-sm btn-danger" onclick="ouvrirModalConfirmDelete(${m.id})">🗑️ Supprimer</button>
      </td>
    `;
    tbody.appendChild(tr);
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
  document.getElementById("modal").style.display = "flex";
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

  document.getElementById("modal").style.display = "flex";
}

function fermerModal() {
  document.getElementById("modal").style.display = "none";
}

// Modal Confirmation Suppression
function ouvrirModalConfirmDelete(id) {
  membreIdToDelete = id;
  document.getElementById("modalConfirmDelete").style.display = "flex";
}

function fermerModalConfirmDelete() {
  membreIdToDelete = null;
  document.getElementById("modalConfirmDelete").style.display = "none";
}

async function confirmerSuppression() {
  if (!membreIdToDelete) return;

  try {
    const res = await fetch(`${API}/membres/${membreIdToDelete}`, {
      method: "DELETE",
    });
    const data = await res.json();

    fermerModalConfirmDelete();

    if (data.success) {
      afficherAlerte("Membre supprimé avec succès", "success");
      chargerMembres();
    } else {
      afficherAlerte(
        data.message || "Impossible de supprimer ce membre",
        "error",
      );
    }
  } catch (e) {
    fermerModalConfirmDelete();
    afficherAlerte("Erreur lors de la suppression", "error");
  }
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
    const res = await fetch(`${API}/membres${id ? "/" + id : ""}`, {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.success) {
      afficherAlerte(
        id ? "Membre modifié avec succès" : "Membre ajouté avec succès",
        "success",
      );
      fermerModal();
      chargerMembres();
    } else {
      afficherAlerte(data.message || "Erreur", "error");
    }
  } catch (e) {
    afficherAlerte("Erreur lors de l'enregistrement", "error");
  }
});

async function toggleActif(id) {
  try {
    const res = await fetch(`${API}/membres/${id}/toggle-actif`, {
      method: "PATCH",
    });
    const data = await res.json();
    if (data.success) {
      afficherAlerte(data.message, "success");
      chargerMembres();
    } else {
      afficherAlerte(data.message || "Erreur", "error");
    }
  } catch (e) {
    afficherAlerte("Erreur de connexion au serveur", "error");
  }
}

function afficherAlerte(msg, type) {
  const el = document.getElementById("alert");
  el.textContent = msg;
  el.className = `alert alert-${type}`;
  el.style.display = "block";
  setTimeout(() => (el.style.display = "none"), 4000);
}

window.onclick = (e) => {
  if (e.target.id === "modal") fermerModal();
  if (e.target.id === "modalConfirmDelete") fermerModalConfirmDelete();
};

document.getElementById("actif").addEventListener("change", majLabelActif);

chargerMembres();
