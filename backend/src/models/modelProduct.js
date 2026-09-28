const db = require('../config/db');

async function createProduct(name, description, price, stock, image, id_store, category, slug) {
    const query = `INSERT INTO products (name, description, price, stock, image, id_store, category, slug, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active') RETURNING id`
    const result = await db.query(query, [name, description, price, stock, image, id_store, category, slug]);
    return { id: result.rows[0].id, name, description, price, stock, image, id_store, category, slug, status: 'active' };
}

async function getAllProducts() {
    const query = `SELECT * FROM products`
    const { rows } = await db.query(query);
    return rows;
}

async function getProductById(id) {
    const query = `SELECT * FROM products WHERE id = $1`
    const { rows } = await db.query(query, [id]);
    return rows;
}

async function updateProduct(id, name, description, price, stock, id_store, category, slug, image) {
    const query = `UPDATE products SET name = $1, description = $2, price = $3, stock = $4, id_store = $5, category = $6, slug = $7, image = $8 WHERE id = $9`
    await db.query(query, [name, description, price, stock, id_store, category, slug, image, id]);
    return { id, name, description, price, stock, image, id_store, category, slug };
}

async function deleteProduct(id) {
    await db.query(`DELETE FROM items WHERE id_product = $1`, [id]);
    const query = `DELETE FROM products WHERE id = $1`
    await db.query(query, [id]);
    return { id };
}

async function getProductsByStore(data) {
  const query = `
    SELECT p.*, s.*, p.slug as product_slug, p.id as product_id
      FROM products p
         , stores s
     where s.id = p.id_store
       and s.id = $1;
     `;
  const { rows: products } = await db.query(query, [data]);
  return products;
};

async function findProductBySlug(slug) {
  const query = `SELECT * FROM products WHERE slug = $1`;
  const { rows } = await db.query(query, [slug]);
  return rows[0];
}

async function findProductBySlugAndId(slug, id) {
  const query = `SELECT * FROM products WHERE slug = $1 AND id != $2`;
  const { rows } = await db.query(query, [slug, id]);
  return rows[0];
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