const express = require('express');
const router = express.Router();

const { storeOwnerRequired } = require("../middlewares/admin.middleware");
const { authRequired }       = require("../middlewares/auth.middleware");
const upload                 = require('../config/multer');


const productController      = require('../controllers/productController');

router.post('/', authRequired, upload.single('image'), storeOwnerRequired, productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/:slug', productController.getProductBySlug);
router.get('/:id', productController.getProductById);
router.put('/:id', authRequired, upload.single('image'), storeOwnerRequired, productController.updateProduct);
router.delete('/:id', authRequired, productController.deleteProduct);
router.get('/store/:id_store', authRequired, storeOwnerRequired, productController.getProductsByStoreID);

module.exports = router;