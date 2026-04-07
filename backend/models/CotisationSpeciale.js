const db = require("./db");

class CotisationSpeciale {
  // Récupérer toutes les cotisations spéciales avec nom du membre et du projet
  static async getAll() {
    const [rows] = await db.query(`
      SELECT 
        cs.*,
        CONCAT(m.nom, ' ', m.prenom) AS membre,
        p.nom AS projet_nom
      FROM cotisations_speciales cs
      JOIN membres m ON m.id = cs.membre_id
      LEFT JOIN projets p ON p.id = cs.projet_id
      ORDER BY cs.date_paiement DESC, cs.date_creation DESC
    `);
    return rows;
  }

  // Récupérer une cotisation par ID
  static async getById(id) {
    const [rows] = await db.query(
      `
      SELECT 
        cs.*,
        CONCAT(m.nom, ' ', m.prenom) AS membre,
        p.nom AS projet_nom
      FROM cotisations_speciales cs
      JOIN membres m ON m.id = cs.membre_id
      LEFT JOIN projets p ON p.id = cs.projet_id
      WHERE cs.id = ?
    `,
      [id],
    );
    return rows[0];
  }

  // Créer une nouvelle cotisation spéciale
  static async create(membreId, montant, datePaiement, statut, note, projetId) {
    const [result] = await db.query(
      `INSERT INTO cotisations_speciales 
       (membre_id, montant, date_paiement, statut, note, projet_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        membreId,
        montant,
        datePaiement,
        statut || "payee",
        note || null,
        projetId || null,
      ],
    );
    return result.insertId;
  }

  // Modifier une cotisation spéciale
  static async update(
    id,
    membreId,
    montant,
    datePaiement,
    statut,
    note,
    projetId,
  ) {
    const [result] = await db.query(
      `UPDATE cotisations_speciales 
       SET membre_id = ?, montant = ?, date_paiement = ?, statut = ?, note = ?, projet_id = ?
       WHERE id = ?`,
      [
        membreId,
        montant,
        datePaiement,
        statut,
        note || null,
        projetId || null,
        id,
      ],
    );
    return result.affectedRows > 0;
  }

  // Supprimer une cotisation spéciale
  static async delete(id) {
    const [result] = await db.query(
      "DELETE FROM cotisations_speciales WHERE id = ?",
      [id],
    );
    return result.affectedRows > 0;
  }
}

module.exports = CotisationSpeciale;
