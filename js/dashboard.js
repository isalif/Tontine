window.addEventListener("DOMContentLoaded", chargerDashboard);

if (window.Chart) {
  Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
  Chart.defaults.color = "#6b7280";
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.legend.labels.boxWidth = 8;
  Chart.defaults.plugins.legend.labels.boxHeight = 8;
}

async function chargerDashboard() {
  try {
    const [dataM, dataR, dataP, dataT] = await Promise.all([
      apiFetch("/membres/count"),
      apiFetch("/reunions"),
      apiFetch("/projets"),
      apiFetch("/cotisations/totaux-par-reunion"),
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
      renderChartReunionsStatut(reunions);
    }

    if (dataP.success) {
      afficherStatsProjets(dataP.data);
      renderChartProjetsMontants(dataP.data);
    }

    if (dataT.success) {
      renderChartCotisationsEvolution(dataT.data);
    }
  } catch (e) {
    console.error("Erreur chargement dashboard", e);
    toast("Erreur de connexion au serveur", "danger");
  }
}

// ====================== GRAPHIQUES ======================

function renderChartReunionsStatut(reunions) {
  const canvas = document.getElementById("chartReunionsStatut");
  if (!canvas || !window.Chart) return;

  const enCours = reunions.filter((r) => r.statut === "en_cours").length;
  const cloturees = reunions.filter((r) => r.statut === "cloturee").length;

  if (canvas._chart) canvas._chart.destroy();
  canvas._chart = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: ["En cours", "Clôturées"],
      datasets: [
        {
          data: [enCours, cloturees],
          backgroundColor: ["#2496b8", "#d98c1d"],
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "65%",
      plugins: {
        legend: { position: "bottom" },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label} : ${ctx.parsed}`,
          },
        },
      },
    },
  });
}

function renderChartProjetsMontants(projets) {
  const canvas = document.getElementById("chartProjetsMontants");
  if (!canvas || !window.Chart) return;

  if (canvas._chart) canvas._chart.destroy();
  canvas._chart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: projets.map((p) => p.nom),
      datasets: [
        {
          label: "Cible",
          data: projets.map((p) => Number(p.montant_cible) || 0),
          backgroundColor: "#5b5bf0",
          borderRadius: 4,
          maxBarThickness: 28,
        },
        {
          label: "Collecté",
          data: projets.map((p) => Number(p.montant_collecte) || 0),
          backgroundColor: "#17a06a",
          borderRadius: 4,
          maxBarThickness: 28,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { display: false } },
        y: {
          grid: { color: "#e6e9f2" },
          ticks: { callback: (v) => formatMontant(v) },
        },
      },
      plugins: {
        legend: { position: "bottom" },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label} : ${formatMontant(ctx.parsed.y)} FCFA`,
          },
        },
      },
    },
  });
}

function renderChartCotisationsEvolution(totaux) {
  const canvas = document.getElementById("chartCotisationsEvolution");
  if (!canvas || !window.Chart) return;

  if (canvas._chart) canvas._chart.destroy();
  canvas._chart = new Chart(canvas, {
    type: "line",
    data: {
      labels: totaux.map((t) => formatDate(t.date_reunion)),
      datasets: [
        {
          label: "Total collecté",
          data: totaux.map((t) => Number(t.total) || 0),
          borderColor: "#5b5bf0",
          backgroundColor: "rgba(91, 91, 240, 0.12)",
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: "#5b5bf0",
          fill: true,
          tension: 0.25,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { display: false } },
        y: {
          grid: { color: "#e6e9f2" },
          ticks: { callback: (v) => formatMontant(v) },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `${formatMontant(ctx.parsed.y)} FCFA`,
          },
        },
      },
    },
  });
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
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;padding:12px 0;border-bottom:1px solid var(--color-border)">
          <div style="min-width:0;">
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
    <div class="stats-grid stats-grid-3">
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
