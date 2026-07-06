const pool = require('../config/db');

const getKpis = async (role, userId) => {
  const filter = role === 'chairman'
    ? ''
    : `AND created_by = ${userId}`;

  const customerFilter = role === 'chairman'
    ? ''
    : `WHERE created_by = ${userId}`;

  const [customers, invoices, payments, outstanding] = await Promise.all([
    pool.query(`SELECT COUNT(*) AS count FROM customers ${customerFilter}`),
    pool.query(`SELECT COUNT(*) AS count FROM invoices WHERE 1=1 ${filter}`),

    // ✅ FIXED: latest approved invoice per customer — paid_amount
    pool.query(`
      SELECT COALESCE(SUM(latest.paid_amount), 0) AS total
      FROM (
        SELECT DISTINCT ON (customer_id)
          customer_id, paid_amount
        FROM invoices
        WHERE status = 'Approved' ${filter}
        ORDER BY customer_id, id DESC
      ) latest
    `),

    // ✅ FIXED: latest approved invoice per customer — balance_amount
    pool.query(`
      SELECT COALESCE(SUM(latest.balance_amount), 0) AS total
      FROM (
        SELECT DISTINCT ON (customer_id)
          customer_id, balance_amount
        FROM invoices
        WHERE status = 'Approved' ${filter}
        ORDER BY customer_id, id DESC
      ) latest
      WHERE latest.balance_amount > 0
    `),
  ]);

  return {
    totalCustomers:   Number(customers.rows[0].count),
    totalInvoices:    Number(invoices.rows[0].count),
    paymentsReceived: Number(payments.rows[0].total),
    pendingAmount:    Number(outstanding.rows[0].total),
  };
};

const getSalesExpensesOverview = async (role, userId) => {
  const isChairman = role === 'chairman';
  const filter = isChairman ? '' : `AND created_by = '${userId}'`;

  const result = await pool.query(`
    SELECT
      TO_CHAR(month_series, 'Mon') AS month,
      EXTRACT(MONTH FROM month_series) AS month_num,
      COALESCE((
        SELECT SUM(grand_total) FROM invoices
        WHERE DATE_TRUNC('month', invoice_date) = DATE_TRUNC('month', month_series)
        ${filter}
      ), 0) AS sales,
      COALESCE((
        SELECT SUM(paid_amount) FROM invoices
        WHERE status = 'Approved' AND DATE_TRUNC('month', invoice_date) = DATE_TRUNC('month', month_series)
        ${filter}
      ), 0) AS receipts,
      COALESCE((
        SELECT SUM(amount) FROM expenses
        WHERE DATE_TRUNC('month', date) = DATE_TRUNC('month', month_series)
      ), 0) AS expenses
    FROM generate_series(
      DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months',
      DATE_TRUNC('month', CURRENT_DATE),
      INTERVAL '1 month'
    ) AS month_series
    ORDER BY month_series
  `);

  const rows = result.rows.map(r => ({
    month: r.month,
    sales: Number(r.sales),
    receipts: Number(r.receipts),
    expenses: Number(r.expenses),
  }));

  const totals = rows.reduce((acc, r) => ({
    totalSales: acc.totalSales + r.sales,
    totalReceipts: acc.totalReceipts + r.receipts,
    totalExpenses: acc.totalExpenses + r.expenses,
  }), { totalSales: 0, totalReceipts: 0, totalExpenses: 0 });

  return { chart: rows, ...totals };
};

const getRecentInvoices = async (role, userId) => {
  const filter = role === 'chairman'
    ? ''
    : `WHERE created_by = ${userId}`;

  const result = await pool.query(`
    SELECT invoice_number, customer_name, grand_total, status
    FROM invoices
    ${filter}
    ORDER BY created_at DESC
    LIMIT 5
  `);

  return result.rows.map(r => ({
    invoiceNo: r.invoice_number,
    customerName: r.customer_name,
    amount: Number(r.grand_total),
    status: r.status,
  }));
};

module.exports = { getKpis, getSalesExpensesOverview, getRecentInvoices };