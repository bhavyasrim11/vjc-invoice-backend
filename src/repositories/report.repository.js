const pool = require('../config/db');

// 1. Sales by Customer
const salesByCustomer = async () => {
  const result = await pool.query(`
    SELECT
      i.customer_name AS customer,
      COUNT(i.id) AS invoices,
      COALESCE(SUM(i.total_amount), 0) AS amount,
      COALESCE(SUM(p.amount_received), 0) AS paid
    FROM invoices i
    LEFT JOIN payments p
      ON p.customer_name = i.customer_name
    GROUP BY i.customer_name
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
      CASE
        WHEN items->0->>'description' IS NULL
             OR TRIM(items->0->>'description') = ''
        THEN 'Visa Service'
        ELSE items->0->>'description'
      END AS item,
      COUNT(*) AS qty,
      COALESCE(SUM(total_amount), 0) AS amount
    FROM invoices
    GROUP BY item
    ORDER BY amount DESC
  `);

  return result.rows.map(r => ({
    item: r.item,
    qty: Number(r.qty),
    amount: Number(r.amount),
    avgPrice:
      Number(r.qty) > 0
        ? Math.round(Number(r.amount) / Number(r.qty))
        : 0,
  }));
};

// 3. Invoice Details
const invoiceDetails = async () => {
  const result = await pool.query(`
    SELECT
      invoice_number,
      customer_name,
      invoice_date,
      due_date,
      total_amount,
      status
    FROM invoices
    ORDER BY created_at DESC
  `);

  return result.rows.map(r => ({
    invoiceNo: r.invoice_number,
    customer: r.customer_name,
    date: r.invoice_date
      ? new Date(r.invoice_date).toISOString().slice(0, 10)
      : '',
    dueDate: r.due_date
      ? new Date(r.due_date).toISOString().slice(0, 10)
      : '',
    amount: Number(r.total_amount || 0),
    status: r.status || '',
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