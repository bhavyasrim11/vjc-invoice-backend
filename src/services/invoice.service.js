const invoiceRepository = require('../repositories/invoice.repository');
const { generateInvoiceNumber, generateToken } = require('../models/invoice');
const emailService = require('./email.service');
const pool = require('../config/db');

const invoiceService = {

  getAllInvoices: async () => {
    const invoices = await invoiceRepository.getAll();
    const stats = await invoiceRepository.getStats();
    return { invoices, stats };
  },

  createInvoice: async (data) => {
    const invoice_number = await generateInvoiceNumber();
    const chairman_token = generateToken();
    const invoice = await invoiceRepository.create({
      ...data,
      invoice_number,
      chairman_token,
    });
    await emailService.sendChairmanApprovalMail(invoice);
    return invoice;
  },

  // Chairman APPROVE — outstanding update అవుతుంది
  approveInvoice: async (token) => {
    const invoice = await invoiceRepository.getByToken(token);
    if (!invoice) throw new Error('Invalid token');
    if (invoice.status !== 'Pending') throw new Error('Already processed');

    const approved = await invoiceRepository.approve(token);

    // ✅ Customer outstanding update చేయి
    await pool.query(
      `UPDATE customers SET
        outstanding = outstanding + $1,
        last_transaction = NOW()
       WHERE id = $2`,
     [approved.balance_amount, approved.customer_id]
    );

    // Client కి mail పంపు
    await emailService.sendClientInvoiceMail(approved);
    return approved;
  },

  // Chairman REJECT
  rejectInvoice: async (token) => {
    const invoice = await invoiceRepository.getByToken(token);
    if (!invoice) throw new Error('Invalid token');
    if (invoice.status !== 'Pending') throw new Error('Already processed');
    return await invoiceRepository.reject(token);
  },
};

module.exports = invoiceService;