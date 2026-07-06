<?php

class Cotisation
{
    public static function getByReunion(int $reunionId): array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT
                c.id,
                c.reunion_id,
                c.membre_id,
                m.nom,
                m.prenom,
                m.numero,
                m.abonne_annuel,
                m.cotisation_speciale_payee,
                c.cotisation_mensuelle,
                c.cotisation_speciale,
                c.penalite,
                c.total,
                p.present
            FROM cotisations c
            INNER JOIN membres m ON c.membre_id = m.id
            LEFT JOIN presences p ON p.reunion_id = c.reunion_id AND p.membre_id = c.membre_id
            WHERE c.reunion_id = ?
            ORDER BY m.nom, m.prenom',
        );
        $stmt->execute([$reunionId]);
        return $stmt->fetchAll();
    }

    public static function getById(int $id): ?array
    {
        $stmt = Database::pdo()->prepare('SELECT * FROM cotisations WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public static function update(int $id, float $cotisationMensuelle, float $cotisationSpeciale, float $penalite): bool
    {
        $stmt = Database::pdo()->prepare(
            'UPDATE cotisations SET cotisation_mensuelle = ?, cotisation_speciale = ?, penalite = ? WHERE id = ?',
        );
        $stmt->execute([$cotisationMensuelle, $cotisationSpeciale, $penalite, $id]);
        return $stmt->rowCount() > 0;
    }

    public static function addPenalite(int $reunionId, int $membreId, float $montantPenalite): bool
    {
        $stmt = Database::pdo()->prepare(
            'UPDATE cotisations SET penalite = penalite + ? WHERE reunion_id = ? AND membre_id = ?',
        );
        $stmt->execute([$montantPenalite, $reunionId, $membreId]);
        return $stmt->rowCount() > 0;
    }

    public static function getTotalReunion(int $reunionId): array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT
                SUM(cotisation_mensuelle) AS total_mensuelle,
                SUM(cotisation_speciale) AS total_speciale,
                SUM(penalite) AS total_penalite,
                SUM(total) AS total_general
            FROM cotisations
            WHERE reunion_id = ?',
        );
        $stmt->execute([$reunionId]);
        return $stmt->fetch();
    }

    public static function getTotauxParReunion(): array
    {
        $stmt = Database::pdo()->query(
            'SELECT
                r.id AS reunion_id,
                r.date_reunion,
                r.titre,
                COALESCE(SUM(c.total), 0) AS total
            FROM reunions r
            LEFT JOIN cotisations c ON c.reunion_id = r.id
            GROUP BY r.id, r.date_reunion, r.titre
            ORDER BY r.date_reunion ASC',
        );
        return $stmt->fetchAll();
    }

    public static function updatePresence(int $reunionId, int $membreId, bool $present): bool
    {
        $stmt = Database::pdo()->prepare(
            'UPDATE presences SET present = ? WHERE reunion_id = ? AND membre_id = ?',
        );
        $stmt->execute([$present, $reunionId, $membreId]);
        return $stmt->rowCount() > 0;
    }

    public static function getConfiguration(): array
    {
        $stmt = Database::pdo()->query('SELECT cle, valeur, description FROM configuration');
        $config = [];
        foreach ($stmt->fetchAll() as $row) {
            $config[$row['cle']] = $row['valeur'];
        }
        return $config;
    }

    public static function updateConfiguration(string $cle, string $valeur): bool
    {
        $stmt = Database::pdo()->prepare('UPDATE configuration SET valeur = ? WHERE cle = ?');
        $stmt->execute([$valeur, $cle]);
        return $stmt->rowCount() > 0;
    }
}
