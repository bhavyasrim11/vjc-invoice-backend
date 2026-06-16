const transporter = require('../config/email');

const emailService = {

  sendChairmanApprovalMail: async (invoice) => {
    const approveUrl = `http://localhost:5000/api/invoices/approve/${invoice.chairman_token}`;
    const rejectUrl = `http://localhost:5000/api/invoices/reject/${invoice.chairman_token}`;

    const html = `
      <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
        <div style="background: #1976d2; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">VJC Invoice</h1>
          <p style="color: #e3f2fd;">Invoice Approval Required</p>
        </div>
        <div style="padding: 30px;">
          <h2>New Invoice Created</h2>
          <table style="width:100%; border-collapse:collapse;">
            <tr style="background:#f5f5f5;">
              <td style="padding:10px; font-weight:bold;">Invoice Number</td>
              <td style="padding:10px;">${invoice.invoice_number}</td>
            </tr>
            <tr>
              <td style="padding:10px; font-weight:bold;">Customer</td>
              <td style="padding:10px;">${invoice.customer_name}</td>
            </tr>
            <tr style="background:#f5f5f5;">
              <td style="padding:10px; font-weight:bold;">Amount</td>
              <td style="padding:10px; color:#1976d2; font-size:18px;">
                ₹${Number(invoice.total_amount).toLocaleString('en-IN')}
              </td>
            </tr>
            <tr>
              <td style="padding:10px; font-weight:bold;">Due Date</td>
              <td style="padding:10px;">${invoice.due_date || '—'}</td>
            </tr>
          </table>
          <div style="margin:30px 0; text-align:center;">
            <a href="${approveUrl}"
               style="background:#2e7d32; color:white; padding:15px 40px;
                      text-decoration:none; border-radius:5px; font-size:16px;
                      margin-right:20px; display:inline-block;">
              ✅ APPROVE
            </a>
            <a href="${rejectUrl}"
               style="background:#d32f2f; color:white; padding:15px 40px;
                      text-decoration:none; border-radius:5px; font-size:16px;
                      display:inline-block;">
              ❌ REJECT
            </a>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"VJC Invoice" <${process.env.EMAIL_USER}>`,
      to: process.env.CHAIRMAN_EMAIL,
      subject: `🔔 Invoice Approval: ${invoice.invoice_number} - ₹${Number(invoice.total_amount).toLocaleString('en-IN')}`,
      html,
    });
    console.log('✅ Chairman mail sent!');
  },

  sendClientInvoiceMail: async (invoice) => {
    const html = `
      <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
        <div style="background: #1976d2; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">VJC Invoice</h1>
        </div>
        <div style="padding: 30px;">
          <h2>Dear ${invoice.customer_name},</h2>
          <p>Your invoice has been approved. Details below:</p>
          <table style="width:100%; border-collapse:collapse;">
            <tr style="background:#f5f5f5;">
              <td style="padding:10px; font-weight:bold;">Invoice Number</td>
              <td style="padding:10px;">${invoice.invoice_number}</td>
            </tr>
            <tr>
              <td style="padding:10px; font-weight:bold;">Amount Due</td>
              <td style="padding:10px; color:#d32f2f; font-size:18px; font-weight:bold;">
                ₹${Number(invoice.total_amount).toLocaleString('en-IN')}
              </td>
            </tr>
            <tr style="background:#f5f5f5;">
              <td style="padding:10px; font-weight:bold;">Due Date</td>
              <td style="padding:10px;">${invoice.due_date || '—'}</td>
            </tr>
          </table>
          <div style="background:#e8f5e9; padding:15px; border-radius:5px; margin:20px 0;">
            <p style="margin:0; color:#2e7d32; font-weight:bold;">
              ✅ Invoice approved and ready for payment.
            </p>
          </div>
          <p>Thank you for your business!</p>
          <p><strong>VJC Invoice Team</strong></p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"VJC Invoice" <${process.env.EMAIL_USER}>`,
      to: invoice.customer_email,
      subject: `📄 Invoice ${invoice.invoice_number} - ₹${Number(invoice.total_amount).toLocaleString('en-IN')}`,
      html,
    });
    console.log('✅ Client mail sent!');
  },
};

module.exports = emailService;