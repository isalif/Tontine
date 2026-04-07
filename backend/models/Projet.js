const db = require("./db"); // ✅ Correction du chemin

class Projet {
  static async getAll() {
    const [rows] = await db.query(`
      SELECT 
        p.*,
        COALESCE(pc.montant_par_reunion, 5000) AS montant_par_reunion,
        COALESCE(pc.montant_annuel, 60000) AS montant_annuel,
        COALESCE(pc.penalite_retard, 1000) AS penalite_retard,
        (SELECT COALESCE(SUM(cs.montant), 0) 
         FROM cotisations_speciales cs 
         WHERE cs.projet_id = p.id) AS montant_collecte
      FROM projets p
      LEFT JOIN projet_configurations pc ON pc.projet_id = p.id
      ORDER BY p.date_creation DESC
    `);
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.query(
      `
      SELECT 
        p.*,
        COALESCE(pc.montant_par_reunion, 5000) AS montant_par_reunion,
        COALESCE(pc.montant_annuel, 60000) AS montant_annuel,
        COALESCE(pc.penalite_retard, 1000) AS penalite_retard,
        (SELECT COALESCE(SUM(cs.montant), 0) 
         FROM cotisations_speciales cs 
         WHERE cs.projet_id = p.id) AS montant_collecte
      FROM projets p
      LEFT JOIN projet_configurations pc ON pc.projet_id = p.id
      WHERE p.id = ?
    `,
      [id],
    );
    return rows[0] || null;
  }

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
        description ? description.trim() : null,
        montantCible || 0,
        dateDebut || null,
        dateFin || null,
        statut || "en_cours",
      ],
    );

    const projetId = result.insertId;

    await db.query(
      `INSERT INTO projet_configurations (projet_id, montant_par_reunion, montant_annuel, penalite_retard)
       VALUES (?, 5000, 60000, 1000)`,
      [projetId],
    );

    return projetId;
  }

  static async update(
    id,
    nom,
    description,
    montantCible,
    dateDebut,
    dateFin,
    statut,
  ) {
    await db.query(
      `UPDATE projets 
       SET nom = ?, description = ?, montant_cible = ?, date_debut = ?, date_fin = ?, statut = ? 
       WHERE id = ?`,
      [
        nom.trim(),
        description ? description.trim() : null,
        montantCible || 0,
        dateDebut || null,
        dateFin || null,
        statut || "en_cours",
        id,
      ],
    );
    return true;
  }

  // ✅ Méthode dédiée pour la configuration
  static async updateConfig(
    id,
    montantParReunion,
    montantAnnuel,
    penaliteRetard,
  ) {
    await db.query(
      `INSERT INTO projet_configurations (projet_id, montant_par_reunion, montant_annuel, penalite_retard)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         montant_par_reunion = VALUES(montant_par_reunion),
         montant_annuel = VALUES(montant_annuel),
         penalite_retard = VALUES(penalite_retard)`,
      [id, montantParReunion, montantAnnuel, penaliteRetard],
    );
    return true;
  }

  static async delete(id) {
    const [result] = await db.query("DELETE FROM projets WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  static async getCotisations(projetId) {
    const [rows] = await db.query(
      `
      SELECT pc.*, c.montant, c.date_paiement, m.nom, m.prenom
      FROM projet_cotisations pc
      JOIN cotisations c ON pc.cotisation_id = c.id
      JOIN membres m ON c.membre_id = m.id
      WHERE pc.projet_id = ?
    `,
      [projetId],
    );
    return rows;
  }

  static async addCotisation(projetId, cotisationId) {
    await db.query(
      `INSERT INTO projet_cotisations (projet_id, cotisation_id) VALUES (?, ?)`,
      [projetId, cotisationId],
    );
  }

  static async removeCotisation(projetId, cotisationId) {
    const [result] = await db.query(
      `DELETE FROM projet_cotisations WHERE projet_id = ? AND cotisation_id = ?`,
      [projetId, cotisationId],
    );
    return result.affectedRows > 0;
  }
}

module.exports = Projet;
