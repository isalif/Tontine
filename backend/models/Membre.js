const db = require("./db");

class Membre {
  // Récupérer tous les membres actifs
  static async getAll() {
    const [rows] = await db.query(
      "SELECT * FROM membres WHERE actif = TRUE ORDER BY nom, prenom"
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

  // Ajouter un nouveau membre
  static async create(
    nom,
    prenom,
    numero,
    abonneAnnuel = false,
    cotisationSpecialePayee = false
  ) {
    const dateAjout = new Date().toISOString().split("T")[0]; // Format YYYY-MM-DD
    const [result] = await db.query(
      "INSERT INTO membres (nom, prenom, numero, date_ajout, actif, abonne_annuel, cotisation_speciale_payee) VALUES (?, ?, ?, ?, TRUE, ?, ?)",
      [
        nom.trim(),
        prenom.trim(),
        numero.trim(),
        dateAjout,
        abonneAnnuel,
        cotisationSpecialePayee,
      ]
    );
    return result.insertId;
  }

  // Modifier un membre
  static async update(
    id,
    nom,
    prenom,
    numero,
    abonneAnnuel = false,
    cotisationSpecialePayee = false
  ) {
    const [result] = await db.query(
      "UPDATE membres SET nom = ?, prenom = ?, numero = ?, abonne_annuel = ?, cotisation_speciale_payee = ? WHERE id = ?",
      [
        nom.trim(),
        prenom.trim(),
        numero.trim(),
        abonneAnnuel,
        cotisationSpecialePayee,
        id,
      ]
    );
    return result.affectedRows > 0;
  }

  // Supprimer un membre (HARD DELETE - suppression définitive avec vérification)
  static async delete(id) {
    try {
      // Vérifier si le membre a des cotisations
      const [cotisations] = await db.query(
        "SELECT COUNT(*) as total FROM cotisations WHERE membre_id = ?",
        [id]
      );

      if (cotisations[0].total > 0) {
        // Le membre a des cotisations → On ne peut pas le supprimer
        throw new Error(
          "Impossible de supprimer ce membre car il a participé à des réunions. Supprimez d'abord les réunions concernées."
        );
      }

      // Aucune cotisation → On peut supprimer définitivement
      const [result] = await db.query("DELETE FROM membres WHERE id = ?", [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Compter le nombre de membres actifs
  static async count() {
    const [rows] = await db.query(
      "SELECT COUNT(*) as total FROM membres WHERE actif = TRUE"
    );
    return rows[0].total;
  }
}

module.exports = Membre;
