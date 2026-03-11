const raceService = require('../services/race.service');

async function getAll(req, res, next) {
    try {
        res.json(await raceService.getAll());
    } catch (error) { next(error); }
}

async function getById(req, res, next) {
    try {
        res.json(await raceService.getById(parseInt(req.params.id)));
    } catch (error) { next(error); }
}

async function create(req, res, next) {
    try {
        res.status(201).json(await raceService.create(req.body));
    } catch (error) { next(error); }
}

async function update(req, res, next) {
    try {
        res.json(await raceService.update(parseInt(req.params.id), req.body));
    } catch (error) { next(error); }
}

async function deleteById(req, res, next) {
    try {
        await raceService.deleteById(parseInt(req.params.id));
        res.status(204).send();
    } catch (error) { next(error); }
}

async function getPoidsAkoho(req, res, next) {
    try {
        const raceId = parseInt(req.params.id);
        const { dateDebut, dateFin } = req.query;
        if (!dateDebut || !dateFin) {
            const error = new Error('Paramètres obligatoires : dateDebut et dateFin (format: YYYY-MM-DD)');
            error.status = 400;
            throw error;
        }
        res.json(await raceService.getPoidsAkoho(raceId, dateDebut, dateFin));
    } catch (error) { next(error); }
}

module.exports = { getAll, getById, create, update, deleteById, getPoidsAkoho };
