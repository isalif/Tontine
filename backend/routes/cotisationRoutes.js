const express = require("express");
const router = express.Router();
const cotisationController = require("../controllers/cotisationController");

// GET /api/cotisations/reunion/:reunionId - Récupérer les cotisations d'une réunion
router.get("/reunion/:reunionId", cotisationController.getByReunion);

// GET /api/cotisations/reunion/:reunionId/total - Calculer le total d'une réunion
router.get("/reunion/:reunionId/total", cotisationController.getTotalReunion);

// PUT /api/cotisations/:id - Mettre à jour une cotisation
router.put("/:id", cotisationController.update);

// PUT /api/cotisations/penalite/:reunionId/:membreId - Ajouter une pénalité
router.put("/penalite/:reunionId/:membreId", cotisationController.addPenalite);

// PUT /api/cotisations/presence/:reunionId/:membreId - Mettre à jour la présence
router.put(
  "/presence/:reunionId/:membreId",
  cotisationController.updatePresence
);

// GET /api/cotisations/configuration - Récupérer la configuration
router.get("/configuration", cotisationController.getConfiguration);

// PUT /api/cotisations/configuration - Mettre à jour la configuration
router.put("/configuration", cotisationController.updateConfiguration);

module.exports = router;
