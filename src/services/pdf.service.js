const chromium = require('@sparticuz/chromium-min');
const puppeteer = require('puppeteer-core');

chromium.setGraphicsMode = false;

const CHROMIUM_PACK_URL =
  'https://github.com/Sparticuz/chromium/releases/download/v123.0.1/chromium-v123.0.1-pack.tar';

const pdfService = {
  generatePdfFromHtml: async (html) => {
    const executablePath = await chromium.executablePath(CHROMIUM_PACK_URL);

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