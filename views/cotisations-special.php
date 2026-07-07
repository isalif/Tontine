<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Cotisations spéciales — Kotiz by Draken</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
    <link rel="stylesheet" href="css/style.css" />
  </head>
  <body data-page="cotisations-special">
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
            <h1>Cotisations spéciales</h1>
            <p>Gérer les cotisations spéciales payées par les membres</p>
          </div>
          <div class="topbar-actions">
            <?php if (($_SESSION['role'] ?? null) === 'admin'): ?>
            <button class="btn btn-primary" onclick="ouvrirModalAjout()"><i class="fa-solid fa-plus"></i> <span class="btn-label">Nouvelle cotisation</span></button>
            <?php endif; ?>
          </div>
        </header>

        <main class="content">
          <div id="alert" class="alert"></div>

          <div class="stats-grid stats-grid-page">
            <div class="stat-card">
              <div class="stat-icon"><i class="fa-solid fa-gem"></i></div>
              <h3 id="statCsTotal">0</h3>
              <p>Total cotisations</p>
            </div>
            <div class="stat-card">
              <div class="stat-icon"><i class="fa-solid fa-circle-check"></i></div>
              <h3 id="statCsPayees">0</h3>
              <p>Payées</p>
            </div>
            <div class="stat-card">
              <div class="stat-icon"><i class="fa-solid fa-hourglass-half"></i></div>
              <h3 id="statCsEnAttente">0</h3>
              <p>En attente</p>
            </div>
            <div class="stat-card">
              <div class="stat-icon"><i class="fa-solid fa-sack-dollar"></i></div>
              <h3 id="statCsMontant">0</h3>
              <p>Montant total (FCFA)</p>
            </div>
          </div>

          <div class="form-group">
            <input
              type="text"
              id="filtreInput"
              class="form-control"
              placeholder="Rechercher par membre ou montant..."
              oninput="filtrerCotisations()"
            />
          </div>

          <div id="loading" class="loading">
            <div class="spinner"></div>
            <p>Chargement des cotisations spéciales...</p>
          </div>

          <div id="cotisationsTable">
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Membre</th>
                    <th>Montant</th>
                    <th>Date de paiement</th>
                    <th>Projet lié</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="cotisationsBody"></tbody>
              </table>
            </div>
          </div>

          <div id="emptyState" class="empty-state hidden">
            <div class="empty-state-icon"><i class="fa-solid fa-gem"></i></div>
            <h3>Aucune cotisation spéciale</h3>
            <p>Commencez par ajouter votre première cotisation spéciale</p>
            <button class="btn btn-primary mt-20" onclick="ouvrirModalAjout()"><i class="fa-solid fa-plus"></i> Ajouter la première</button>
          </div>
        </main>
      </div>
    </div>

    <!-- Modal Ajout / Modification -->
    <div id="modal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 id="modalTitle">Nouvelle cotisation spéciale</h2>
          <button type="button" class="modal-close" data-close="modal"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <form id="cotisationForm">
          <input type="hidden" id="cotisationId" />

          <div class="form-group">
            <label for="membreId">Membre *</label>
            <select id="membreId" class="form-control" required></select>
          </div>

          <div class="form-group">
            <label for="projetId">Projet lié (optionnel)</label>
            <select id="projetId" class="form-control">
              <option value="">-- Aucun projet --</option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="montant">Montant (FCFA) *</label>
              <input type="number" id="montant" class="form-control" min="0" required />
            </div>
            <div class="form-group">
              <label for="datePaiement">Date de paiement *</label>
              <input type="date" id="datePaiement" class="form-control" required />
            </div>
          </div>

          <div class="form-group">
            <label for="statut">Statut *</label>
            <select id="statut" class="form-control">
              <option value="payee">Payée</option>
              <option value="en_attente">En attente</option>
              <option value="annule">Annulée</option>
            </select>
          </div>

          <div class="form-group">
            <label for="note">Note</label>
            <textarea id="note" class="form-control" rows="2"></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-close="modal">Annuler</button>
            <button type="submit" class="btn btn-primary">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>

    <script src="js/common.js"></script>
    <script src="js/cotisations-special.js"></script>
  </body>
</html>
