document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const remember = document.getElementById("remember").checked;
  const btn = document.getElementById("btnSubmit");

  btn.disabled = true;
  try {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, remember }),
    });

    if (data.success) {
      window.location.href = "/";
    } else {
      afficherAlert(data.message || "Identifiants incorrects", "danger");
      btn.disabled = false;
    }
  } catch (error) {
    afficherAlert("Erreur de connexion au serveur", "danger");
    btn.disabled = false;
  }
});
