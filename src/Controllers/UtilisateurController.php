<?php

class UtilisateurController
{
    public static function getAll(): void
    {
        try {
            send_json(['success' => true, 'data' => Utilisateur::getAll()]);
        } catch (Throwable $e) {
            error_log('Erreur getAll utilisateurs: ' . $e->getMessage());
            send_error('Erreur serveur');
        }
    }

    public static function updateRole(string $id): void
    {
        try {
            $user = Utilisateur::findById((int) $id);
            if (!$user) {
                send_error('Utilisateur introuvable', 404);
            }

            $body = json_body();
            $role = $body['role'] ?? null;
            if (!in_array($role, ['admin', 'membre'], true)) {
                send_error('Rôle invalide', 400);
            }

            if ($user['role'] === 'admin' && $role === 'membre' && Utilisateur::countAdmins() <= 1) {
                send_error("Impossible de retirer le dernier administrateur", 400);
            }

            Utilisateur::updateRole((int) $id, $role);
            send_json(['success' => true, 'message' => 'Rôle mis à jour avec succès']);
        } catch (Throwable $e) {
            error_log('Erreur updateRole: ' . $e->getMessage());
            send_error('Erreur serveur');
        }
    }

    public static function updateMembreLink(string $id): void
    {
        try {
            if (!Utilisateur::findById((int) $id)) {
                send_error('Utilisateur introuvable', 404);
            }

            $body = json_body();
            $membreId = !empty($body['membre_id']) ? (int) $body['membre_id'] : null;

            if ($membreId !== null) {
                if (!Membre::getById($membreId)) {
                    send_error('Membre introuvable', 400);
                }
                $existingLink = Utilisateur::findByMembreId($membreId);
                if ($existingLink && (int) $existingLink['id'] !== (int) $id) {
                    send_error('Ce membre est déjà relié à un autre compte', 400);
                }
            }

            Utilisateur::updateMembreLink((int) $id, $membreId);
            send_json(['success' => true, 'message' => 'Lien mis à jour avec succès']);
        } catch (Throwable $e) {
            error_log('Erreur updateMembreLink: ' . $e->getMessage());
            send_error('Erreur serveur');
        }
    }

    public static function delete(string $id): void
    {
        try {
            $user = Utilisateur::findById((int) $id);
            if (!$user) {
                send_error('Utilisateur introuvable', 404);
            }

            if ((int) $id === (int) $_SESSION['user_id']) {
                send_error('Impossible de supprimer votre propre compte', 400);
            }

            if ($user['role'] === 'admin' && Utilisateur::countAdmins() <= 1) {
                send_error("Impossible de supprimer le dernier administrateur", 400);
            }

            Utilisateur::delete((int) $id);
            send_json(['success' => true, 'message' => 'Compte supprimé avec succès']);
        } catch (Throwable $e) {
            error_log('Erreur delete utilisateur: ' . $e->getMessage());
            send_error('Erreur serveur');
        }
    }
}
