<?php

require __DIR__ . '/src/helpers.php';

// Interrupteur global : voir src/maintenance.php pour l'activer/désactiver.
$maintenance = require __DIR__ . '/src/maintenance.php';
if (!empty($maintenance['active'])) {
    http_response_code(503);
    $requestPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if (str_starts_with($requestPath, '/api/')) {
        send_json([
            'success' => false,
            'message' => $maintenance['message'] ?? 'Service suspendu',
        ], 503);
    }
    $message = $maintenance['message'] ?? 'Service suspendu.';
    $deadline = $maintenance['deadline'] ?? null;
    require __DIR__ . '/views/suspended.php';
    exit;
}

require __DIR__ . '/src/Database.php';
require __DIR__ . '/src/Session.php';
require __DIR__ . '/src/Middleware/requireAuth.php';

foreach (glob(__DIR__ . '/src/Models/*.php') as $file) {
    require $file;
}
foreach (glob(__DIR__ . '/src/Controllers/*.php') as $file) {
    require $file;
}

require __DIR__ . '/src/router.php';

start_session();

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if ($path !== '/') {
    $path = rtrim($path, '/');
}
$method = $_SERVER['REQUEST_METHOD'];

if (str_starts_with($path, '/api/')) {
    if (empty($_SESSION['user_id']) && !str_starts_with($path, '/api/auth/')) {
        send_error('Non authentifié', 401);
    }
    dispatch_api($method, $path);
    exit;
}

dispatch_page($path);
