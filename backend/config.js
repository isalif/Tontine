module.exports = {
  db: {
    host: "localhost",
    user: "root",
    password: "", // Mettez votre mot de passe MySQL ici
    database: "tontine_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  },
  port: 3000, // Port du serveur Express
};
