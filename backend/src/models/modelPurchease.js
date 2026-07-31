const db = require('../config/db');

async function findOpenPurchaseByUserId(id_user) {
    const query = `SELECT * FROM purchase WHERE id_user = ? AND status = 'aberto'`;
    const [rows] = await db.query(query, [id_user]);
    return rows[0];
}

async function createPurchase(id_user, all_price) {
    const query = `INSERT INTO purchase (id_user, status, all_price) VALUES (?, 'aberto', ?)`
    const [result] = await db.query(query, [id_user, all_price]);
    return { id: result.insertId, id_user, status: 'aberto', all_price };
}

async function findItemByPurchaseAndProduct(id_purchase, id_product) {
    const query = `SELECT * FROM items WHERE id_purchase = ? AND id_product = ?`;
    const [rows] = await db.query(query, [id_purchase, id_product]);
    return rows[0];
}

async function addItemQuantity(id_item, quantity) {
    const query = `UPDATE items SET quantity = ? WHERE id = ?`;
    const [result] = await db.query(query, [quantity, id_item]);
    return result;
}

async function AllPrice(id_purchase) {
    const query = `
      SELECT COALESCE(SUM(quantity * unit_value), 0) AS total_value
      FROM items
      WHERE id_purchase = ?
    `;
    const [rows] = await db.query(query, [id_purchase]);
    return rows.length > 0 ? rows[0].total_value : 0;
}

async function getAllPurchases() {
  const query = `
    SELECT p.*, u.name AS user_name, u.email AS user_email
    FROM purchase p
    JOIN users u ON u.id = p.id_user
    ORDER BY p.datahora DESC
  `;
  const [rows] = await db.query(query);
  return rows;
}

async function updatePurchaseStatus(id, status) {
  const query = `UPDATE purchase SET status = ? WHERE id = ?`;
  const [result] = await db.query(query, [status, id]);
  return result;
}

async function getPurchasesByStore(data) {
  const query = `
    SELECT 
      p.id AS product_id, p.name, p.image, p.price AS product_price,
      i.quantity, i.unit_value,
      pu.id AS purchase_id, pu.id_user, pu.datahora, pu.all_price, pu.status,
      u.name as user_name
    FROM products p
    JOIN items i ON p.id = i.id_product
    JOIN purchase pu ON pu.id = i.id_purchase
    JOIN stores s ON s.id = p.id_store
    JOIN users u ON pu.id_user = u.id
    WHERE pu.status != 'cancelado' AND s.id = ?
  `;
  const [rows] = await db.query(query, [data]);
  return rows;
}

module.exports = {
  findOpenPurchaseByUserId,
  createPurchase,
  findItemByPurchaseAndProduct,
  addItemQuantity,
  AllPrice,
  getAllPurchases,
  updatePurchaseStatus,
  getPurchasesByStore
}
