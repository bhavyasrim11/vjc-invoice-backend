const pool = require('../config/db');

const itemRepository = {

  getAll: async ({ search, status, category, role, userId }) => {
    let query = 'SELECT * FROM items WHERE 1=1';
    const values = [];
    let i = 1;

    if (role !== 'chairman' && userId) {
      query += ` AND created_by = $${i}`;
      values.push(userId);
      i++;
    }

    if (search) {
      query += ` AND (service_name ILIKE $${i} OR category ILIKE $${i} OR country ILIKE $${i})`;
      values.push(`%${search}%`);
      i++;
    }
    if (status && status !== 'All') {
      query += ` AND status = $${i}`;
      values.push(status);
      i++;
    }
    if (category && category !== 'All') {
      query += ` AND category = $${i}`;
      values.push(category);
      i++;
    }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, values);
    return result.rows;
  },

  getById: async (id) => {
    const result = await pool.query('SELECT * FROM items WHERE id = $1', [id]);
    return result.rows[0];
  },

  create: async (data) => {
    const {
      item_id, service_name, category, country,
      price, gst, duration, documents, description, status, created_by
    } = data;

    const result = await pool.query(
      `INSERT INTO items
        (item_id, service_name, category, country, price, gst,
         duration, documents, description, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [item_id, service_name, category, country,
       price, gst, duration, documents, description, status, created_by || null]
    );
    return result.rows[0];
  },

  update: async (id, data) => {
    const {
      service_name, category, country, price, gst,
      duration, documents, description, status
    } = data;

    const result = await pool.query(
      `UPDATE items SET
        service_name=$1, category=$2, country=$3, price=$4,
        gst=$5, duration=$6, documents=$7, description=$8,
        status=$9, updated_at=NOW()
       WHERE id=$10 RETURNING *`,
      [service_name, category, country, price, gst,
       duration, documents, description, status, id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    const result = await pool.query(
      'DELETE FROM items WHERE id = $1 RETURNING *', [id]
    );
    return result.rows[0];
  },

  getStats: async (role, userId) => {
    const whereClause = (role !== 'chairman' && userId)
      ? `WHERE created_by = '${userId}'`
      : '';
    const itemResult = await pool.query(`
      SELECT
        COUNT(*) as total_items,
        COUNT(CASE WHEN status='Active' THEN 1 END) as active_items
      FROM items ${whereClause}
    `);
    const revenueResult = await pool.query(`
      SELECT COALESCE(SUM(grand_total), 0) as total_revenue
      FROM invoices
      WHERE status = 'Approved'
    `);

    return {
      ...itemResult.rows[0],
      total_revenue: revenueResult.rows[0].total_revenue,
    };
  },
};

module.exports = itemRepository;