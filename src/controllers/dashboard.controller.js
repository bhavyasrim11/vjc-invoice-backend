const dashboardRepo = require('../repositories/dashboard.repository');

const getKpis = async (req, res) => {
  try {
    const data = await dashboardRepo.getKpis();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getSalesExpensesOverview = async (req, res) => {
  try {
    const data = await dashboardRepo.getSalesExpensesOverview();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getRecentInvoices = async (req, res) => {
  try {
    const data = await dashboardRepo.getRecentInvoices();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getKpis, getSalesExpensesOverview, getRecentInvoices };