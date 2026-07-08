-- Nom d'utilisateur choisi par l'admin pour chaque membre, utilisé à
-- l'inscription pour relier un nouveau compte à sa fiche membre (au lieu
-- d'exposer publiquement la liste des membres).

ALTER TABLE membres
  ADD COLUMN username VARCHAR(50) NULL AFTER numero,
  ADD UNIQUE KEY username (username);
