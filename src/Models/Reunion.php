<?php

class Reunion
{
    public static function getAll(): array
    {
        $stmt = Database::pdo()->query(
            'SELECT r.*, p.nom AS projet_nom
             FROM reunions r
             LEFT JOIN projets p ON p.id = r.projet_id
             ORDER BY r.date_reunion DESC',
        );
        return $stmt->fetchAll();
    }

    public static function getById(int $id): ?array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT r.*, p.nom AS projet_nom
             FROM reunions r
             LEFT JOIN projets p ON p.id = r.projet_id
             WHERE r.id = ?',
        );
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public static function checkDateExists(string $dateReunion, ?int $excludeId = null): bool
    {
        $query = 'SELECT id FROM reunions WHERE date_reunion = ?';
        $params = [$dateReunion];

        if ($excludeId) {
            $query .= ' AND id != ?';
            $params[] = $excludeId;
        }

        $stmt = Database::pdo()->prepare($query);
        $stmt->execute($params);
        return $stmt->fetch() !== false;
    }

    public static function create(?string $titre, string $dateReunion, ?int $projetId): int
    {
        $stmt = Database::pdo()->prepare(
            'INSERT INTO reunions (titre, date_reunion, projet_id, statut) VALUES (?, ?, ?, "en_cours")',
        );
        $stmt->execute([$titre ? trim($titre) : null, $dateReunion, $projetId ?: null]);
        return (int) Database::pdo()->lastInsertId();
    }

    public static function update(int $id, ?string $titre, string $dateReunion, ?int $projetId): bool
    {
        $stmt = Database::pdo()->prepare(
            'UPDATE reunions SET titre = ?, date_reunion = ?, projet_id = ? WHERE id = ?',
        );
        $stmt->execute([$titre ? trim($titre) : null, $dateReunion, $projetId ?: null, $id]);
        return $stmt->rowCount() > 0;
    }

    public static function createPresences(int $reunionId): void
    {
        $stmt = Database::pdo()->prepare(
            'INSERT INTO presences (reunion_id, membre_id, present)
             SELECT ?, id, TRUE FROM membres WHERE actif = TRUE',
        );
        $stmt->execute([$reunionId]);
    }

    public static function createCotisations(int $reunionId, $cotisationMensuelleParam): void
    {
        $montantMensuel = $cotisationMensuelleParam !== null ? (float) $cotisationMensuelleParam : null;

        if ($montantMensuel === null || !is_finite($montantMensuel)) {
            $configStmt = Database::pdo()->query(
                "SELECT cle, valeur FROM configuration WHERE cle IN ('cotisation_mensuelle_defaut', 'cotisation_speciale_defaut')",
            );
            $config = $configStmt->fetchAll();
            $default = array_values(array_filter($config, fn ($c) => $c['cle'] === 'cotisation_mensuelle_defaut'));
            $montantMensuel = $default ? (float) $default[0]['valeur'] : 0;
        }

        $specialeStmt = Database::pdo()->query(
            "SELECT valeur FROM configuration WHERE cle = 'cotisation_speciale_defaut'",
        );
        $specialeRow = $specialeStmt->fetch();
        $cotisationSpeciale = $specialeRow ? (float) $specialeRow['valeur'] : 0;

        $stmt = Database::pdo()->prepare(
            'INSERT INTO cotisations (reunion_id, membre_id, cotisation_mensuelle, cotisation_speciale, penalite)
             SELECT ?, id, ?, ?, 0 FROM membres WHERE actif = TRUE',
        );
        $stmt->execute([$reunionId, $montantMensuel, $cotisationSpeciale]);
    }

    public static function cloture(int $id): bool
    {
        $stmt = Database::pdo()->prepare('UPDATE reunions SET statut = "cloturee" WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0;
    }

    public static function delete(int $id): bool
    {
        $stmt = Database::pdo()->prepare('DELETE FROM reunions WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0;
    }
}
