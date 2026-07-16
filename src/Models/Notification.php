<?php

class Notification
{
    public static function ensureTable(): void
    {
        Database::ensureSchema();
    }

    public static function getForUser(?int $userId = null, ?int $membreId = null): array
    {
        self::ensureTable();

        if ($userId === null && $membreId === null) {
            return [];
        }

        $query = 'SELECT * FROM notifications WHERE 1=1';
        $params = [];

        if ($userId !== null) {
            $query .= ' AND (user_id = ? OR user_id IS NULL)';
            $params[] = $userId;
        }

        if ($membreId !== null) {
            $query .= ' AND (membre_id = ? OR membre_id IS NULL)';
            $params[] = $membreId;
        }

        $query .= ' ORDER BY created_at DESC, id DESC LIMIT 20';

        $stmt = Database::pdo()->prepare($query);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public static function getUnreadCount(?int $userId = null, ?int $membreId = null): int
    {
        self::ensureTable();

        if ($userId === null && $membreId === null) {
            return 0;
        }

        $query = 'SELECT COUNT(*) AS total FROM notifications WHERE is_read = 0';
        $params = [];

        if ($userId !== null) {
            $query .= ' AND (user_id = ? OR user_id IS NULL)';
            $params[] = $userId;
        }

        if ($membreId !== null) {
            $query .= ' AND (membre_id = ? OR membre_id IS NULL)';
            $params[] = $membreId;
        }

        $stmt = Database::pdo()->prepare($query);
        $stmt->execute($params);
        return (int) $stmt->fetch()['total'];
    }

    public static function markAllRead(?int $userId = null, ?int $membreId = null): void
    {
        self::ensureTable();

        $query = 'UPDATE notifications SET is_read = 1 WHERE is_read = 0';
        $params = [];

        if ($userId !== null) {
            $query .= ' AND (user_id = ? OR user_id IS NULL)';
            $params[] = $userId;
        }

        if ($membreId !== null) {
            $query .= ' AND (membre_id = ? OR membre_id IS NULL)';
            $params[] = $membreId;
        }

        $stmt = Database::pdo()->prepare($query);
        $stmt->execute($params);
    }

    public static function create(
        ?int $userId,
        ?int $membreId,
        string $type,
        string $title,
        string $message,
        ?string $relatedType = null,
        ?int $relatedId = null,
    ): int {
        self::ensureTable();

        $stmt = Database::pdo()->prepare(
            'INSERT INTO notifications (user_id, membre_id, type, title, message, related_type, related_id, is_read)
             VALUES (?, ?, ?, ?, ?, ?, ?, 0)',
        );
        $stmt->execute([$userId, $membreId, $type, $title, $message, $relatedType, $relatedId]);
        return (int) Database::pdo()->lastInsertId();
    }

    public static function createForAllUsers(
        string $type,
        string $title,
        string $message,
        ?string $relatedType = null,
        ?int $relatedId = null,
    ): void {
        $users = Utilisateur::getAll();
        foreach ($users as $user) {
            self::create((int) $user['id'], $user['membre_id'] ? (int) $user['membre_id'] : null, $type, $title, $message, $relatedType, $relatedId);
        }
    }
}
