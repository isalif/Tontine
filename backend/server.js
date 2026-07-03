const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const config = require("./config");

// Importer les routes
const authRoutes = require("./routes/authRoutes");
const membreRoutes = require("./routes/membreRoutes");
const reunionRoutes = require("./routes/reunionRoutes");
const cotisationRoutes = require("./routes/cotisationRoutes");
const projetRoutes = require("./routes/projetRoutes");
const cotisationSpecialeRoutes = require("./routes/cotisations-speciales");

// Initialiser l'application Express
const app = express();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 jours
    },
  }),
);

// Chemins accessibles sans être connecté : assets statiques, pages d'auth,
// et les routes API d'authentification elles-mêmes.
function isPublicPath(requestPath) {
  return (
    requestPath.startsWith("/css/") ||
    requestPath.startsWith("/js/") ||
    requestPath.startsWith("/uploads/") ||
    requestPath === "/login" ||
    requestPath === "/login.html" ||
    requestPath === "/register" ||
    requestPath === "/register.html" ||
    requestPath.startsWith("/api/auth/")
  );
}

// Garde globale : protège aussi bien les pages HTML (servies en statique ou
// via les routes propres ci-dessous) que les routes API.
app.use((req, res, next) => {
  if (isPublicPath(req.path)) return next();
  if (req.session && req.session.userId) return next();

  if (req.path.startsWith("/api/")) {
    return res.status(401).json({ success: false, message: "Non authentifié" });
  }
  return res.redirect("/login");
});

// Fichiers statiques du frontend (CSS, JS, images) + photos de profil uploadées
app.use(express.static(path.join(__dirname, "..", "frontend")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes de l'API
app.use("/api/auth", authRoutes);
app.use("/api/membres", membreRoutes);
app.use("/api/reunions", reunionRoutes);
app.use("/api/cotisations", cotisationRoutes);
app.use("/api/projets", projetRoutes);
app.use("/api/cotisations-speciales", cotisationSpecialeRoutes);

// Routes propres pour les pages HTML (sans .html)
const pages = [
  { route: "/", file: "index.html" },
  { route: "/reunions", file: "reunions.html" },
  { route: "/cotisations", file: "cotisations.html" },
  { route: "/membres", file: "membres.html" },
  { route: "/projets", file: "projets.html" },
  { route: "/cotisations-special", file: "cotisations-special.html" },
  { route: "/profile", file: "profile.html" },
  { route: "/login", file: "login.html" },
  { route: "/register", file: "register.html" },
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
