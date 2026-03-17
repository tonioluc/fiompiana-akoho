const raceRepository = require('../repositories/race.repository');
const descriptionRaceService = require('./descriptionRace.service');

async function getAll() {
    return await raceRepository.findAll();
}

async function getById(id) {
    const item = await raceRepository.findById(id);
    if (!item) {
        const error = new Error(`Race avec l'id ${id} introuvable`);
        error.status = 404;
        throw error;
    }
    return item;
}

async function create(data) {
    if (!data.nom || data.prix_sakafo == null || data.prix_vente == null || data.prix_vente_atody == null) {
        const error = new Error('Champs obligatoires : nom, prix_sakafo, prix_vente, prix_vente_atody');
        error.status = 400;
        throw error;
    }
    return await raceRepository.create(data);
}

async function update(id, data) {
    await getById(id);
    const updated = await raceRepository.update(id, data);
    if (!updated) {
        const error = new Error(`Échec de la mise à jour de Race id ${id}`);
        error.status = 500;
        throw error;
    }
    return updated;
}

async function deleteById(id) {
    await getById(id);
    const deleted = await raceRepository.deleteById(id);
    if (!deleted) {
        const error = new Error(`Échec de la suppression de Race id ${id}`);
        error.status = 500;
        throw error;
    }
    return true;
}

/**
 * Calcule le poids exact en grammes d'un poulet d'une race donnée
 * qui a vécu de dateDebut à dateFin.
 * On cumule les variation_poids semaine par semaine.
 *
 * @param {number} raceId   - ID de la race
 * @param {string} dateDebut - Date de début (naissance/entrée) format YYYY-MM-DD
 * @param {string} dateFin   - Date de fin format YYYY-MM-DD
 * @returns {object} { raceId, raceName, dateDebut, dateFin, joursPresence, ageEnSemaine, poidsGrammes }
 */
async function getPoidsAkoho(ageEntree ,raceId, dateDebut, dateFin) {
    const race = await getById(raceId);
    const descriptions = await descriptionRaceService.getAllByRaceId(raceId);

    const dateDebutObj = new Date(dateDebut);
    const dateFinObj = new Date(dateFin);
    const joursPresence = Math.floor((dateFinObj - dateDebutObj) / (24 * 60 * 60 * 1000)) + 1;

    if (joursPresence < 0) {
        const error = new Error('La date de fin doit être postérieure à la date de début');
        error.status = 400;
        throw error;
    }

    // Map des descriptions par semaine
    const descMap = {};
    for (const desc of descriptions) {
        descMap[desc.age] = desc;
    }

    // Cumul des variations de poids depuis la semaine 0
    const ageExact = ageEntree + (joursPresence / 7);
    const ageEntier = Math.floor(ageExact);
    const fraction = ageExact - ageEntier;

    let poidsGrammes = 0;
    for (let w = 0; w <= ageEntier; w++) {
        if (descMap[w]) {
            poidsGrammes += descMap[w].variation_poids;
        }
    }
    // Ajouter la fraction de la semaine suivante
    const semaineSuivante = ageEntier + 1;
    if (fraction > 0 && descMap[semaineSuivante]) {
        poidsGrammes += descMap[semaineSuivante].variation_poids * fraction;
    }

    return {
        raceId: race.Id_race,
        raceName: race.nom,
        dateDebut,
        dateFin,
        joursPresence,
        ageEnSemaine: parseFloat(ageExact.toFixed(2)),
        poidsGrammes: parseFloat(poidsGrammes.toFixed(2))
    };
}

async function getSakafoAkoho(ageEntree ,raceId, dateDebut, dateFin) {
    const race = await getById(raceId);
    const descriptions = await descriptionRaceService.getAllByRaceId(raceId);
    
    const dateDebutObj = new Date(dateDebut);
    const dateFinObj = new Date(dateFin);
    const joursPresence = Math.floor((dateFinObj - dateDebutObj) / (24 * 60 * 60 * 1000)) + 1;

    if (joursPresence < 0) {
        const error = new Error('La date de fin doit être postérieure à la date de début');
        error.status = 400;
        throw error;
    }

    // Map des descriptions par semaine
    const descMap = {};
    for (const desc of descriptions) {
        descMap[desc.age] = desc;
    }

    const ageExact = joursPresence / 7;
    const ageEntier = Math.floor(ageExact);
    const fraction = ageExact - ageEntier;
    
    let totalGrammes = 0;
    
    for (let w = ageEntree ; w <= ageEntier; w++) {
        if (descMap[w]) {
            totalGrammes += descMap[w].lanja_sakafo;
        }
    }
    // Ajouter la fraction de la semaine suivante
    const semaineSuivante = ageEntier + 1;
    if (fraction > 0 && descMap[semaineSuivante]) {
        totalGrammes += descMap[semaineSuivante].lanja_sakafo * fraction;
    }

    return {
        raceId: race.Id_race,
        raceName: race.nom,
        dateDebut,
        dateFin,
        joursPresence,
        ageEnSemaine: parseFloat(ageExact.toFixed(2)),
        totalGrammes: parseFloat(totalGrammes.toFixed(2))
    };
}

module.exports = { getAll, getById, create, update, deleteById, getPoidsAkoho, getSakafoAkoho };
