const express = require('express');
const router = express.Router();

const { authRequired } = require('../middlewares/auth.middleware');
const { storeOwnerRequired } = require("../middlewares/admin.middleware");
const db = require('../config/db');

router.get('/dashboard/:id_store', authRequired, storeOwnerRequired, async (req, res, next) => {
  try {
    const storeId = req.params.id_store;
    
    const [[{ total: totalProducts }]] = await db.query(`
      SELECT COUNT(*) as total
            FROM products p
               , stores s
           where s.id = p.id_store
             and s.id = ?;
    `, [storeId]);
    
    const [[{ total: totalPurchases }]] = await db.query(`
      SELECT COUNT(DISTINCT pu.id) AS total
      FROM purchase pu
      JOIN items i ON pu.id = i.id_purchase
      JOIN products p ON p.id = i.id_product
      WHERE p.id_store = ? AND pu.status = 'fechado'
    `, [storeId]);

    const [[{ total: totalFaturamento }]] = await db.query(`
      SELECT CONCAT('R$ ', FORMAT(SUM(i.quantity * i.unit_value), 2, 'pt_BR')) AS  total
      FROM items i
      JOIN products p ON p.id = i.id_product
      JOIN purchase pu ON pu.id = i.id_purchase
      WHERE p.id_store = ? AND pu.status = 'fechado'
    `, [storeId]);
    
    return res.json({ totalProducts, totalPurchases, totalFaturamento });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
