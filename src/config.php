<?php

// Charge les variables du fichier .env s'il existe (utile hors Docker, ex: hébergement
// mutualisé/VPS classique sans docker-compose pour injecter les variables d'environnement).
// En local avec Docker, les valeurs sont déjà fournies par docker-compose.yml et priment.
$envFile = __DIR__ . '/../.env';
if (is_file($envFile)) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
            continue;
        }
        [$key, $value] = array_map('trim', explode('=', $line, 2));
        if (getenv($key) === false) {
            putenv("$key=$value");
        }
    }
}

return [
    'db' => [
        'host' => getenv('DB_HOST') ?: 'localhost',
        'port' => (int) (getenv('DB_PORT') ?: 3306),
        'user' => getenv('DB_USER') ?: 'root',
        'password' => getenv('DB_PASSWORD') ?: '',
        'database' => getenv('DB_NAME') ?: 'tontine_db',
    ],
    'uploadsDir' => __DIR__ . '/../uploads/avatars',
];
