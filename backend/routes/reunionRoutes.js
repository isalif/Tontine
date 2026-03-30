const express = require("express");
const router = express.Router();
const reunionController = require("../controllers/reunionController");

// GET /api/reunions - Récupérer toutes les réunions
router.get("/", reunionController.getAll);

// GET /api/reunions/:id - Récupérer une réunion par ID
router.get("/:id", reunionController.getById);

// POST /api/reunions - Créer une nouvelle réunion
router.post("/", reunionController.create);

// PUT /api/reunions/:id/cloture - Clôturer une réunion
router.put("/:id/cloture", reunionController.cloture);

// DELETE /api/reunions/:id - Supprimer une réunion
router.delete("/:id", reunionController.delete);

module.exports = router;
