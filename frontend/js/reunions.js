let reunions = [];

window.addEventListener("DOMContentLoaded", () => {
  chargerReunions();
  chargerProjetsEnCours();
});

async function chargerCotisationDefaut() {
  try {
    const data = await apiFetch("/cotisations/configuration");
    if (data.success && data.data.cotisation_mensuelle_defaut) {
      document.getElementById("cotisationMensuelle").value =
        data.data.cotisation_mensuelle_defaut;
    }
  } catch (e) {
    console.error("Erreur chargement config cotisation", e);
  }
}

async function chargerReunions() {
  try {
    const data = await apiFetch("/reunions");

    document.getElementById("loading").style.display = "none";

    if (data.success && data.data.length) {
      reunions = data.data;
      afficherReunions(reunions);
      document.getElementById("reunionsTable").style.display = "block";
      document.getElementById("emptyState").classList.add("hidden");
    } else {
      document.getElementById("reunionsTable").style.display = "none";
      document.getElementById("emptyState").classList.remove("hidden");
    }
  } catch (error) {
    console.error(error);
    document.getElementById("loading").style.display = "none";
    afficherAlert("Erreur de connexion au serveur", "danger");
  }
}

function afficherReunions(reunions) {
  const tbody = document.getElementById("reunionsBody");
  tbody.innerHTML = "";

  reunions.forEach((r) => {
    const statutBadge =
      r.statut === "en_cours"
        ? '<span class="badge badge-info">En cours</span>'
        : '<span class="badge badge-muted">Clôturée</span>';

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${r.titre || "Sans titre"}</strong></td>
      <td>${formatDate(r.date_reunion)}</td>
      <td>${r.projet_nom || "—"}</td>
      <td>${statutBadge}</td>
      <td>
        <a href="cotisations.html?reunion=${r.id}" class="btn btn-sm btn-info"><i class="fa-solid fa-file-pen"></i> Cotisations</a>
        ${
          r.statut === "en_cours"
            ? `
          <button class="btn btn-sm btn-warning" onclick="ouvrirModalModification(${r.id})"><i class="fa-solid fa-pen"></i> Modifier</button>
          <button class="btn btn-sm btn-warning" onclick="cloturerReunion(${r.id})"><i class="fa-solid fa-lock"></i> Clôturer</button>
        `
            : ""
        }
        <button class="btn btn-sm btn-danger" onclick="supprimerReunion(${r.id})"><i class="fa-solid fa-trash"></i> Supprimer</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Charger les projets en cours pour le select
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
    console.error("Erreur chargement projets", e);
  }
}

// Modal Création
function ouvrirModalCreation() {
  document.getElementById("modalTitle").textContent = "Créer une nouvelle réunion";
  document.getElementById("reunionId").value = "";
  document.getElementById("titre").value = "";
  document.getElementById("dateReunion").value = new Date().toISOString().split("T")[0];
  document.getElementById("projetId").value = "";
  document.getElementById("cotisationMensuelle").value = "";
  document.getElementById("champCotisation").style.display = "block";
  document.getElementById("btnSubmit").textContent = "Créer la réunion";
  chargerCotisationDefaut();
  openModal("modal");
}

// Modal Modification
async function ouvrirModalModification(id) {
  try {
    const data = await apiFetch(`/reunions/${id}`);

    if (data.success) {
      const r = data.data;
      document.getElementById("modalTitle").textContent = "Modifier la réunion";
      document.getElementById("reunionId").value = r.id;
      document.getElementById("titre").value = r.titre || "";
      document.getElementById("dateReunion").value = r.date_reunion.split("T")[0];
      document.getElementById("projetId").value = r.projet_id || "";
      document.getElementById("champCotisation").style.display = "none";
      document.getElementById("btnSubmit").textContent = "Enregistrer les modifications";
      openModal("modal");
    }
  } catch (e) {
    afficherAlert("Erreur lors du chargement", "danger");
  }
}

// Soumission du formulaire (Créer ou Modifier)
document.getElementById("reunionForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("reunionId").value;
  const titre = document.getElementById("titre").value.trim();
  const dateReunion = document.getElementById("dateReunion").value;
  const projetId = document.getElementById("projetId").value || null;
  const cotisationMensuelle = id
    ? null
    : parseFloat(document.getElementById("cotisationMensuelle").value) || null;

  if (!dateReunion) {
    afficherAlert("La date est obligatoire", "danger");
    return;
  }

  try {
    const body = { titre, date_reunion: dateReunion, projet_id: projetId };
    if (!id && cotisationMensuelle !== null) {
      body.cotisation_mensuelle = cotisationMensuelle;
    }

    const data = await apiFetch(`/reunions${id ? "/" + id : ""}`, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(body),
    });

    if (data.success) {
      afficherAlert(data.message, "success");
      closeModal("modal");
      chargerReunions();
    } else {
      afficherAlert(data.message, "danger");
    }
  } catch (error) {
    console.error("Erreur:", error);
    afficherAlert("Erreur de connexion au serveur", "danger");
  }
});

// Clôturer réunion
async function cloturerReunion(id) {
  const ok = await confirmModal({
    title: "Clôturer la réunion",
    message: "Une fois clôturée, les cotisations de cette réunion ne pourront plus être modifiées.",
    confirmText: "Clôturer",
  });
  if (!ok) return;

  try {
    const data = await apiFetch(`/reunions/${id}/cloture`, { method: "PUT" });

    if (data.success) {
      afficherAlert(data.message, "success");
      chargerReunions();
    } else {
      afficherAlert(data.message, "danger");
    }
  } catch (e) {
    afficherAlert("Erreur lors de la clôture", "danger");
  }
}

// Suppression
async function supprimerReunion(id) {
  const ok = await confirmModal({
    title: "Supprimer la réunion",
    message: "Cette action est irréversible et supprimera aussi les cotisations liées.",
    confirmText: "Supprimer",
  });
  if (!ok) return;

  try {
    const data = await apiFetch(`/reunions/${id}`, { method: "DELETE" });

    if (data.success) {
      afficherAlert(data.message, "success");
      chargerReunions();
    } else {
      afficherAlert(data.message, "danger");
    }
  } catch (e) {
    afficherAlert("Erreur lors de la suppression", "danger");
  }
}
