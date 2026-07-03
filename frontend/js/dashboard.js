window.addEventListener("DOMContentLoaded", chargerDashboard);

async function chargerDashboard() {
  try {
    const [dataM, dataR, dataP] = await Promise.all([
      apiFetch("/membres/count"),
      apiFetch("/reunions"),
      apiFetch("/projets"),
    ]);

    document.getElementById("membresActifs").textContent = dataM.success
      ? dataM.data.total
      : 0;

    if (dataR.success) {
      const reunions = dataR.data;
      document.getElementById("reunionsTotal").textContent = reunions.length;
      const enCoursR = reunions.filter((r) => r.statut === "en_cours").length;
      document.getElementById("reunionsEnCours").textContent = enCoursR;
      afficherDernieresReunions(reunions.slice(0, 5));
    }

    if (dataP.success) {
      afficherStatsProjets(dataP.data);
    }
  } catch (e) {
    console.error("Erreur chargement dashboard", e);
    toast("Erreur de connexion au serveur", "danger");
  }
}

function afficherDernieresReunions(reunions) {
  const container = document.getElementById("dernieresReunions");

  if (!reunions.length) {
    container.innerHTML = `<p style="color: var(--color-text-muted)">Aucune réunion pour le moment.</p>`;
    return;
  }

  container.innerHTML = reunions
    .map((r) => {
      const badgeClass = r.statut === "en_cours" ? "badge-info" : "badge-success";
      const badgeText = r.statut === "en_cours" ? "En cours" : "Clôturée";
      return `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--color-border)">
          <div>
            <strong>${r.titre || "Sans titre"}</strong>
            <div style="font-size:0.82rem;color:var(--color-text-muted)">
              ${formatDate(r.date_reunion)}${r.projet_nom ? " · " + r.projet_nom : ""}
            </div>
          </div>
          <div class="d-flex align-center gap-10">
            <span class="badge ${badgeClass}">${badgeText}</span>
            <a href="cotisations.html?reunion=${r.id}" class="btn btn-sm btn-info">Cotisations</a>
          </div>
        </div>
      `;
    })
    .join("");
}

function afficherStatsProjets(projets) {
  document.getElementById("totalProjets").textContent = projets.length;
  const enCoursP = projets.filter((p) => p.statut === "en_cours").length;
  const terminesP = projets.filter((p) => p.statut === "termine").length;
  document.getElementById("projetsEnCoursStat").textContent = enCoursP;
  document.getElementById("projetsTermines").textContent = terminesP;

  const select = document.getElementById("projetSelect");
  select.innerHTML = '<option value="">-- Sélectionner un projet --</option>';

  projets.sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation));

  projets.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = `${p.nom} (${p.statut === "en_cours" ? "En cours" : p.statut})`;
    select.appendChild(opt);
  });

  const defaultProj = projets.find((p) => p.statut === "en_cours") || projets[0];
  if (defaultProj) {
    select.value = defaultProj.id;
    afficherDetailsProjet(defaultProj);
  } else {
    document.getElementById("projetDetails").innerHTML =
      '<p style="color: var(--color-text-muted)">Aucun projet pour le moment.</p>';
  }

  select.addEventListener("change", () => {
    const proj = projets.find((p) => p.id == select.value);
    if (proj) afficherDetailsProjet(proj);
  });
}

function afficherDetailsProjet(p) {
  const cible = Number(p.montant_cible || 0);
  const collecte = Number(p.montant_collecte || 0);
  const restant = Math.max(0, cible - collecte);

  document.getElementById("projetDetails").innerHTML = `
    <h3>${p.nom}</h3>
    <p style="margin-top:6px"><strong>Description :</strong> ${p.description || "—"}</p>
    <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 20px; margin-bottom:0;">
      <div style="background:var(--color-primary-soft);padding:15px;border-radius:var(--radius-md);text-align:center;">
        <small>Cible</small>
        <h3 style="color:var(--color-primary);margin:8px 0 0;font-size:1.3rem;">${formatMontant(cible)} FCFA</h3>
      </div>
      <div style="background:var(--color-success-soft);padding:15px;border-radius:var(--radius-md);text-align:center;">
        <small>Collecté</small>
        <h3 style="color:var(--color-success);margin:8px 0 0;font-size:1.3rem;">${formatMontant(collecte)} FCFA</h3>
      </div>
      <div style="background:var(--color-danger-soft);padding:15px;border-radius:var(--radius-md);text-align:center;">
        <small>Restant</small>
        <h3 style="color:var(--color-danger);margin:8px 0 0;font-size:1.3rem;">${formatMontant(restant)} FCFA</h3>
      </div>
    </div>
  `;
}
