const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');

router.get('/', invoiceController.getAll);
router.post('/', invoiceController.create);
router.get('/approve/:token', invoiceController.approve);
router.get('/reject/:token', invoiceController.reject);

module.exports = router;