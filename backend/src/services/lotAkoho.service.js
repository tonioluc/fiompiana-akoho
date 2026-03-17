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

async function getLotAkohoBeforeDate(date) {
    return await lotAkohoRepository.getLotAkohoBeforeDate(date);
}

async function getSituationByIdAndDate(id, date) {
    // numéro lot
    const lotAkoho = await getById(id);
    const numero = lotAkoho.numero;

    // age en semaine
    const dateObj = new Date(date);
    const dateEntreeObj = new Date(lotAkoho.date_entree);
    if (dateObj < dateEntreeObj) {
        const error = new Error('La date doit être postérieur que la date d\' entrer du lot.')
        error.status = 400;
        throw error;
    }
    const jourDepuisEntree = Math.floor((dateObj - dateEntreeObj) / (24 * 60 * 60 * 1000)) + 1; // plus 1 satria efa ao izy 1er jour
    const ageEnSemaine = parseFloat((lotAkoho.age + (jourDepuisEntree / 7)).toFixed(2));

    //nombre de mort 
    const nombreMorts = await akohoMatyService.getAkohoMatyByIdLotAkohoAndDate(id, date);

    //poulet restant
    const pouletRestant = lotAkoho.nombre - nombreMorts;

    // poids moyen des poulets restants
    const poidsMoyen = await raceService.getPoidsAkoho(lotAkoho.Id_race, lotAkoho.date_entree, date);

    // poids des poulets restants
    const poidsTotalRestant = pouletRestant * poidsMoyen.poidsGrammes;

    // nombre d'oeuf restants
    const nombreOeuf = await lotAtodyService.getNombreOeufsByLotAkohoIdAndDate(id, date);

    // prix de vente total des poulets restants
    const prixVenteTotal = poidsTotalRestant * (await raceService.getById(lotAkoho.Id_race)).prix_vente;

    // valeur totale des oeufs restants
    const valeurOeufsRestants = nombreOeuf * (await raceService.getById(lotAkoho.Id_race)).prix_vente_atody;

    // valeur des nourritures consommées
    const sakafoPouletRestant = await raceService.getSakafoAkoho(
        lotAkoho.age,
        lotAkoho.Id_race,
        lotAkoho.date_entree,
        date
    );
    const nourritureConsommePouletRestantEnGramme = sakafoPouletRestant.totalGrammes * pouletRestant;

    let nourritureConsommePouletMortEnGramme = 0;
    if (nombreMorts > 0) {
        const detailsMorts = await akohoMatyService.getDetailsByLotAkohoIdAndDate(id, date);
        for (const mort of detailsMorts) {
            const sakafoPouletMort = await raceService.getSakafoAkoho(
                lotAkoho.age,
                lotAkoho.Id_race,
                lotAkoho.date_entree,
                mort.date_mort
            );
            nourritureConsommePouletMortEnGramme += sakafoPouletMort.totalGrammes * mort.nombre;
        }
    }



    const totalNourritureConsommeeEnGramme = nourritureConsommePouletRestantEnGramme + nourritureConsommePouletMortEnGramme;
    const valeurNourritureConsommee = totalNourritureConsommeeEnGramme * (await raceService.getById(lotAkoho.Id_race)).prix_sakafo;
    console.log(
        'nourriture consommée pour les poulets restants (en grammes) :', nourritureConsommePouletRestantEnGramme,
        '\nnourriture consommée pour les poulets morts (en grammes) :', nourritureConsommePouletMortEnGramme,
        '\ntotal nourriture consommée (en grammes) :', totalNourritureConsommeeEnGramme,
        '\nValeur de la nourriture consommée :', valeurNourritureConsommee
    );

    // prix achat total
    const prixAchatTotal = lotAkoho.prix_achat * lotAkoho.nombre;

    // bénéfice
    const benefice = prixVenteTotal + valeurOeufsRestants - prixAchatTotal - valeurNourritureConsommee;

    return {
        numero,
        ageEnSemaine,
        nombreMorts,
        pouletRestant,
        poidsMoyen: poidsMoyen.poidsGrammes,
        poidsTotalRestant,
        nombreOeuf,
        prixVenteTotal,
        valeurOeufsRestants,
        valeurNourritureConsommee,
        prixAchatTotal,
        benefice
    }
}

module.exports = { getAll, getById, getByNumero, create, update, deleteById, getSituationByIdAndDate, getLotAkohoBeforeDate };