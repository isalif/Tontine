const Projet = require("../models/Projet");

// Validation des données
const validateProjet = (nom, description, montantCible) => {
  const errors = [];

  if (!nom || nom.trim().length < 2) {
    errors.push("Le nom doit contenir au moins 2 caractères");
  }

  if (!description || description.trim().length < 5) {
    errors.push("La description doit contenir au moins 5 caractères");
  }

  if (!montantCible || isNaN(montantCible) || Number(montantCible) <= 0) {
    errors.push("Le montant cible doit être un nombre positif");
  }

  return errors;
};

const projetController = {
  // Récupérer tous les projets
  async getAll(req, res) {
    try {
      const projets = await Projet.getAll();
      res.json({ success: true, data: projets });
    } catch (error) {
      console.error("Erreur getAll projets:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  // Récupérer un projet par ID
  async getById(req, res) {
    try {
      const projet = await Projet.getById(req.params.id);
      if (!projet) {
        return res
          .status(404)
          .json({ success: false, message: "Projet introuvable" });
      }
      res.json({ success: true, data: projet });
    } catch (error) {
      console.error("Erreur getById projet:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  // Créer un projet
  async create(req, res) {
    try {
      const { nom, description, montantCible, dateDebut, dateFin, statut } =
        req.body;

      const errors = validateProjet(nom, description, montantCible);
      if (errors.length > 0) {
        return res
          .status(400)
          .json({ success: false, message: "Erreurs de validation", errors });
      }

      const projetId = await Projet.create(
        nom,
        description,
        montantCible,
        dateDebut || null,
        dateFin || null,
        statut || "en_cours",
      );
      const newProjet = await Projet.getById(projetId);

      res.status(201).json({
        success: true,
        message: "Projet créé avec succès",
        data: newProjet,
      });
    } catch (error) {
      console.error("Erreur create projet:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  // Modifier un projet
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nom, description, montantCible, dateDebut, dateFin, statut } =
        req.body;

      const projetExists = await Projet.getById(id);
      if (!projetExists) {
        return res
          .status(404)
          .json({ success: false, message: "Projet introuvable" });
      }

      const errors = validateProjet(nom, description, montantCible);
      if (errors.length > 0) {
        return res
          .status(400)
          .json({ success: false, message: "Erreurs de validation", errors });
      }

      await Projet.update(
        id,
        nom,
        description,
        montantCible,
        dateDebut || null,
        dateFin || null,
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

  // Supprimer un projet
  async delete(req, res) {
    try {
      const { id } = req.params;

      const projetExists = await Projet.getById(id);
      if (!projetExists) {
        return res
          .status(404)
          .json({ success: false, message: "Projet introuvable" });
      }

      await Projet.delete(id);
      res.json({ success: true, message: "Projet supprimé avec succès" });
    } catch (error) {
      console.error("Erreur delete projet:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  // Récupérer les cotisations d'un projet
  async getCotisations(req, res) {
    try {
      const { id } = req.params;

      const projetExists = await Projet.getById(id);
      if (!projetExists) {
        return res
          .status(404)
          .json({ success: false, message: "Projet introuvable" });
      }

      const cotisations = await Projet.getCotisations(id);
      res.json({ success: true, data: cotisations });
    } catch (error) {
      console.error("Erreur getCotisations projet:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  // Affecter une cotisation à un projet
  async addCotisation(req, res) {
    try {
      const { id } = req.params;
      const { cotisationId } = req.body;

      if (!cotisationId) {
        return res
          .status(400)
          .json({ success: false, message: "cotisationId est requis" });
      }

      const projetExists = await Projet.getById(id);
      if (!projetExists) {
        return res
          .status(404)
          .json({ success: false, message: "Projet introuvable" });
      }

      await Projet.addCotisation(id, cotisationId);
      res
        .status(201)
        .json({ success: true, message: "Cotisation affectée avec succès" });
    } catch (error) {
      console.error("Erreur addCotisation projet:", error);
      res
        .status(400)
        .json({ success: false, message: error.message || "Erreur serveur" });
    }
  },

  // Retirer une cotisation d'un projet
  async removeCotisation(req, res) {
    try {
      const { id, cotisationId } = req.params;

      const removed = await Projet.removeCotisation(id, cotisationId);
      if (!removed) {
        return res
          .status(404)
          .json({ success: false, message: "Lien introuvable" });
      }

      res.json({ success: true, message: "Cotisation retirée avec succès" });
    } catch (error) {
      console.error("Erreur removeCotisation projet:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },
};

module.exports = projetController;
