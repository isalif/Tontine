const express = require("express");
const router = express.Router();
const reunionController = require("../controllers/reunionController");

// GET /api/reunions
router.get("/", reunionController.getAll);

// GET /api/reunions/:id
router.get("/:id", reunionController.getById);

// POST /api/reunions
router.post("/", reunionController.create);

// PUT /api/reunions/:id   ← Cette route est obligatoire pour la modification
router.put("/:id", reunionController.update);

// PUT /api/reunions/:id/cloture
router.put("/:id/cloture", reunionController.cloture);

// DELETE /api/reunions/:id
router.delete("/:id", reunionController.delete);

module.exports = router;
