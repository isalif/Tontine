const db = require("./db");

class Projet {
  // Récupérer tous les projets
  static async getAll() {
    const [rows] = await db.query(`
      SELECT p.*,
        COALESCE(SUM(c.montant), 0) AS montant_collecte
      FROM projets p
      LEFT JOIN projet_cotisations pc ON pc.projet_id = p.id
      LEFT JOIN cotisations c ON c.id = pc.cotisation_id
      GROUP BY p.id
      ORDER BY p.date_creation DESC
    `);
    return rows;
  }

  // Récupérer un projet par ID
  static async getById(id) {
    const [rows] = await db.query(
      `
      SELECT p.*,
        COALESCE(SUM(c.montant), 0) AS montant_collecte
      FROM projets p
      LEFT JOIN projet_cotisations pc ON pc.projet_id = p.id
      LEFT JOIN cotisations c ON c.id = pc.cotisation_id
      WHERE p.id = ?
      GROUP BY p.id
    `,
      [id],
    );
    return rows[0];
  }

  // Créer un projet
  static async create(
    nom,
    description,
    montantCible,
    dateDebut,
    dateFin,
    statut,
  ) {
    const [result] = await db.query(
      `INSERT INTO projets (nom, description, montant_cible, date_debut, date_fin, statut)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        nom.trim(),
        description.trim(),
        montantCible,
        dateDebut || null,
        dateFin || null,
        statut,
      ],
    );
    return result.insertId;
  }

  // Modifier un projet
  static async update(
    id,
    nom,
    description,
    montantCible,
    dateDebut,
    dateFin,
    statut,
  ) {
    const [result] = await db.query(
      `UPDATE projets
       SET nom = ?, description = ?, montant_cible = ?, date_debut = ?, date_fin = ?, statut = ?
       WHERE id = ?`,
      [
        nom.trim(),
        description.trim(),
        montantCible,
        dateDebut || null,
        dateFin || null,
        statut,
        id,
      ],
    );
    return result.affectedRows > 0;
  }

  // Supprimer un projet
  static async delete(id) {
    // Supprimer d'abord les liens avec les cotisations
    await db.query("DELETE FROM projet_cotisations WHERE projet_id = ?", [id]);
    const [result] = await db.query("DELETE FROM projets WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  // Récupérer les cotisations affectées à un projet
  static async getCotisations(projetId) {
    const [rows] = await db.query(
      `
      SELECT c.*, CONCAT(m.nom, ' ', m.prenom) AS membre
      FROM projet_cotisations pc
      JOIN cotisations c ON c.id = pc.cotisation_id
      JOIN membres m ON m.id = c.membre_id
      WHERE pc.projet_id = ?
      ORDER BY c.date_paiement DESC
    `,
      [projetId],
    );
    return rows;
  }

  // Affecter une cotisation à un projet
  static async addCotisation(projetId, cotisationId) {
    // Vérifier si déjà affectée
    const [exists] = await db.query(
      "SELECT id FROM projet_cotisations WHERE projet_id = ? AND cotisation_id = ?",
      [projetId, cotisationId],
    );
    if (exists.length > 0) {
      throw new Error("Cette cotisation est déjà affectée à ce projet");
    }
    const [result] = await db.query(
      "INSERT INTO projet_cotisations (projet_id, cotisation_id) VALUES (?, ?)",
      [projetId, cotisationId],
    );
    return result.insertId;
  }

  // Retirer une cotisation d'un projet
  static async removeCotisation(projetId, cotisationId) {
    const [result] = await db.query(
      "DELETE FROM projet_cotisations WHERE projet_id = ? AND cotisation_id = ?",
      [projetId, cotisationId],
    );
    return result.affectedRows > 0;
  }
}

module.exports = Projet;
