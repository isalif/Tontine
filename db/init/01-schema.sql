-- Schéma + données initiales pour la base tontine_db
-- Repris de sauvegarde.sql, sans les tables listes_presence /
-- listes_presence_membres (fonctionnalité fusionnée dans reunions/presences).
-- Ce fichier est exécuté automatiquement par MariaDB au premier démarrage
-- du conteneur (docker-entrypoint-initdb.d).

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

--
-- Table `configuration`
--

DROP TABLE IF EXISTS `configuration`;
CREATE TABLE `configuration` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cle` varchar(50) NOT NULL,
  `valeur` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cle` (`cle`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;

INSERT INTO `configuration` VALUES
  (1,'cotisation_mensuelle_defaut','2000','Montant par défaut de la cotisation mensuelle'),
  (2,'cotisation_speciale_defaut','0','Montant par défaut de la cotisation spéciale'),
  (3,'penalite_retard_defaut','1000','Montant par défaut de la pénalité de retard');

--
-- Table `membres`
--

DROP TABLE IF EXISTS `membres`;
CREATE TABLE `membres` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `numero` varchar(20) NOT NULL,
  `date_ajout` date NOT NULL,
  `actif` tinyint(1) DEFAULT 1,
  `abonne_annuel` tinyint(1) DEFAULT 0,
  `cotisation_speciale_payee` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero` (`numero`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4;

INSERT INTO `membres` VALUES
  (1,'Salifou','Barmou','96870792','2025-11-25',1,0,0,'2025-11-25 12:40:31'),
  (2,'Elhadj Ibrahim','Abdoulaye','96760224','2025-11-25',1,0,0,'2025-11-25 12:42:23'),
  (3,'Elhadj Housseini','Abdoulaye','80414511','2025-11-25',1,0,0,'2025-11-25 12:43:33'),
  (5,'Nassirou','Abdoulaye','94982503','2025-11-25',1,0,0,'2025-11-25 12:51:03'),
  (6,'Salifou Barmou','Ismael','87458045','2025-11-25',1,0,0,'2025-11-25 12:52:56'),
  (7,'Elhadj Badamassi','Abdoulaye','98634242','2025-11-25',1,0,0,'2025-11-25 12:58:56'),
  (9,'Bassirou Mouctari','Hassane','90290116','2025-12-06',1,0,0,'2025-12-06 21:00:38'),
  (10,'Rachidou','Zabeirou','96784556','2025-12-06',1,0,0,'2025-12-06 21:02:01'),
  (11,'Chefou','Zakari','98784512','2025-12-06',1,0,0,'2025-12-06 21:02:49'),
  (12,'Lamine','Ibrahim','88789863','2025-12-06',1,0,0,'2025-12-06 21:10:01'),
  (13,'Mahmoud','Issah','87456523','2025-12-06',1,0,0,'2025-12-06 21:10:49'),
  (14,'Adamou','Djibo','88565412','2025-12-06',1,0,0,'2025-12-06 21:11:17'),
  (15,'Abdourahmane','A.Kadri','86541232','2025-12-06',1,0,0,'2025-12-06 21:12:01'),
  (16,'A.Razak','Hashimou','88996686','2025-12-06',1,1,0,'2025-12-06 21:13:44'),
  (17,'Djafar','Zabeirou','88319482','2025-12-06',1,0,0,'2025-12-06 21:16:46'),
  (18,'Hamissou','Ibrahim','86363654','2025-12-06',1,0,0,'2025-12-06 21:17:59'),
  (19,'Saadou','Ibrahim','95969321','2025-12-06',1,0,0,'2025-12-06 21:20:04'),
  (20,'Djamilou','Ala','98114135','2025-12-06',1,0,0,'2025-12-06 21:21:33'),
  (21,'Kalla','******','87456536','2025-12-06',1,0,0,'2025-12-06 21:23:33'),
  (22,'Saadou','Asoumane','96866401','2025-12-06',1,0,0,'2025-12-06 21:24:43'),
  (23,'Djafarou','Mahamadou Issoufou','89784565','2025-12-06',1,0,0,'2025-12-06 21:26:58'),
  (24,'Moussa','Yacoubou','86384261','2025-12-06',1,0,0,'2025-12-06 21:28:08'),
  (25,'Abdoulaye','Housseini','89653221','2025-12-06',1,0,0,'2025-12-06 21:29:52'),
  (26,'Ousseini','Abdoulaye','85542112','2025-12-06',1,0,0,'2025-12-06 21:49:26');

--
-- Table `projets`
--

DROP TABLE IF EXISTS `projets`;
CREATE TABLE `projets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `montant_cible` decimal(10,2) DEFAULT NULL,
  `date_debut` date DEFAULT NULL,
  `date_fin` date DEFAULT NULL,
  `statut` enum('en_cours','termine','annule') DEFAULT 'en_cours',
  `date_creation` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;

INSERT INTO `projets` VALUES
  (4,'Mosquee Tahirou','Rien 2.2',5000000.00,'2026-04-01','2026-08-31','en_cours','2026-04-02 20:48:43');

--
-- Table `projet_configurations`
--

DROP TABLE IF EXISTS `projet_configurations`;
CREATE TABLE `projet_configurations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `projet_id` int(11) NOT NULL,
  `montant_par_reunion` decimal(10,2) NOT NULL DEFAULT 5000.00,
  `montant_annuel` decimal(10,2) NOT NULL DEFAULT 60000.00,
  `penalite_retard` decimal(10,2) NOT NULL DEFAULT 1000.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_projet_config` (`projet_id`),
  CONSTRAINT `fk_projet_config` FOREIGN KEY (`projet_id`) REFERENCES `projets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table `reunions`
--

DROP TABLE IF EXISTS `reunions`;
CREATE TABLE `reunions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date_reunion` date NOT NULL,
  `titre` varchar(255) DEFAULT NULL,
  `projet_id` int(11) DEFAULT NULL,
  `statut` enum('en_cours','cloturee') DEFAULT 'en_cours',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `date_reunion` (`date_reunion`),
  KEY `projet_id` (`projet_id`),
  CONSTRAINT `reunions_ibfk_1` FOREIGN KEY (`projet_id`) REFERENCES `projets` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4;

INSERT INTO `reunions` VALUES
  (11,'2026-05-09','jkshfklmsdh',4,'en_cours','2026-04-02 23:17:56'),
  (12,'2026-04-03','26646',4,'en_cours','2026-04-03 00:01:49');

--
-- Table `cotisations`
--

DROP TABLE IF EXISTS `cotisations`;
CREATE TABLE `cotisations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reunion_id` int(11) NOT NULL,
  `membre_id` int(11) NOT NULL,
  `cotisation_mensuelle` decimal(10,2) DEFAULT 0.00,
  `cotisation_speciale` decimal(10,2) DEFAULT 0.00,
  `penalite` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) GENERATED ALWAYS AS (`cotisation_mensuelle` + `cotisation_speciale` + `penalite`) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_cotisation` (`reunion_id`,`membre_id`),
  KEY `membre_id` (`membre_id`),
  CONSTRAINT `cotisations_ibfk_1` FOREIGN KEY (`reunion_id`) REFERENCES `reunions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cotisations_ibfk_2` FOREIGN KEY (`membre_id`) REFERENCES `membres` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=321 DEFAULT CHARSET=utf8mb4;

INSERT INTO `cotisations` (id, reunion_id, membre_id, cotisation_mensuelle, cotisation_speciale, penalite) VALUES
  (259,11,1,2000.00,0.00,0.00),(260,11,2,2000.00,0.00,0.00),(261,11,3,2000.00,0.00,0.00),
  (262,11,5,2000.00,0.00,0.00),(263,11,6,2000.00,0.00,0.00),(264,11,7,2000.00,0.00,0.00),
  (265,11,9,2000.00,0.00,0.00),(266,11,10,2000.00,0.00,0.00),(267,11,11,2000.00,0.00,0.00),
  (268,11,12,2000.00,0.00,0.00),(269,11,13,2000.00,0.00,0.00),(270,11,14,2000.00,0.00,0.00),
  (271,11,15,2000.00,0.00,0.00),(272,11,16,2000.00,0.00,0.00),(273,11,17,2000.00,0.00,0.00),
  (274,11,18,2000.00,0.00,0.00),(275,11,19,2000.00,0.00,0.00),(276,11,20,2000.00,0.00,0.00),
  (277,11,21,2000.00,0.00,0.00),(278,11,22,2000.00,0.00,0.00),(279,11,23,2000.00,0.00,0.00),
  (280,11,24,2000.00,0.00,0.00),(281,11,25,2000.00,0.00,0.00),(282,11,26,2000.00,0.00,0.00),
  (290,12,1,2000.00,0.00,0.00),(291,12,2,2000.00,0.00,0.00),(292,12,3,2000.00,0.00,0.00),
  (293,12,5,2000.00,0.00,0.00),(294,12,6,2000.00,0.00,0.00),(295,12,7,2000.00,0.00,0.00),
  (296,12,9,2000.00,0.00,0.00),(297,12,10,2000.00,0.00,0.00),(298,12,11,2000.00,0.00,0.00),
  (299,12,12,2000.00,0.00,0.00),(300,12,13,2000.00,0.00,0.00),(301,12,14,2000.00,0.00,0.00),
  (302,12,15,2000.00,0.00,0.00),(303,12,16,2000.00,0.00,0.00),(304,12,17,2000.00,0.00,0.00),
  (305,12,18,2000.00,0.00,0.00),(306,12,19,2000.00,0.00,0.00),(307,12,20,2000.00,0.00,0.00),
  (308,12,21,2000.00,0.00,0.00),(309,12,22,2000.00,0.00,0.00),(310,12,23,2000.00,0.00,0.00),
  (311,12,24,2000.00,0.00,0.00),(312,12,25,2000.00,0.00,0.00),(313,12,26,2000.00,0.00,0.00);

--
-- Table `cotisations_speciales`
--

DROP TABLE IF EXISTS `cotisations_speciales`;
CREATE TABLE `cotisations_speciales` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `membre_id` int(11) NOT NULL,
  `projet_id` int(11) DEFAULT NULL,
  `montant` decimal(10,2) NOT NULL,
  `date_paiement` date NOT NULL,
  `statut` enum('payee','en_attente','annule') DEFAULT 'payee',
  `note` text DEFAULT NULL,
  `date_creation` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_membre_id` (`membre_id`),
  KEY `projet_id` (`projet_id`),
  CONSTRAINT `cotisations_speciales_ibfk_1` FOREIGN KEY (`projet_id`) REFERENCES `projets` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_cotisations_speciales_membres` FOREIGN KEY (`membre_id`) REFERENCES `membres` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

INSERT INTO `cotisations_speciales` VALUES
  (2,7,4,800000.00,'2026-04-03','en_attente',NULL,'2026-04-02 23:30:49');

--
-- Table `presences`
--

DROP TABLE IF EXISTS `presences`;
CREATE TABLE `presences` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reunion_id` int(11) NOT NULL,
  `membre_id` int(11) NOT NULL,
  `present` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_presence` (`reunion_id`,`membre_id`),
  KEY `membre_id` (`membre_id`),
  CONSTRAINT `presences_ibfk_1` FOREIGN KEY (`reunion_id`) REFERENCES `reunions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `presences_ibfk_2` FOREIGN KEY (`membre_id`) REFERENCES `membres` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=321 DEFAULT CHARSET=utf8mb4;

INSERT INTO `presences` VALUES
  (259,11,1,1),(260,11,2,1),(261,11,3,1),(262,11,5,1),(263,11,6,1),(264,11,7,1),(265,11,9,1),(266,11,10,1),
  (267,11,11,1),(268,11,12,1),(269,11,13,1),(270,11,14,1),(271,11,15,1),(272,11,16,1),(273,11,17,1),(274,11,18,1),
  (275,11,19,1),(276,11,20,1),(277,11,21,1),(278,11,22,1),(279,11,23,1),(280,11,24,1),(281,11,25,1),(282,11,26,1),
  (290,12,1,1),(291,12,2,1),(292,12,3,1),(293,12,5,1),(294,12,6,1),(295,12,7,1),(296,12,9,1),(297,12,10,1),
  (298,12,11,1),(299,12,12,1),(300,12,13,1),(301,12,14,1),(302,12,15,1),(303,12,16,1),(304,12,17,1),(305,12,18,1),
  (306,12,19,1),(307,12,20,1),(308,12,21,1),(309,12,22,1),(310,12,23,1),(311,12,24,1),(312,12,25,1),(313,12,26,1);

--
-- Table `projet_cotisations`
--

DROP TABLE IF EXISTS `projet_cotisations`;
CREATE TABLE `projet_cotisations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `projet_id` int(11) NOT NULL,
  `cotisation_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `projet_id` (`projet_id`),
  KEY `cotisation_id` (`cotisation_id`),
  CONSTRAINT `projet_cotisations_ibfk_1` FOREIGN KEY (`projet_id`) REFERENCES `projets` (`id`),
  CONSTRAINT `projet_cotisations_ibfk_2` FOREIGN KEY (`cotisation_id`) REFERENCES `cotisations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
