const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/dashboard.controller');

router.get('/kpis',                ctrl.getKpis);
router.get('/sales-overview',      ctrl.getSalesExpensesOverview);
router.get('/recent-invoices',     ctrl.getRecentInvoices);

module.exports = router;