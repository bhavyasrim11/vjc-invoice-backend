const express = require('express');
const router = express.Router();

const customerRoutes = require('./customer.routes');

router.use('/customers', customerRoutes);

module.exports = router;