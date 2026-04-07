const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path"); // ✅ AJOUT
const config = require("./config");

// Importer les routes
const membreRoutes = require("./routes/membreRoutes");
const reunionRoutes = require("./routes/reunionRoutes");
const cotisationRoutes = require("./routes/cotisationRoutes");
const listepresenceRoutes = require("./routes/listepresenceRoutes");
const projetRoutes = require("./routes/projetRoutes");
const cotisationSpecialeRoutes = require("./routes/cotisations-speciales");

// Initialiser l'application Express
const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ AJOUT : Servir les fichiers statiques du frontend (CSS, JS, images)
app.use(express.static(path.join(__dirname, "..", "frontend")));

// Routes de l'API
app.use("/api/membres", membreRoutes);
app.use("/api/reunions", reunionRoutes);
app.use("/api/cotisations", cotisationRoutes);
app.use("/api/listes-presence", listepresenceRoutes);
app.use("/api/projets", projetRoutes);
app.use("/api/reunions", reunionRoutes);
app.use("/api/cotisations-speciales", cotisationSpecialeRoutes);

// ✅ AJOUT : Routes propres pour les pages HTML (sans .html)
const pages = [
  { route: "/", file: "index.html" },
  { route: "/reunions", file: "reunions.html" },
  { route: "/cotisations", file: "cotisations.html" },
  { route: "/membres", file: "membres.html" },
  { route: "/listes-presence", file: "listes-presence.html" },
  { route: "/rapports", file: "rapports.html" },
  { route: "/cotisations-special", file: "cotisations-special.html" },
];

pages.forEach(({ route, file }) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, "..", "frontend", file));
  });
});

// Route 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route non trouvée",
  });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error("Erreur globale:", err);
  res.status(500).json({
    success: false,
    message: "Erreur interne du serveur",
    error: err.message,
  });
});

// Démarrer le serveur
const PORT = config.port || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`📚 Documentation API: http://localhost:${PORT}/`);
});

module.exports = app;
