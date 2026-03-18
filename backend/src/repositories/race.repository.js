const { sql, getPool } = require('../config/database');

async function findAll() {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM race');
    return result.recordset;
}

async function findById(id) {
    const pool = await getPool();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM race WHERE Id_race = @id');
    return result.recordset[0] || null;
}

async function create({ nom, prix_sakafo, prix_vente_lahy, prix_vente_vavy, prix_vente_atody, nombre_jour_foy, capacite_pondaison }) {
    const pool = await getPool();
    const result = await pool.request()
        .input('nom', sql.VarChar(50), nom)
        .input('prix_sakafo', sql.Float, prix_sakafo)
        .input('prix_vente_lahy', sql.Float, prix_vente_lahy)
        .input('prix_vente_vavy', sql.Float, prix_vente_vavy)
        .input('prix_vente_atody', sql.Float, prix_vente_atody)
        .input('nombre_jour_foy', sql.Int, nombre_jour_foy)
        .input('capacite_pondaison', sql.Int, capacite_pondaison)
        .query(`
            INSERT INTO race (nom, prix_sakafo, prix_vente_lahy, prix_vente_vavy, prix_vente_atody, nombre_jour_foy, capacite_pondaison)
            OUTPUT INSERTED.*
            VALUES (@nom, @prix_sakafo, @prix_vente_lahy, @prix_vente_vavy, @prix_vente_atody, @nombre_jour_foy, @capacite_pondaison)
        `);
    return result.recordset[0];
}

async function update(id, { nom, prix_sakafo, prix_vente_lahy, prix_vente_vavy, prix_vente_atody, nombre_jour_foy, capacite_pondaison }) {
    const pool = await getPool();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .input('nom', sql.VarChar(50), nom)
        .input('prix_sakafo', sql.Float, prix_sakafo)
        .input('prix_vente_lahy', sql.Float, prix_vente_lahy)
        .input('prix_vente_vavy', sql.Float, prix_vente_vavy)
        .input('prix_vente_atody', sql.Float, prix_vente_atody)
        .input('nombre_jour_foy', sql.Int, nombre_jour_foy)
        .input('capacite_pondaison', sql.Int, capacite_pondaison)
        .query(`
            UPDATE race
            SET nom = @nom, prix_sakafo = @prix_sakafo,
                prix_vente_lahy = @prix_vente_lahy, prix_vente_vavy = @prix_vente_vavy,
                prix_vente_atody = @prix_vente_atody,
                nombre_jour_foy = @nombre_jour_foy, capacite_pondaison = @capacite_pondaison
            WHERE Id_race = @id;
            SELECT * FROM race WHERE Id_race = @id;
        `);
    return result.recordset[0] || null;
}

async function deleteById(id) {
    const pool = await getPool();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM race WHERE Id_race = @id');
    return result.rowsAffected[0] > 0;
}

module.exports = { findAll, findById, create, update, deleteById };
