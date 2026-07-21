<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Accès suspendu — Kotiz by Draken</title>
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
        </div>
      </div>

      <div class="auth-form-panel">
        <div class="auth-form-box" style="text-align:center;">
          <span class="auth-pill" style="background:var(--color-danger-soft);color:var(--color-danger);">
            <i class="fa-solid fa-circle-pause"></i> Accès suspendu
          </span>
          <h2 style="margin-top:16px;">Omar a suspendu la plateforme</h2>
          <p style="margin-top:12px;color:var(--color-text-muted);line-height:1.6;">
            <?= htmlspecialchars($message, ENT_QUOTES, 'UTF-8') ?>
          </p>
          <?php if (!empty($deadline)): ?>
          <p style="margin-top:20px;font-weight:600;">
            <i class="fa-solid fa-calendar-days"></i>
            Échéance : <?= htmlspecialchars(date('d/m/Y', strtotime($deadline)), ENT_QUOTES, 'UTF-8') ?>
          </p>
          <?php endif; ?>
        </div>
      </div>
    </div>
  </body>
</html>
