const db = require('../config/db');

async function createAddress(data) {
  const query = `INSERT INTO user_addresses (user_id, street, number, complement, neighborhood, city, state, cep, full_name, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const [result] = await db.query(query, [data.user_id, data.street, data.number, data.complement, data.neighborhood, data.city, data.state, data.cep, data.full_name, data.phone_number]);
  return { id: result.insertId, user_id: data.user_id, street: data.street, number: data.number, complement: data.complement, neighborhood: data.neighborhood, city: data.city, state: data.state, cep: data.cep, full_name: data.full_name, phone_number: data.phone_number };
}

async function getAddressesByUserId(user_id) {
  const query = `SELECT id, user_id, street, number, complement, neighborhood, city, state, cep, full_name, phone_number FROM user_addresses WHERE user_id = ?`;
  const [rows] = await db.query(query, [user_id]);
  return rows;
}

module.exports = { createAddress, getAddressesByUserId };
