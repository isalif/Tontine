const Reunion = require("../models/Reunion");

const reunionController = {
  async getAll(req, res) {
    try {
      const reunions = await Reunion.getAll();
      res.json({ success: true, data: reunions });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

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
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  async create(req, res) {
    try {
      const { titre, date_reunion, projet_id, cotisation_mensuelle } = req.body;

      if (!date_reunion) {
        return res
          .status(400)
          .json({
            success: false,
            message: "La date de réunion est obligatoire",
          });
      }

      const dateExists = await Reunion.checkDateExists(date_reunion);
      if (dateExists) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Une réunion existe déjà à cette date",
          });
      }

      const reunionId = await Reunion.create(titre, date_reunion, projet_id);

      await Reunion.createPresences(reunionId);
      await Reunion.createCotisations(reunionId, cotisation_mensuelle);

      const newReunion = await Reunion.getById(reunionId);

      res.status(201).json({
        success: true,
        message: "Réunion créée avec succès",
        data: newReunion,
      });
    } catch (error) {
      console.error("Erreur create réunion:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { titre, date_reunion, projet_id } = req.body;

      if (!date_reunion) {
        return res
          .status(400)
          .json({
            success: false,
            message: "La date de réunion est obligatoire",
          });
      }

      const reunionExists = await Reunion.getById(id);
      if (!reunionExists) {
        return res
          .status(404)
          .json({ success: false, message: "Réunion introuvable" });
      }

      if (date_reunion !== reunionExists.date_reunion) {
        const dateExists = await Reunion.checkDateExists(date_reunion, id);
        if (dateExists) {
          return res
            .status(400)
            .json({
              success: false,
              message: "Une réunion existe déjà à cette date",
            });
        }
      }

      const success = await Reunion.update(id, titre, date_reunion, projet_id);
      if (success) {
        const updated = await Reunion.getById(id);
        res.json({
          success: true,
          message: "Réunion modifiée avec succès",
          data: updated,
        });
      } else {
        res
          .status(400)
          .json({ success: false, message: "Aucune modification effectuée" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  async cloture(req, res) {
    try {
      const success = await Reunion.cloture(req.params.id);
      if (success) {
        res.json({ success: true, message: "Réunion clôturée avec succès" });
      } else {
        res
          .status(404)
          .json({ success: false, message: "Réunion introuvable" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  async delete(req, res) {
    try {
      const success = await Reunion.delete(req.params.id);
      if (success) {
        res.json({ success: true, message: "Réunion supprimée avec succès" });
      } else {
        res
          .status(404)
          .json({ success: false, message: "Réunion introuvable" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },
};

module.exports = reunionController;
