const API_URL = "http://localhost:3000/api";
let membres = [];

// Charger les membres au chargement de la page
window.addEventListener("DOMContentLoaded", () => {
  chargerMembres();
});

// Charger tous les membres
async function chargerMembres() {
  try {
    const response = await fetch(`${API_URL}/membres`);
    const data = await response.json();

    document.getElementById("loading").style.display = "none";

    if (data.success && data.data.length > 0) {
      membres = data.data;
      afficherMembres(membres);
      document.getElementById("membresTable").style.display = "block";
    } else {
      document.getElementById("emptyState").style.display = "block";
    }
  } catch (error) {
    console.error("Erreur lors du chargement des membres:", error);
    document.getElementById("loading").style.display = "none";
    afficherAlert("Erreur de connexion au serveur", "danger");
  }
}

// Afficher les membres dans le tableau
function afficherMembres(membres) {
  const tbody = document.getElementById("membresBody");
  tbody.innerHTML = "";

  membres.forEach((membre) => {
    const date = new Date(membre.date_ajout);
    const dateFormatee = date.toLocaleDateString("fr-FR");

    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${membre.nom}</td>
            <td>${membre.prenom}</td>
            <td>${membre.numero}</td>
            <td>${dateFormatee}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="ouvrirModalModification(${membre.id})">✏️ Modifier</button>
                <button class="btn btn-sm btn-danger" onclick="supprimerMembre(${membre.id})">🗑️ Supprimer</button>
            </td>
        `;
    tbody.appendChild(tr);
  });
}

// Ouvrir le modal d'ajout
function ouvrirModalAjout() {
  document.getElementById("modalTitle").textContent = "Ajouter un membre";
  document.getElementById("membreForm").reset();
  document.getElementById("membreId").value = "";
  document.getElementById("modal").classList.add("show");
}

function ouvrirModalModification(id) {
  const membre = membres.find((m) => m.id === id);
  if (!membre) return;

  document.getElementById("modalTitle").textContent = "Modifier un membre";
  document.getElementById("membreId").value = membre.id;
  document.getElementById("nom").value = membre.nom;
  document.getElementById("prenom").value = membre.prenom;
  document.getElementById("numero").value = membre.numero;
  document.getElementById("abonneAnnuel").checked =
    membre.abonne_annuel || false;
  document.getElementById("cotisationSpecialePayee").checked =
    membre.cotisation_speciale_payee || false;
  document.getElementById("modal").classList.add("show");
}

// Fermer le modal
function fermerModal() {
  document.getElementById("modal").classList.remove("show");
  document.getElementById("membreForm").reset();
}

// Soumettre le formulaire
document.getElementById("membreForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("membreId").value;
  const nom = document.getElementById("nom").value.trim();
  const prenom = document.getElementById("prenom").value.trim();
  const numero = document.getElementById("numero").value.trim();
  const abonneAnnuel = document.getElementById("abonneAnnuel").checked;
  const cotisationSpecialePayee = document.getElementById(
    "cotisationSpecialePayee"
  ).checked;

  // Validation
  if (nom.length < 2) {
    afficherAlert("Le nom doit contenir au moins 2 caractères", "danger");
    return;
  }

  if (prenom.length < 2) {
    afficherAlert("Le prénom doit contenir au moins 2 caractères", "danger");
    return;
  }

  if (numero.length < 8) {
    afficherAlert("Le numéro doit contenir au moins 8 caractères", "danger");
    return;
  }

  try {
    const url = id ? `${API_URL}/membres/${id}` : `${API_URL}/membres`;
    const method = id ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nom,
        prenom,
        numero,
        abonne_annuel: abonneAnnuel,
        cotisation_speciale_payee: cotisationSpecialePayee,
      }),
    });

    const data = await response.json();

    if (data.success) {
      afficherAlert(data.message, "success");
      fermerModal();
      chargerMembres();
    } else {
      afficherAlert(data.message, "danger");
    }
  } catch (error) {
    console.error("Erreur lors de l'enregistrement:", error);
    afficherAlert("Erreur de connexion au serveur", "danger");
  }
});

// Supprimer un membre
async function supprimerMembre(id) {
  if (!confirm("Êtes-vous sûr de vouloir supprimer ce membre ?")) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/membres/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (data.success) {
      afficherAlert(data.message, "success");
      chargerMembres();
    } else {
      afficherAlert(data.message, "danger");
    }
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    afficherAlert("Erreur de connexion au serveur", "danger");
  }
}

// Afficher une alerte
function afficherAlert(message, type) {
  const alert = document.getElementById("alert");
  alert.className = `alert alert-${type} show`;
  alert.textContent = message;

  setTimeout(() => {
    alert.classList.remove("show");
  }, 5000);
}

// Fermer le modal en cliquant à l'extérieur
window.addEventListener("click", (e) => {
  const modal = document.getElementById("modal");
  if (e.target === modal) {
    fermerModal();
  }
});
