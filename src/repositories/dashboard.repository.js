const pool = require('../config/db');

const getKpis = async () => {
  const [customers, invoices, payments, outstanding] = await Promise.all([
    pool.query(`SELECT COUNT(*) AS count FROM customers`),
    pool.query(`SELECT COUNT(*) AS count FROM sales_invoices`),
    pool.query(`
      SELECT COALESCE(SUM(total_amount), 0) AS total
      FROM sales_invoices WHERE status = 'Paid'
    `),
    pool.query(`
      SELECT COALESCE(SUM(total_amount), 0) AS total
      FROM sales_invoices WHERE status NOT IN ('Paid','Cancelled','Draft')
    `),
  ]);

  return {
    totalCustomers:   Number(customers.rows[0].count),
    totalInvoices:    Number(invoices.rows[0].count),
    paymentsReceived: Number(payments.rows[0].total),
    pendingAmount:    Number(outstanding.rows[0].total),
  };
};

const getSalesExpensesOverview = async () => {
  // last 6 months: Sales (sales_invoices), Receipts (Paid amount), Expenses (expenses table)
  const result = await pool.query(`
    SELECT
      TO_CHAR(month_series, 'Mon') AS month,
      EXTRACT(MONTH FROM month_series) AS month_num,
      COALESCE((
        SELECT SUM(total_amount) FROM sales_invoices
        WHERE DATE_TRUNC('month', invoice_date) = DATE_TRUNC('month', month_series)
      ), 0) AS sales,
      COALESCE((
        SELECT SUM(total_amount) FROM sales_invoices
        WHERE status = 'Paid' AND DATE_TRUNC('month', invoice_date) = DATE_TRUNC('month', month_series)
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

const getRecentInvoices = async () => {
  const result = await pool.query(`
    SELECT invoice_id, customer_name, total_amount, status
    FROM sales_invoices
    ORDER BY created_at DESC
    LIMIT 5
  `);
  return result.rows.map(r => ({
    invoiceNo: r.invoice_id,
    customerName: r.customer_name,
    amount: Number(r.total_amount),
    status: r.status,
  }));
};

module.exports = { getKpis, getSalesExpensesOverview, getRecentInvoices };