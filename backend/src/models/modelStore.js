const db = require('../config/db');

async function postStore (id_ownerOrObj, name, slug, niche) {
  // Accept either (id_owner, name, slug, niche) or a single object { id_owner, name, slug, niche }
  let id_owner = id_ownerOrObj;
  if (id_ownerOrObj && typeof id_ownerOrObj === 'object') {
    ({ id_owner, name, slug, niche } = id_ownerOrObj);
  }
  const query = `INSERT INTO stores (id_owner, name, slug, niche, status) VALUES ( ?, ?, ?, ?, 'pending')`;
  const values = [id_owner, name, slug, niche];
  await db.query(query, values);
};

async function getAllStore() {
  const query = `SELECT * FROM stores`;
  const [stores] = await db.query(query);
  return stores;
};

async function getStoreById(id) {
  const query = `SELECT * FROM stores WHERE id = ?`;
  const [store] = await db.query(query, [id]);
  return store;
};

async function getStorePending() {
  const query = `SELECT * FROM stores WHERE status = 'pending'`;
  const [stores] = await db.query(query);
  return stores;
};

async function findStoreBySlug(slug) {  
  const query = `SELECT * FROM stores WHERE slug = ?`;
  const [store] = await db.query(query, [slug]);
  return store;
};

async function approveStore(id) {
  const query = `UPDATE stores SET status = 'approved' WHERE id = ?`;
  await db.query(query, [id]);
};

module.exports = { postStore, getAllStore, getStoreById, getStorePending, findStoreBySlug, approveStore };
