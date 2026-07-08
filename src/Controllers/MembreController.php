<?php

class MembreController
{
    private static function validate(?string $nom, ?string $prenom, ?string $numero, ?string $username = null): array
    {
        $errors = [];

        if (!$nom || mb_strlen(trim($nom)) < 2) {
            $errors[] = 'Le nom doit contenir au moins 2 caractères';
        }
        if (!$prenom || mb_strlen(trim($prenom)) < 2) {
            $errors[] = 'Le prénom doit contenir au moins 2 caractères';
        }
        if (!$numero || mb_strlen(trim($numero)) < 8) {
            $errors[] = 'Le numéro doit contenir au moins 8 caractères';
        }
        if ($numero && !preg_match('/^[\d+\s-]+$/', trim($numero))) {
            $errors[] = 'Le numéro ne doit contenir que des chiffres, espaces, tirets ou +';
        }
        if ($username && !preg_match('/^[a-zA-Z0-9._-]{3,50}$/', trim($username))) {
            $errors[] = "Le nom d'utilisateur doit contenir 3 à 50 caractères (lettres, chiffres, points, tirets)";
        }

        return $errors;
    }

    public static function getAll(): void
    {
        try {
            $includeInactive = ($_GET['all'] ?? null) === 'true';
            send_json(['success' => true, 'data' => Membre::getAll($includeInactive)]);
        } catch (Throwable $e) {
            error_log('Erreur getAll membres: ' . $e->getMessage());
            send_error('Erreur serveur');
        }
    }

    public static function getById(string $id): void
    {
        try {
            $membre = Membre::getById((int) $id);
            if (!$membre) {
                send_error('Membre introuvable', 404);
            }
            send_json(['success' => true, 'data' => $membre]);
        } catch (Throwable $e) {
            error_log('Erreur getById membre: ' . $e->getMessage());
            send_error('Erreur serveur');
        }
    }

    public static function create(): void
    {
        try {
            $body = json_body();
            $nom = $body['nom'] ?? null;
            $prenom = $body['prenom'] ?? null;
            $numero = $body['numero'] ?? null;
            $username = trim($body['username'] ?? '') ?: null;

            $errors = self::validate($nom, $prenom, $numero, $username);
            if ($errors) {
                send_json(['success' => false, 'message' => 'Erreurs de validation', 'errors' => $errors], 400);
            }

            if (Membre::checkNumeroExists(trim($numero))) {
                send_error('Ce numéro est déjà utilisé par un autre membre', 400);
            }

            if ($username && Membre::checkUsernameExists($username)) {
                send_error("Ce nom d'utilisateur est déjà utilisé par un autre membre", 400);
            }

            $abonneAnnuel = (bool) ($body['abonne_annuel'] ?? false);
            $membreId = Membre::create($nom, $prenom, $numero, $abonneAnnuel, $username);

            send_json([
                'success' => true,
                'message' => 'Membre ajouté avec succès',
                'data' => Membre::getById($membreId),
            ], 201);
        } catch (Throwable $e) {
            error_log('Erreur create membre: ' . $e->getMessage());
            send_error('Erreur serveur');
        }
    }

    public static function update(string $id): void
    {
        try {
            if (!Membre::getById((int) $id)) {
                send_error('Membre introuvable', 404);
            }

            $body = json_body();
            $nom = $body['nom'] ?? null;
            $prenom = $body['prenom'] ?? null;
            $numero = $body['numero'] ?? null;
            $username = trim($body['username'] ?? '') ?: null;

            $errors = self::validate($nom, $prenom, $numero, $username);
            if ($errors) {
                send_json(['success' => false, 'message' => 'Erreurs de validation', 'errors' => $errors], 400);
            }

            if (Membre::checkNumeroExists(trim($numero), (int) $id)) {
                send_error('Ce numéro est déjà utilisé par un autre membre', 400);
            }

            if ($username && Membre::checkUsernameExists($username, (int) $id)) {
                send_error("Ce nom d'utilisateur est déjà utilisé par un autre membre", 400);
            }

            $abonneAnnuel = (bool) ($body['abonne_annuel'] ?? false);
            $actif = array_key_exists('actif', $body) ? (bool) $body['actif'] : true;

            Membre::update((int) $id, $nom, $prenom, $numero, $abonneAnnuel, $actif, $username);

            send_json([
                'success' => true,
                'message' => 'Membre modifié avec succès',
                'data' => Membre::getById((int) $id),
            ]);
        } catch (Throwable $e) {
            error_log('Erreur update membre: ' . $e->getMessage());
            send_error('Erreur serveur');
        }
    }

    public static function delete(string $id): void
    {
        try {
            if (!Membre::getById((int) $id)) {
                send_error('Membre introuvable', 404);
            }

            Membre::delete((int) $id);
            send_json(['success' => true, 'message' => 'Membre supprimé avec succès']);
        } catch (RuntimeException $e) {
            send_error($e->getMessage(), 400);
        } catch (Throwable $e) {
            error_log('Erreur delete membre: ' . $e->getMessage());
            send_error('Erreur serveur');
        }
    }

    public static function toggleActif(string $id): void
    {
        try {
            if (!Membre::getById((int) $id)) {
                send_error('Membre introuvable', 404);
            }
            Membre::toggleActif((int) $id);
            $updated = Membre::getById((int) $id);
            $statut = $updated['actif'] ? 'actif' : 'inactif';
            send_json(['success' => true, 'message' => "Membre marqué comme $statut", 'data' => $updated]);
        } catch (Throwable $e) {
            error_log('Erreur toggleActif membre: ' . $e->getMessage());
            send_error('Erreur serveur');
        }
    }

    public static function count(): void
    {
        try {
            send_json(['success' => true, 'data' => ['total' => Membre::count()]]);
        } catch (Throwable $e) {
            error_log('Erreur count membres: ' . $e->getMessage());
            send_error('Erreur serveur');
        }
    }
}
