<?php

// Corps JSON de la requête, décodé une seule fois.
function json_body(): array
{
    static $body = null;
    if ($body === null) {
        $raw = file_get_contents('php://input');
        $body = $raw ? (json_decode($raw, true) ?? []) : [];
    }
    return $body;
}

// Envoie une réponse JSON et termine le script (équivalent res.json()/res.status()).
function send_json($data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function send_error(string $message, int $status = 500, array $extra = []): void
{
    send_json(array_merge(['success' => false, 'message' => $message], $extra), $status);
}
