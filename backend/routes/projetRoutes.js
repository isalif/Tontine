const express = require("express");
const router = express.Router();
const projetController = require("../controllers/projetController");

// GET /api/projets - Tous les projets
router.get("/", projetController.getAll);

// GET /api/projets/:id - Un projet par ID
router.get("/:id", projetController.getById);

// POST /api/projets - Créer un projet
router.post("/", projetController.create);

// PUT /api/projets/:id - Modifier un projet
router.put("/:id", projetController.update);

// DELETE /api/projets/:id - Supprimer un projet
router.delete("/:id", projetController.delete);

// GET /api/projets/:id/cotisations - Cotisations affectées
router.get("/:id/cotisations", projetController.getCotisations);

// POST /api/projets/:id/cotisations - Affecter une cotisation
router.post("/:id/cotisations", projetController.addCotisation);

// DELETE /api/projets/:id/cotisations/:cotisationId - Retirer une cotisation
router.delete(
  "/:id/cotisations/:cotisationId",
  projetController.removeCotisation,
);

module.exports = router;
