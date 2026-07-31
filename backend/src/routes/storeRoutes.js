const express = require('express');
const router = express.Router();

const { authRequired } = require('../middlewares/auth.middleware');
const { adminRequired } = require("../middlewares/admin.middleware");

const storeController = require('../controllers/storeController');

router.post('/', authRequired, storeController.postStore);
router.get('/', storeController.getAllStoresWithProduct);
router.get('/all', storeController.getAllStores);
router.get('/products', storeController.getProductsByStore);
router.get('/active', storeController.getStoreActive);
router.get('/pending', authRequired, adminRequired, storeController.getStorePending);
router.get('/:slug', storeController.getStoreBySlug);
router.put('/:id/approve', authRequired, adminRequired, storeController.approveStore);
router.post('/:id/reprove', authRequired, adminRequired, storeController.reproveStore);

module.exports = router;  
