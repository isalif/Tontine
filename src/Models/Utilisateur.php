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
            'SELECT id, nom, prenom, email, photo, created_at FROM utilisateurs WHERE id = ?',
        );
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public static function create(string $nom, string $prenom, string $email, string $passwordHash): int
    {
        $stmt = Database::pdo()->prepare(
            'INSERT INTO utilisateurs (nom, prenom, email, password_hash) VALUES (?, ?, ?, ?)',
        );
        $stmt->execute([trim($nom), trim($prenom), strtolower(trim($email)), $passwordHash]);
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
}
