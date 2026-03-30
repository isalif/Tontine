const Reunion = require("../models/Reunion");

// Validation de la date
const validateDate = (dateReunion) => {
  const errors = [];

  // Vérifier que la date n'est pas vide
  if (!dateReunion) {
    errors.push("La date de réunion est obligatoire");
    return errors;
  }

  // Vérifier le format de la date (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateReunion)) {
    errors.push("Format de date invalide (attendu: YYYY-MM-DD)");
    return errors;
  }

  // Vérifier que la date est valide
  const date = new Date(dateReunion);
  if (isNaN(date.getTime())) {
    errors.push("Date invalide");
  }

  return errors;
};

const reunionController = {
  // Récupérer toutes les réunions
  async getAll(req, res) {
    try {
      const reunions = await Reunion.getAll();
      res.json({ success: true, data: reunions });
    } catch (error) {
      console.error("Erreur getAll réunions:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  // Récupérer une réunion par ID
  async getById(req, res) {
    try {
      const reunion = await Reunion.getById(req.params.id);
      if (!reunion) {
        return res
          .status(404)
          .json({ success: false, message: "Réunion introuvable" });
      }
      res.json({ success: true, data: reunion });
    } catch (error) {
      console.error("Erreur getById réunion:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  // Créer une nouvelle réunion
  async create(req, res) {
    try {
      const { date_reunion } = req.body;

      // Validation de la date
      const errors = validateDate(date_reunion);
      if (errors.length > 0) {
        return res
          .status(400)
          .json({ success: false, message: "Erreurs de validation", errors });
      }

      // Vérifier que la date n'existe pas déjà
      const dateExists = await Reunion.checkDateExists(date_reunion);
      if (dateExists) {
        return res.status(400).json({
          success: false,
          message: "Une réunion existe déjà pour cette date",
        });
      }

      // Créer la réunion
      const reunionId = await Reunion.create(date_reunion);

      // Créer automatiquement les présences pour tous les membres actifs
      await Reunion.createPresences(reunionId);

      // Créer automatiquement les cotisations pour tous les membres
      await Reunion.createCotisations(reunionId);

      const newReunion = await Reunion.getById(reunionId);

      res.status(201).json({
        success: true,
        message:
          "Réunion créée avec succès. Les présences et cotisations ont été initialisées.",
        data: newReunion,
      });
    } catch (error) {
      console.error("Erreur create réunion:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  // Clôturer une réunion
  async cloture(req, res) {
    try {
      const { id } = req.params;

      // Vérifier si la réunion existe
      const reunion = await Reunion.getById(id);
      if (!reunion) {
        return res
          .status(404)
          .json({ success: false, message: "Réunion introuvable" });
      }

      // Vérifier si elle n'est pas déjà clôturée
      if (reunion.statut === "cloturee") {
        return res.status(400).json({
          success: false,
          message: "Cette réunion est déjà clôturée",
        });
      }

      await Reunion.cloture(id);
      const updatedReunion = await Reunion.getById(id);

      res.json({
        success: true,
        message: "Réunion clôturée avec succès",
        data: updatedReunion,
      });
    } catch (error) {
      console.error("Erreur clôture réunion:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  // Supprimer une réunion
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Vérifier si la réunion existe
      const reunion = await Reunion.getById(id);
      if (!reunion) {
        return res
          .status(404)
          .json({ success: false, message: "Réunion introuvable" });
      }

      await Reunion.delete(id);
      res.json({ success: true, message: "Réunion supprimée avec succès" });
    } catch (error) {
      console.error("Erreur delete réunion:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },
};

module.exports = reunionController;
