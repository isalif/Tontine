const express = require("express");
const router = express.Router();
const projetController = require("../controllers/projetController");

// Routes principales
router.get("/", projetController.getAll);
router.get("/:id", projetController.getById);
router.post("/", projetController.create);
router.put("/:id", projetController.update);
router.delete("/:id", projetController.delete);

// Route Configuration
router.put("/:id/config", projetController.updateConfig);

// Cotisations affectées
router.get("/:id/cotisations", projetController.getCotisations);
router.post("/:id/cotisations", projetController.addCotisation);
router.delete(
  "/:id/cotisations/:cotisationId",
  projetController.removeCotisation,
);

module.exports = router;
