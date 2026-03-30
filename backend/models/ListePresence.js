const db = require("./db");

class ListePresence {
  // Récupérer toutes les listes
  static async getAll() {
    const query = `
            SELECT 
                lp.id,
                lp.date_liste,
                lp.titre,
                lp.created_at,
                COUNT(lpm.membre_id) as nombre_membres
            FROM listes_presence lp
            LEFT JOIN listes_presence_membres lpm ON lp.id = lpm.liste_id
            GROUP BY lp.id
            ORDER BY lp.date_liste DESC
        `;
    const [rows] = await db.query(query);
    return rows;
  }

  // Récupérer une liste par ID
  static async getById(id) {
    const [rows] = await db.query(
      "SELECT * FROM listes_presence WHERE id = ?",
      [id]
    );
    return rows[0];
  }

  // Récupérer les membres d'une liste
  static async getMembres(listeId) {
    const query = `
            SELECT 
                m.id,
                m.nom,
                m.prenom,
                m.numero
            FROM listes_presence_membres lpm
            INNER JOIN membres m ON lpm.membre_id = m.id
            WHERE lpm.liste_id = ?
            ORDER BY m.nom, m.prenom
        `;
    const [rows] = await db.query(query, [listeId]);
    return rows;
  }

  // Créer une nouvelle liste
  static async create(dateListe, titre, membresIds) {
    // Insérer la liste
    const [result] = await db.query(
      "INSERT INTO listes_presence (date_liste, titre) VALUES (?, ?)",
      [dateListe, titre]
    );

    const listeId = result.insertId;

    // Insérer les membres
    if (membresIds && membresIds.length > 0) {
      const values = membresIds.map((membreId) => [listeId, membreId]);
      await db.query(
        "INSERT INTO listes_presence_membres (liste_id, membre_id) VALUES ?",
        [values]
      );
    }

    return listeId;
  }

  // Supprimer une liste
  static async delete(id) {
    const [result] = await db.query(
      "DELETE FROM listes_presence WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = ListePresence;
