const lotAkohoRepository = require('../repositories/lotAkoho.repository');
const descriptionRaceService = require('./descriptionRace.service');
const akohoMatyService = require('./akohoMaty.service');
const raceService = require('./race.service');
const lotAtodyService = require('./lotAtody.service');

async function getAll() {
    return await lotAkohoRepository.findAll();
}

async function getById(id) {
    const item = await lotAkohoRepository.findById(id);
    if (!item) {
        const error = new Error(`LotAkoho avec l'id ${id} introuvable`);
        error.status = 404;
        throw error;
    }
    return item;
}

async function getByNumero(numero) {
    const item = await lotAkohoRepository.findByNumero(numero);
    if (!item) {
        const error = new Error(`LotAkoho avec le numéro ${numero} introuvable`);
        error.status = 404;
        throw error;
    }
    return item;
}

async function create(data) {
    if (data.numero == null || data.date_entree == null || data.nombre == null ||
        data.age == null || data.prix_achat == null || data.Id_race == null) {
        const error = new Error('Champs obligatoires : numero, date_entree, nombre, age, prix_achat, Id_race');
        error.status = 400;
        throw error;
    }
    return await lotAkohoRepository.create(data);
}

async function update(id, data) {
    await getById(id);
    const updated = await lotAkohoRepository.update(id, data);
    if (!updated) {
        const error = new Error(`Échec de la mise à jour de LotAkoho id ${id}`);
        error.status = 500;
        throw error;
    }
    return updated;
}

async function deleteById(id) {
    await getById(id);
    const deleted = await lotAkohoRepository.deleteById(id);
    if (!deleted) {
        const error = new Error(`Échec de la suppression de LotAkoho id ${id}`);
        error.status = 500;
        throw error;
    }
    return true;
}

/**
 * Calcule les grammes de nourriture consommés par UN poulet
 * depuis la semaine d'entrée pendant un nombre de jours donné.
 *
 * @param {number} ageEntreeSemaine - Âge du poulet à l'entrée (en semaines)
 * @param {number} joursPresence    - Nombre de jours de présence
 * @param {object} descMap           - Map semaine => { lanja_sakafo }
 * @returns {number} grammes consommés par 1 poulet
 */
function calculerNourritureParPoulet(ageEntreeSemaine, joursPresence, descMap) {
    if (joursPresence <= 0) return 0;

    const ageFinalExact = ageEntreeSemaine + (joursPresence / 7);
    const ageFinalEntier = Math.floor(ageFinalExact);
    const fractionFinale = ageFinalExact - ageFinalEntier;

    let totalGrammes = 0;

    // Semaines complètes depuis l'entrée
    for (let w = ageEntreeSemaine; w < ageFinalEntier; w++) {
        if (descMap[w]) {
            totalGrammes += descMap[w].lanja_sakafo;
        }
    }

    // Fraction de la semaine en cours
    if (fractionFinale > 0 && descMap[ageFinalEntier]) {
        totalGrammes += descMap[ageFinalEntier].lanja_sakafo * fractionFinale;
    }

    return totalGrammes;
}

