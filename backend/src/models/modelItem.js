const db = require('../config/db');

async function findPriceByProductId(id_product){
    const query = `SELECT price FROM products WHERE id = $1`;
    const { rows } = await db.query(query, [id_product]);
    return rows.length > 0 ? rows[0].price : null;
}

async function findItemByPurchaseAndProduct(id_purchase, id_product) {
    const query = `SELECT * FROM items WHERE id_purchase = $1 AND id_product = $2`
    const { rows } = await db.query(query, [id_purchase, id_product]);
    return rows.length > 0 ? rows[0] : null;
}

async function createItem(id_product, id_purchase, quantity, price) {
    const query = `
        INSERT INTO items (id_product, id_purchase, quantity, unit_value)
        VALUES ($1, $2, $3, $4)
        RETURNING id_product, id_purchase, quantity, unit_value
    `;
    const { rows } = await db.query(query, [id_product, id_purchase, quantity, price]);
    return { ...rows[0], price: rows[0].unit_value };
}

async function addItemQuantity(id_purchase, id_product, quantity, price) {
    const query = `UPDATE items SET quantity = quantity + $1 WHERE id_purchase = $2 AND id_product = $3`;
    await db.query(query, [quantity, id_purchase, id_product]);
    return { id_product, id_purchase, quantity, price };
}

async function removeItemQuantity(id_purchase, id_product, quantity) {
    const query = `UPDATE items SET quantity = quantity - $1 WHERE id_purchase = $2 AND id_product = $3`;
    await db.query(query, [quantity, id_purchase, id_product]);
    return { id_product, id_purchase, quantity };
}

async function deleteItem(id_purchase, id_product) {
    const query = `DELETE FROM items WHERE id_purchase = $1 AND id_product = $2`;
    await db.query(query, [id_purchase, id_product]);
    return { id_product, id_purchase };
}

async function findItemsByPurchase(id_purchase) {
  const query = `
    SELECT i.*, p.name, p.price AS original_price, p.image 
    FROM items i 
    JOIN products p ON i.id_product = p.id 
    WHERE i.id_purchase = $1
    `;
    const { rows } = await db.query(query, [id_purchase]);
    return rows;
}

module.exports = { createItem, addItemQuantity, removeItemQuantity, findItemByPurchaseAndProduct, deleteItem, findPriceByProductId, findItemsByPurchase }