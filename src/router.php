<?php

// Pages : chemin => [fichier de vue, accès requis (null = public, 'auth' = connecté, 'admin' = admin)]
const PAGE_ROUTES = [
    '/' => ['index.php', 'auth'],
    '/membres' => ['membres.php', 'admin'],
    '/reunions' => ['reunions.php', 'auth'],
    '/reunions.html' => ['reunions.php', 'auth'],
    '/cotisations' => ['cotisations.php', 'auth'],
    '/cotisations.html' => ['cotisations.php', 'auth'],
    '/projets' => ['projets.php', 'auth'],
    '/cotisations-special' => ['cotisations-special.php', 'auth'],
    '/utilisateurs' => ['users.php', 'admin'],
    '/profile' => ['profile.php', 'auth'],
    '/login' => ['login.php', null],
    '/register' => ['register.php', null],
];

function dispatch_page(string $path): void
{
    if (!isset(PAGE_ROUTES[$path])) {
        http_response_code(404);
        echo '404 Not Found';
        return;
    }

    [$view, $access] = PAGE_ROUTES[$path];

    if ($access === 'auth' && empty($_SESSION['user_id'])) {
        header('Location: /login');
        return;
    }

    if ($access === 'admin' && ($_SESSION['role'] ?? null) !== 'admin') {
        header('Location: /');
        return;
    }

    require __DIR__ . '/../views/' . $view;
}

function dispatch_api(string $method, string $path): void
{
    $routes = [
        // Membres (annuaire complet = admin uniquement)
        ['GET', '#^/api/membres$#', ['MembreController', 'getAll'], 'admin'],
        ['GET', '#^/api/membres/count$#', ['MembreController', 'count'], 'admin'],
        ['GET', '#^/api/membres/(\d+)$#', ['MembreController', 'getById'], 'admin'],
        ['POST', '#^/api/membres$#', ['MembreController', 'create'], 'admin'],
        ['PUT', '#^/api/membres/(\d+)$#', ['MembreController', 'update'], 'admin'],
        ['PATCH', '#^/api/membres/(\d+)/toggle-actif$#', ['MembreController', 'toggleActif'], 'admin'],
        ['DELETE', '#^/api/membres/(\d+)$#', ['MembreController', 'delete'], 'admin'],

        // Réunions (lecture ouverte, écriture admin)
        ['GET', '#^/api/reunions$#', ['ReunionController', 'getAll']],
        ['GET', '#^/api/reunions/(\d+)$#', ['ReunionController', 'getById']],
        ['POST', '#^/api/reunions$#', ['ReunionController', 'create'], 'admin'],
        ['PUT', '#^/api/reunions/(\d+)/cloture$#', ['ReunionController', 'cloture'], 'admin'],
        ['PUT', '#^/api/reunions/(\d+)$#', ['ReunionController', 'update'], 'admin'],
        ['DELETE', '#^/api/reunions/(\d+)$#', ['ReunionController', 'delete'], 'admin'],

        // Cotisations (lecture filtrée par rôle dans le contrôleur, écriture admin)
        ['GET', '#^/api/cotisations/mon-resume$#', ['CotisationController', 'getMonResume']],
        ['GET', '#^/api/cotisations/reunion/(\d+)/total$#', ['CotisationController', 'getTotalReunion']],
        ['GET', '#^/api/cotisations/reunion/(\d+)$#', ['CotisationController', 'getByReunion']],
        ['PUT', '#^/api/cotisations/penalite/(\d+)/(\d+)$#', ['CotisationController', 'addPenalite'], 'admin'],
        ['PUT', '#^/api/cotisations/presence/(\d+)/(\d+)$#', ['CotisationController', 'updatePresence'], 'admin'],
        ['GET', '#^/api/cotisations/totaux-par-reunion$#', ['CotisationController', 'getTotauxParReunion']],
        ['GET', '#^/api/cotisations/configuration$#', ['CotisationController', 'getConfiguration']],
        ['PUT', '#^/api/cotisations/configuration$#', ['CotisationController', 'updateConfiguration'], 'admin'],
        ['PUT', '#^/api/cotisations/(\d+)$#', ['CotisationController', 'update'], 'admin'],

        // Cotisations spéciales (lecture filtrée par rôle, écriture admin)
        ['GET', '#^/api/cotisations-speciales$#', ['CotisationSpecialeController', 'getAll']],
        ['GET', '#^/api/cotisations-speciales/(\d+)$#', ['CotisationSpecialeController', 'getById']],
        ['POST', '#^/api/cotisations-speciales$#', ['CotisationSpecialeController', 'create'], 'admin'],
        ['PUT', '#^/api/cotisations-speciales/(\d+)$#', ['CotisationSpecialeController', 'update'], 'admin'],
        ['DELETE', '#^/api/cotisations-speciales/(\d+)$#', ['CotisationSpecialeController', 'delete'], 'admin'],

        // Projets (lecture ouverte/collective, écriture admin)
        ['GET', '#^/api/projets$#', ['ProjetController', 'getAll']],
        ['GET', '#^/api/projets/(\d+)/cotisations$#', ['ProjetController', 'getCotisations']],
        ['POST', '#^/api/projets/(\d+)/cotisations$#', ['ProjetController', 'addCotisation'], 'admin'],
        ['DELETE', '#^/api/projets/(\d+)/cotisations/(\d+)$#', ['ProjetController', 'removeCotisation'], 'admin'],
        ['GET', '#^/api/projets/(\d+)$#', ['ProjetController', 'getById']],
        ['POST', '#^/api/projets$#', ['ProjetController', 'create'], 'admin'],
        ['PUT', '#^/api/projets/(\d+)/config$#', ['ProjetController', 'updateConfig'], 'admin'],
        ['PUT', '#^/api/projets/(\d+)$#', ['ProjetController', 'update'], 'admin'],
        ['DELETE', '#^/api/projets/(\d+)$#', ['ProjetController', 'delete'], 'admin'],

        // Gestion des comptes utilisateurs (admin uniquement)
        ['GET', '#^/api/users$#', ['UtilisateurController', 'getAll'], 'admin'],
        ['PUT', '#^/api/users/(\d+)/role$#', ['UtilisateurController', 'updateRole'], 'admin'],
        ['PUT', '#^/api/users/(\d+)/membre$#', ['UtilisateurController', 'updateMembreLink'], 'admin'],
        ['DELETE', '#^/api/users/(\d+)$#', ['UtilisateurController', 'delete'], 'admin'],

        // Authentification
        ['POST', '#^/api/auth/register$#', ['AuthController', 'register']],
        ['POST', '#^/api/auth/login$#', ['AuthController', 'login']],
        ['POST', '#^/api/auth/logout$#', ['AuthController', 'logout']],
        ['GET', '#^/api/auth/me$#', ['AuthController', 'me'], 'auth'],
        ['PUT', '#^/api/auth/profile$#', ['AuthController', 'updateProfile'], 'auth'],
        ['POST', '#^/api/auth/photo$#', ['AuthController', 'updatePhoto'], 'auth'],
    ];

    foreach ($routes as $route) {
        [$routeMethod, $pattern, $handler] = $route;
        if ($routeMethod !== $method) {
            continue;
        }
        if (preg_match($pattern, $path, $matches)) {
            $access = $route[3] ?? null;
            if ($access === 'auth') {
                require_auth();
            } elseif ($access === 'admin') {
                require_admin();
            }
            array_shift($matches);
            [$class, $fn] = $handler;
            $class::$fn(...$matches);
            return;
        }
    }

    send_error('Route non trouvée', 404);
}
