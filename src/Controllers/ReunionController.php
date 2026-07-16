<?php

class ReunionController
{
    public static function getAll(): void
    {
        try {
            send_json(['success' => true, 'data' => Reunion::getAll()]);
        } catch (Throwable $e) {
            error_log($e->getMessage());
            send_error('Erreur serveur');
        }
    }

    public static function getById(string $id): void
    {
        try {
            $reunion = Reunion::getById((int) $id);
            if (!$reunion) {
                send_error('Réunion introuvable', 404);
            }
            send_json(['success' => true, 'data' => $reunion]);
        } catch (Throwable $e) {
            send_error('Erreur serveur');
        }
    }

    public static function create(): void
    {
        try {
            $body = json_body();
            $titre = $body['titre'] ?? null;
            $dateReunion = $body['date_reunion'] ?? null;
            $projetId = $body['projet_id'] ?? null;
            $rapport = $body['rapport'] ?? null;
            $cotisationMensuelle = $body['cotisation_mensuelle'] ?? null;

            if (!$dateReunion) {
                send_error('La date de réunion est obligatoire', 400);
            }

            if (Reunion::checkDateExists($dateReunion)) {
                send_error('Une réunion existe déjà à cette date', 400);
            }

            $reunionId = Reunion::create($titre, $dateReunion, $projetId ? (int) $projetId : null, $rapport);
            Reunion::createPresences($reunionId);
            Reunion::createCotisations($reunionId, $cotisationMensuelle);
            Notification::createForAllUsers(
                'reunion_planifiee',
                'Nouvelle réunion prévue',
                'La réunion ' . ($titre ?: 'sans titre') . ' est prévue. Un paiement mensuel est maintenant attendu.',
                'reunion',
                $reunionId,
            );

            send_json([
                'success' => true,
                'message' => 'Réunion créée avec succès',
                'data' => Reunion::getById($reunionId),
            ], 201);
        } catch (Throwable $e) {
            error_log('Erreur create réunion: ' . $e->getMessage());
            send_error('Erreur serveur');
        }
    }

    public static function update(string $id): void
    {
        try {
            $body = json_body();
            $titre = $body['titre'] ?? null;
            $dateReunion = $body['date_reunion'] ?? null;
            $projetId = $body['projet_id'] ?? null;
            $rapport = $body['rapport'] ?? null;

            if (!$dateReunion) {
                send_error('La date de réunion est obligatoire', 400);
            }

            $existing = Reunion::getById((int) $id);
            if (!$existing) {
                send_error('Réunion introuvable', 404);
            }

            if ($dateReunion !== substr((string) $existing['date_reunion'], 0, 10)
                && Reunion::checkDateExists($dateReunion, (int) $id)) {
                send_error('Une réunion existe déjà à cette date', 400);
            }

            $success = Reunion::update((int) $id, $titre, $dateReunion, $projetId ? (int) $projetId : null, $rapport);
            if ($success) {
                send_json([
                    'success' => true,
                    'message' => 'Réunion modifiée avec succès',
                    'data' => Reunion::getById((int) $id),
                ]);
            } else {
                send_error('Aucune modification effectuée', 400);
            }
        } catch (Throwable $e) {
            error_log($e->getMessage());
            send_error('Erreur serveur');
        }
    }

    public static function cloture(string $id): void
    {
        try {
            if (Reunion::cloture((int) $id)) {
                $reunion = Reunion::getById((int) $id);
                if ($reunion) {
                    Notification::createForAllUsers(
                        'reunion_cloturee',
                        'Réunion clôturée',
                        'La réunion ' . ($reunion['titre'] ?: 'sans titre') . ' a été clôturée.',
                        'reunion',
                        (int) $id,
                    );
                }
                send_json(['success' => true, 'message' => 'Réunion clôturée avec succès']);
            } else {
                send_error('Réunion introuvable', 404);
            }
        } catch (Throwable $e) {
            send_error('Erreur serveur');
        }
    }

    public static function getNotifications(): void
    {
        try {
            $userId = isset($_SESSION['user_id']) ? (int) $_SESSION['user_id'] : null;
            $membreId = isset($_SESSION['membre_id']) ? (int) $_SESSION['membre_id'] : null;
            send_json(['success' => true, 'data' => Notification::getForUser($userId, $membreId)]);
        } catch (Throwable $e) {
            send_error('Erreur serveur');
        }
    }

    public static function markNotificationsRead(): void
    {
        try {
            $userId = isset($_SESSION['user_id']) ? (int) $_SESSION['user_id'] : null;
            $membreId = isset($_SESSION['membre_id']) ? (int) $_SESSION['membre_id'] : null;
            Notification::markAllRead($userId, $membreId);
            send_json(['success' => true, 'message' => 'Notifications marquées comme lues']);
        } catch (Throwable $e) {
            send_error('Erreur serveur');
        }
    }

    public static function delete(string $id): void
    {
        try {
            if (Reunion::delete((int) $id)) {
                send_json(['success' => true, 'message' => 'Réunion supprimée avec succès']);
            } else {
                send_error('Réunion introuvable', 404);
            }
        } catch (Throwable $e) {
            send_error('Erreur serveur');
        }
    }
}
