const db = require('../config/db');

async function createAddress(data) {
  // 11 colunas → 11 placeholders
  const query = `
    INSERT INTO user_addresses
      (user_id, state, city, cep, neighborhood, street, number, complement, address_name, full_name, phone_number)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const [result] = await db.query(query, [
    data.user_id,
    data.state,
    data.city,
    data.cep,
    data.neighborhood,
    data.street,
    data.number,
    data.complement ?? null,
    data.address_name || null,
    data.full_name,
    data.phone_number,
  ]);
  return {
    id: result.insertId,
    user_id: data.user_id,
    state: data.state,
    city: data.city,
    cep: data.cep,
    neighborhood: data.neighborhood,
    street: data.street,
    number: data.number,
    complement: data.complement ?? null,
    address_name: data.address_name || null,
    full_name: data.full_name,
    phone_number: data.phone_number,
  };
}

async function getAddressesByUserId(user_id) {
  const query = `
    SELECT id, user_id, address_name, state, city, cep, neighborhood, street, number, complement, full_name, phone_number
    FROM user_addresses
    WHERE user_id = ?
  `;
  const [rows] = await db.query(query, [user_id]);
  return rows;
}

async function userAddressesExists(data) {
  // (address_name = ? OR ? IS NULL) usa o address_name duas vezes
  const query = `
    SELECT id FROM user_addresses
    WHERE user_id = ?
      AND (address_name = ? OR ? IS NULL)
      AND street = ?
      AND number = ?
      AND complement <=> ?
      AND neighborhood = ?
      AND city = ?
      AND state = ?
      AND cep = ?
      AND full_name = ?
      AND phone_number = ?
  `;
  const addressName = data.address_name || null;
  const [rows] = await db.query(query, [
    data.user_id,
    addressName,
    addressName,
    data.street,
    data.number,
    data.complement ?? null,
    data.neighborhood,
    data.city,
    data.state,
    data.cep,
    data.full_name,
    data.phone_number,
  ]);
  return rows.length > 0;
}

async function updateAddress(user_id, id, fields) {
  const allowed = [
    'street',
    'number',
    'complement',
    'neighborhood',
    'city',
    'state',
    'cep',
    'address_name',
    'full_name',
    'phone_number',
  ];
  const keys = Object.keys(fields).filter((k) => allowed.includes(k));

  if (keys.length === 0) {
    return { affectedRows: 0 };
  }

  const setClause = keys.map((k) => `${k} = ?`).join(', ');
  const values = keys.map((k) => fields[k]);
  values.push(user_id, id);

  const query = `UPDATE user_addresses SET ${setClause} WHERE user_id = ? AND id = ?`;
  const [result] = await db.query(query, values);
  return result;
}

async function deleteAddress(id, user_id) {
  const query = `DELETE FROM user_addresses WHERE id = ? AND user_id = ?`;
  const [result] = await db.query(query, [id, user_id]);
  return result;
}

module.exports = { createAddress, getAddressesByUserId, userAddressesExists, updateAddress, deleteAddress };
