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
            $cotisationMensuelle = $body['cotisation_mensuelle'] ?? null;

            if (!$dateReunion) {
                send_error('La date de réunion est obligatoire', 400);
            }

            if (Reunion::checkDateExists($dateReunion)) {
                send_error('Une réunion existe déjà à cette date', 400);
            }

            $reunionId = Reunion::create($titre, $dateReunion, $projetId ? (int) $projetId : null);
            Reunion::createPresences($reunionId);
            Reunion::createCotisations($reunionId, $cotisationMensuelle);

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

            $success = Reunion::update((int) $id, $titre, $dateReunion, $projetId ? (int) $projetId : null);
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
                send_json(['success' => true, 'message' => 'Réunion clôturée avec succès']);
            } else {
                send_error('Réunion introuvable', 404);
            }
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
