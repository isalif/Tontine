window.addEventListener("DOMContentLoaded", chargerMembresDisponibles);

async function chargerMembresDisponibles() {
  const select = document.getElementById("membreId");
  const help = document.getElementById("membreIdHelp");

  try {
    const data = await apiFetch("/membres/unlinked");
    if (data.success && data.data && data.data.length > 0) {
      data.data.forEach((m) => {
        const option = document.createElement("option");
        option.value = m.id;
        option.textContent = `${m.nom} ${m.prenom}`;
        select.appendChild(option);
      });
    } else {
      select.disabled = true;
      select.innerHTML = '<option value="">-- Aucun membre disponible --</option>';
      help.textContent = "Aucun membre disponible pour le moment — contactez l'administrateur, vous pourrez être relié à votre fiche après votre inscription.";
    }
  } catch (e) {
    select.disabled = true;
    help.textContent = "Impossible de charger la liste des membres pour le moment.";
  }
}

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nom = document.getElementById("nom").value.trim();
  const prenom = document.getElementById("prenom").value.trim();
  const email = document.getElementById("email").value.trim();
  const membreId = document.getElementById("membreId").value || null;
  const password = document.getElementById("password").value;
  const passwordConfirm = document.getElementById("passwordConfirm").value;
  const btn = document.getElementById("btnSubmit");

  if (password !== passwordConfirm) {
    afficherAlert("Les mots de passe ne correspondent pas", "danger");
    return;
  }

  btn.disabled = true;
  try {
    const data = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ nom, prenom, email, password, membre_id: membreId }),
    });

    if (data.success) {
      window.location.href = "/";
    } else {
      afficherAlert(data.message || (data.errors && data.errors[0]) || "Erreur lors de l'inscription", "danger");
      btn.disabled = false;
    }
  } catch (error) {
    afficherAlert("Erreur de connexion au serveur", "danger");
    btn.disabled = false;
  }
});
