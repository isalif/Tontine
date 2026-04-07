const Projet = require("../models/Projet"); // ✅ Seul import nécessaire

const validateProjet = (nom, montantCible) => {
  const errors = [];
  if (!nom || nom.trim().length < 2)
    errors.push("Le nom doit contenir au moins 2 caractères");
  if (!montantCible || isNaN(montantCible) || Number(montantCible) <= 0)
    errors.push("Le montant cible doit être un nombre positif");
  return errors;
};

const projetController = {
  async getAll(req, res) {
    try {
      const projets = await Projet.getAll();
      res.json({ success: true, data: projets });
    } catch (error) {
      console.error("Erreur getAll projets:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  async getById(req, res) {
    try {
      const projet = await Projet.getById(req.params.id);
      if (!projet)
        return res
          .status(404)
          .json({ success: false, message: "Projet introuvable" });
      res.json({ success: true, data: projet });
    } catch (error) {
      console.error("Erreur getById projet:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  async create(req, res) {
    try {
      const { nom, description, montantCible, dateDebut, dateFin, statut } =
        req.body;

      const errors = validateProjet(nom, montantCible);
      if (errors.length > 0)
        return res
          .status(400)
          .json({ success: false, message: "Erreurs de validation", errors });

      const projetId = await Projet.create(
        nom,
        description,
        montantCible,
        dateDebut,
        dateFin,
        statut || "en_cours",
      );
      const newProjet = await Projet.getById(projetId);

      res
        .status(201)
        .json({
          success: true,
          message: "Projet créé avec succès",
          data: newProjet,
        });
    } catch (error) {
      console.error("Erreur create projet:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { nom, description, montantCible, dateDebut, dateFin, statut } =
        req.body;

      const projet = await Projet.getById(id);
      if (!projet)
        return res
          .status(404)
          .json({ success: false, message: "Projet introuvable" });

      const errors = validateProjet(nom, montantCible);
      if (errors.length > 0)
        return res
          .status(400)
          .json({ success: false, message: "Erreurs de validation", errors });

      await Projet.update(
        id,
        nom,
        description,
        montantCible,
        dateDebut,
        dateFin,
        statut || "en_cours",
      );

      const updatedProjet = await Projet.getById(id);
      res.json({
        success: true,
        message: "Projet modifié avec succès",
        data: updatedProjet,
      });
    } catch (error) {
      console.error("Erreur update projet:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  async delete(req, res) {
    try {
      const projet = await Projet.getById(req.params.id);
      if (!projet)
        return res
          .status(404)
          .json({ success: false, message: "Projet introuvable" });

      await Projet.delete(req.params.id);
      res.json({ success: true, message: "Projet supprimé avec succès" });
    } catch (error) {
      console.error("Erreur delete projet:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  // ✅ updateConfig passe maintenant par le modèle, plus de db.query() ici
  async updateConfig(req, res) {
    try {
      const { id } = req.params;
      const { montant_par_reunion, montant_annuel, penalite_retard } = req.body;

      if (montant_par_reunion < 0 || montant_annuel < 0 || penalite_retard < 0)
        return res
          .status(400)
          .json({
            success: false,
            message: "Les montants ne peuvent pas être négatifs",
          });

      const projet = await Projet.getById(id);
      if (!projet)
        return res
          .status(404)
          .json({ success: false, message: "Projet introuvable" });

      await Projet.updateConfig(
        id,
        montant_par_reunion,
        montant_annuel,
        penalite_retard,
      );

      res.json({
        success: true,
        message: "Configuration mise à jour avec succès",
      });
    } catch (error) {
      console.error("Erreur updateConfig projet:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  async getCotisations(req, res) {
    try {
      const cotisations = await Projet.getCotisations(req.params.id);
      res.json({ success: true, data: cotisations });
    } catch (error) {
      console.error("Erreur getCotisations projet:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  async addCotisation(req, res) {
    try {
      const { cotisationId } = req.body;
      if (!cotisationId)
        return res
          .status(400)
          .json({
            success: false,
            message: "L'identifiant de la cotisation est obligatoire",
          });

      await Projet.addCotisation(req.params.id, cotisationId);
      res
        .status(201)
        .json({ success: true, message: "Cotisation affectée avec succès" });
    } catch (error) {
      console.error("Erreur addCotisation projet:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  async removeCotisation(req, res) {
    try {
      const { id, cotisationId } = req.params;
      const removed = await Projet.removeCotisation(id, cotisationId);
      if (!removed)
        return res
          .status(404)
          .json({ success: false, message: "Lien introuvable" });

      res.json({ success: true, message: "Cotisation retirée avec succès" });
    } catch (error) {
      console.error("Erreur removeCotisation projet:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },
};

module.exports = projetController;
