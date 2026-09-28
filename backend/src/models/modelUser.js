const db = require('../config/db');

async function findUserByEmail(email) {
    const query = `SELECT * FROM users WHERE email = $1`
    const { rows } = await db.query(query, [email]);
    return rows[0];
}

async function createUser(name, email, password) {
    const query = `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'user') RETURNING *`
    const result = await db.query(query, [name, email, password]);
    return result.rows[0];
}

async function getAllUsers() {
    const query = `SELECT * FROM users`;
    const { rows } = await db.query(query);
    return rows;
}

async function getUserById(id) {
    const query = `SELECT * FROM users WHERE id = $1`
    const { rows } = await db.query(query, [id]);
    return rows[0];
}

async function getProfileById(id) {
    const query = `SELECT id, name, email, role FROM users WHERE id = $1`
    const { rows } = await db.query(query, [id]);
    return rows[0];
}

async function updateUser(id, fields) {
    // fields é um objeto com qualquer combinação de: name, email, password, role
    const allowed = ['name', 'email', 'password', 'role'];
    const keys = Object.keys(fields).filter(k => allowed.includes(k));

    if (keys.length === 0) {
        return { affectedRows: 0 };
    }

    const setClause = keys.map((k, index) => `${k} = $${index + 1}`).join(', ');
    const values = keys.map(k => fields[k]);
    values.push(id);

    const query = `UPDATE users SET ${setClause} WHERE id = $${keys.length + 1}`;
    const result = await db.query(query, values);
    return result;
}

async function deleteUser(id) {
    const query = `DELETE FROM users WHERE id = $1`;
    const result = await db.query(query, [id]);
    return result;
}

module.exports = { findUserByEmail, createUser, getAllUsers, getUserById, updateUser, deleteUser, getProfileById }