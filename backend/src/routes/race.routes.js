const express = require('express');
const router = express.Router();
const raceController = require('../controllers/race.controller');

/**
 * @swagger
 * tags:
 *   name: Races
 *   description: Gestion des races de poulets
 */

/**
 * @swagger
 * /api/races:
 *   get:
 *     summary: Récupérer toutes les races
 *     tags: [Races]
 *     responses:
 *       200:
 *         description: Liste de toutes les races
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Race'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Créer une nouvelle race
 *     tags: [Races]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RaceInput'
 *     responses:
 *       201:
 *         description: Race créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Race'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', raceController.getAll);
router.post('/', raceController.create);

/**
 * @swagger
 * /api/races/{id}:
 *   get:
 *     summary: Récupérer une race par son ID
 *     tags: [Races]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la race
 *     responses:
 *       200:
 *         description: Race trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Race'
 *       404:
 *         description: Race introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFound'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Mettre à jour une race
 *     tags: [Races]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la race
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RaceInput'
 *     responses:
 *       200:
 *         description: Race mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Race'
 *       404:
 *         description: Race introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFound'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Supprimer une race
 *     tags: [Races]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la race
 *     responses:
 *       200:
 *         description: Race supprimée avec succès
 *       404:
 *         description: Race introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFound'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', raceController.getById);
router.get('/:id/poids-akoho', raceController.getPoidsAkoho);
router.put('/:id', raceController.update);
router.delete('/:id', raceController.deleteById);

module.exports = router;
