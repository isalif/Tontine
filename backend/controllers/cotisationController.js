const Cotisation = require("../models/Cotisation");

const cotisationController = {
  // Récupérer les cotisations d'une réunion
  async getByReunion(req, res) {
    try {
      const { reunionId } = req.params;
      const cotisations = await Cotisation.getByReunion(reunionId);
      res.json({ success: true, data: cotisations });
    } catch (error) {
      console.error("Erreur getByReunion cotisations:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  // Mettre à jour une cotisation
  async update(req, res) {
    try {
      const { id } = req.params;
      const { cotisation_mensuelle, cotisation_speciale, penalite } = req.body;

      // Validation des montants
      if (cotisation_mensuelle < 0 || cotisation_speciale < 0 || penalite < 0) {
        return res.status(400).json({
          success: false,
          message: "Les montants ne peuvent pas être négatifs",
        });
      }

      const cotisation = await Cotisation.getById(id);
      if (!cotisation) {
        return res
          .status(404)
          .json({ success: false, message: "Cotisation introuvable" });
      }

      await Cotisation.update(
        id,
        cotisation_mensuelle,
        cotisation_speciale,
        penalite
      );
      const updatedCotisation = await Cotisation.getById(id);

      res.json({
        success: true,
        message: "Cotisation mise à jour avec succès",
        data: updatedCotisation,
      });
    } catch (error) {
      console.error("Erreur update cotisation:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  // Ajouter une pénalité
  async addPenalite(req, res) {
    try {
      const { reunionId, membreId } = req.params;
      const { montant } = req.body;

      if (!montant || montant <= 0) {
        return res.status(400).json({
          success: false,
          message: "Le montant de la pénalité doit être supérieur à 0",
        });
      }

      await Cotisation.addPenalite(reunionId, membreId, montant);

      res.json({
        success: true,
        message: "Pénalité ajoutée avec succès",
      });
    } catch (error) {
      console.error("Erreur addPenalite:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  // Calculer le total d'une réunion
  async getTotalReunion(req, res) {
    try {
      const { reunionId } = req.params;
      const totaux = await Cotisation.getTotalReunion(reunionId);
      res.json({ success: true, data: totaux });
    } catch (error) {
      console.error("Erreur getTotalReunion:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  // Mettre à jour la présence
  async updatePresence(req, res) {
    try {
      const { reunionId, membreId } = req.params;
      const { present } = req.body;

      if (typeof present !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "La valeur de présence doit être true ou false",
        });
      }

      await Cotisation.updatePresence(reunionId, membreId, present);

      res.json({
        success: true,
        message: "Présence mise à jour avec succès",
      });
    } catch (error) {
      console.error("Erreur updatePresence:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  // Récupérer la configuration
  async getConfiguration(req, res) {
    try {
      const config = await Cotisation.getConfiguration();
      res.json({ success: true, data: config });
    } catch (error) {
      console.error("Erreur getConfiguration:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  // Mettre à jour la configuration
  async updateConfiguration(req, res) {
    try {
      const { cle, valeur } = req.body;

      if (!cle || valeur === undefined) {
        return res.status(400).json({
          success: false,
          message: "Clé et valeur sont obligatoires",
        });
      }

      // Validation des valeurs numériques
      if (isNaN(valeur) || parseFloat(valeur) < 0) {
        return res.status(400).json({
          success: false,
          message: "La valeur doit être un nombre positif",
        });
      }

      await Cotisation.updateConfiguration(cle, valeur);

      res.json({
        success: true,
        message: "Configuration mise à jour avec succès",
      });
    } catch (error) {
      console.error("Erreur updateConfiguration:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },
};

module.exports = cotisationController;
