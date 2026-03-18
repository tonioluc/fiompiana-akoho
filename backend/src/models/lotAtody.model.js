class LotAtody {
    constructor({ Id_lot_atody = null, numero, date_entree, nombre, pourcentage_atody_lamokany, pourcentage_vavy, Id_lot_akoho }) {
        this.Id_lot_atody = Id_lot_atody;
        this.numero = numero;
        this.date_entree = date_entree;
        this.nombre = nombre;
        this.pourcentage_atody_lamokany = pourcentage_atody_lamokany;
        this.pourcentage_vavy = pourcentage_vavy;
        this.Id_lot_akoho = Id_lot_akoho;
    }
}

module.exports = LotAtody;