async function getSituationByIdAndDate(id, date) {
    // 1. Récupérer les données de base
    const lotAkoho = await getById(id);
    const race = await raceService.getById(lotAkoho.Id_race);
    const descriptions = await descriptionRaceService.getAllByRaceId(lotAkoho.Id_race);

    // 2. Calcul de l'âge du lot
    const dateObj = new Date(date);
    const dateEntreeObj = new Date(lotAkoho.date_entree);
    const jourDepuisEntree = Math.floor((dateObj - dateEntreeObj) / (24 * 60 * 60 * 1000));

    if (jourDepuisEntree < 0) {
        const error = new Error("La date doit être postérieure à la date d'entrée du lot");
        error.status = 400;
        throw error;
    }

    const ageEntreeSemaine = lotAkoho.age; // âge initial en semaines à l'entrée
    const ageActuelSemaineExact = ageEntreeSemaine + (jourDepuisEntree / 7);
    const ageActuelSemaineEntier = Math.floor(ageActuelSemaineExact);
    const fractionSemaineCourante = ageActuelSemaineExact - ageActuelSemaineEntier;

    // 3. Map des descriptions par semaine (age => {variation_poids, lanja_sakafo})
    const descMap = {};
    for (const desc of descriptions) {
        descMap[desc.age] = desc;
    }

    // 4. Poids moyen par poulet
    //    On cumule les variations de poids depuis la semaine 0 (naissance)
    //    Le poids de la semaine 0 est le poids initial du poulet
    let poidsMoyen = 0;
    for (let w = 0; w <= ageActuelSemaineEntier; w++) {
        if (descMap[w]) {
            poidsMoyen += descMap[w].variation_poids;
        }
    }
    // Ajouter la fraction de la semaine suivante
    const semaineSuivante = ageActuelSemaineEntier + 1;
    if (fractionSemaineCourante > 0 && descMap[semaineSuivante]) {
        poidsMoyen += descMap[semaineSuivante].variation_poids * fractionSemaineCourante;
    }

    // 5. Valeur de la nourriture consommée — calcul par tranche de vie
    //    Chaque groupe de poulets morts a consommé de date_entree → date_mort
    //    Les survivants ont consommé de date_entree → date demandée
    const detailsMorts = await akohoMatyService.getDetailsByLotAkohoIdAndDate(id, date);

    let nombreMorts = 0;
    let valeurNourritureConsommee = 0;

    // 5a. Pour chaque événement de mort : nourriture consommée par ces poulets
    for (const mort of detailsMorts) {
        const dateMortObj = new Date(mort.date_mort);
        const joursAvantMort = Math.floor((dateMortObj - dateEntreeObj) / (24 * 60 * 60 * 1000));
        const grammesParPouletMort = calculerNourritureParPoulet(ageEntreeSemaine, joursAvantMort, descMap);
        valeurNourritureConsommee += grammesParPouletMort * mort.nombre * race.prix_sakafo;
        nombreMorts += mort.nombre;
    }

    // 5b. Pour les poulets encore vivants : nourriture de date_entree → date demandée
    const nombreApresMort = lotAkoho.nombre - nombreMorts;
    const grammesParPouletVivant = calculerNourritureParPoulet(ageEntreeSemaine, jourDepuisEntree, descMap);
    valeurNourritureConsommee += grammesParPouletVivant * nombreApresMort * race.prix_sakafo;

    // 6. Poids moyen : sans mort = poids par poulet, avec mort = ramené au lot initial
    const poidsMoyenSansMort = poidsMoyen;
    const poidsMoyenAvecMort = lotAkoho.nombre > 0
        ? (poidsMoyen * nombreApresMort) / lotAkoho.nombre
        : 0;

    // 7. Prix de vente (poids × prix de vente par gramme)
    const prixVenteSansMort = poidsMoyen * lotAkoho.nombre * race.prix_vente;
    const prixVenteAvecMort = poidsMoyen * nombreApresMort * race.prix_vente;

    // 8. Oeufs (total oeufs − oeufs déjà nés/éclos)
    const nombreOeufs = await lotAtodyService.getNombreOeufsByLotAkohoIdAndDate(id, date);
    const valeurOeufs = nombreOeufs * race.prix_vente_atody;

    // 9. Prix d'achat total
    const prixAchatTotal = lotAkoho.prix_achat * lotAkoho.nombre;

    // 10. Bénéfices
    const beneficeSansMort = prixVenteSansMort + valeurOeufs - prixAchatTotal - valeurNourritureConsommee;
    const beneficeAvecMort = prixVenteAvecMort + valeurOeufs - prixAchatTotal - valeurNourritureConsommee;

    return {
        numero: lotAkoho.numero,
        nombreInitial: lotAkoho.nombre,
        prixAchatTotal,
        valeurNourritureConsommee,
        poidsMoyenSansMort,
        poidsMoyenAvecMort,
        prixVenteSansMort,
        nombreMorts,
        nombreApresMort,
        ageEnJour: jourDepuisEntree,
        ageEnSemaine: parseFloat((jourDepuisEntree / 7).toFixed(2)),
        prixVenteAvecMort,
        nombreOeufs,
        valeurOeufs,
        beneficeSansMort,
        beneficeAvecMort
    };
}

async function getLotAkohoBeforeDate(date) {
    return await lotAkohoRepository.getLotAkohoBeforeDate(date);
}

module.exports = { getAll, getById, getByNumero, create, update, deleteById, getSituationByIdAndDate, getLotAkohoBeforeDate };