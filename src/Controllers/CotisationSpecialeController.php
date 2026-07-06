<?php

class CotisationSpecialeController
{
    private static function validate($montant, $datePaiement): array
    {
        $errors = [];
        if (!$montant || $montant <= 0) {
            $errors[] = 'Le montant doit être positif';
        }
        if (!$datePaiement) {
            $errors[] = 'La date de paiement est obligatoire';
        }
        return $errors;
    }

    public static function getAll(): void
    {
        try {
            send_json(['success' => true, 'data' => CotisationSpeciale::getAll()]);
        } catch (Throwable $e) {
            error_log($e->getMessage());
            send_error('Erreur serveur');
        }
    }

    public static function getById(string $id): void
    {
        try {
            $data = CotisationSpeciale::getById((int) $id);
            if (!$data) {
                send_error('Cotisation introuvable', 404);
            }
            send_json(['success' => true, 'data' => $data]);
        } catch (Throwable $e) {
            send_error('Erreur serveur');
        }
    }

    public static function create(): void
    {
        try {
            $body = json_body();
            $membreId = $body['membre_id'] ?? null;
            $montant = $body['montant'] ?? null;
            $datePaiement = $body['date_paiement'] ?? null;
            $statut = $body['statut'] ?? null;
            $note = $body['note'] ?? null;
            $projetId = $body['projet_id'] ?? null;

            $errors = self::validate($montant, $datePaiement);
            if ($errors) {
                send_json(['success' => false, 'message' => 'Erreurs de validation', 'errors' => $errors], 400);
            }

            $id = CotisationSpeciale::create(
                (int) $membreId,
                (float) $montant,
                $datePaiement,
                $statut,
                $note,
                $projetId ? (int) $projetId : null,
            );

            send_json([
                'success' => true,
                'message' => 'Cotisation spéciale ajoutée avec succès',
                'data' => CotisationSpeciale::getById($id),
            ], 201);
        } catch (Throwable $e) {
            error_log($e->getMessage());
            send_error('Erreur serveur');
        }
    }

    public static function update(string $id): void
    {
        try {
            if (!CotisationSpeciale::getById((int) $id)) {
                send_error('Cotisation introuvable', 404);
            }

            $body = json_body();
            $success = CotisationSpeciale::update(
                (int) $id,
                (int) ($body['membre_id'] ?? 0),
                (float) ($body['montant'] ?? 0),
                $body['date_paiement'] ?? null,
                $body['statut'] ?? null,
                $body['note'] ?? null,
                isset($body['projet_id']) && $body['projet_id'] ? (int) $body['projet_id'] : null,
            );

            if ($success) {
                send_json([
                    'success' => true,
                    'message' => 'Cotisation modifiée avec succès',
                    'data' => CotisationSpeciale::getById((int) $id),
                ]);
            } else {
                send_error('Aucune modification effectuée', 400);
            }
        } catch (Throwable $e) {
            send_error('Erreur serveur');
        }
    }

    public static function delete(string $id): void
    {
        try {
            if (CotisationSpeciale::delete((int) $id)) {
                send_json(['success' => true, 'message' => 'Cotisation supprimée avec succès']);
            } else {
                send_error('Cotisation introuvable', 404);
            }
        } catch (Throwable $e) {
            send_error('Erreur serveur');
        }
    }
}
