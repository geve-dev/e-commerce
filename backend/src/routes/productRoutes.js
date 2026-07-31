const express = require('express');
const router = express.Router();

const { authRequired } = require("../middlewares/auth.middleware");
const { modOrAdminRequired } = require("../middlewares/admin.middleware");
const { storeOwnerRequired } = require("../middlewares/admin.middleware");

const productController = require('../controllers/productController');

router.post('/', authRequired, storeOwnerRequired, productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.put('/:id', authRequired, modOrAdminRequired, storeOwnerRequired, productController.updateProduct);
router.delete('/:id', authRequired, modOrAdminRequired, storeOwnerRequired, productController.deleteProduct);
router.get('/store/:id_store', authRequired, storeOwnerRequired, productController.getProductsByStoreID);

module.exports = router;