<?php

class AuthController
{
    private static function validateRegister(?string $nom, ?string $prenom, ?string $email, ?string $password): array
    {
        $errors = [];
        if (!$nom || mb_strlen(trim($nom)) < 2) {
            $errors[] = 'Le nom doit contenir au moins 2 caractères';
        }
        if (!$prenom || mb_strlen(trim($prenom)) < 2) {
            $errors[] = 'Le prénom doit contenir au moins 2 caractères';
        }
        if (!$email || !preg_match('/^\S+@\S+\.\S+$/', $email)) {
            $errors[] = 'Adresse e-mail invalide';
        }
        if (!$password || strlen($password) < 6) {
            $errors[] = 'Le mot de passe doit contenir au moins 6 caractères';
        }
        return $errors;
    }

    public static function register(): void
    {
        try {
            $body = json_body();
            $nom = $body['nom'] ?? null;
            $prenom = $body['prenom'] ?? null;
            $email = $body['email'] ?? null;
            $password = $body['password'] ?? null;

            $errors = self::validateRegister($nom, $prenom, $email, $password);
            if ($errors) {
                send_json(['success' => false, 'message' => 'Erreurs de validation', 'errors' => $errors], 400);
            }

            if (Utilisateur::findByEmail(strtolower(trim($email)))) {
                send_error('Un compte existe déjà avec cet e-mail', 400);
            }

            $passwordHash = password_hash($password, PASSWORD_BCRYPT);
            $userId = Utilisateur::create($nom, $prenom, $email, $passwordHash);

            $_SESSION['user_id'] = $userId;

            send_json([
                'success' => true,
                'message' => 'Compte créé avec succès',
                'data' => Utilisateur::findById($userId),
            ], 201);
        } catch (Throwable $e) {
            error_log('Erreur register: ' . $e->getMessage());
            send_error('Erreur serveur');
        }
    }

    public static function login(): void
    {
        try {
            $body = json_body();
            $email = $body['email'] ?? null;
            $password = $body['password'] ?? null;
            $remember = $body['remember'] ?? false;

            if (!$email || !$password) {
                send_error('E-mail et mot de passe requis', 400);
            }

            $user = Utilisateur::findByEmail(strtolower(trim($email)));
            if (!$user || !password_verify($password, $user['password_hash'])) {
                send_error('Identifiants incorrects', 401);
            }

            $_SESSION['user_id'] = $user['id'];
            if ($remember) {
                remember_session();
            }

            unset($user['password_hash']);
            send_json(['success' => true, 'message' => 'Connexion réussie', 'data' => $user]);
        } catch (Throwable $e) {
            error_log('Erreur login: ' . $e->getMessage());
            send_error('Erreur serveur');
        }
    }

    public static function logout(): void
    {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
        }
        session_destroy();

        send_json(['success' => true, 'message' => 'Déconnexion réussie']);
    }

    public static function me(): void
    {
        try {
            $user = Utilisateur::findById($_SESSION['user_id']);
            if (!$user) {
                send_error('Utilisateur introuvable', 404);
            }
            send_json(['success' => true, 'data' => $user]);
        } catch (Throwable $e) {
            error_log('Erreur me: ' . $e->getMessage());
            send_error('Erreur serveur');
        }
    }

    public static function updateProfile(): void
    {
        try {
            $body = json_body();
            $nom = $body['nom'] ?? null;
            $prenom = $body['prenom'] ?? null;
            $email = $body['email'] ?? null;
            $currentPassword = $body['current_password'] ?? null;
            $newPassword = $body['new_password'] ?? null;
            $userId = (int) $_SESSION['user_id'];

            $errors = [];
            if (!$nom || mb_strlen(trim($nom)) < 2) {
                $errors[] = 'Le nom doit contenir au moins 2 caractères';
            }
            if (!$prenom || mb_strlen(trim($prenom)) < 2) {
                $errors[] = 'Le prénom doit contenir au moins 2 caractères';
            }
            if (!$email || !preg_match('/^\S+@\S+\.\S+$/', $email)) {
                $errors[] = 'Adresse e-mail invalide';
            }
            if ($errors) {
                send_json(['success' => false, 'message' => 'Erreurs de validation', 'errors' => $errors], 400);
            }

            $existing = Utilisateur::findByEmail(strtolower(trim($email)));
            if ($existing && (int) $existing['id'] !== $userId) {
                send_error('Cet e-mail est déjà utilisé', 400);
            }

            Utilisateur::updateProfile($userId, $nom, $prenom, $email);

            if ($newPassword) {
                if (strlen($newPassword) < 6) {
                    send_error('Le nouveau mot de passe doit contenir au moins 6 caractères', 400);
                }
                $current = Utilisateur::findByEmail(strtolower(trim($email)));
                if (!$currentPassword || !password_verify($currentPassword, $current['password_hash'])) {
                    send_error('Mot de passe actuel incorrect', 400);
                }
                Utilisateur::updatePassword($userId, password_hash($newPassword, PASSWORD_BCRYPT));
            }

            send_json([
                'success' => true,
                'message' => 'Profil mis à jour avec succès',
                'data' => Utilisateur::findById($userId),
            ]);
        } catch (Throwable $e) {
            error_log('Erreur updateProfile: ' . $e->getMessage());
            send_error('Erreur serveur');
        }
    }

    public static function updatePhoto(): void
    {
        try {
            if (empty($_FILES['photo']) || $_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
                send_error('Aucune image envoyée', 400);
            }

            $file = $_FILES['photo'];

            if ($file['size'] > 3 * 1024 * 1024) {
                send_error("L'image dépasse la taille maximale de 3 Mo", 400);
            }

            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $mime = $finfo->file($file['tmp_name']);
            $allowed = [
                'image/jpeg' => '.jpg',
                'image/png' => '.png',
                'image/webp' => '.webp',
                'image/gif' => '.gif',
            ];
            if (!isset($allowed[$mime])) {
                send_error("Format d'image non supporté", 400);
            }

            $userId = (int) $_SESSION['user_id'];
            $config = require __DIR__ . '/../config.php';
            $filename = 'user-' . $userId . '-' . time() . $allowed[$mime];
            $destination = $config['uploadsDir'] . '/' . $filename;

            if (!move_uploaded_file($file['tmp_name'], $destination)) {
                send_error("Erreur lors de l'enregistrement de l'image", 500);
            }

            Utilisateur::updatePhoto($userId, $filename);

            send_json([
                'success' => true,
                'message' => 'Photo de profil mise à jour',
                'data' => Utilisateur::findById($userId),
            ]);
        } catch (Throwable $e) {
            error_log('Erreur updatePhoto: ' . $e->getMessage());
            send_error('Erreur serveur');
        }
    }
}
