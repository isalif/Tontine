const express = require("express");
const router = express.Router();
const membreController = require("../controllers/membreController");

// GET /api/membres - Récupérer tous les membres
router.get("/", membreController.getAll);

// GET /api/membres/count - Compter les membres
router.get("/count", membreController.count);

// GET /api/membres/:id - Récupérer un membre par ID
router.get("/:id", membreController.getById);

// POST /api/membres - Créer un nouveau membre
router.post("/", membreController.create);

// PUT /api/membres/:id - Modifier un membre
router.put("/:id", membreController.update);

// PATCH /api/membres/:id/toggle-actif - Basculer actif/inactif
router.patch("/:id/toggle-actif", membreController.toggleActif);

// DELETE /api/membres/:id - Supprimer un membre
router.delete("/:id", membreController.delete);

module.exports = router;
