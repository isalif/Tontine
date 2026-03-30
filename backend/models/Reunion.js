const db = require("./db");

class Reunion {
  // Récupérer toutes les réunions
  static async getAll() {
    const [rows] = await db.query(
      "SELECT * FROM reunions ORDER BY date_reunion DESC"
    );
    return rows;
  }

  // Récupérer une réunion par ID
  static async getById(id) {
    const [rows] = await db.query("SELECT * FROM reunions WHERE id = ?", [id]);
    return rows[0];
  }

  // Vérifier si une date de réunion existe déjà
  static async checkDateExists(dateReunion, excludeId = null) {
    let query = "SELECT id FROM reunions WHERE date_reunion = ?";
    let params = [dateReunion];

    if (excludeId) {
      query += " AND id != ?";
      params.push(excludeId);
    }

    const [rows] = await db.query(query, params);
    return rows.length > 0;
  }

  // Créer une nouvelle réunion
  static async create(dateReunion) {
    const [result] = await db.query(
      'INSERT INTO reunions (date_reunion, statut) VALUES (?, "en_cours")',
      [dateReunion]
    );
    return result.insertId;
  }

  // Créer automatiquement les présences pour tous les membres actifs
  static async createPresences(reunionId) {
    const query = `
            INSERT INTO presences (reunion_id, membre_id, present)
            SELECT ?, id, TRUE FROM membres WHERE actif = TRUE
        `;
    await db.query(query, [reunionId]);
  }

  // Créer automatiquement les cotisations pour tous les membres
  static async createCotisations(reunionId) {
    // Récupérer les montants par défaut
    const [config] = await db.query(
      'SELECT cle, valeur FROM configuration WHERE cle IN ("cotisation_mensuelle_defaut", "cotisation_speciale_defaut")'
    );

    const cotisationMensuelle =
      config.find((c) => c.cle === "cotisation_mensuelle_defaut")?.valeur || 0;
    const cotisationSpeciale =
      config.find((c) => c.cle === "cotisation_speciale_defaut")?.valeur || 0;

    const query = `
            INSERT INTO cotisations (reunion_id, membre_id, cotisation_mensuelle, cotisation_speciale, penalite)
            SELECT ?, id, ?, ?, 0 FROM membres WHERE actif = TRUE
        `;
    await db.query(query, [reunionId, cotisationMensuelle, cotisationSpeciale]);
  }

  // Clôturer une réunion
  static async cloture(id) {
    const [result] = await db.query(
      'UPDATE reunions SET statut = "cloturee" WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Supprimer une réunion
  static async delete(id) {
    const [result] = await db.query("DELETE FROM reunions WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Reunion;
