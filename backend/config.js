module.exports = {
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "tontine_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  },
  port: Number(process.env.PORT) || 3000, // Port du serveur Express
  sessionSecret: process.env.SESSION_SECRET || "tontine-dev-secret-change-me",
};
