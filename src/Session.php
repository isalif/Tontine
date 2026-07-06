<?php

function start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    session_set_cookie_params([
        'lifetime' => 0, // cookie de session : expire à la fermeture du navigateur
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);

    session_start();
}

// Réémet le cookie de session avec une durée de 30 jours ("se souvenir de moi").
function remember_session(): void
{
    $lifetime = 60 * 60 * 24 * 30;
    setcookie(session_name(), session_id(), [
        'expires' => time() + $lifetime,
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}
