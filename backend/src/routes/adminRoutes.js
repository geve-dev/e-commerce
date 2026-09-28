const express = require('express');
const router = express.Router();

const { authRequired } = require('../middlewares/auth.middleware');
const { adminRequired } = require("../middlewares/admin.middleware");
const db = require('../config/db');

router.get('/dashboard', authRequired, adminRequired, async (req, res, next) => {
  try {
    const { rows: storesRows } = await db.query('SELECT COUNT(*) AS total FROM stores');
    const { rows: usersRows } = await db.query('SELECT COUNT(*) AS total FROM users');
    const { rows: productsRows } = await db.query('SELECT COUNT(*) AS total FROM products');
    const { rows: purchasesRows } = await db.query('SELECT COUNT(*) AS total FROM purchase');

    const totalStores = storesRows[0].total;
    const totalUsers = usersRows[0].total;
    const totalProducts = productsRows[0].total;
    const totalPurchases = purchasesRows[0].total;

    return res.json({ totalStores, totalUsers, totalProducts, totalPurchases });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
