document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nom = document.getElementById("nom").value.trim();
  const prenom = document.getElementById("prenom").value.trim();
  const email = document.getElementById("email").value.trim();
  const username = document.getElementById("membreUsername").value.trim();
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
      body: JSON.stringify({ nom, prenom, email, password, username }),
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
