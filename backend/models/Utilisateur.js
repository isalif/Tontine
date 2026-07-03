const db = require("./db");

class Utilisateur {
  static async findByEmail(email) {
    const [rows] = await db.query(
      "SELECT * FROM utilisateurs WHERE email = ?",
      [email],
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.query(
      "SELECT id, nom, prenom, email, photo, created_at FROM utilisateurs WHERE id = ?",
      [id],
    );
    return rows[0];
  }

  static async create(nom, prenom, email, passwordHash) {
    const [result] = await db.query(
      `INSERT INTO utilisateurs (nom, prenom, email, password_hash)
       VALUES (?, ?, ?, ?)`,
      [nom.trim(), prenom.trim(), email.trim().toLowerCase(), passwordHash],
    );
    return result.insertId;
  }

  static async updateProfile(id, nom, prenom, email) {
    const [result] = await db.query(
      `UPDATE utilisateurs SET nom = ?, prenom = ?, email = ? WHERE id = ?`,
      [nom.trim(), prenom.trim(), email.trim().toLowerCase(), id],
    );
    return result.affectedRows > 0;
  }

  static async updatePassword(id, passwordHash) {
    const [result] = await db.query(
      "UPDATE utilisateurs SET password_hash = ? WHERE id = ?",
      [passwordHash, id],
    );
    return result.affectedRows > 0;
  }

  static async updatePhoto(id, filename) {
    const [result] = await db.query(
      "UPDATE utilisateurs SET photo = ? WHERE id = ?",
      [filename, id],
    );
    return result.affectedRows > 0;
  }
}

module.exports = Utilisateur;
