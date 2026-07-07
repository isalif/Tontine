<?php

class Membre
{
    public static function getAll(bool $includeInactive = false): array
    {
        $where = $includeInactive ? '' : 'WHERE actif = TRUE';
        $stmt = Database::pdo()->query("SELECT * FROM membres $where ORDER BY nom, prenom");
        return $stmt->fetchAll();
    }

    public static function getById(int $id): ?array
    {
        $stmt = Database::pdo()->prepare('SELECT * FROM membres WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    // Membres actifs sans compte de connexion relié — utilisé sur la page d'inscription.
    public static function getUnlinked(): array
    {
        $stmt = Database::pdo()->query(
            'SELECT m.id, m.nom, m.prenom
             FROM membres m
             LEFT JOIN utilisateurs u ON u.membre_id = m.id
             WHERE m.actif = TRUE AND u.id IS NULL
             ORDER BY m.nom, m.prenom',
        );
        return $stmt->fetchAll();
    }

    public static function checkNumeroExists(string $numero, ?int $excludeId = null): bool
    {
        $query = 'SELECT id FROM membres WHERE numero = ?';
        $params = [$numero];

        if ($excludeId) {
            $query .= ' AND id != ?';
            $params[] = $excludeId;
        }

        $stmt = Database::pdo()->prepare($query);
        $stmt->execute($params);
        return $stmt->fetch() !== false;
    }

    public static function create(string $nom, string $prenom, string $numero, bool $abonneAnnuel = false): int
    {
        $stmt = Database::pdo()->prepare(
            'INSERT INTO membres (nom, prenom, numero, date_ajout, actif, abonne_annuel)
             VALUES (?, ?, ?, CURDATE(), TRUE, ?)',
        );
        $stmt->execute([trim($nom), trim($prenom), trim($numero), $abonneAnnuel]);
        return (int) Database::pdo()->lastInsertId();
    }

    public static function update(
        int $id,
        string $nom,
        string $prenom,
        string $numero,
        bool $abonneAnnuel = false,
        bool $actif = true,
    ): bool {
        $stmt = Database::pdo()->prepare(
            'UPDATE membres SET nom = ?, prenom = ?, numero = ?, abonne_annuel = ?, actif = ? WHERE id = ?',
        );
        $stmt->execute([trim($nom), trim($prenom), trim($numero), $abonneAnnuel, $actif, $id]);
        return $stmt->rowCount() > 0;
    }

    public static function toggleActif(int $id): bool
    {
        $stmt = Database::pdo()->prepare('UPDATE membres SET actif = NOT actif WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0;
    }

    public static function delete(int $id): bool
    {
        $countStmt = Database::pdo()->prepare('SELECT COUNT(*) AS total FROM cotisations WHERE membre_id = ?');
        $countStmt->execute([$id]);
        $total = (int) $countStmt->fetch()['total'];

        if ($total > 0) {
            throw new RuntimeException(
                "Impossible de supprimer ce membre car il a des cotisations associées. Supprimez d'abord les cotisations concernées.",
            );
        }

        $stmt = Database::pdo()->prepare('DELETE FROM membres WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0;
    }

    public static function count(): int
    {
        $stmt = Database::pdo()->query('SELECT COUNT(*) AS total FROM membres WHERE actif = TRUE');
        return (int) $stmt->fetch()['total'];
    }
}
