const db = require('../config/db');

async function createProduct(name, description, price, stock, image, id_store, category, slug) {
    const query = `INSERT INTO products (name, description, price, stock, image, id_store, category, slug, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`
    const [result] = await db.query(query, [name, description, price, stock, image, id_store, category, slug]);
    return { id: result.insertId, name, description, price, stock, image, id_store, category, slug, status: 'active' };
}

async function getAllProducts() {
    const query = `SELECT * FROM products`
    const [rows] = await db.query(query);
    return rows;
}

async function getProductById(id) {
    const query = `SELECT * FROM products WHERE id = ?`
    const [rows] = await db.query(query, [id]);
    return rows;
}

async function updateProduct(id, name, description, price, stock, id_store, category, slug, image) {
    const query = `UPDATE products SET name = ?, description = ?, price = ?, stock = ?, id_store = ?, category = ?, slug = ?, image = ? WHERE id = ?`
    const [result] = await db.query(query, [name, description, price, stock, id_store, category, slug, image, id]);
    return { id: result.insertId, id, name, description, price, stock, image, id_store, category, slug };
}

async function deleteProduct(id) {
    await db.query(`DELETE FROM items WHERE id_product = ?`, [id]);
    const query = `DELETE FROM products WHERE id = ?`
    const [result] = await db.query(query, [id]);
    return { id: result.insertId, id };
}

async function getProductsByStore(data) {
  const query = `
    SELECT p.*, s.*, p.slug as product_slug, p.id as product_id
      FROM products p
         , stores s
     where s.id = p.id_store
       and s.id = ?;
     `;
  const [products] = await db.query(query, [data]);
  return products;
};

async function findProductBySlug(slug) {
  const query = `SELECT * FROM products WHERE slug = ?`;
  const [[rows]] = await db.query(query, [slug]);
  return rows;
}

async function findProductBySlugAndId(slug, id) {
  const query = `SELECT * FROM products WHERE slug = ? AND id != ?`;
  const [[rows]] = await db.query(query, [slug, id]);
  return rows;
}


module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByStore,
  findProductBySlug,
  findProductBySlugAndId
};