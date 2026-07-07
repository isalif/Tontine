<?php

function require_auth(): void
{
    if (empty($_SESSION['user_id'])) {
        send_error('Non authentifié', 401);
    }
}

function require_admin(): void
{
    require_auth();
    if (($_SESSION['role'] ?? null) !== 'admin') {
        send_error('Accès réservé aux administrateurs', 403);
    }
}
