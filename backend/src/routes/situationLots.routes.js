const express = require('express');
const router = express.Router();
const situationLotsController = require('../controllers/situationLots.controller');

/**
 * @swagger
 * tags:
 *   name: SituationLots
 *   description: Vue d'ensemble de la situation de tous les lots de poulets
 */

/**
 * @swagger
 * /api/situation-lots:
 *   get:
 *     summary: Obtenir la situation de tous les lots de poulets à une date donnée
 *     description: |
 *       Retourne la situation complète (financière et physique) de **tous les lots de poulets**
 *       dont la date d'entrée est antérieure ou égale à la date demandée.
 *
 *       Pour chaque lot, on calcule :
 *       - Le numéro du lot et son âge en semaines
 *       - Le nombre de morts, le poids moyen et le poids total restant
 *       - Le nombre d'oeufs restants et leur valeur
 *       - Le prix de vente total des poulets restants
 *       - La valeur totale de la nourriture consommée
 *       - Le prix d'achat total et le bénéfice du lot
 *     tags: [SituationLots]
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: '2026-03-10'
 *         description: Date pour le calcul de la situation (format YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Situation de tous les lots
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 date:
 *                   type: string
 *                   format: date
 *                   example: '2026-03-10'
 *                 nombreLots:
 *                   type: integer
 *                   description: Nombre total de lots trouvés
 *                   example: 3
 *                 situations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       numero:
 *                         type: integer
 *                         description: Numéro du lot
 *                       ageEnSemaine:
 *                         type: number
 *                         description: Âge du lot en semaines
 *                       nombreMorts:
 *                         type: integer
 *                         description: Nombre de poulets morts
 *                       pouletRestant:
 *                          type: integer  
 *                          description: Nombre de poulets restants
 *                       poidsMoyen:
 *                         type: number
 *                         description: Poids moyen des poulets restants (en grammes)
 *                       poidsTotalRestant:
 *                         type: number
 *                         description: Poids total des poulets restants (en grammes)
 *                       nombreOeuf:
 *                         type: integer
 *                         description: Nombre d'oeufs restants
 *                       prixVenteTotal:
 *                         type: number
 *                         description: Prix de vente total des poulets restants
 *                       valeurOeufsRestants:
 *                         type: number
 *                         description: Valeur des oeufs restants
 *                       valeurNourritureConsommee:
 *                         type: number
 *                         description: Valeur totale de la nourriture consommée
 *                       prixAchatTotal:
 *                         type: number
 *                         description: Prix d'achat total du lot
 *                       benefice:
 *                         type: number
 *                         description: Bénéfice total du lot (vente + oeufs - nourriture - achat)
 *       400:
 *         description: Paramètre date manquant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', situationLotsController.getSituationByDate);

module.exports = router;
