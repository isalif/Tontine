<?php

class CotisationController
{
    public static function getByReunion(string $reunionId): void
    {
        try {
            send_json(['success' => true, 'data' => Cotisation::getByReunion((int) $reunionId)]);
        } catch (Throwable $e) {
            error_log('Erreur getByReunion cotisations: ' . $e->getMessage());
            send_error('Erreur serveur');
        }
    }

    public static function update(string $id): void
    {
        try {
            $cotisation = Cotisation::getById((int) $id);
            if (!$cotisation) {
                send_error('Cotisation introuvable', 404);
            }

            $body = json_body();
            // Ne remplace que les champs fournis, préserve les autres (ex: cotisation_speciale
            // non envoyée par le formulaire simplifié) pour ne pas corrompre le total généré.
            $cotisationMensuelle = $body['cotisation_mensuelle'] ?? $cotisation['cotisation_mensuelle'];
            $cotisationSpeciale = $body['cotisation_speciale'] ?? $cotisation['cotisation_speciale'];
            $penalite = $body['penalite'] ?? $cotisation['penalite'];

            if ($cotisationMensuelle < 0 || $cotisationSpeciale < 0 || $penalite < 0) {
                send_error('Les montants ne peuvent pas être négatifs', 400);
            }

            Cotisation::update((int) $id, (float) $cotisationMensuelle, (float) $cotisationSpeciale, (float) $penalite);

            send_json([
                'success' => true,
                'message' => 'Cotisation mise à jour avec succès',
                'data' => Cotisation::getById((int) $id),
            ]);
        } catch (Throwable $e) {
            error_log('Erreur update cotisation: ' . $e->getMessage());
            send_error('Erreur serveur');
        }
    }

    public static function addPenalite(string $reunionId, string $membreId): void
    {
        try {
            $body = json_body();
            $montant = $body['montant'] ?? null;

            if (!$montant || $montant <= 0) {
                send_error('Le montant de la pénalité doit être supérieur à 0', 400);
            }

            Cotisation::addPenalite((int) $reunionId, (int) $membreId, (float) $montant);
            send_json(['success' => true, 'message' => 'Pénalité ajoutée avec succès']);
        } catch (Throwable $e) {
            error_log('Erreur addPenalite: ' . $e->getMessage());
            send_error('Erreur serveur');
        }
    }

    public static function getTotauxParReunion(): void
    {
        try {
            send_json(['success' => true, 'data' => Cotisation::getTotauxParReunion()]);
        } catch (Throwable $e) {
            error_log('Erreur getTotauxParReunion: ' . $e->getMessage());
            send_error('Erreur serveur');
        }
    }

    public static function getTotalReunion(string $reunionId): void
    {
        try {
            send_json(['success' => true, 'data' => Cotisation::getTotalReunion((int) $reunionId)]);
        } catch (Throwable $e) {
            error_log('Erreur getTotalReunion: ' . $e->getMessage());
            send_error('Erreur serveur');
        }
    }

    public static function updatePresence(string $reunionId, string $membreId): void
    {
        try {
            $body = json_body();
            $present = $body['present'] ?? null;

            if (!is_bool($present)) {
                send_error('La valeur de présence doit être true ou false', 400);
            }

            Cotisation::updatePresence((int) $reunionId, (int) $membreId, $present);
            send_json(['success' => true, 'message' => 'Présence mise à jour avec succès']);
        } catch (Throwable $e) {
            error_log('Erreur updatePresence: ' . $e->getMessage());
            send_error('Erreur serveur');
        }
    }

    public static function getConfiguration(): void
    {
        try {
            send_json(['success' => true, 'data' => Cotisation::getConfiguration()]);
        } catch (Throwable $e) {
            error_log('Erreur getConfiguration: ' . $e->getMessage());
            send_error('Erreur serveur');
        }
    }

    public static function updateConfiguration(): void
    {
        try {
            $body = json_body();
            $cle = $body['cle'] ?? null;
            $valeur = $body['valeur'] ?? null;

            if (!$cle || $valeur === null) {
                send_error('Clé et valeur sont obligatoires', 400);
            }

            if (!is_numeric($valeur) || (float) $valeur < 0) {
                send_error('La valeur doit être un nombre positif', 400);
            }

            Cotisation::updateConfiguration($cle, (string) $valeur);
            send_json(['success' => true, 'message' => 'Configuration mise à jour avec succès']);
        } catch (Throwable $e) {
            error_log('Erreur updateConfiguration: ' . $e->getMessage());
            send_error('Erreur serveur');
        }
    }
}
