/**
 * Repository AtodyLamokany — couche d'accès aux données.
 * 
 * ➜ Spring Boot : équivalent d'une interface @Repository
 *
 * Gère les requêtes SQL pour la table atody_lamokany
 * (œufs couvés gâtés / pourris).
 */

const { sql, getPool } = require('../config/database');

async function findAll() {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM atody_lamokany');
    return result.recordset;
}

async function findById(id) {
    const pool = await getPool();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM atody_lamokany WHERE Id_atody_lamokany = @id');
    return result.recordset[0] || null;
}

async function create({ date_lamokany, nombre, Id_lot_atody }) {
    const pool = await getPool();
    const result = await pool.request()
        .input('date_lamokany', sql.Date, date_lamokany)
        .input('nombre', sql.Int, nombre)
        .input('Id_lot_atody', sql.Int, Id_lot_atody)
        .query(`
            INSERT INTO atody_lamokany (date_lamokany, nombre, Id_lot_atody)
            OUTPUT INSERTED.*
            VALUES (@date_lamokany, @nombre, @Id_lot_atody)
        `);
    return result.recordset[0];
}

async function update(id, { date_lamokany, nombre, Id_lot_atody }) {
    const pool = await getPool();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .input('date_lamokany', sql.Date, date_lamokany)
        .input('nombre', sql.Int, nombre)
        .input('Id_lot_atody', sql.Int, Id_lot_atody)
        .query(`
            UPDATE atody_lamokany
            SET date_lamokany = @date_lamokany, nombre = @nombre,
                Id_lot_atody = @Id_lot_atody
            WHERE Id_atody_lamokany = @id;
            SELECT * FROM atody_lamokany WHERE Id_atody_lamokany = @id;
        `);
    return result.recordset[0] || null;
}

async function deleteById(id) {
    const pool = await getPool();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM atody_lamokany WHERE Id_atody_lamokany = @id');
    return result.rowsAffected[0] > 0;
}

/**
 * Calculer le nombre total d'œufs pourris pour des lots d'œufs donnés, jusqu'à une date.
 */
async function sumLamokanyByLotAtodyIdsAndDate(lotAtodyIds, date) {
    const pool = await getPool();
    if (!lotAtodyIds || lotAtodyIds.length === 0) return 0;
    const params = lotAtodyIds.map((_, i) => `@id${i}`).join(',');
    const request = pool.request().input('date', sql.Date, date);
    lotAtodyIds.forEach((id, i) => request.input(`id${i}`, sql.Int, id));
    const result = await request.query(`
        SELECT COALESCE(SUM(nombre), 0) as total
        FROM atody_lamokany
        WHERE Id_lot_atody IN (${params}) AND date_lamokany <= @date
    `);
    return result.recordset[0].total;
}

/**
 * Calculer le nombre total d'œufs pourris pour un lot d'œufs spécifique.
 */
async function getSumByLotAtodyId(idLotAtody) {
    const pool = await getPool();
    const result = await pool.request()
        .input('idLotAtody', sql.Int, idLotAtody)
        .query('SELECT COALESCE(SUM(nombre), 0) as total FROM atody_lamokany WHERE Id_lot_atody = @idLotAtody');
    return result.recordset[0].total;
}

module.exports = { findAll, findById, create, update, deleteById, sumLamokanyByLotAtodyIdsAndDate, getSumByLotAtodyId };
