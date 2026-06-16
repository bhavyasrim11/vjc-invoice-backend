const pool = require('../config/db');

// 1. Sales by Customer
const salesByCustomer = async () => {
  const result = await pool.query(`
    SELECT
      si.customer_id,
      si.customer_name AS customer,
      COUNT(*) AS invoices,
      COALESCE(SUM(si.total_amount), 0) AS amount,
      COALESCE(SUM(CASE WHEN si.status = 'Paid' THEN si.total_amount ELSE 0 END), 0) AS paid
    FROM sales_invoices si
    GROUP BY si.customer_id, si.customer_name
    ORDER BY amount DESC
  `);
  return result.rows.map(r => ({
    customer: r.customer,
    invoices: Number(r.invoices),
    amount: Number(r.amount),
    paid: Number(r.paid),
    outstanding: Number(r.amount) - Number(r.paid),
  }));
};

// 2. Sales by Item (unnest line_items jsonb)
const salesByItem = async () => {
  const result = await pool.query(`
    SELECT
      item->>'description' AS item,
      SUM((item->>'qty')::numeric) AS qty,
      SUM((item->>'qty')::numeric * (item->>'rate')::numeric) AS amount
    FROM sales_invoices si,
      jsonb_array_elements(si.line_items) AS item
    WHERE si.line_items IS NOT NULL AND jsonb_array_length(si.line_items) > 0
    GROUP BY item->>'description'
    ORDER BY amount DESC
  `);
  return result.rows.map(r => ({
    item: r.item,
    qty: Number(r.qty),
    amount: Number(r.amount),
    avgPrice: Number(r.qty) > 0 ? Math.round(Number(r.amount) / Number(r.qty)) : 0,
  }));
};

// 3. Invoice Details
const invoiceDetails = async () => {
  const result = await pool.query(`
    SELECT invoice_id, customer_name, invoice_date, due_date, total_amount, status
    FROM sales_invoices
    ORDER BY invoice_date DESC
  `);
  return result.rows.map(r => ({
    invoiceNo: r.invoice_id,
    customer: r.customer_name,
    date: r.invoice_date ? r.invoice_date.toISOString().slice(0, 10) : '',
    dueDate: r.due_date ? r.due_date.toISOString().slice(0, 10) : '',
    amount: Number(r.total_amount),
    status: r.status,
  }));
};

// 4. Quote Details
const quoteDetails = async () => {
  const result = await pool.query(`
    SELECT quote_id, customer_name, quote_date, expiry_date, total_amount, status
    FROM quotes
    ORDER BY quote_date DESC
  `);
  return result.rows.map(r => ({
    quoteNo: r.quote_id,
    customer: r.customer_name,
    date: r.quote_date ? r.quote_date.toISOString().slice(0, 10) : '',
    expiryDate: r.expiry_date ? r.expiry_date.toISOString().slice(0, 10) : '',
    amount: Number(r.total_amount),
    status: r.status,
  }));
};

// 5. Payments Received
const paymentsReceived = async () => {
  const result = await pool.query(`
    SELECT p.paid_date, c.name AS customer_name, p.invoice_id, p.payment_method, p.amount_received
    FROM payments p
    LEFT JOIN customers c ON c.customer_id = p.customer_id
    WHERE p.amount_received IS NOT NULL AND p.amount_received > 0
    ORDER BY p.paid_date DESC
  `);
  return result.rows.map(r => ({
    date: r.paid_date ? new Date(r.paid_date).toISOString().slice(0, 10) : '',
    customer: r.customer_name || '—',
    invoiceNo: r.invoice_id || '—',
    mode: r.payment_method || '—',
    amount: Number(r.amount_received || 0),
  }));
};

// 6. AR Aging Summary
const arAgingSummary = async () => {
  const result = await pool.query(`
    SELECT
      customer_name AS customer,
      COALESCE(SUM(CASE WHEN due_date >= CURRENT_DATE THEN total_amount ELSE 0 END), 0) AS current,
      COALESCE(SUM(CASE WHEN due_date < CURRENT_DATE AND (CURRENT_DATE - due_date) <= 30 THEN total_amount ELSE 0 END), 0) AS days30,
      COALESCE(SUM(CASE WHEN (CURRENT_DATE - due_date) > 30 AND (CURRENT_DATE - due_date) <= 60 THEN total_amount ELSE 0 END), 0) AS days60,
      COALESCE(SUM(CASE WHEN (CURRENT_DATE - due_date) > 60 THEN total_amount ELSE 0 END), 0) AS days90,
      COALESCE(SUM(total_amount), 0) AS total
    FROM sales_invoices
    WHERE status NOT IN ('Paid','Cancelled','Draft')
    GROUP BY customer_name
    ORDER BY total DESC
  `);
  return result.rows.map(r => ({
    customer: r.customer,
    current: Number(r.current),
    days30: Number(r.days30),
    days60: Number(r.days60),
    days90: Number(r.days90),
    total: Number(r.total),
  }));
};

// 7. Customer Balance Summary
const customerBalanceSummary = async () => {
  const result = await pool.query(`
    SELECT customer_id, name, outstanding, total_payments
    FROM customers
    ORDER BY outstanding DESC
  `);
  return result.rows.map(r => ({
    customerId: r.customer_id,
    customer: r.name,
    outstanding: Number(r.outstanding || 0),
    totalPayments: Number(r.total_payments || 0),
  }));
};

module.exports = {
  salesByCustomer,
  salesByItem,
  invoiceDetails,
  quoteDetails,
  paymentsReceived,
  arAgingSummary,
  customerBalanceSummary,
};