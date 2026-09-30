const db = require('../config/db');

async function postStore(data) {
  const { id_owner, store_name, slug, niche, description, contact_email, contact_phone, cnpj, logo, banner } = data;
  const query = `
    INSERT INTO stores
      (id_owner, store_name, slug, niche, description, contact_email, contact_phone, cnpj, logo, banner, status)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
    RETURNING *
  `;
  const values = [id_owner, store_name, slug, niche, description, contact_email, contact_phone, cnpj, logo, banner];
  const { rows } = await db.query(query, values);
  return rows[0];
};

async function getAllStores() {
  const query = `SELECT * FROM stores`;
  const { rows: stores } = await db.query(query);
  return stores;
}; 

async function getAllStoresWithProduct() {
  const query = `SELECT s.* FROM stores s WHERE EXISTS (SELECT 1 FROM products p WHERE p.id_store = s.id)`;
  const { rows: stores } = await db.query(query);
  return stores;
};

async function getStorePending() {
  const query = `SELECT * FROM stores WHERE status = 'pending'`;
  const { rows: stores } = await db.query(query);
  return stores;
};

async function findStoreBySlug(slug) {  
  const query = `SELECT * FROM stores WHERE slug = $1`;
  const { rows } = await db.query(query, [slug]);
  return rows[0];
};

async function getStoreActive() {
  const query = `SELECT * FROM stores WHERE status = 'active'`;
  const { rows: stores } = await db.query(query);
  return stores;
};

async function getStoreById(id) {
  const query = `SELECT * FROM stores WHERE id = $1`;
  const { rows } = await db.query(query, [id]);
  return rows[0];
}


async function storesByUser(id) {
  const query = `SELECT * FROM stores WHERE id_owner = $1`;
  const { rows } = await db.query(query, [id]);
  return rows;
}

async function getStoreBySlug(slug) {
  const query = `SELECT * FROM stores WHERE slug = $1`
  const { rows } = await db.query(query, [slug]);
  return rows[0];
}

async function approveStore(id) {
  const query = `UPDATE stores SET status = 'active' WHERE id = $1`;
  const result = await db.query(query, [id]);
  return result;
}

async function reproveStore(id) {
  const query = `UPDATE stores SET status = 'rejected' WHERE id = $1`;
  const result = await db.query(query, [id]);
  return result;
}

async function getProductsByStore() {
  const query = `
    SELECT p.*, s.store_name
      FROM products p
         , stores s
     where s.id = p.id_store;
     `;
  const { rows: products } = await db.query(query);
  return products;
};

async function deleteStore(id) {
  const query = `DELETE FROM stores WHERE id = $1 RETURNING id, store_name`;
  const { rows } = await db.query(query, [id]);
  return rows[0] || null;
}

module.exports = {
  postStore,
  getAllStores,
  getAllStoresWithProduct,
  getStoreById,
  getStorePending,
  getStoreActive,
  getStoreBySlug,
  getProductsByStore,
  findStoreBySlug,
  approveStore,
  reproveStore,
  storesByUser,
  deleteStore
};