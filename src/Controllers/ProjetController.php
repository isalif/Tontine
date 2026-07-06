<?php

class ProjetController
{
    private static function validate($nom, $montantCible): array
    {
        $errors = [];
        if (!$nom || mb_strlen(trim($nom)) < 2) {
            $errors[] = 'Le nom doit contenir au moins 2 caractères';
        }
        if (!$montantCible || !is_numeric($montantCible) || (float) $montantCible <= 0) {
            $errors[] = 'Le montant cible doit être un nombre positif';
        }
        return $errors;
    }

    public static function getAll(): void
    {
        try {
            send_json(['success' => true, 'data' => Projet::getAll()]);
        } catch (Throwable $e) {
            error_log('Erreur getAll projets: ' . $e->getMessage());
            send_error('Erreur serveur');
        }
    }

    public static function getById(string $id): void
    {
        try {
            $projet = Projet::getById((int) $id);
            if (!$projet) {
                send_error('Projet introuvable', 404);
            }
            send_json(['success' => true, 'data' => $projet]);
        } catch (Throwable $e) {
            error_log('Erreur getById projet: ' . $e->getMessage());
            send_error('Erreur serveur');
        }
    }

    public static function create(): void
    {
        try {
            $body = json_body();
            $nom = $body['nom'] ?? null;
            $description = $body['description'] ?? null;
            $montantCible = $body['montantCible'] ?? null;
            $dateDebut = $body['dateDebut'] ?? null;
            $dateFin = $body['dateFin'] ?? null;
            $statut = $body['statut'] ?? null;

            $errors = self::validate($nom, $montantCible);
            if ($errors) {
                send_json(['success' => false, 'message' => 'Erreurs de validation', 'errors' => $errors], 400);
            }

            $projetId = Projet::create(
                $nom,
                $description,
                $montantCible !== null ? (float) $montantCible : null,
                $dateDebut,
                $dateFin,
                $statut ?: 'en_cours',
            );

            send_json([
                'success' => true,
                'message' => 'Projet créé avec succès',
                'data' => Projet::getById($projetId),
            ], 201);
        } catch (Throwable $e) {
            error_log('Erreur create projet: ' . $e->getMessage());
            send_error('Erreur serveur');
        }
    }

    public static function update(string $id): void
    {
        try {
            if (!Projet::getById((int) $id)) {
                send_error('Projet introuvable', 404);
            }

            $body = json_body();
            $nom = $body['nom'] ?? null;
            $description = $body['description'] ?? null;
            $montantCible = $body['montantCible'] ?? null;
            $dateDebut = $body['dateDebut'] ?? null;
            $dateFin = $body['dateFin'] ?? null;
            $statut = $body['statut'] ?? null;

            $errors = self::validate($nom, $montantCible);
            if ($errors) {
                send_json(['success' => false, 'message' => 'Erreurs de validation', 'errors' => $errors], 400);
            }

            Projet::update(
                (int) $id,
                $nom,
                $description,
                $montantCible !== null ? (float) $montantCible : null,
                $dateDebut,
                $dateFin,
                $statut ?: 'en_cours',
            );

            send_json([
                'success' => true,
                'message' => 'Projet modifié avec succès',
                'data' => Projet::getById((int) $id),
            ]);
        } catch (Throwable $e) {
            error_log('Erreur update projet: ' . $e->getMessage());
            send_error('Erreur serveur');
        }
    }

    public static function delete(string $id): void
    {
        try {
            if (!Projet::getById((int) $id)) {
                send_error('Projet introuvable', 404);
            }
            Projet::delete((int) $id);
            send_json(['success' => true, 'message' => 'Projet supprimé avec succès']);
        } catch (Throwable $e) {
            error_log('Erreur delete projet: ' . $e->getMessage());
            send_error('Erreur serveur');
        }
    }

    public static function updateConfig(string $id): void
    {
        try {
            $body = json_body();
            $montantParReunion = $body['montant_par_reunion'] ?? null;
            $montantAnnuel = $body['montant_annuel'] ?? null;
            $penaliteRetard = $body['penalite_retard'] ?? null;

            if ($montantParReunion < 0 || $montantAnnuel < 0 || $penaliteRetard < 0) {
                send_error('Les montants ne peuvent pas être négatifs', 400);
            }

            if (!Projet::getById((int) $id)) {
                send_error('Projet introuvable', 404);
            }

            Projet::updateConfig((int) $id, (float) $montantParReunion, (float) $montantAnnuel, (float) $penaliteRetard);
            send_json(['success' => true, 'message' => 'Configuration mise à jour avec succès']);
        } catch (Throwable $e) {
            error_log('Erreur updateConfig projet: ' . $e->getMessage());
            send_error('Erreur serveur');
        }
    }

    public static function getCotisations(string $id): void
    {
        try {
            send_json(['success' => true, 'data' => Projet::getCotisations((int) $id)]);
        } catch (Throwable $e) {
            error_log('Erreur getCotisations projet: ' . $e->getMessage());
            send_error('Erreur serveur');
        }
    }

    public static function addCotisation(string $id): void
    {
        try {
            $body = json_body();
            $cotisationId = $body['cotisationId'] ?? null;
            if (!$cotisationId) {
                send_error("L'identifiant de la cotisation est obligatoire", 400);
            }

            Projet::addCotisation((int) $id, (int) $cotisationId);
            send_json(['success' => true, 'message' => 'Cotisation affectée avec succès'], 201);
        } catch (Throwable $e) {
            error_log('Erreur addCotisation projet: ' . $e->getMessage());
            send_error('Erreur serveur');
        }
    }

    public static function removeCotisation(string $id, string $cotisationId): void
    {
        try {
            if (Projet::removeCotisation((int) $id, (int) $cotisationId)) {
                send_json(['success' => true, 'message' => 'Cotisation retirée avec succès']);
            } else {
                send_error('Lien introuvable', 404);
            }
        } catch (Throwable $e) {
            error_log('Erreur removeCotisation projet: ' . $e->getMessage());
            send_error('Erreur serveur');
        }
    }
}
