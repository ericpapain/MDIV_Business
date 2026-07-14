import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  console.log('Navigating to http://localhost:5173/revivre/p1 ...');
  try {
    const response = await page.goto('http://localhost:5173/revivre/p1', { waitUntil: 'networkidle', timeout: 15000 });
    console.log('Status:', response ? response.status() : 'Unknown');
    await page.waitForTimeout(2000);
    const content = await page.content();
    console.log('Body length:', content.length);
  } catch(e) {
    console.error(e);
  }
  await browser.close();
  process.exit(0);
})();
