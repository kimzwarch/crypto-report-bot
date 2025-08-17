const puppeteer = require('puppeteer');

async function takeScreenshot(notionUrl) {
  let browser;
  
  try {
    console.log('🚀 Launching browser for screenshot...');
    
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set viewport for consistent screenshots
    await page.setViewport({ 
      width: 1200, 
      height: 800,
      deviceScaleFactor: 1
    });
    
    console.log(`📄 Navigating to Notion page: ${notionUrl}`);
    
    // Navigate to Notion page
    await page.goto(notionUrl, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Wait for content to load
    console.log('⏳ Waiting for content to load...');
    await page.waitForTimeout(5000);
    
    // Try to remove any popups or overlays
    try {
      await page.evaluate(() => {
        // Remove any cookie banners, popups, or overlays
        const selectors = [
          '[data-testid="cookie-banner"]',
          '.notion-overlay',
          '.notion-popup',
          '[role="dialog"]'
        ];
        
        selectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => el.remove());
        });
      });
    } catch (e) {
      console.log('No popups to remove');
    }
    
    // Take screenshot
    console.log('📸 Taking screenshot...');
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: true,
      quality: 90
    });
    
    console.log(`✅ Screenshot taken successfully (${screenshot.length} bytes)`);
    
    return screenshot;
    
  } catch (error) {
    console.error('❌ Error taking screenshot:', error);
    throw new Error(`Failed to take screenshot: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { takeScreenshot };
