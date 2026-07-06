<?php

class Projet
{
    private const SELECT_BASE = "
        SELECT
            p.*,
            COALESCE(pc.montant_par_reunion, 5000) AS montant_par_reunion,
            COALESCE(pc.montant_annuel, 60000) AS montant_annuel,
            COALESCE(pc.penalite_retard, 1000) AS penalite_retard,
            (
                SELECT COALESCE(SUM(cs.montant), 0)
                FROM cotisations_speciales cs
                WHERE cs.projet_id = p.id AND cs.statut != 'annule'
            ) + (
                SELECT COALESCE(SUM(c.cotisation_mensuelle), 0)
                FROM cotisations c
                JOIN reunions r ON r.id = c.reunion_id
                WHERE r.projet_id = p.id
            ) AS montant_collecte
        FROM projets p
        LEFT JOIN projet_configurations pc ON pc.projet_id = p.id
    ";

    public static function getAll(): array
    {
        $stmt = Database::pdo()->query(self::SELECT_BASE . ' ORDER BY p.date_creation DESC');
        return $stmt->fetchAll();
    }

    public static function getById(int $id): ?array
    {
        $stmt = Database::pdo()->prepare(self::SELECT_BASE . ' WHERE p.id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public static function create(
        string $nom,
        ?string $description,
        ?float $montantCible,
        ?string $dateDebut,
        ?string $dateFin,
        ?string $statut,
    ): int {
        $pdo = Database::pdo();
        $stmt = $pdo->prepare(
            'INSERT INTO projets (nom, description, montant_cible, date_debut, date_fin, statut)
             VALUES (?, ?, ?, ?, ?, ?)',
        );
        $stmt->execute([
            trim($nom),
            $description ? trim($description) : null,
            $montantCible ?: 0,
            $dateDebut ?: null,
            $dateFin ?: null,
            $statut ?: 'en_cours',
        ]);

        $projetId = (int) $pdo->lastInsertId();

        $configStmt = $pdo->prepare(
            'INSERT INTO projet_configurations (projet_id, montant_par_reunion, montant_annuel, penalite_retard)
             VALUES (?, 5000, 60000, 1000)',
        );
        $configStmt->execute([$projetId]);

        return $projetId;
    }

    public static function update(
        int $id,
        string $nom,
        ?string $description,
        ?float $montantCible,
        ?string $dateDebut,
        ?string $dateFin,
        ?string $statut,
    ): bool {
        $stmt = Database::pdo()->prepare(
            'UPDATE projets SET nom = ?, description = ?, montant_cible = ?, date_debut = ?, date_fin = ?, statut = ?
             WHERE id = ?',
        );
        $stmt->execute([
            trim($nom),
            $description ? trim($description) : null,
            $montantCible ?: 0,
            $dateDebut ?: null,
            $dateFin ?: null,
            $statut ?: 'en_cours',
            $id,
        ]);
        return true;
    }

    public static function updateConfig(int $id, float $montantParReunion, float $montantAnnuel, float $penaliteRetard): bool
    {
        $stmt = Database::pdo()->prepare(
            'INSERT INTO projet_configurations (projet_id, montant_par_reunion, montant_annuel, penalite_retard)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                montant_par_reunion = VALUES(montant_par_reunion),
                montant_annuel = VALUES(montant_annuel),
                penalite_retard = VALUES(penalite_retard)',
        );
        $stmt->execute([$id, $montantParReunion, $montantAnnuel, $penaliteRetard]);
        return true;
    }

    public static function delete(int $id): bool
    {
        $stmt = Database::pdo()->prepare('DELETE FROM projets WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0;
    }

    public static function getCotisations(int $projetId): array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT pc.*, c.montant, c.date_paiement, m.nom, m.prenom
             FROM projet_cotisations pc
             JOIN cotisations c ON pc.cotisation_id = c.id
             JOIN membres m ON c.membre_id = m.id
             WHERE pc.projet_id = ?',
        );
        $stmt->execute([$projetId]);
        return $stmt->fetchAll();
    }

    public static function addCotisation(int $projetId, int $cotisationId): void
    {
        $stmt = Database::pdo()->prepare(
            'INSERT INTO projet_cotisations (projet_id, cotisation_id) VALUES (?, ?)',
        );
        $stmt->execute([$projetId, $cotisationId]);
    }

    public static function removeCotisation(int $projetId, int $cotisationId): bool
    {
        $stmt = Database::pdo()->prepare(
            'DELETE FROM projet_cotisations WHERE projet_id = ? AND cotisation_id = ?',
        );
        $stmt->execute([$projetId, $cotisationId]);
        return $stmt->rowCount() > 0;
    }
}
