const pool = require('../config/db');

const getAllQuotes = async ({ role, userId } = {}) => {
  let query = 'SELECT * FROM quotes';
  const vals = [];
  // if (role !== 'chairman' && userId) {
//   query += ' WHERE created_by = $1';
//   vals.push(userId);
// }
  query += ' ORDER BY id DESC';
  const result = await pool.query(query, vals);
  return result.rows;
};
const getQuoteById = async (id) => {
  const result = await pool.query(
    'SELECT * FROM quotes WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

const createQuote = async (data) => {
  const {
    quote_id,
    customer_id,
    customer_name,
    customer_email,
    salesperson,
    quote_date,
    expiry_date,
    subtotal,
    gst,
    total_amount,
    notes,
    status
  } = data;

  const result = await pool.query(
`INSERT INTO quotes
(quote_id, customer_id, customer_name, salesperson,
 quote_date, expiry_date, total_amount, status, notes)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
RETURNING *`,
[
  quote_id,
  customer_id,
  customer_name,
  salesperson || null,
  quote_date,
  expiry_date,
  total_amount || 0,
  status || 'Draft',
  notes || null
]
  );

  return result.rows[0];
};

const updateQuote = async (id, data) => {
  const {
    customer_id,
    customer_name,
    customer_email,
    salesperson,
    quote_date,
    expiry_date,
    subtotal,
    gst,
    total_amount,
    notes,
    status
  } = data;

  const result = await pool.query(
    `UPDATE quotes SET
      customer_id=$1,
      customer_name=$2,
      customer_email=$3,
      salesperson=$4,
      quote_date=$5,
      expiry_date=$6,
      subtotal=$7,
      gst=$8,
      total_amount=$9,
      notes=$10,
      status=$11
    WHERE id=$12
    RETURNING *`,
    [
      customer_id,
      customer_name,
      customer_email,
      salesperson,
      quote_date,
      expiry_date,
      subtotal,
      gst,
      total_amount,
      notes,
      status,
      id
    ]
  );

  return result.rows[0];
};

const updateQuoteStatus = async (id, status) => {
  const result = await pool.query(
    'UPDATE quotes SET status=$1 WHERE id=$2 RETURNING *',
    [status, id]
  );

  return result.rows[0];
};

const deleteQuote = async (id) => {
  await pool.query(
    'DELETE FROM quotes WHERE id=$1',
    [id]
  );
};

module.exports = {
  getAllQuotes,
  getQuoteById,
  createQuote,
  updateQuote,
  updateQuoteStatus,
  deleteQuote,
};