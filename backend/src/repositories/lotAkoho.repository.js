const { sql, getPool } = require('../config/database');

async function findAll() {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM lot_akoho');
    return result.recordset;
}

async function findById(id) {
    const pool = await getPool();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM lot_akoho WHERE Id_lot_akoho = @id');
    return result.recordset[0] || null;
}

async function create({ numero, date_entree, nombre, age, nombre_akoho_vavy, prix_achat, Id_race }) {
    const pool = await getPool();
    const result = await pool.request()
        .input('numero', sql.Int, numero)
        .input('date_entree', sql.Date, date_entree)
        .input('nombre', sql.Int, nombre)
        .input('age', sql.Int, age)
        .input('nombre_akoho_vavy', sql.Int, nombre_akoho_vavy)
        .input('prix_achat', sql.Float, prix_achat)
        .input('Id_race', sql.Int, Id_race)
        .query(`
            INSERT INTO lot_akoho (numero, date_entree, nombre, age, nombre_akoho_vavy, prix_achat, Id_race)
            OUTPUT INSERTED.*
            VALUES (@numero, @date_entree, @nombre, @age, @nombre_akoho_vavy, @prix_achat, @Id_race)
        `);
    return result.recordset[0];
}

async function update(id, { numero, date_entree, nombre, age, nombre_akoho_vavy, prix_achat, Id_race }) {
    const pool = await getPool();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .input('numero', sql.Int, numero)
        .input('date_entree', sql.Date, date_entree)
        .input('nombre', sql.Int, nombre)
        .input('age', sql.Int, age)
        .input('nombre_akoho_vavy', sql.Int, nombre_akoho_vavy)
        .input('prix_achat', sql.Float, prix_achat)
        .input('Id_race', sql.Int, Id_race)
        .query(`
            UPDATE lot_akoho
            SET numero = @numero, date_entree = @date_entree, nombre = @nombre,
                age = @age, nombre_akoho_vavy = @nombre_akoho_vavy,
                prix_achat = @prix_achat, Id_race = @Id_race
            WHERE Id_lot_akoho = @id;
            SELECT * FROM lot_akoho WHERE Id_lot_akoho = @id;
        `);
    return result.recordset[0] || null;
}

async function deleteById(id) {
    const pool = await getPool();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM lot_akoho WHERE Id_lot_akoho = @id');
    return result.rowsAffected[0] > 0;
}

async function getLotAkohoBeforeDate(date) {
    const pool = await getPool();
    const result = await pool.request()
        .input('date', sql.Date, date)
        .query('SELECT * FROM lot_akoho WHERE date_entree <= @date');
    return result.recordset;
}

async function findByNumero(numero) {
    const pool = await getPool();
    const result = await pool.request()
        .input('numero', sql.Int, numero)
        .query('SELECT * FROM lot_akoho WHERE numero = @numero');
    return result.recordset[0] || null;
}

module.exports = { findAll, findById, findByNumero, create, update, deleteById, getLotAkohoBeforeDate };