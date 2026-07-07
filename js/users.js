let usersActuels = [];
let userIdToDelete = null;

window.addEventListener("DOMContentLoaded", async () => {
  await window.currentUserReady;
  chargerUsers();
});

async function chargerUsers() {
  document.getElementById("loading").style.display = "flex";
  document.getElementById("usersTable").style.display = "none";
  document.getElementById("emptyState").classList.add("hidden");

  try {
    const data = await apiFetch("/users");
    afficherUsers(data.data || []);
  } catch (e) {
    afficherAlert("Erreur de connexion au serveur", "danger");
  } finally {
    document.getElementById("loading").style.display = "none";
  }
}

function afficherUsers(users) {
  usersActuels = users;
  afficherStatsUsers(users);

  const tbody = document.getElementById("usersBody");
  tbody.innerHTML = "";

  if (users.length === 0) {
    document.getElementById("emptyState").classList.remove("hidden");
    document.getElementById("usersTable").style.display = "none";
    return;
  }

  document.getElementById("emptyState").classList.add("hidden");
  document.getElementById("usersTable").style.display = "block";

  users.forEach((u) => {
    const isSelf = window.currentUser?.id === u.id;
    const roleBadge =
      u.role === "admin"
        ? '<span class="badge badge-info"><i class="fa-solid fa-circle badge-dot"></i>Administrateur</span>'
        : '<span class="badge badge-muted"><i class="fa-solid fa-circle badge-dot"></i>Membre</span>';
    const membreLabel = u.membre_nom
      ? u.membre_nom
      : '<span style="color:var(--color-text-muted)">— Aucun —</span>';

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${u.prenom} ${u.nom}</strong></td>
      <td>${u.email}</td>
      <td>${roleBadge}</td>
      <td>${membreLabel}</td>
      <td>${formatDate(u.created_at)}</td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="toggleRole(${u.id}, '${u.role}')" ${isSelf ? 'disabled title="Vous ne pouvez pas modifier votre propre rôle"' : ""}>
          <i class="fa-solid fa-shuffle"></i> ${u.role === "admin" ? "Rétrograder" : "Promouvoir"}
        </button>
        <button class="btn btn-sm btn-info" onclick="ouvrirModalLink(${u.id})"><i class="fa-solid fa-link"></i> Lier</button>
        <button class="btn btn-sm btn-danger" onclick="ouvrirModalConfirmDelete(${u.id})" ${isSelf ? 'disabled title="Impossible de supprimer votre propre compte"' : ""}>
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function afficherStatsUsers(users) {
  document.getElementById("statUsersTotal").textContent = users.length;
  document.getElementById("statUsersAdmins").textContent = users.filter((u) => u.role === "admin").length;
  document.getElementById("statUsersMembres").textContent = users.filter((u) => u.role === "membre").length;
}

function filtrerUsers() {
  const recherche = document.getElementById("filtreInput").value.toLowerCase();
  document.querySelectorAll("#usersBody tr").forEach((tr) => {
    tr.style.display = tr.textContent.toLowerCase().includes(recherche) ? "" : "none";
  });
}

async function toggleRole(id, currentRole) {
  const nextRole = currentRole === "admin" ? "membre" : "admin";
  const ok = await confirmModal({
    title: nextRole === "admin" ? "Promouvoir en administrateur" : "Rétrograder en membre",
    message:
      nextRole === "admin"
        ? "Ce compte aura accès à toutes les fonctionnalités de gestion."
        : "Ce compte perdra l'accès aux fonctionnalités de gestion et ne verra plus que ses propres données.",
    confirmText: "Confirmer",
  });
  if (!ok) return;

  try {
    const data = await apiFetch(`/users/${id}/role`, {
      method: "PUT",
      body: JSON.stringify({ role: nextRole }),
    });
    if (data.success) {
      afficherAlert(data.message, "success");
      chargerUsers();
    } else {
      afficherAlert(data.message, "danger");
    }
  } catch (e) {
    afficherAlert("Erreur lors de la mise à jour du rôle", "danger");
  }
}

async function ouvrirModalLink(id) {
  const user = usersActuels.find((u) => u.id === id);
  if (!user) return;

  document.getElementById("linkUserId").value = id;
  const select = document.getElementById("linkMembreId");
  select.innerHTML = '<option value="">-- Aucun (délier) --</option>';

  try {
    const data = await apiFetch("/membres?all=true");
    const linkedElsewhere = new Set(
      usersActuels.filter((u) => u.id !== id && u.membre_id).map((u) => u.membre_id),
    );

    (data.data || [])
      .filter((m) => !linkedElsewhere.has(m.id))
      .forEach((m) => {
        const option = document.createElement("option");
        option.value = m.id;
        option.textContent = `${m.nom} ${m.prenom}`;
        if (m.id === user.membre_id) option.selected = true;
        select.appendChild(option);
      });

    openModal("modalLink");
  } catch (e) {
    afficherAlert("Erreur lors du chargement des membres", "danger");
  }
}

document.getElementById("linkForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("linkUserId").value;
  const membreId = document.getElementById("linkMembreId").value || null;

  try {
    const data = await apiFetch(`/users/${id}/membre`, {
      method: "PUT",
      body: JSON.stringify({ membre_id: membreId }),
    });

    if (data.success) {
      afficherAlert(data.message, "success");
      closeModal("modalLink");
      chargerUsers();
    } else {
      afficherAlert(data.message, "danger");
    }
  } catch (e) {
    afficherAlert("Erreur lors de la mise à jour du lien", "danger");
  }
});

function ouvrirModalConfirmDelete(id) {
  userIdToDelete = id;
  openModal("modalConfirmDelete");
}

async function confirmerSuppression() {
  if (!userIdToDelete) return;

  try {
    const data = await apiFetch(`/users/${userIdToDelete}`, { method: "DELETE" });
    closeModal("modalConfirmDelete");

    if (data.success) {
      afficherAlert("Compte supprimé avec succès", "success");
      chargerUsers();
    } else {
      afficherAlert(data.message || "Impossible de supprimer ce compte", "danger");
    }
  } catch (e) {
    closeModal("modalConfirmDelete");
    afficherAlert("Erreur lors de la suppression", "danger");
  }
  userIdToDelete = null;
}
