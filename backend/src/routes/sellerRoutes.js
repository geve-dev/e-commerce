const express = require('express');
const router = express.Router();

const { authRequired } = require('../middlewares/auth.middleware');
const { storeOwnerRequired } = require("../middlewares/admin.middleware");
const db = require('../config/db');

router.get('/dashboard/:id_store', authRequired, storeOwnerRequired, async (req, res, next) => {
  try {
    const storeId = req.params.id_store;
    
    const { rows: productRows } = await db.query(`
      SELECT COUNT(*) as total
            FROM products p
               , stores s
           where s.id = p.id_store
             and s.id = $1;
    `, [storeId]);
    const totalProducts = productRows[0].total;
    
    const { rows: purchaseRows } = await db.query(`
      SELECT COUNT(DISTINCT pu.id) AS total
      FROM purchase pu
      JOIN items i ON pu.id = i.id_purchase
      JOIN products p ON p.id = i.id_product
      WHERE p.id_store = $1 AND pu.status = 'fechado'
    `, [storeId]);
    const totalPurchases = purchaseRows[0].total;

    const { rows: revenueRows } = await db.query(`
      SELECT COALESCE(SUM(i.quantity * i.unit_value), 0) AS total
      FROM items i
      JOIN products p ON p.id = i.id_product
      JOIN purchase pu ON pu.id = i.id_purchase
      WHERE p.id_store = $1 AND pu.status = 'fechado'
    `, [storeId]);
    const totalFaturamento = Number(revenueRows[0].total).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    
    return res.json({ totalProducts, totalPurchases, totalFaturamento });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
