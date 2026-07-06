let currentUser = null;

window.addEventListener("DOMContentLoaded", chargerProfil);

async function chargerProfil() {
  try {
    const data = await apiFetch("/auth/me");
    if (!data.success) return;

    currentUser = data.data;
    document.getElementById("nom").value = currentUser.nom;
    document.getElementById("prenom").value = currentUser.prenom;
    document.getElementById("email").value = currentUser.email;
    afficherPhoto(currentUser);
  } catch (e) {
    afficherAlert("Erreur lors du chargement du profil", "danger");
  }
}

function afficherPhoto(user) {
  const photoEl = document.getElementById("profilePhoto");
  if (user.photo) {
    photoEl.innerHTML = `<img src="/uploads/avatars/${user.photo}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`;
  } else {
    photoEl.textContent = `${(user.prenom || "").charAt(0)}${(user.nom || "").charAt(0)}`.toUpperCase();
  }
}

document.getElementById("btnChoosePhoto").addEventListener("click", () => {
  document.getElementById("photoInput").click();
});

document.getElementById("photoInput").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("photo", file);

  try {
    const data = await apiFetch("/auth/photo", { method: "POST", body: formData });
    if (data.success) {
      currentUser = data.data;
      afficherPhoto(currentUser);
      loadCurrentUser();
      afficherAlert("Photo de profil mise à jour", "success");
    } else {
      afficherAlert(data.message || "Erreur lors de l'envoi de la photo", "danger");
    }
  } catch (error) {
    afficherAlert("Erreur lors de l'envoi de la photo", "danger");
  }
});

document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    nom: document.getElementById("nom").value.trim(),
    prenom: document.getElementById("prenom").value.trim(),
    email: document.getElementById("email").value.trim(),
  };

  const newPassword = document.getElementById("newPassword").value;
  const currentPassword = document.getElementById("currentPassword").value;
  if (newPassword) {
    payload.new_password = newPassword;
    payload.current_password = currentPassword;
  }

  try {
    const data = await apiFetch("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    if (data.success) {
      afficherAlert("Profil mis à jour avec succès", "success");
      document.getElementById("currentPassword").value = "";
      document.getElementById("newPassword").value = "";
      loadCurrentUser();
    } else {
      afficherAlert(data.message || (data.errors && data.errors[0]) || "Erreur", "danger");
    }
  } catch (error) {
    afficherAlert("Erreur lors de la mise à jour du profil", "danger");
  }
});
