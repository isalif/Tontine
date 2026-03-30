const ListePresence = require("../models/ListePresence");

const listePresenceController = {
  // Récupérer toutes les listes
  async getAll(req, res) {
    try {
      const listes = await ListePresence.getAll();
      res.json({ success: true, data: listes });
    } catch (error) {
      console.error("Erreur getAll listes:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  // Récupérer une liste par ID avec ses membres
  async getById(req, res) {
    try {
      const { id } = req.params;
      const liste = await ListePresence.getById(id);

      if (!liste) {
        return res
          .status(404)
          .json({ success: false, message: "Liste introuvable" });
      }

      const membres = await ListePresence.getMembres(id);

      res.json({
        success: true,
        data: {
          ...liste,
          membres,
        },
      });
    } catch (error) {
      console.error("Erreur getById liste:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  // Créer une nouvelle liste
  async create(req, res) {
    try {
      const { date_liste, titre, membres_ids } = req.body;

      // Validation
      if (!date_liste) {
        return res.status(400).json({
          success: false,
          message: "La date est obligatoire",
        });
      }

      if (!membres_ids || membres_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Veuillez sélectionner au moins un membre",
        });
      }

      const listeId = await ListePresence.create(
        date_liste,
        titre || "Réunion",
        membres_ids
      );
      const newListe = await ListePresence.getById(listeId);

      res.status(201).json({
        success: true,
        message: "Liste de présence créée avec succès",
        data: newListe,
      });
    } catch (error) {
      console.error("Erreur create liste:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  // Supprimer une liste
  async delete(req, res) {
    try {
      const { id } = req.params;

      const listeExists = await ListePresence.getById(id);
      if (!listeExists) {
        return res
          .status(404)
          .json({ success: false, message: "Liste introuvable" });
      }

      await ListePresence.delete(id);
      res.json({ success: true, message: "Liste supprimée avec succès" });
    } catch (error) {
      console.error("Erreur delete liste:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },
};

module.exports = listePresenceController;
