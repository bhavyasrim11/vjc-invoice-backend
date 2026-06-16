const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/report.controller');

router.get('/sales-by-customer',        ctrl.salesByCustomer);
router.get('/sales-by-item',            ctrl.salesByItem);
router.get('/invoice-details',          ctrl.invoiceDetails);
router.get('/quote-details',            ctrl.quoteDetails);
router.get('/payments-received',        ctrl.paymentsReceived);
router.get('/ar-aging-summary',         ctrl.arAgingSummary);
router.get('/customer-balance-summary', ctrl.customerBalanceSummary);

module.exports = router;