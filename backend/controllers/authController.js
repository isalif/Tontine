const bcrypt = require("bcryptjs");
const Utilisateur = require("../models/Utilisateur");

const validateRegister = (nom, prenom, email, password) => {
  const errors = [];
  if (!nom || nom.trim().length < 2) errors.push("Le nom doit contenir au moins 2 caractères");
  if (!prenom || prenom.trim().length < 2) errors.push("Le prénom doit contenir au moins 2 caractères");
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push("Adresse e-mail invalide");
  if (!password || password.length < 6) errors.push("Le mot de passe doit contenir au moins 6 caractères");
  return errors;
};

const authController = {
  async register(req, res) {
    try {
      const { nom, prenom, email, password } = req.body;

      const errors = validateRegister(nom, prenom, email, password);
      if (errors.length > 0) {
        return res.status(400).json({ success: false, message: "Erreurs de validation", errors });
      }

      const existing = await Utilisateur.findByEmail(email.trim().toLowerCase());
      if (existing) {
        return res.status(400).json({ success: false, message: "Un compte existe déjà avec cet e-mail" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userId = await Utilisateur.create(nom, prenom, email, passwordHash);

      req.session.userId = userId;
      const user = await Utilisateur.findById(userId);

      res.status(201).json({ success: true, message: "Compte créé avec succès", data: user });
    } catch (error) {
      console.error("Erreur register:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  async login(req, res) {
    try {
      const { email, password, remember } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: "E-mail et mot de passe requis" });
      }

      const user = await Utilisateur.findByEmail(email.trim().toLowerCase());
      if (!user) {
        return res.status(401).json({ success: false, message: "Identifiants incorrects" });
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ success: false, message: "Identifiants incorrects" });
      }

      req.session.userId = user.id;
      if (remember) {
        // Se souvenir de moi : cookie persistant 30 jours.
        req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30;
      } else {
        // Sinon, cookie de session : expire à la fermeture du navigateur.
        req.session.cookie.expires = false;
      }
      delete user.password_hash;

      res.json({ success: true, message: "Connexion réussie", data: user });
    } catch (error) {
      console.error("Erreur login:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Erreur logout:", err);
        return res.status(500).json({ success: false, message: "Erreur serveur" });
      }
      res.clearCookie("connect.sid");
      res.json({ success: true, message: "Déconnexion réussie" });
    });
  },

  async me(req, res) {
    try {
      const user = await Utilisateur.findById(req.session.userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "Utilisateur introuvable" });
      }
      res.json({ success: true, data: user });
    } catch (error) {
      console.error("Erreur me:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  async updateProfile(req, res) {
    try {
      const { nom, prenom, email, current_password, new_password } = req.body;
      const userId = req.session.userId;

      const errors = [];
      if (!nom || nom.trim().length < 2) errors.push("Le nom doit contenir au moins 2 caractères");
      if (!prenom || prenom.trim().length < 2) errors.push("Le prénom doit contenir au moins 2 caractères");
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push("Adresse e-mail invalide");
      if (errors.length > 0) {
        return res.status(400).json({ success: false, message: "Erreurs de validation", errors });
      }

      const existing = await Utilisateur.findByEmail(email.trim().toLowerCase());
      if (existing && existing.id !== userId) {
        return res.status(400).json({ success: false, message: "Cet e-mail est déjà utilisé" });
      }

      await Utilisateur.updateProfile(userId, nom, prenom, email);

      if (new_password) {
        if (new_password.length < 6) {
          return res.status(400).json({
            success: false,
            message: "Le nouveau mot de passe doit contenir au moins 6 caractères",
          });
        }
        const current = await Utilisateur.findByEmail(email.trim().toLowerCase());
        const valid = current_password && (await bcrypt.compare(current_password, current.password_hash));
        if (!valid) {
          return res.status(400).json({ success: false, message: "Mot de passe actuel incorrect" });
        }
        const passwordHash = await bcrypt.hash(new_password, 10);
        await Utilisateur.updatePassword(userId, passwordHash);
      }

      const updated = await Utilisateur.findById(userId);
      res.json({ success: true, message: "Profil mis à jour avec succès", data: updated });
    } catch (error) {
      console.error("Erreur updateProfile:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  async updatePhoto(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "Aucune image envoyée" });
      }
      await Utilisateur.updatePhoto(req.session.userId, req.file.filename);
      const updated = await Utilisateur.findById(req.session.userId);
      res.json({ success: true, message: "Photo de profil mise à jour", data: updated });
    } catch (error) {
      console.error("Erreur updatePhoto:", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },
};

module.exports = authController;
