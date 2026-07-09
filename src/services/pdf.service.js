const path = require('path');
const chromium = require('@sparticuz/chromium-min');
const puppeteer = require('puppeteer-core');

chromium.setGraphicsMode = false;

const CHROMIUM_PACK_URL =
  'https://github.com/Sparticuz/chromium/releases/download/v123.0.1/chromium-v123.0.1-pack.tar';

// CRITICAL FIX: extraction ఒక్కసారే జరిగేలా cache చేయాలి,
// prathi request కి కొత్తగా extract అవ్వకుండా ఆపడానికి
let cachedExecutablePath = null;
let extractionPromise = null;

async function getChromiumExecutablePath() {
  if (cachedExecutablePath) return cachedExecutablePath;

  if (!extractionPromise) {
    extractionPromise = chromium
      .executablePath(CHROMIUM_PACK_URL)
      .then((execPath) => {
        cachedExecutablePath = execPath;
        return execPath;
      })
      .catch((err) => {
        extractionPromise = null; // fail అయితే మళ్ళీ try అవ్వడానికి reset
        throw err;
      });
  }

  return extractionPromise;
}

const pdfService = {
  generatePdfFromHtml: async (html) => {
    const executablePath = await getChromiumExecutablePath();

    const execDir = path.dirname(executablePath);
    process.env.LD_LIBRARY_PATH = execDir;

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