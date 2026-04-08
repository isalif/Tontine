const db = require("./db");

class Membre {
  // Récupérer tous les membres (actifs seulement par défaut)
  static async getAll(includeInactive = false) {
    const where = includeInactive ? "" : "WHERE actif = TRUE";
    const [rows] = await db.query(
      `SELECT * FROM membres ${where} ORDER BY nom, prenom`,
    );
    return rows;
  }

  // Récupérer un membre par ID
  static async getById(id) {
    const [rows] = await db.query("SELECT * FROM membres WHERE id = ?", [id]);
    return rows[0];
  }

  // Vérifier si un numéro existe déjà
  static async checkNumeroExists(numero, excludeId = null) {
    let query = "SELECT id FROM membres WHERE numero = ?";
    let params = [numero];

    if (excludeId) {
      query += " AND id != ?";
      params.push(excludeId);
    }

    const [rows] = await db.query(query, params);
    return rows.length > 0;
  }

  // Créer un nouveau membre (sans cotisation spéciale)
  static async create(nom, prenom, numero, abonneAnnuel = false) {
    const [result] = await db.query(
      `INSERT INTO membres 
       (nom, prenom, numero, actif, abonne_annuel) 
       VALUES (?, ?, ?, TRUE, ?)`,
      [nom.trim(), prenom.trim(), numero.trim(), abonneAnnuel],
    );
    return result.insertId;
  }

  // Modifier un membre
  static async update(id, nom, prenom, numero, abonneAnnuel = false, actif = true) {
    const [result] = await db.query(
      `UPDATE membres
       SET nom = ?, prenom = ?, numero = ?, abonne_annuel = ?, actif = ?
       WHERE id = ?`,
      [nom.trim(), prenom.trim(), numero.trim(), abonneAnnuel, actif, id],
    );
    return result.affectedRows > 0;
  }

  // Basculer le statut actif/inactif
  static async toggleActif(id) {
    const [result] = await db.query(
      "UPDATE membres SET actif = NOT actif WHERE id = ?",
      [id],
    );
    return result.affectedRows > 0;
  }

  // Supprimer un membre
  static async delete(id) {
    try {
      const [cotisations] = await db.query(
        "SELECT COUNT(*) as total FROM cotisations WHERE membre_id = ?",
        [id],
      );

      if (cotisations[0].total > 0) {
        throw new Error(
          "Impossible de supprimer ce membre car il a des cotisations associées. Supprimez d'abord les cotisations concernées.",
        );
      }

      const [result] = await db.query("DELETE FROM membres WHERE id = ?", [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Compter les membres actifs
  static async count() {
    const [rows] = await db.query(
      "SELECT COUNT(*) as total FROM membres WHERE actif = TRUE",
    );
    return rows[0].total;
  }
}

module.exports = Membre;
