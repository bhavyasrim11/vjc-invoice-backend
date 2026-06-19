const transporter = require('../config/email');

const emailService = {

  sendChairmanApprovalMail: async (invoice) => {
    const approveUrl =
      `https://vjc-invoice-backend.vercel.app/api/invoices/approve/${invoice.chairman_token}`;

    const rejectUrl =
      `https://vjc-invoice-backend.vercel.app/api/invoices/reject/${invoice.chairman_token}`;

    const html = `
<div style="font-family:Arial,sans-serif;background:#f4f6f9;padding:20px;">
  <div style="max-width:900px;margin:auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #ddd;">

    <div style="background:#0f9d94;color:#fff;padding:18px 25px;">
      <h2 style="margin:0;">Create Client Invoice</h2>
    </div>

    <div style="padding:25px;">

      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:10px;font-weight:bold;">Client Name</td>
          <td style="padding:10px;">${invoice.customer_name}</td>

          <td style="padding:10px;font-weight:bold;">Invoice Number</td>
          <td style="padding:10px;">${invoice.invoice_number}</td>
        </tr>

        <tr style="background:#f8f9fa;">
          <td style="padding:10px;font-weight:bold;">Customer Email</td>
          <td style="padding:10px;">${invoice.customer_email}</td>

          <td style="padding:10px;font-weight:bold;">Grand Total</td>
          <td style="padding:10px;">
            ₹${Number(invoice.grand_total || 0).toLocaleString('en-IN')}
          </td>
        </tr>

        <tr>
          <td style="padding:10px;font-weight:bold;">Subtotal</td>
          <td style="padding:10px;">
            ₹${Number(invoice.subtotal || 0).toLocaleString('en-IN')}
          </td>

          <td style="padding:10px;font-weight:bold;">Paid Amount</td>
          <td style="padding:10px;">
            ₹${Number(invoice.paid_amount || 0).toLocaleString('en-IN')}
          </td>
        </tr>

        <tr style="background:#f8f9fa;">
          <td style="padding:10px;font-weight:bold;">Tax %</td>
          <td style="padding:10px;">
            ${invoice.tax_percent || 0}%
          </td>

          <td style="padding:10px;font-weight:bold;">Balance Amount</td>
          <td style="padding:10px;color:red;font-weight:bold;">
            ₹${Number(invoice.balance_amount || 0).toLocaleString('en-IN')}
          </td>
        </tr>

        <tr>
          <td style="padding:10px;font-weight:bold;">Tax Amount</td>
          <td style="padding:10px;">
            ₹${Number(invoice.tax_amount || 0).toLocaleString('en-IN')}
          </td>

          <td style="padding:10px;font-weight:bold;">Due Date</td>
          <td style="padding:10px;">
            ${invoice.due_date || '-'}
          </td>
        </tr>

        <tr style="background:#f8f9fa;">
          <td style="padding:10px;font-weight:bold;">GSTIN</td>
          <td style="padding:10px;">
            ${invoice.customer_gstin || '-'}
          </td>

          <td style="padding:10px;font-weight:bold;">Address</td>
          <td style="padding:10px;">
            ${invoice.customer_address || '-'}
          </td>
        </tr>

        <tr>
          <td style="padding:10px;font-weight:bold;">Description</td>
          <td colspan="3" style="padding:10px;">
            ${invoice.notes || '-'}
          </td>
        </tr>
      </table>

      <div style="margin-top:35px;text-align:center;">
        <a href="${approveUrl}"
          style="background:#2e7d32;color:#fff;padding:14px 35px;
          text-decoration:none;border-radius:5px;font-size:16px;
          margin-right:15px;">
          ✅ APPROVE
        </a>

        <a href="${rejectUrl}"
          style="background:#d32f2f;color:#fff;padding:14px 35px;
          text-decoration:none;border-radius:5px;font-size:16px;">
          ❌ REJECT
        </a>
      </div>

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
    // ── derive CGST / SGST split (matches the PDF invoice template) ────────
    const taxAmountTotal = Number(invoice.tax_amount || 0);
    const halfTaxPercent = (Number(invoice.tax_percent || 0) / 2).toFixed(0);
    const cgstAmount = (taxAmountTotal / 2);
    const sgstAmount = (taxAmountTotal / 2);

    const grandTotalNum = Number(invoice.grand_total || invoice.total_amount || 0);
    const subtotalNum = Number(invoice.subtotal || 0);
    const invoiceAmountNum = Number(
      invoice.invoice_amount ?? (subtotalNum - taxAmountTotal)
    );

    // Amount in words (simple Indian numbering, integer rupees only)
    const numberToWords = (num) => {
      const a = [
        '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
        'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen',
        'Eighteen', 'Nineteen',
      ];
      const b = [
        '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
      ];
      const inWords = (n) => {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
        if (n < 1000)
          return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + inWords(n % 100) : '');
        if (n < 100000)
          return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + inWords(n % 1000) : '');
        if (n < 10000000)
          return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + inWords(n % 100000) : '');
        return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + inWords(n % 10000000) : '');
      };
      const intPart = Math.round(num);
      if (intPart === 0) return 'Zero';
      return inWords(intPart);
    };

    const grandTotalWords = `${numberToWords(grandTotalNum)} Only`;
    const currency = invoice.currency || 'INR';

    const html = `
<div style="font-family:Arial,Helvetica,sans-serif;background:#eef1f4;padding:20px;">
  <div style="max-width:760px;margin:auto;background:#fff;border:1px solid #e2e2e2;border-radius:4px;overflow:hidden;">

    <div style="height:5px;background:#1976d2;"></div>

    <!-- Header -->
    <table style="width:100%;border-collapse:collapse;padding:0;">
      <tr>
        <td style="vertical-align:top;width:55%;padding:22px 0 0 28px;">
          <div style="font-size:19px;font-weight:800;color:#1565c0;letter-spacing:0.3px;line-height:1;">
            VJC OVERSEAS
          </div>
          <div style="font-size:10.5px;font-weight:700;color:#444;letter-spacing:1px;margin-top:4px;">
            IMMIGRATION &amp; VISA
          </div>
          <div style="display:inline-block;background:#f57c00;color:#fff;font-size:10.5px;
            font-weight:700;letter-spacing:1px;padding:2px 8px;margin-top:5px;border-radius:2px;">
            CONSULTANTS
          </div>
        </td>
        <td style="vertical-align:top;width:45%;text-align:right;padding:22px 28px 0 0;">
          <div style="font-size:24px;font-weight:800;color:#111;letter-spacing:0.5px;">INVOICE</div>
          <div style="font-size:12.5px;font-weight:700;color:#222;margin-top:5px;">
            VJC Immigration And Visa Consultants Pvt. Ltd.,
          </div>
          <div style="font-size:11.5px;color:#555;margin-top:3px;line-height:1.5;">
            GST No: ${invoice.company_gstin || '36AAFCV2627Q1ZR'}<br/>
            Company Number: ${invoice.company_phone || '+919160449000'}<br/>
            Email: ${invoice.company_email || 'info@vjcoverseas.com'}
          </div>
        </td>
      </tr>
    </table>

    <div style="padding:0 28px;">
      <hr style="border:none;border-top:1px solid #e6e6e6;margin:14px 0 16px 0;" />
    </div>

    <!-- Bill To / Invoice meta -->
    <table style="width:100%;border-collapse:collapse;padding:0 28px;">
      <tr>
        <td style="vertical-align:top;width:55%;padding:0 0 0 28px;">
          <div style="font-size:13px;font-weight:700;color:#222;margin-bottom:7px;">Bill To</div>
          <table style="font-size:12px;color:#333;border-collapse:collapse;">
            <tr><td style="font-weight:700;padding:2px 6px 2px 0;white-space:nowrap;">Name :</td><td style="padding:2px 0;">${invoice.customer_name || '-'}</td></tr>
            <tr><td style="font-weight:700;padding:2px 6px 2px 0;white-space:nowrap;">Email :</td><td style="padding:2px 0;">${invoice.customer_email || '-'}</td></tr>
            <tr><td style="font-weight:700;padding:2px 6px 2px 0;white-space:nowrap;">Mobile :</td><td style="padding:2px 0;">${invoice.customer_phone || '-'}</td></tr>
            <tr><td style="font-weight:700;padding:2px 6px 2px 0;white-space:nowrap;vertical-align:top;">Address :</td><td style="padding:2px 0;">${invoice.customer_address || '-'}</td></tr>
            <tr><td style="font-weight:700;padding:2px 6px 2px 0;white-space:nowrap;">Country :</td><td style="padding:2px 0;">${invoice.customer_country || 'India'}</td></tr>
          </table>
        </td>
        <td style="vertical-align:top;width:45%;padding:0 28px 0 0;">
          <table style="font-size:12px;color:#333;border-collapse:collapse;margin-left:auto;">
            <tr><td style="font-weight:700;padding:2px 6px 2px 0;white-space:nowrap;">Client ID :</td><td style="padding:2px 0;text-align:right;">${invoice.customer_id || '-'}</td></tr>
            <tr><td style="font-weight:700;padding:2px 6px 2px 0;white-space:nowrap;">Visa Type :</td><td style="padding:2px 0;text-align:right;">${invoice.service_type || '-'}</td></tr>
            <tr><td style="font-weight:700;padding:2px 6px 2px 0;white-space:nowrap;">Invoice Number :</td><td style="padding:2px 0;text-align:right;">${invoice.invoice_number || '-'}</td></tr>
            <tr><td style="font-weight:700;padding:2px 6px 2px 0;white-space:nowrap;">Invoice Date :</td><td style="padding:2px 0;text-align:right;">${invoice.invoice_date || '-'}</td></tr>
            <tr><td style="font-weight:700;padding:2px 6px 2px 0;white-space:nowrap;vertical-align:top;">Service Type :</td><td style="padding:2px 0;text-align:right;">${invoice.notes || invoice.service_type || '-'}</td></tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Totals -->
    <div style="padding:22px 28px 0 28px;">
      <table style="width:100%;border-collapse:collapse;font-size:12.5px;">
        <tr>
          <td style="padding:4px 0;color:#333;">Sub Total:</td>
          <td style="padding:4px 0;text-align:right;font-weight:600;color:#222;">
            ${currency} ${subtotalNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#333;">Invoice Amount:</td>
          <td style="padding:4px 0;text-align:right;font-weight:600;color:#222;">
            ${currency} ${invoiceAmountNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#333;">CGST (${halfTaxPercent}%):</td>
          <td style="padding:4px 0;text-align:right;font-weight:600;color:#222;">
            ${currency} ${cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </td>
        </tr>
        <tr>
          <td style="padding:4px 0 10px 0;color:#333;">SGST (${halfTaxPercent}%):</td>
          <td style="padding:4px 0 10px 0;text-align:right;font-weight:600;color:#222;">
            ${currency} ${sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </td>
        </tr>
      </table>
      <hr style="border:none;border-top:1px solid #e6e6e6;margin:0 0 8px 0;" />
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:2px 0;font-size:14px;font-weight:800;color:#111;">Grand Total :</td>
          <td style="padding:2px 0;text-align:right;font-size:14px;font-weight:800;color:#1565c0;">
            ${currency} ${grandTotalNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </td>
        </tr>
      </table>
      <div style="text-align:right;font-size:11.5px;color:#555;margin-top:3px;">
        Grand Total in Word : <strong>${grandTotalWords}</strong>
      </div>
    </div>

    <!-- Terms -->
    <div style="padding:20px 28px 24px 28px;">
      <div style="font-size:13px;font-weight:700;color:#222;margin-bottom:5px;">Notes / Terms &amp; Conditions</div>
      <div style="font-size:11px;color:#555;line-height:1.6;">
        <strong>Invoice Terms &amp; Conditions</strong><br/>
        <strong>Mode of Payment</strong><br/>
        Payments can be made via bank transfer, UPI, cheque, or any other method as communicated.
        All charges related to international transfers (if applicable) must be borne by the client.<br/>
        <strong>Service Delivery</strong><br/>
        Services will be rendered as per the agreed scope. VJC Overseas is not responsible for delays
        or failures due to incomplete documentation or non-cooperation by the client.<br/>
        <strong>Third-Party Charges</strong><br/>
        Any government, embassy, university, or third-party fees are not included in this invoice
        unless specifically mentioned. The client is solely responsible for paying these charges.<br/>
        <strong>Changes and Cancellations</strong><br/>
        Any changes in service scope requested after payment may result in additional charges.
        Cancellations must be made in writing and are subject to VJC Overseas' cancellation policy.<br/>
        <strong>Limitation of Liability</strong><br/>
        VJC Overseas will not be liable for any losses arising from visa rejection, university admission
        denial, or any outcome beyond our direct control.
      </div>
    </div>

    <div style="background:#111;color:#ddd;text-align:center;font-size:11px;padding:13px 18px;">
      VJC Immigration And Visa Consultants Pvt. Ltd., - Raheja Arcade, 16 &amp; 17, 5th Block,
      Koramangala, Bengaluru, Karnataka 560095
    </div>
  </div>
</div>
    `;

    await transporter.sendMail({
      from: `"VJC Overseas" <${process.env.EMAIL_USER}>`,
      to: invoice.customer_email,
      subject: `Invoice ${invoice.invoice_number} - ₹${grandTotalNum.toLocaleString('en-IN')}`,
      html,
    });
    console.log('✅ Client mail sent!');
  },
};

module.exports = emailService;
