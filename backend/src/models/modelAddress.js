const db = require('../config/db');

async function createAddress(data) {
  const query = `
    INSERT INTO user_addresses
      (user_id, state, city, cep, neighborhood, street, number, complement, address_name, full_name, phone_number)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING id
  `;
  const result = await db.query(query, [
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
    id: result.rows[0].id,
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
    WHERE user_id = $1
  `;
  const { rows } = await db.query(query, [user_id]);
  return rows;
}

async function userAddressesExists(data) {
  const query = `
    SELECT id FROM user_addresses
    WHERE user_id = $1
      AND (address_name = $2 OR $3 IS NULL)
      AND street = $4
      AND number = $5
      AND complement IS NOT DISTINCT FROM $6
      AND neighborhood = $7
      AND city = $8
      AND state = $9
      AND cep = $10
      AND full_name = $11
      AND phone_number = $12
  `;
  const addressName = data.address_name || null;
  const { rows } = await db.query(query, [
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

  const setClause = keys.map((k, index) => `${k} = $${index + 1}`).join(', ');
  const values = keys.map((k) => fields[k]);
  values.push(user_id, id);

  const query = `UPDATE user_addresses SET ${setClause} WHERE user_id = $${keys.length + 1} AND id = $${keys.length + 2}`;
  const result = await db.query(query, values);
  return result;
}

async function deleteAddress(id, user_id) {
  const query = `DELETE FROM user_addresses WHERE id = $1 AND user_id = $2`;
  const result = await db.query(query, [id, user_id]);
  return result;
}

module.exports = { createAddress, getAddressesByUserId, userAddressesExists, updateAddress, deleteAddress };
