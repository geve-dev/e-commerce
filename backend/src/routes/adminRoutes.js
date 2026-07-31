const express = require('express');
const router = express.Router();

const { authRequired } = require('../middlewares/auth.middleware');
const { adminRequired } = require("../middlewares/admin.middleware");
const db = require('../config/db');

router.get('/dashboard', authRequired, adminRequired, async (req, res, next) => {
  try {
    const [[{ total: totalStores }]] = await db.query('SELECT COUNT(*) AS total FROM stores');
    const [[{ total: totalUsers }]] = await db.query('SELECT COUNT(*) AS total FROM users');
    const [[{ total: totalProducts }]] = await db.query('SELECT COUNT(*) AS total FROM products');
    const [[{ total: totalPurchases }]] = await db.query('SELECT COUNT(*) AS total FROM purchase');

    return res.json({ totalStores, totalUsers, totalProducts, totalPurchases });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
