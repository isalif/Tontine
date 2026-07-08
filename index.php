<?php

require __DIR__ . '/src/Database.php';
require __DIR__ . '/src/Session.php';
require __DIR__ . '/src/helpers.php';
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
