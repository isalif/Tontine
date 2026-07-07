-- Ajoute les rôles (admin/membre) et le lien compte <-> fiche membre.

ALTER TABLE utilisateurs
  ADD COLUMN role ENUM('admin','membre') NOT NULL DEFAULT 'membre' AFTER email,
  ADD COLUMN membre_id INT NULL AFTER role,
  ADD UNIQUE KEY membre_id (membre_id),
  ADD CONSTRAINT fk_utilisateurs_membre FOREIGN KEY (membre_id)
      REFERENCES membres(id) ON DELETE SET NULL;

-- Les comptes qui existaient déjà (créés avant l'introduction des rôles)
-- deviennent admin ; seuls les comptes créés après cette migration seront
-- "membre" par défaut.
UPDATE utilisateurs SET role = 'admin';
