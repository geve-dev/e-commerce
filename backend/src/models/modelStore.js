const db = require('../config/db');

async function postStore(data) {
  const { id_owner, store_name, slug, niche, description, contact_email, contact_phone, cnpj, logo, banner } = data;
  const query = `INSERT INTO stores (id_owner, store_name, slug, niche, description, contact_email, contact_phone, cnpj, logo, banner, status) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`;
  const values = [id_owner, store_name, slug, niche, description, contact_email, contact_phone, cnpj, logo, banner];
  await db.query(query, values);
};

async function getAllStores() {
  const query = `SELECT * FROM stores`;
  const [stores] = await db.query(query);
  return stores;
}; 

async function getAllStoresWithProduct() {
  const query = `SELECT s.* FROM stores s WHERE EXISTS (SELECT 1 FROM products p WHERE p.id_store = s.id)`;
  const [stores] = await db.query(query);
  return stores;
};

async function getStorePending() {
  const query = `SELECT * FROM stores WHERE status = 'pending'`;
  const [stores] = await db.query(query);
  return stores;
};

async function findStoreBySlug(slug) {  
  const query = `SELECT * FROM stores WHERE slug = ?`;
  const [[store]] = await db.query(query, [slug]);
  return store;
};

async function approveStore(id) {
  const query = `UPDATE stores SET status = 'approved' WHERE id = ?`;
  const [result] = await db.query(query, [id]);
  return result;
};

async function getStoreActive() {
  const query = `SELECT * FROM stores WHERE status = 'active'`;
  const [stores] = await db.query(query);
  return stores;
};

async function getStoreById(id) {
  const query = `SELECT * FROM stores WHERE id = ?`;
  const [[store]] = await db.query(query, [id]);
  return store;
}


async function storesByUser(id) {
  const query = `SELECT * FROM stores WHERE id_owner = ?`;
  const[result] = await db.query(query, [id]);
  return result;
}

async function getStoreBySlug(slug) {
  const query = `SELECT * FROM stores WHERE slug = ?`
  const [[store]] = await db.query(query, [slug]);
  return store;
}

async function approveStore(id) {
  const query = `UPDATE stores SET status = 'active' WHERE id = ?`;
  const [result] = await db.query(query, [id]);
  return result;
}

async function reproveStore(id) {
  const query = `UPDATE stores SET status = 'rejected' WHERE id = ?`;
  const [result] = await db.query(query, [id]);
  return result;
}

async function getProductsByStore() {
  const query = `
    SELECT p.*, s.store_name
      FROM products p
         , stores s
     where s.id = p.id_store;
     `;
  const [products] = await db.query(query);
  return products;
};

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
  storesByUser
};