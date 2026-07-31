const express = require('express');
const router = express.Router();

const { authRequired } = require("../middlewares/auth.middleware")
const { adminRequired } = require("../middlewares/admin.middleware")

const userController = require("../controllers/userController")
const storeController = require('../controllers/storeController');

router.get("/", authRequired, userController.getAllUsers);
router.get("/me", authRequired, userController.getMyProfile);
router.get("/:id", authRequired, adminRequired, userController.getUserById);
router.get('/:id/stores', storeController.getStoresByUser);

router.put("/me", authRequired, userController.updateUser);
router.delete("/me", authRequired, userController.deleteUser);

router.put("/:id", authRequired, adminRequired, userController.updateUser);
router.delete("/:id", authRequired, adminRequired, userController.deleteUser);

module.exports = router;