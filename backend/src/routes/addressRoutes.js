const express = require('express');
const router = express.Router();

const { authRequired } = require("../middlewares/auth.middleware");

const addressController = require('../controllers/addressController');

router.get('/', authRequired, addressController.getAddressesById);
router.get('/cep', authRequired, addressController.getAddressByCep);
router.post('/', authRequired, addressController.createAddress);
router.put('/', authRequired, addressController.updateAddress);
router.delete('/', authRequired, addressController.deleteAddress);

module.exports = router;