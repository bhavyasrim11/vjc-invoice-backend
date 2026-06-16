const reportRepo = require('../repositories/report.repository');

const wrap = (fn) => async (req, res) => {
  try {
    const data = await fn();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  salesByCustomer:        wrap(reportRepo.salesByCustomer),
  salesByItem:            wrap(reportRepo.salesByItem),
  invoiceDetails:         wrap(reportRepo.invoiceDetails),
  quoteDetails:           wrap(reportRepo.quoteDetails),
  paymentsReceived:       wrap(reportRepo.paymentsReceived),
  arAgingSummary:         wrap(reportRepo.arAgingSummary),
  customerBalanceSummary: wrap(reportRepo.customerBalanceSummary),
};