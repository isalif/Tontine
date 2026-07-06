<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tableau de bord — Tontix by Draken</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
    <link rel="stylesheet" href="css/style.css" />
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js"></script>
  </head>
  <body data-page="index">
    <div class="app-shell">
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-brand">
          <span class="sidebar-brand-icon"><i class="fa-solid fa-sack-dollar"></i></span>
          <div class="sidebar-brand-text">
            <strong>Tontix</strong>
            <small>by Draken</small>
          </div>
        </div>
        <nav class="sidebar-nav">
          <a href="/" data-page="index" class="nav-link"><span class="nav-icon"><i class="fa-solid fa-house"></i></span>Tableau de bord</a>
          <a href="/membres" data-page="membres" class="nav-link"><span class="nav-icon"><i class="fa-solid fa-users"></i></span>Membres</a>
          <a href="/reunions" data-page="reunions" class="nav-link"><span class="nav-icon"><i class="fa-solid fa-calendar-days"></i></span>Réunions</a>
          <a href="/projets" data-page="projets" class="nav-link"><span class="nav-icon"><i class="fa-solid fa-bullseye"></i></span>Projets</a>
          <a href="/cotisations-special" data-page="cotisations-special" class="nav-link"><span class="nav-icon"><i class="fa-solid fa-gem"></i></span>Cotisations spéciales</a>
        </nav>
        <div class="sidebar-footer">
          <a href="/profile" class="sidebar-user">
            <span class="sidebar-user-avatar" id="sidebarUserAvatar">--</span>
            <span class="sidebar-user-name" id="sidebarUserName">Mon profil</span>
          </a>
          <button class="sidebar-logout" id="sidebarLogout" title="Se déconnecter">
            <i class="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </aside>
      <div class="sidebar-backdrop"></div>

      <div class="app-main">
        <header class="topbar">
          <button class="sidebar-toggle" id="sidebarToggle" aria-label="Menu"><i class="fa-solid fa-bars"></i></button>
          <div class="topbar-title">
            <h1>Tableau de bord</h1>
            <p>Vue d'ensemble des membres, réunions et projets</p>
          </div>
        </header>

        <main class="content">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon"><i class="fa-solid fa-users"></i></div>
              <h3 id="membresActifs">0</h3>
              <p>Membres actifs</p>
            </div>
            <div class="stat-card">
              <div class="stat-icon"><i class="fa-solid fa-calendar-days"></i></div>
              <h3 id="reunionsTotal">0</h3>
              <p>Réunions organisées</p>
            </div>
            <div class="stat-card">
              <div class="stat-icon"><i class="fa-solid fa-circle-play"></i></div>
              <h3 id="reunionsEnCours">0</h3>
              <p>Réunions en cours</p>
            </div>
            <div class="stat-card">
              <div class="stat-icon"><i class="fa-solid fa-bullseye"></i></div>
              <h3 id="totalProjets">0</h3>
              <p>Projets totaux</p>
            </div>
            <div class="stat-card">
              <div class="stat-icon"><i class="fa-solid fa-hourglass-half"></i></div>
              <h3 id="projetsEnCoursStat">0</h3>
              <p>Projets en cours</p>
            </div>
            <div class="stat-card">
              <div class="stat-icon"><i class="fa-solid fa-circle-check"></i></div>
              <h3 id="projetsTermines">0</h3>
              <p>Projets terminés</p>
            </div>
          </div>

          <div class="charts-grid">
            <div class="card chart-card">
              <div class="card-title">Réunions par statut</div>
              <div class="chart-canvas-wrap chart-canvas-wrap-donut">
                <canvas id="chartReunionsStatut"></canvas>
              </div>
            </div>
            <div class="card chart-card">
              <div class="card-title">Projets : cible vs collecté</div>
              <div class="chart-canvas-wrap">
                <canvas id="chartProjetsMontants"></canvas>
              </div>
            </div>
            <div class="card chart-card">
              <div class="card-title">Cotisations collectées par réunion</div>
              <div class="chart-canvas-wrap">
                <canvas id="chartCotisationsEvolution"></canvas>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-title d-flex justify-between align-center" style="flex-wrap: wrap; gap: 10px;">
              <span><i class="fa-solid fa-chart-pie"></i> Projet sélectionné</span>
              <select id="projetSelect" class="form-control" style="width: auto; max-width: 100%;"></select>
            </div>
            <div id="projetDetails" class="card-body">
              <p>Chargement…</p>
            </div>
          </div>

          <div class="card">
            <div class="card-title">Actions rapides</div>
            <div class="d-flex gap-10 actions-rapides">
              <a href="/membres" class="btn btn-primary"><i class="fa-solid fa-users"></i> Gérer les membres</a>
              <a href="/reunions" class="btn btn-success"><i class="fa-solid fa-calendar-days"></i> Nouvelle réunion</a>
              <a href="/projets" class="btn btn-info"><i class="fa-solid fa-bullseye"></i> Gérer les projets</a>
            </div>
          </div>

          <div class="card">
            <div class="card-title">Dernières réunions</div>
            <div id="dernieresReunions">
              <div class="loading"><div class="spinner"></div></div>
            </div>
          </div>
        </main>
      </div>
    </div>

    <script src="js/common.js"></script>
    <script src="js/dashboard.js"></script>
  </body>
</html>
