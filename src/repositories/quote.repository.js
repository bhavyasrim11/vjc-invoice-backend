const pool = require('../config/db');

const getAllQuotes = async () => {
  const result = await pool.query(
    'SELECT * FROM quotes ORDER BY id DESC'
  );
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
    quote_id, customer_id, customer_name, reference,
    quote_date, expiry_date, salesperson, line_items,
    notes, terms_conditions, status, total_amount
  } = data;

  const result = await pool.query(
    `INSERT INTO quotes
      (quote_id, customer_id, customer_name, reference,
       quote_date, expiry_date, salesperson, line_items,
       notes, terms_conditions, status, total_amount)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING *`,
    [
      quote_id, customer_id, customer_name, reference || null,
      quote_date, expiry_date || null, salesperson || null,
      JSON.stringify(line_items), notes || null,
      terms_conditions || null, status || 'Draft', total_amount
    ]
  );
  return result.rows[0];
};

const updateQuote = async (id, data) => {
  const {
    customer_id, customer_name, reference, quote_date,
    expiry_date, salesperson, line_items, notes,
    terms_conditions, status, total_amount
  } = data;

  const result = await pool.query(
    `UPDATE quotes SET
      customer_id=$1, customer_name=$2, reference=$3,
      quote_date=$4, expiry_date=$5, salesperson=$6,
      line_items=$7, notes=$8, terms_conditions=$9,
      status=$10, total_amount=$11
     WHERE id=$12
     RETURNING *`,
    [
      customer_id, customer_name, reference || null,
      quote_date, expiry_date || null, salesperson || null,
      JSON.stringify(line_items), notes || null,
      terms_conditions || null, status, total_amount,
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
  await pool.query('DELETE FROM quotes WHERE id=$1', [id]);
};

module.exports = {
  getAllQuotes,
  getQuoteById,
  createQuote,
  updateQuote,
  updateQuoteStatus,
  deleteQuote,
};