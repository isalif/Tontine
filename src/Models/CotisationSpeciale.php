<?php

class CotisationSpeciale
{
    public static function getAll(): array
    {
        $stmt = Database::pdo()->query(
            "SELECT
                cs.*,
                CONCAT(m.nom, ' ', m.prenom) AS membre,
                p.nom AS projet_nom
            FROM cotisations_speciales cs
            JOIN membres m ON m.id = cs.membre_id
            LEFT JOIN projets p ON p.id = cs.projet_id
            ORDER BY cs.date_paiement DESC, cs.date_creation DESC",
        );
        return $stmt->fetchAll();
    }

    public static function getById(int $id): ?array
    {
        $stmt = Database::pdo()->prepare(
            "SELECT
                cs.*,
                CONCAT(m.nom, ' ', m.prenom) AS membre,
                p.nom AS projet_nom
            FROM cotisations_speciales cs
            JOIN membres m ON m.id = cs.membre_id
            LEFT JOIN projets p ON p.id = cs.projet_id
            WHERE cs.id = ?",
        );
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public static function create(
        int $membreId,
        float $montant,
        string $datePaiement,
        ?string $statut,
        ?string $note,
        ?int $projetId,
    ): int {
        $stmt = Database::pdo()->prepare(
            'INSERT INTO cotisations_speciales (membre_id, montant, date_paiement, statut, note, projet_id)
             VALUES (?, ?, ?, ?, ?, ?)',
        );
        $stmt->execute([
            $membreId,
            $montant,
            $datePaiement,
            $statut ?: 'payee',
            $note ?: null,
            $projetId ?: null,
        ]);
        return (int) Database::pdo()->lastInsertId();
    }

    public static function update(
        int $id,
        int $membreId,
        float $montant,
        string $datePaiement,
        string $statut,
        ?string $note,
        ?int $projetId,
    ): bool {
        $stmt = Database::pdo()->prepare(
            'UPDATE cotisations_speciales
             SET membre_id = ?, montant = ?, date_paiement = ?, statut = ?, note = ?, projet_id = ?
             WHERE id = ?',
        );
        $stmt->execute([$membreId, $montant, $datePaiement, $statut, $note ?: null, $projetId ?: null, $id]);
        return $stmt->rowCount() > 0;
    }

    public static function delete(int $id): bool
    {
        $stmt = Database::pdo()->prepare('DELETE FROM cotisations_speciales WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0;
    }
}
