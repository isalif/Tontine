const db = require("./db");

class Reunion {
  // Récupérer toutes les réunions avec le nom du projet lié
  static async getAll() {
    const [rows] = await db.query(`
      SELECT r.*, p.nom AS projet_nom 
      FROM reunions r 
      LEFT JOIN projets p ON p.id = r.projet_id 
      ORDER BY r.date_reunion DESC
    `);
    return rows;
  }

  // Récupérer une réunion par ID
  static async getById(id) {
    const [rows] = await db.query(
      `
      SELECT r.*, p.nom AS projet_nom 
      FROM reunions r 
      LEFT JOIN projets p ON p.id = r.projet_id 
      WHERE r.id = ?
    `,
      [id],
    );
    return rows[0];
  }

  // Vérifier si une date existe déjà
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
  static async create(titre, dateReunion, projetId) {
    const [result] = await db.query(
      'INSERT INTO reunions (titre, date_reunion, projet_id, statut) VALUES (?, ?, ?, "en_cours")',
      [titre ? titre.trim() : null, dateReunion, projetId || null],
    );
    return result.insertId;
  }

  // Modifier une réunion
  static async update(id, titre, dateReunion, projetId) {
    const [result] = await db.query(
      `UPDATE reunions 
       SET titre = ?, date_reunion = ?, projet_id = ? 
       WHERE id = ?`,
      [titre ? titre.trim() : null, dateReunion, projetId || null, id],
    );
    return result.affectedRows > 0;
  }

  // Créer automatiquement les présences
  static async createPresences(reunionId) {
    const query = `
      INSERT INTO presences (reunion_id, membre_id, present)
      SELECT ?, id, TRUE FROM membres WHERE actif = TRUE
    `;
    await db.query(query, [reunionId]);
  }

  // Créer automatiquement les cotisations
  static async createCotisations(reunionId, cotisationMensuelleParam) {
    let montantMensuel = cotisationMensuelleParam != null
      ? parseFloat(cotisationMensuelleParam)
      : null;

    if (montantMensuel == null || isNaN(montantMensuel)) {
      const [config] = await db.query(
        'SELECT cle, valeur FROM configuration WHERE cle IN ("cotisation_mensuelle_defaut", "cotisation_speciale_defaut")',
      );
      montantMensuel = parseFloat(
        config.find((c) => c.cle === "cotisation_mensuelle_defaut")?.valeur,
      ) || 0;
    }

    const [configSpeciale] = await db.query(
      'SELECT valeur FROM configuration WHERE cle = "cotisation_speciale_defaut"',
    );
    const cotisationSpeciale =
      parseFloat(configSpeciale[0]?.valeur) || 0;

    const query = `
      INSERT INTO cotisations (reunion_id, membre_id, cotisation_mensuelle, cotisation_speciale, penalite)
      SELECT ?, id, ?, ?, 0 FROM membres WHERE actif = TRUE
    `;
    await db.query(query, [reunionId, montantMensuel, cotisationSpeciale]);
  }

  // Clôturer une réunion
  static async cloture(id) {
    const [result] = await db.query(
      'UPDATE reunions SET statut = "cloturee" WHERE id = ?',
      [id],
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
