const express = require('express');
const router = express.Router();
const itemController = require('../controllers/item.controller');
const { verifyToken, chairmanOnly } = require('../middlewares/auth.middleware');  // ← ADD

router.get('/',     verifyToken, itemController.getAll);
router.get('/:id',  verifyToken, itemController.getById);
router.post('/',    verifyToken, chairmanOnly, itemController.create);
router.put('/:id',  verifyToken, chairmanOnly, itemController.update);
router.delete('/:id', verifyToken, chairmanOnly, itemController.delete);

module.exports = router;