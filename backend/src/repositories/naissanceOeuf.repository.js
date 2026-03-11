const { sql, getPool } = require('../config/database');

async function findAll() {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM naissance_oeuf');
    return result.recordset;
}

async function findById(id) {
    const pool = await getPool();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM naissance_oeuf WHERE Id_naissance_oeuf = @id');
    return result.recordset[0] || null;
}

async function create({ nombre_poussin, date_naissance, Id_lot_atody }) {
    const pool = await getPool();
    const result = await pool.request()
        .input('nombre_poussin', sql.Int, nombre_poussin)
        .input('date_naissance', sql.Date, date_naissance)
        .input('Id_lot_atody', sql.Int, Id_lot_atody)
        .query(`
            INSERT INTO naissance_oeuf (nombre_poussin, date_naissance, Id_lot_atody)
            OUTPUT INSERTED.*
            VALUES (@nombre_poussin, @date_naissance, @Id_lot_atody)
        `);
    return result.recordset[0];
}

async function update(id, { nombre_poussin, date_naissance, Id_lot_atody }) {
    const pool = await getPool();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .input('nombre_poussin', sql.Int, nombre_poussin)
        .input('date_naissance', sql.Date, date_naissance)
        .input('Id_lot_atody', sql.Int, Id_lot_atody)
        .query(`
            UPDATE naissance_oeuf
            SET nombre_poussin = @nombre_poussin, date_naissance = @date_naissance,
                Id_lot_atody = @Id_lot_atody
            WHERE Id_naissance_oeuf = @id;
            SELECT * FROM naissance_oeuf WHERE Id_naissance_oeuf = @id;
        `);
    return result.recordset[0] || null;
}

async function deleteById(id) {
    const pool = await getPool();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM naissance_oeuf WHERE Id_naissance_oeuf = @id');
    return result.rowsAffected[0] > 0;
}

/**
 * Calculer le nombre total de poussins nés pour des lots d'oeufs donnés, jusqu'à une date.
 */
async function sumNaissanceByLotAtodyIdsAndDate(lotAtodyIds, date) {
    const pool = await getPool();
    if (!lotAtodyIds || lotAtodyIds.length === 0) return 0;
    const params = lotAtodyIds.map((_, i) => `@id${i}`).join(',');
    const request = pool.request().input('date', sql.Date, date);
    lotAtodyIds.forEach((id, i) => request.input(`id${i}`, sql.Int, id));
    const result = await request.query(`
        SELECT COALESCE(SUM(nombre_poussin), 0) as total
        FROM naissance_oeuf
        WHERE Id_lot_atody IN (${params}) AND date_naissance <= @date
    `);
    return result.recordset[0].total;
}

module.exports = { findAll, findById, create, update, deleteById, sumNaissanceByLotAtodyIdsAndDate };
