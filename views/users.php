<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Utilisateurs — Kotiz by Draken</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
    <link rel="stylesheet" href="<?= asset_url('css/style.css') ?>" />
  </head>
  <body data-page="utilisateurs">
    <div class="app-shell">
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-brand">
          <span class="sidebar-brand-icon"><i class="fa-solid fa-sack-dollar"></i></span>
          <div class="sidebar-brand-text">
            <strong>Kotiz</strong>
            <small>by Draken</small>
          </div>
        </div>
        <nav class="sidebar-nav">
          <a href="/" data-page="index" class="nav-link"><span class="nav-icon"><i class="fa-solid fa-house"></i></span>Tableau de bord</a>
          <?php if (($_SESSION['role'] ?? null) === 'admin'): ?>
          <a href="/membres" data-page="membres" class="nav-link"><span class="nav-icon"><i class="fa-solid fa-users"></i></span>Membres</a>
          <?php endif; ?>
          <a href="/reunions" data-page="reunions" class="nav-link"><span class="nav-icon"><i class="fa-solid fa-calendar-days"></i></span>Réunions</a>
          <a href="/projets" data-page="projets" class="nav-link"><span class="nav-icon"><i class="fa-solid fa-bullseye"></i></span>Projets</a>
          <a href="/cotisations-special" data-page="cotisations-special" class="nav-link"><span class="nav-icon"><i class="fa-solid fa-gem"></i></span>Cotisations spéciales</a>
          <?php if (($_SESSION['role'] ?? null) === 'admin'): ?>
          <a href="/utilisateurs" data-page="utilisateurs" class="nav-link"><span class="nav-icon"><i class="fa-solid fa-user-gear"></i></span>Utilisateurs</a>
          <?php endif; ?>
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
            <h1>Utilisateurs</h1>
            <p>Gérer les comptes, les rôles et le lien avec les fiches membres</p>
          </div>
        </header>

        <main class="content">
          <div id="alert" class="alert"></div>

          <div class="stats-grid stats-grid-page">
            <div class="stat-card">
              <div class="stat-icon"><i class="fa-solid fa-user-group"></i></div>
              <h3 id="statUsersTotal">0</h3>
              <p>Total comptes</p>
            </div>
            <div class="stat-card">
              <div class="stat-icon"><i class="fa-solid fa-user-shield"></i></div>
              <h3 id="statUsersAdmins">0</h3>
              <p>Administrateurs</p>
            </div>
            <div class="stat-card">
              <div class="stat-icon"><i class="fa-solid fa-user"></i></div>
              <h3 id="statUsersMembres">0</h3>
              <p>Membres</p>
            </div>
          </div>

          <div class="form-group">
            <input
              type="text"
              id="filtreInput"
              class="form-control"
              placeholder="Rechercher par nom, prénom ou e-mail..."
              oninput="filtrerUsers()"
            />
          </div>

          <div id="loading" class="loading">
            <div class="spinner"></div>
            <p>Chargement des utilisateurs...</p>
          </div>

          <div id="usersTable">
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>E-mail</th>
                    <th>Rôle</th>
                    <th>Membre lié</th>
                    <th>Créé le</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="usersBody"></tbody>
              </table>
            </div>
          </div>

          <div id="emptyState" class="empty-state hidden">
            <div class="empty-state-icon"><i class="fa-solid fa-user-group"></i></div>
            <h3>Aucun utilisateur</h3>
            <p>Les comptes créés depuis la page d'inscription apparaîtront ici.</p>
          </div>
        </main>
      </div>
    </div>

    <!-- Modal Lier / Délier un membre -->
    <div id="modalLink" class="modal">
      <div class="modal-content modal-small">
        <div class="modal-header">
          <h2 id="modalLinkTitle">Lier à un membre</h2>
          <button type="button" class="modal-close" data-close="modalLink"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <form id="linkForm">
          <input type="hidden" id="linkUserId" />
          <div class="form-group">
            <label for="linkMembreId">Fiche membre</label>
            <select id="linkMembreId" class="form-control">
              <option value="">-- Aucun (délier) --</option>
            </select>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-close="modalLink">Annuler</button>
            <button type="submit" class="btn btn-primary">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Confirmation Suppression -->
    <div id="modalConfirmDelete" class="modal">
      <div class="modal-content modal-small">
        <div class="modal-header">
          <h2><i class="fa-solid fa-trash"></i> Confirmation</h2>
          <button type="button" class="modal-close" data-close="modalConfirmDelete"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body modal-body-center">
          <p id="deleteMessage" class="text-lg">Voulez-vous vraiment supprimer ce compte ?</p>
          <p class="text-warning mt-10">Cette action est irréversible.</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-close="modalConfirmDelete">Annuler</button>
          <button type="button" class="btn btn-danger" onclick="confirmerSuppression()">Oui, supprimer</button>
        </div>
      </div>
    </div>

    <script src="<?= asset_url('js/common.js') ?>"></script>
    <script src="<?= asset_url('js/users.js') ?>"></script>
  </body>
</html>
