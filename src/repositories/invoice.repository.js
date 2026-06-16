const pool = require('../config/db');

const invoiceRepository = {

  getAll: async () => {
    const result = await pool.query(
      'SELECT * FROM invoices ORDER BY created_at DESC'
    );
    return result.rows;
  },

  getByToken: async (token) => {
    const result = await pool.query(
      'SELECT * FROM invoices WHERE chairman_token = $1',
      [token]
    );
    return result.rows[0];
  },

  create: async (data) => {
    const {
      invoice_number,
      customer_id,
      customer_name,
      customer_email,
      items,
      subtotal,
      tax_percent,
      tax_amount,
      total_amount,
      due_date,
      notes,
      chairman_token
    } = data;

    const result = await pool.query(
      `INSERT INTO invoices
        (invoice_number, customer_id, customer_name, customer_email,
         items, subtotal, tax_percent, tax_amount, total_amount,
         due_date, notes, chairman_token, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'Pending')
       RETURNING *`,
      [
        invoice_number,
        customer_id,
        customer_name,
        customer_email,
        JSON.stringify(items),
        subtotal,
        tax_percent,
        tax_amount,
        total_amount,
        due_date,
        notes,
        chairman_token
      ]
    );

    return result.rows[0];
  },

  approve: async (token) => {
    const result = await pool.query(
      `UPDATE invoices
       SET status='Approved', approved_at=NOW()
       WHERE chairman_token=$1
       RETURNING *`,
      [token]
    );

    return result.rows[0];
  },

  reject: async (token) => {
    const result = await pool.query(
      `UPDATE invoices
       SET status='Rejected', rejected_at=NOW()
       WHERE chairman_token=$1
       RETURNING *`,
      [token]
    );

    return result.rows[0];
  },

  getStats: async () => {
    const result = await pool.query(`
      SELECT
        COUNT(*) as total_invoices,
        COUNT(CASE WHEN status='Pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status='Approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status='Rejected' THEN 1 END) as rejected,
        SUM(total_amount) as total_amount
      FROM invoices
    `);

    return result.rows[0];
  },
};

module.exports = invoiceRepository;