const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

chromium.setGraphicsMode = false;

const pdfService = {
  generatePdfFromHtml: async (html) => {
    const executablePath = await chromium.executablePath();
    
    const browser = await puppeteer.launch({
      args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
      defaultViewport: chromium.defaultViewport,
      executablePath,
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