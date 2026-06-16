const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/quote.controller');

router.get('/',         ctrl.getQuotes);
router.get('/:id',      ctrl.getQuoteById);
router.post('/',        ctrl.createQuote);
router.put('/:id',      ctrl.updateQuote);
router.patch('/:id/status', ctrl.updateQuoteStatus);
router.delete('/:id',   ctrl.deleteQuote);

module.exports = router;