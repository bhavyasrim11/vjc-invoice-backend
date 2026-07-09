const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

const pdfService = {
  generatePdfFromHtml: async (html) => {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '10px', bottom: '10px', left: '10px', right: '10px' },
      });
      return pdfBuffer;
    } finally {
      await browser.close();
    }
  },
};

module.exports = pdfService;