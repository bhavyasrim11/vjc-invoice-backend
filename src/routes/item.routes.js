const express = require('express');
const router = express.Router();
const itemController = require('../controllers/item.controller');
const { verifyToken } = require('../middlewares/auth.middleware');  // ← ADD

router.get('/',     verifyToken, itemController.getAll);
router.get('/:id',  verifyToken, itemController.getById);
router.post('/',    verifyToken, itemController.create);
router.put('/:id',  verifyToken, itemController.update);
router.delete('/:id', verifyToken, itemController.delete);

module.exports = router;