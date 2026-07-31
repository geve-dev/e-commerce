const express = require('express');
const router = express.Router();

const { authRequired } = require('../middlewares/auth.middleware');
const { adminRequired } = require("../middlewares/admin.middleware");
const { storeOwnerRequired } = require("../middlewares/admin.middleware");

const purchaseController = require('../controllers/purchaseController');

router.post('/', authRequired, purchaseController.createPurchase);
router.post('/checkout', authRequired, purchaseController.checkout);
router.get('/all', authRequired, adminRequired, purchaseController.getAllPurchases);
router.get('/store/:id_store', authRequired, storeOwnerRequired, purchaseController.getPurchasesByStore);
router.put('/:id/status', authRequired, adminRequired, purchaseController.updatePurchaseStatus);
router.delete('/', authRequired, purchaseController.deletePurchase);

module.exports = router;
