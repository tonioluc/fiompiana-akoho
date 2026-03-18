const { sql, getPool } = require('../config/database');

async function findAll() {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM lot_atody');
    return result.recordset;
}

async function findById(id) {
    const pool = await getPool();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM lot_atody WHERE Id_lot_atody = @id');
    return result.recordset[0] || null;
}

async function create({ numero, date_entree, nombre, pourcentage_atody_lamokany, pourcentage_vavy, Id_lot_akoho }) {
    const pool = await getPool();
    const result = await pool.request()
        .input('numero', sql.Int, numero)
        .input('date_entree', sql.Date, date_entree)
        .input('nombre', sql.Int, nombre)
        .input('pourcentage_atody_lamokany', sql.Int, pourcentage_atody_lamokany)
        .input('pourcentage_vavy', sql.Int, pourcentage_vavy)
        .input('Id_lot_akoho', sql.Int, Id_lot_akoho)
        .query(`
            INSERT INTO lot_atody (numero, date_entree, nombre, pourcentage_atody_lamokany, pourcentage_vavy, Id_lot_akoho)
            OUTPUT INSERTED.*
            VALUES (@numero, @date_entree, @nombre, @pourcentage_atody_lamokany, @pourcentage_vavy, @Id_lot_akoho)
        `);
    return result.recordset[0];
}

async function update(id, { numero, date_entree, nombre, pourcentage_atody_lamokany, pourcentage_vavy, Id_lot_akoho }) {
    const pool = await getPool();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .input('numero', sql.Int, numero)
        .input('date_entree', sql.Date, date_entree)
        .input('nombre', sql.Int, nombre)
        .input('pourcentage_atody_lamokany', sql.Int, pourcentage_atody_lamokany)
        .input('pourcentage_vavy', sql.Int, pourcentage_vavy)
        .input('Id_lot_akoho', sql.Int, Id_lot_akoho)
        .query(`
            UPDATE lot_atody
            SET numero = @numero, date_entree = @date_entree,
                nombre = @nombre, pourcentage_atody_lamokany = @pourcentage_atody_lamokany,
                pourcentage_vavy = @pourcentage_vavy, Id_lot_akoho = @Id_lot_akoho
            WHERE Id_lot_atody = @id;
            SELECT * FROM lot_atody WHERE Id_lot_atody = @id;
        `);
    return result.recordset[0] || null;
}

async function deleteById(id) {
    const pool = await getPool();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM lot_atody WHERE Id_lot_atody = @id');
    return result.rowsAffected[0] > 0;
}

/**
 * Récupérer tous les lots d'oeufs d'un lot de poulets jusqu'à une date donnée.
 */
async function findByLotAkohoIdAndDate(idLotAkoho, date) {
    const pool = await getPool();
    const result = await pool.request()
        .input('idLotAkoho', sql.Int, idLotAkoho)
        .input('date', sql.Date, date)
        .query('SELECT * FROM lot_atody WHERE Id_lot_akoho = @idLotAkoho AND date_entree <= @date');
    return result.recordset;
}

/**
 * Calculer la somme totale des œufs recensés pour un lot de poulets donné.
 */
async function getSumOeufsByLotAkohoId(idLotAkoho) {
    const pool = await getPool();
    const result = await pool.request()
        .input('idLotAkoho', sql.Int, idLotAkoho)
        .query('SELECT COALESCE(SUM(nombre), 0) as total FROM lot_atody WHERE Id_lot_akoho = @idLotAkoho');
    return result.recordset[0].total;
}

module.exports = { findAll, findById, create, update, deleteById, findByLotAkohoIdAndDate, getSumOeufsByLotAkohoId };
