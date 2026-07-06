<?php

// Pages : chemin => [fichier de vue, protégée par login]
const PAGE_ROUTES = [
    '/' => ['index.php', true],
    '/membres' => ['membres.php', true],
    '/reunions' => ['reunions.php', true],
    '/reunions.html' => ['reunions.php', true],
    '/cotisations' => ['cotisations.php', true],
    '/cotisations.html' => ['cotisations.php', true],
    '/projets' => ['projets.php', true],
    '/cotisations-special' => ['cotisations-special.php', true],
    '/profile' => ['profile.php', true],
    '/login' => ['login.php', false],
    '/register' => ['register.php', false],
];

function dispatch_page(string $path): void
{
    if (!isset(PAGE_ROUTES[$path])) {
        http_response_code(404);
        echo '404 Not Found';
        return;
    }

    [$view, $protected] = PAGE_ROUTES[$path];

    if ($protected && empty($_SESSION['user_id'])) {
        header('Location: /login');
        return;
    }

    require __DIR__ . '/../views/' . $view;
}

function dispatch_api(string $method, string $path): void
{
    $routes = [
        // Membres
        ['GET', '#^/api/membres$#', ['MembreController', 'getAll']],
        ['GET', '#^/api/membres/count$#', ['MembreController', 'count']],
        ['GET', '#^/api/membres/(\d+)$#', ['MembreController', 'getById']],
        ['POST', '#^/api/membres$#', ['MembreController', 'create']],
        ['PUT', '#^/api/membres/(\d+)$#', ['MembreController', 'update']],
        ['PATCH', '#^/api/membres/(\d+)/toggle-actif$#', ['MembreController', 'toggleActif']],
        ['DELETE', '#^/api/membres/(\d+)$#', ['MembreController', 'delete']],

        // Réunions
        ['GET', '#^/api/reunions$#', ['ReunionController', 'getAll']],
        ['GET', '#^/api/reunions/(\d+)$#', ['ReunionController', 'getById']],
        ['POST', '#^/api/reunions$#', ['ReunionController', 'create']],
        ['PUT', '#^/api/reunions/(\d+)/cloture$#', ['ReunionController', 'cloture']],
        ['PUT', '#^/api/reunions/(\d+)$#', ['ReunionController', 'update']],
        ['DELETE', '#^/api/reunions/(\d+)$#', ['ReunionController', 'delete']],

        // Cotisations
        ['GET', '#^/api/cotisations/reunion/(\d+)/total$#', ['CotisationController', 'getTotalReunion']],
        ['GET', '#^/api/cotisations/reunion/(\d+)$#', ['CotisationController', 'getByReunion']],
        ['PUT', '#^/api/cotisations/penalite/(\d+)/(\d+)$#', ['CotisationController', 'addPenalite']],
        ['PUT', '#^/api/cotisations/presence/(\d+)/(\d+)$#', ['CotisationController', 'updatePresence']],
        ['GET', '#^/api/cotisations/totaux-par-reunion$#', ['CotisationController', 'getTotauxParReunion']],
        ['GET', '#^/api/cotisations/configuration$#', ['CotisationController', 'getConfiguration']],
        ['PUT', '#^/api/cotisations/configuration$#', ['CotisationController', 'updateConfiguration']],
        ['PUT', '#^/api/cotisations/(\d+)$#', ['CotisationController', 'update']],

        // Cotisations spéciales
        ['GET', '#^/api/cotisations-speciales$#', ['CotisationSpecialeController', 'getAll']],
        ['GET', '#^/api/cotisations-speciales/(\d+)$#', ['CotisationSpecialeController', 'getById']],
        ['POST', '#^/api/cotisations-speciales$#', ['CotisationSpecialeController', 'create']],
        ['PUT', '#^/api/cotisations-speciales/(\d+)$#', ['CotisationSpecialeController', 'update']],
        ['DELETE', '#^/api/cotisations-speciales/(\d+)$#', ['CotisationSpecialeController', 'delete']],

        // Projets
        ['GET', '#^/api/projets$#', ['ProjetController', 'getAll']],
        ['GET', '#^/api/projets/(\d+)/cotisations$#', ['ProjetController', 'getCotisations']],
        ['POST', '#^/api/projets/(\d+)/cotisations$#', ['ProjetController', 'addCotisation']],
        ['DELETE', '#^/api/projets/(\d+)/cotisations/(\d+)$#', ['ProjetController', 'removeCotisation']],
        ['GET', '#^/api/projets/(\d+)$#', ['ProjetController', 'getById']],
        ['POST', '#^/api/projets$#', ['ProjetController', 'create']],
        ['PUT', '#^/api/projets/(\d+)/config$#', ['ProjetController', 'updateConfig']],
        ['PUT', '#^/api/projets/(\d+)$#', ['ProjetController', 'update']],
        ['DELETE', '#^/api/projets/(\d+)$#', ['ProjetController', 'delete']],

        // Authentification
        ['POST', '#^/api/auth/register$#', ['AuthController', 'register']],
        ['POST', '#^/api/auth/login$#', ['AuthController', 'login']],
        ['POST', '#^/api/auth/logout$#', ['AuthController', 'logout']],
        ['GET', '#^/api/auth/me$#', ['AuthController', 'me'], true],
        ['PUT', '#^/api/auth/profile$#', ['AuthController', 'updateProfile'], true],
        ['POST', '#^/api/auth/photo$#', ['AuthController', 'updatePhoto'], true],
    ];

    foreach ($routes as $route) {
        [$routeMethod, $pattern, $handler] = $route;
        if ($routeMethod !== $method) {
            continue;
        }
        if (preg_match($pattern, $path, $matches)) {
            if ($route[3] ?? false) {
                require_auth();
            }
            array_shift($matches);
            [$class, $fn] = $handler;
            $class::$fn(...$matches);
            return;
        }
    }

    send_error('Route non trouvée', 404);
}
