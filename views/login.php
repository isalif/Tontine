<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Connexion — Kotiz by Draken</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
    <link rel="stylesheet" href="<?= asset_url('css/style.css') ?>" />
  </head>
  <body>
    <div class="auth-shell">
      <div class="auth-brand">
        <div class="auth-blob" style="width:340px;height:340px;top:-100px;left:-100px;background:rgba(255,255,255,0.05);animation:authBlob1 20s ease-in-out infinite;"></div>
        <div class="auth-blob" style="width:280px;height:280px;bottom:-90px;right:-80px;background:rgba(255,255,255,0.06);animation:authBlob2 24s ease-in-out infinite;"></div>
        <div class="auth-blob" style="width:160px;height:160px;top:12%;right:10%;background:rgba(255,255,255,0.05);animation:authBlob1 16s ease-in-out infinite;animation-delay:3s;"></div>
        <div class="auth-blob" style="width:120px;height:120px;bottom:18%;left:8%;background:rgba(255,255,255,0.04);animation:authBlob2 14s ease-in-out infinite;animation-delay:5s;"></div>

        <div class="auth-brand-content">
          <div class="auth-brand-icon"><i class="fa-solid fa-sack-dollar"></i></div>
          <h1>Kotiz</h1>
          <p class="auth-brand-sub">by Draken</p>
          <p class="auth-brand-slogan">
            Portail de gestion de la tontine : membres, réunions, cotisations
            et projets communautaires.
          </p>
          <div class="auth-badge"><i class="fa-solid fa-lock"></i> Connexion sécurisée</div>
        </div>
      </div>

      <div class="auth-form-panel">
        <div class="auth-form-box">
          <span class="auth-pill"><i class="fa-solid fa-circle"></i> Accès membres</span>
          <h2>Connexion</h2>
          <p>Connectez-vous pour accéder à votre espace de gestion.</p>

          <div id="alert" class="alert"></div>

          <form id="loginForm">
            <div class="form-group">
              <label for="email">Adresse e-mail</label>
              <input type="email" id="email" class="form-control" required autocomplete="username" placeholder="vous@exemple.com" />
            </div>

            <div class="form-group">
              <label for="password">Mot de passe</label>
              <input type="password" id="password" class="form-control" required autocomplete="current-password" placeholder="••••••••" />
            </div>

            <div class="form-group">
              <label style="display:flex;align-items:center;cursor:pointer;font-weight:500;">
                <input type="checkbox" id="remember" />
                <span>Se souvenir de moi</span>
              </label>
            </div>

            <button type="submit" class="btn btn-primary btn-block" id="btnSubmit">
              <i class="fa-solid fa-right-to-bracket"></i> Se connecter
            </button>
          </form>

          <div class="auth-footer">
            Pas encore de compte ? <a href="/register">Créer un compte</a>
          </div>
        </div>
      </div>
    </div>

    <script src="<?= asset_url('js/common.js') ?>"></script>
    <script src="<?= asset_url('js/login.js') ?>"></script>
  </body>
</html>
