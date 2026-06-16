const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const routes = require('./routes/index');
const authRoutes = require('./routes/auth'); // ← NEW

const { createPaymentTable }          = require('./models/payment.model');
const { createRecurringInvoiceTable } = require('./models/recurringInvoice.model');
const { createExpenseTable }          = require('./models/expense.model');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://vjc-invoice-frontend.vercel.app'
  ],
  credentials: true,
}));
app.use(express.json());
app.use('/api', routes);
app.use('/api/auth', authRoutes); // ← NEW

app.get('/', (req, res) => {
  res.json({ message: 'VJC Invoice API Running!' });
});

// ── Auto-create tables ────────────────────────────────────────
Promise.all([
  createPaymentTable(),
  createRecurringInvoiceTable(),
  createExpenseTable(),
]).then(() => console.log("✅ All tables ready"))
  .catch((err) => console.error("❌ Table error:", err));

module.exports = app;
