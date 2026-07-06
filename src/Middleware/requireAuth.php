<?php

function require_auth(): void
{
    if (empty($_SESSION['user_id'])) {
        send_error('Non authentifié', 401);
    }
}
