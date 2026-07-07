<?php

class Utilisateur
{
    public static function findByEmail(string $email): ?array
    {
        $stmt = Database::pdo()->prepare('SELECT * FROM utilisateurs WHERE email = ?');
        $stmt->execute([$email]);
        return $stmt->fetch() ?: null;
    }

    public static function findById(int $id): ?array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT id, nom, prenom, email, role, membre_id, photo, created_at FROM utilisateurs WHERE id = ?',
        );
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public static function findByMembreId(int $membreId): ?array
    {
        $stmt = Database::pdo()->prepare('SELECT * FROM utilisateurs WHERE membre_id = ?');
        $stmt->execute([$membreId]);
        return $stmt->fetch() ?: null;
    }

    public static function create(
        string $nom,
        string $prenom,
        string $email,
        string $passwordHash,
        string $role = 'membre',
        ?int $membreId = null,
    ): int {
        $stmt = Database::pdo()->prepare(
            'INSERT INTO utilisateurs (nom, prenom, email, password_hash, role, membre_id)
             VALUES (?, ?, ?, ?, ?, ?)',
        );
        $stmt->execute([trim($nom), trim($prenom), strtolower(trim($email)), $passwordHash, $role, $membreId]);
        return (int) Database::pdo()->lastInsertId();
    }

    public static function updateProfile(int $id, string $nom, string $prenom, string $email): bool
    {
        $stmt = Database::pdo()->prepare(
            'UPDATE utilisateurs SET nom = ?, prenom = ?, email = ? WHERE id = ?',
        );
        $stmt->execute([trim($nom), trim($prenom), strtolower(trim($email)), $id]);
        return $stmt->rowCount() > 0;
    }

    public static function updatePassword(int $id, string $passwordHash): bool
    {
        $stmt = Database::pdo()->prepare('UPDATE utilisateurs SET password_hash = ? WHERE id = ?');
        $stmt->execute([$passwordHash, $id]);
        return $stmt->rowCount() > 0;
    }

    public static function updatePhoto(int $id, string $filename): bool
    {
        $stmt = Database::pdo()->prepare('UPDATE utilisateurs SET photo = ? WHERE id = ?');
        $stmt->execute([$filename, $id]);
        return $stmt->rowCount() > 0;
    }

    public static function getAll(): array
    {
        $stmt = Database::pdo()->query(
            'SELECT u.id, u.nom, u.prenom, u.email, u.role, u.membre_id, u.photo, u.created_at,
                    CONCAT(m.nom, \' \', m.prenom) AS membre_nom
             FROM utilisateurs u
             LEFT JOIN membres m ON m.id = u.membre_id
             ORDER BY u.nom, u.prenom',
        );
        return $stmt->fetchAll();
    }

    public static function updateRole(int $id, string $role): bool
    {
        $stmt = Database::pdo()->prepare('UPDATE utilisateurs SET role = ? WHERE id = ?');
        $stmt->execute([$role, $id]);
        return $stmt->rowCount() > 0;
    }

    public static function updateMembreLink(int $id, ?int $membreId): bool
    {
        $stmt = Database::pdo()->prepare('UPDATE utilisateurs SET membre_id = ? WHERE id = ?');
        $stmt->execute([$membreId, $id]);
        return $stmt->rowCount() > 0;
    }

    public static function countAdmins(): int
    {
        $stmt = Database::pdo()->query("SELECT COUNT(*) AS total FROM utilisateurs WHERE role = 'admin'");
        return (int) $stmt->fetch()['total'];
    }

    public static function delete(int $id): bool
    {
        $stmt = Database::pdo()->prepare('DELETE FROM utilisateurs WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0;
    }
}
