const Membre = require("../models/Membre");

// Validation des données
const validateMembre = (nom, prenom, numero) => {
  const errors = [];

  // Validation du nom
  if (!nom || nom.trim().length < 2) {
    errors.push("Le nom doit contenir au moins 2 caractères");
  }

  // Validation du prénom
  if (!prenom || prenom.trim().length < 2) {
    errors.push("Le prénom doit contenir au moins 2 caractères");
  }

  // Validation du numéro
  if (!numero || numero.trim().length < 8) {
    errors.push("Le numéro doit contenir au moins 8 caractères");
  }

  // Vérifier que le numéro ne contient que des chiffres et éventuellement un +
  const numeroRegex = /^[\d+\s-]+$/;
  if (numero && !numeroRegex.test(numero.trim())) {
    errors.push(
      "Le numéro ne doit contenir que des chiffres, espaces, tirets ou +"
    );
  }

  return errors;
};

const membreController = {
  // Récupérer tous les membres
  async getAll(req, res) {
    try {
      const membres = await Membre.getAll();
      res.json({ success: true, data: membres });
    } catch (error) {
      console.error("Erreur getAll membres:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  // Récupérer un membre par ID
  async getById(req, res) {
    try {
      const membre = await Membre.getById(req.params.id);
      if (!membre) {
        return res
          .status(404)
          .json({ success: false, message: "Membre introuvable" });
      }
      res.json({ success: true, data: membre });
    } catch (error) {
      console.error("Erreur getById membre:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  // Créer un nouveau membre
  async create(req, res) {
    try {
      const { nom, prenom, numero } = req.body;

      // Validation des données
      const errors = validateMembre(nom, prenom, numero);
      if (errors.length > 0) {
        return res
          .status(400)
          .json({ success: false, message: "Erreurs de validation", errors });
      }

      // Vérifier l'unicité du numéro
      const numeroExists = await Membre.checkNumeroExists(numero.trim());
      if (numeroExists) {
        return res.status(400).json({
          success: false,
          message: "Ce numéro est déjà utilisé par un autre membre",
        });
      }

      // Créer le membre
      const abonneAnnuel = req.body.abonne_annuel || false;
      const cotisationSpecialePayee =
        req.body.cotisation_speciale_payee || false;
      const membreId = await Membre.create(
        nom,
        prenom,
        numero,
        abonneAnnuel,
        cotisationSpecialePayee
      );
      const newMembre = await Membre.getById(membreId);

      res.status(201).json({
        success: true,
        message: "Membre ajouté avec succès",
        data: newMembre,
      });
    } catch (error) {
      console.error("Erreur create membre:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  // Modifier un membre
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nom, prenom, numero } = req.body;

      // Vérifier si le membre existe
      const membreExists = await Membre.getById(id);
      if (!membreExists) {
        return res
          .status(404)
          .json({ success: false, message: "Membre introuvable" });
      }

      // Validation des données
      const errors = validateMembre(nom, prenom, numero);
      if (errors.length > 0) {
        return res
          .status(400)
          .json({ success: false, message: "Erreurs de validation", errors });
      }

      // Vérifier l'unicité du numéro (sauf pour le membre actuel)
      const numeroExists = await Membre.checkNumeroExists(numero.trim(), id);
      if (numeroExists) {
        return res.status(400).json({
          success: false,
          message: "Ce numéro est déjà utilisé par un autre membre",
        });
      }

      // Mettre à jour le membre
      const abonneAnnuel = req.body.abonne_annuel || false;
      const cotisationSpecialePayee =
        req.body.cotisation_speciale_payee || false;
      await Membre.update(
        id,
        nom,
        prenom,
        numero,
        abonneAnnuel,
        cotisationSpecialePayee
      );
      const updatedMembre = await Membre.getById(id);

      res.json({
        success: true,
        message: "Membre modifié avec succès",
        data: updatedMembre,
      });
    } catch (error) {
      console.error("Erreur update membre:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  // Supprimer un membre
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Vérifier si le membre existe
      const membreExists = await Membre.getById(id);
      if (!membreExists) {
        return res
          .status(404)
          .json({ success: false, message: "Membre introuvable" });
      }

      await Membre.delete(id);
      res.json({ success: true, message: "Membre supprimé avec succès" });
    } catch (error) {
      console.error("Erreur delete membre:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  // Compter les membres
  async count(req, res) {
    try {
      const total = await Membre.count();
      res.json({ success: true, data: { total } });
    } catch (error) {
      console.error("Erreur count membres:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },
};

module.exports = membreController;
