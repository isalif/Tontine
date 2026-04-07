const CotisationSpeciale = require("../models/CotisationSpeciale");

const validateCotisation = (montant, datePaiement) => {
  const errors = [];
  if (!montant || montant <= 0) errors.push("Le montant doit être positif");
  if (!datePaiement) errors.push("La date de paiement est obligatoire");
  return errors;
};

const cotisationSpecialeController = {
  async getAll(req, res) {
    try {
      const data = await CotisationSpeciale.getAll();
      res.json({ success: true, data });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  async getById(req, res) {
    try {
      const data = await CotisationSpeciale.getById(req.params.id);
      if (!data)
        return res
          .status(404)
          .json({ success: false, message: "Cotisation introuvable" });
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  async create(req, res) {
    try {
      const { membre_id, montant, date_paiement, statut, note, projet_id } =
        req.body;

      const errors = validateCotisation(montant, date_paiement);
      if (errors.length > 0) {
        return res
          .status(400)
          .json({ success: false, message: "Erreurs de validation", errors });
      }

      const id = await CotisationSpeciale.create(
        membre_id,
        montant,
        date_paiement,
        statut,
        note,
        projet_id,
      );
      const newItem = await CotisationSpeciale.getById(id);

      res.status(201).json({
        success: true,
        message: "Cotisation spéciale ajoutée avec succès",
        data: newItem,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { membre_id, montant, date_paiement, statut, note, projet_id } =
        req.body;

      const exists = await CotisationSpeciale.getById(id);
      if (!exists)
        return res
          .status(404)
          .json({ success: false, message: "Cotisation introuvable" });

      const success = await CotisationSpeciale.update(
        id,
        membre_id,
        montant,
        date_paiement,
        statut,
        note,
        projet_id,
      );
      if (success) {
        const updated = await CotisationSpeciale.getById(id);
        res.json({
          success: true,
          message: "Cotisation modifiée avec succès",
          data: updated,
        });
      } else {
        res
          .status(400)
          .json({ success: false, message: "Aucune modification effectuée" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  async delete(req, res) {
    try {
      const success = await CotisationSpeciale.delete(req.params.id);
      if (success) {
        res.json({
          success: true,
          message: "Cotisation supprimée avec succès",
        });
      } else {
        res
          .status(404)
          .json({ success: false, message: "Cotisation introuvable" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },
};

module.exports = cotisationSpecialeController;
