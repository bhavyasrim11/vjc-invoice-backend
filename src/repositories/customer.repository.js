const pool = require('../config/db');

const customerRepository = {

  // Get all customers with filters
  getAll: async ({ search, status, type, userId, role }) => {
    let query = `
SELECT
  c.*,
  COALESCE(i.status,'Pending') AS invoice_status
FROM customers c
LEFT JOIN (
  SELECT DISTINCT ON (customer_id)
    customer_id,
    status
  FROM invoices
  ORDER BY customer_id, id DESC
) i
ON c.id = i.customer_id
WHERE 1=1
`;
    const values = [];
    let i = 1;

    if (search) {
      query += ` AND (name ILIKE $${i} OR email ILIKE $${i} OR company ILIKE $${i})`;
      values.push(`%${search}%`);
      i++;
    }
    if (status && status !== 'All') {
      query += ` AND status = $${i}`;
      values.push(status);
      i++;
    }
    if (type && type !== 'All') {
      query += ` AND type = $${i}`;
      values.push(type);
      i++;
    }

    query += ` ORDER BY created_at DESC`;
    const result = await pool.query(query, values);
    return result.rows;
  },

  // Get single customer by ID
  getById: async (id) => {
    const result = await pool.query(
      'SELECT * FROM customers WHERE id = $1', [id]
    );
    return result.rows[0];
  },

  // Get by customer_id like CUS001
  getByCustomerId: async (customer_id) => {
    const result = await pool.query(
      'SELECT * FROM customers WHERE customer_id = $1', [customer_id]
    );
    return result.rows[0];
  },

  // Create new customer
  create: async (data) => {
   const {
  customer_id, name, email, phone, company,
  service_type, service_id,
  type, status, address, city, state,
  pincode, gstin, notes
} = data;

    const result = await pool.query(
      `INSERT INTO customers
(customer_id, name, email, phone, company, service_type, service_id, type, status,
 address, city, state, pincode, gstin, notes)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
RETURNING *`,
     [
  customer_id, name, email, phone, company,
  service_type, service_id,
  type, status,
  address, city, state, pincode, gstin, notes
]
    );
    return result.rows[0];
  },

  // Update customer
  update: async (id, data) => {
    const {
      name, email, phone, company, type, status,
      address, city, state, pincode, gstin, notes
    } = data;

    const result = await pool.query(
      `UPDATE customers SET
        name=$1, email=$2, phone=$3, company=$4, type=$5,
        status=$6, address=$7, city=$8, state=$9, pincode=$10,
        gstin=$11, notes=$12, updated_at=NOW()
       WHERE id=$13 RETURNING *`,
      [name, email, phone, company, type, status,
       address, city, state, pincode, gstin, notes, id]
    );
    return result.rows[0];
  },

  // Delete customer
  delete: async (id) => {
  const result = await pool.query(
    'DELETE FROM customers WHERE id = $1 RETURNING *', [id]
  );
  return result.rows[0];
},

  // Get stats for top cards
  getStats: async () => {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_customers,
        COUNT(CASE WHEN status='Active' THEN 1 END) as active_customers,
        SUM(outstanding) as total_outstanding,
        SUM(total_payments) as total_payments
      FROM customers
    `);
    return result.rows[0];
  }
};

module.exports = customerRepository;