<?php

// Interrupteur d'accès à la plateforme, à éditer directement via FTP.
// - 'active' => true  : plus personne ne peut se connecter, ni charger l'app
//   (page de suspension à la place). Repasser à false pour rétablir l'accès
//   normal instantanément, sans rien redéployer d'autre.
// - 'message'/'deadline' : texte affiché sur la page de suspension.

return [
    'active' => true,
    'message' => "Merci de payer le montant restant de vos dettes à Omar pour voir les nouvelles améliorations de la plateforme, et si au début août le paiement n'est effectué la plateforme sera suspendue.",
    'deadline' => '2026-08-01',
];
