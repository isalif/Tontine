const db = require("./db");

class Cotisation {
  static async getByReunion(reunionId) {
    const query = `
        SELECT 
            c.id,
            c.reunion_id,
            c.membre_id,
            m.nom,
            m.prenom,
            m.numero,
            m.abonne_annuel,
            m.cotisation_speciale_payee,
            c.cotisation_mensuelle,
            c.cotisation_speciale,
            c.penalite,
            c.total,
            p.present
        FROM cotisations c
        INNER JOIN membres m ON c.membre_id = m.id
        LEFT JOIN presences p ON p.reunion_id = c.reunion_id AND p.membre_id = c.membre_id
        WHERE c.reunion_id = ?
        ORDER BY m.nom, m.prenom
    `;
    const [rows] = await db.query(query, [reunionId]);
    return rows;
  }

  // Récupérer une cotisation spécifique
  static async getById(id) {
    const [rows] = await db.query("SELECT * FROM cotisations WHERE id = ?", [
      id,
    ]);
    return rows[0];
  }

  // Mettre à jour les cotisations d'un membre pour une réunion
  static async update(id, cotisationMensuelle, cotisationSpeciale, penalite) {
    const [result] = await db.query(
      "UPDATE cotisations SET cotisation_mensuelle = ?, cotisation_speciale = ?, penalite = ? WHERE id = ?",
      [cotisationMensuelle, cotisationSpeciale, penalite, id]
    );
    return result.affectedRows > 0;
  }

  // Ajouter une pénalité à un membre
  static async addPenalite(reunionId, membreId, montantPenalite) {
    const [result] = await db.query(
      "UPDATE cotisations SET penalite = penalite + ? WHERE reunion_id = ? AND membre_id = ?",
      [montantPenalite, reunionId, membreId]
    );
    return result.affectedRows > 0;
  }

  // Calculer le total d'une réunion
  static async getTotalReunion(reunionId) {
    const query = `
            SELECT 
                SUM(cotisation_mensuelle) as total_mensuelle,
                SUM(cotisation_speciale) as total_speciale,
                SUM(penalite) as total_penalite,
                SUM(total) as total_general
            FROM cotisations
            WHERE reunion_id = ?
        `;
    const [rows] = await db.query(query, [reunionId]);
    return rows[0];
  }

  // Mettre à jour la présence d'un membre
  static async updatePresence(reunionId, membreId, present) {
    const [result] = await db.query(
      "UPDATE presences SET present = ? WHERE reunion_id = ? AND membre_id = ?",
      [present, reunionId, membreId]
    );
    return result.affectedRows > 0;
  }

  // Récupérer la configuration par défaut
  static async getConfiguration() {
    const [rows] = await db.query(
      "SELECT cle, valeur, description FROM configuration"
    );
    const config = {};
    rows.forEach((row) => {
      config[row.cle] = row.valeur;
    });
    return config;
  }

  // Mettre à jour la configuration
  static async updateConfiguration(cle, valeur) {
    const [result] = await db.query(
      "UPDATE configuration SET valeur = ? WHERE cle = ?",
      [valeur, cle]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Cotisation;
