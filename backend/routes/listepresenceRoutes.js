const express = require("express");
const router = express.Router();
const listePresenceController = require("../controllers/listepresenceController");

// GET /api/listes-presence - Récupérer toutes les listes
router.get("/", listePresenceController.getAll);

// GET /api/listes-presence/:id - Récupérer une liste par ID
router.get("/:id", listePresenceController.getById);

// POST /api/listes-presence - Créer une nouvelle liste
router.post("/", listePresenceController.create);

// DELETE /api/listes-presence/:id - Supprimer une liste
router.delete("/:id", listePresenceController.delete);

module.exports = router;
