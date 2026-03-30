const mysql = require("mysql2");
const config = require("../config");

// Créer le pool de connexions
const pool = mysql.createPool(config.db);

// Obtenir une connexion avec promesses
const promisePool = pool.promise();

// Test de connexion
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Erreur de connexion à MySQL:", err.message);
    return;
  }
  console.log("✅ Connexion à MySQL réussie !");
  connection.release();
});

module.exports = promisePool;
