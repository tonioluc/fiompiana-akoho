const lotAtodyRepository = require('../repositories/lotAtody.repository');
const lotAkohoRepository = require('../repositories/lotAkoho.repository');
const naissanceOeufRepository = require('../repositories/naissanceOeuf.repository');
const atodyLamokanyRepository = require('../repositories/atodyLamokany.repository');
const naissanceOeufService = require('./naissanceOeuf.service');
const atodyLamokanyService = require('./atodyLamokany.service');
const raceService = require('./race.service');

async function getAll() {
    return await lotAtodyRepository.findAll();
}

async function getById(id) {
    const item = await lotAtodyRepository.findById(id);
    if (!item) {
        const error = new Error(`LotAtody avec l'id ${id} introuvable`);
        error.status = 404;
        throw error;
    }
    return item;
}

/**
 * Créer un lot d'œufs avec la règle métier de naissance automatique.
 *
 * Règle métier :
 * 1. Vérifier que la somme des œufs ne dépasse pas la capacité de pondaison
 * 2. Créer le lot_atody
 * 3. Créer atody_lamokany (œufs pourris selon pourcentage_atody_lamokany)
 * 4. Calculer la date de naissance (date_entree + nombre_jour_foy de la race)
 * 5. Créer un nouveau lot_akoho (poussins nés)
 * 6. Créer naissance_oeuf avec référence vers le nouveau lot_akoho
 */
async function create(data) {
    if (data.numero == null || data.date_entree == null || data.nombre == null ||
        data.pourcentage_atody_lamokany == null || data.pourcentage_vavy == null || data.Id_lot_akoho == null) {
        const error = new Error('Champs obligatoires : numero, date_entree, nombre, pourcentage_atody_lamokany, pourcentage_vavy, Id_lot_akoho');
        error.status = 400;
        throw error;
    }

    // 1. Récupérer le lot de poulets parent et vérifier la capacité de pondaison
    const lotAkohoParent = await lotAkohoRepository.findById(data.Id_lot_akoho);
    if (!lotAkohoParent) {
        const error = new Error(`Lot de poulets avec l'id ${data.Id_lot_akoho} introuvable`);
        error.status = 404;
        throw error;
    }

    const race = await raceService.getById(lotAkohoParent.Id_race);
    const capacitePondaison = lotAkohoParent.nombre_akoho_vavy * race.capacite_pondaison;

    // Calculer la somme totale des œufs déjà recensés pour ce lot de poulets
    const sommeOeufsExistants = await lotAtodyRepository.getSumOeufsByLotAkohoId(data.Id_lot_akoho);
    const nouvelleSomme = sommeOeufsExistants + data.nombre;

    if (nouvelleSomme > capacitePondaison) {
        const error = new Error(`Le nombre d'œufs dépasse la capacité de pondaison. ` +
            `Capacité maximale: ${capacitePondaison}, ` +
            `Œufs déjà recensés: ${sommeOeufsExistants}, ` +
            `Œufs à ajouter: ${data.nombre}, ` +
            `Total: ${nouvelleSomme}`);
        error.status = 400;
        throw error;
    }

    // 2. Créer le lot_atody
    const lotAtody = await lotAtodyRepository.create(data);

    // 3. Calculer et créer atody_lamokany (œufs pourris)
    const nombreLamokany = Math.floor(data.nombre * data.pourcentage_atody_lamokany / 100);
    if (nombreLamokany > 0) {
        await atodyLamokanyRepository.create({
            date_lamokany: data.date_entree,
            nombre: nombreLamokany,
            Id_lot_atody: lotAtody.Id_lot_atody
        });
    }

    // 4. Calculer le nombre de poussins qui vont naître (œufs - lamokany)
    const nombrePoussins = data.nombre - nombreLamokany;

    if (nombrePoussins > 0) {
        // 5. Calculer la date de naissance
        const dateEntree = new Date(data.date_entree);
        const dateNaissance = new Date(dateEntree);
        dateNaissance.setDate(dateNaissance.getDate() + race.nombre_jour_foy);
        const dateNaissanceStr = dateNaissance.toISOString().split('T')[0];

        // 6. Calculer le nombre de poussins femelles
        const nombreVavy = Math.floor(nombrePoussins * data.pourcentage_vavy / 100);

        // 7. Obtenir le prochain numéro de lot
        const maxNumero = await lotAkohoRepository.getMaxNumero();
        const nouveauNumero = maxNumero + 1;

        // 8. Créer le nouveau lot_akoho pour les poussins nés
        const nouveauLotAkoho = await lotAkohoRepository.create({
            numero: nouveauNumero,
            date_entree: dateNaissanceStr,
            nombre: nombrePoussins,
            age: 0, // Les poussins naissent à l'âge 0
            nombre_akoho_vavy: nombreVavy,
            prix_achat: 0, // Prix d'achat à 0 car ils sont nés
            Id_race: lotAkohoParent.Id_race
        });

        // 9. Créer naissance_oeuf avec référence vers le nouveau lot_akoho
        await naissanceOeufRepository.create({
            nombre_poussin: nombrePoussins,
            date_naissance: dateNaissanceStr,
            Id_lot_atody: lotAtody.Id_lot_atody,
            Id_lot_akoho: nouveauLotAkoho.Id_lot_akoho
        });

        console.log(`Naissance automatique créée: ${nombrePoussins} poussins (${nombreVavy} femelles) dans lot n°${nouveauNumero}, nés le ${dateNaissanceStr}`);
    }

    return lotAtody;
}

async function update(id, data) {
    await getById(id);
    const updated = await lotAtodyRepository.update(id, data);
    if (!updated) {
        const error = new Error(`Échec de la mise à jour de LotAtody id ${id}`);
        error.status = 500;
        throw error;
    }
    return updated;
}

async function deleteById(id) {
    await getById(id);
    const deleted = await lotAtodyRepository.deleteById(id);
    if (!deleted) {
        const error = new Error(`Échec de la suppression de LotAtody id ${id}`);
        error.status = 500;
        throw error;
    }
    return true;
}

/**
 * Calculer le nombre d'oeufs restants pour un lot de poulets à une date donnée.
 * Formule : total oeufs - naissances (poussins éclos) - oeufs pourris (lamokany)
 */
async function getNombreOeufsByLotAkohoIdAndDate(idLotAkoho, date) {
    const lotsAtody = await lotAtodyRepository.findByLotAkohoIdAndDate(idLotAkoho, date);
    let totalOeufs = 0;
    const lotAtodyIds = [];
    for (const lot of lotsAtody) {
        totalOeufs += lot.nombre;
        lotAtodyIds.push(lot.Id_lot_atody);
    }
    if (lotAtodyIds.length > 0) {
        const totalNaissances = await naissanceOeufService.getNombreNaissanceByLotAtodyIdsAndDate(lotAtodyIds, date);
        const totalLamokany = await atodyLamokanyService.getNombreLamokanyByLotAtodyIdsAndDate(lotAtodyIds, date);
        totalOeufs -= totalNaissances;
        totalOeufs -= totalLamokany;
    }
    return Math.max(0, totalOeufs);
}

module.exports = { getAll, getById, create, update, deleteById, getNombreOeufsByLotAkohoIdAndDate };
