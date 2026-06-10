const express = require('express');
const router = express.Router();

const { authRequired } = require('../middlewares/auth.middleware');
const { modOrAdminRequired } = require("../middlewares/admin.middleware");

const storeController = require('../controllers/storeController');

router.post('/', authRequired, storeController.postStore);
router.get('/', authRequired, storeController.getAllStore);
router.get('/pending', authRequired, modOrAdminRequired, storeController.getStorePending);

module.exports = router;