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
        '--disable-gpu',
        '--disable-extensions',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
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
    
    // Navigate to Notion page with longer timeout
    await page.goto(notionUrl, { 
      waitUntil: 'networkidle2',
      timeout: 60000 
    });
    
    // Wait for Notion content to fully load
    console.log('⏳ Waiting for Notion content to load...');
    
    // Wait for typical Notion content selectors
    try {
      await page.waitForSelector('.notion-page-content, [data-block-id], .notion-page-block', {
        timeout: 30000
      });
    } catch (selectorError) {
      console.log('⚠️ Notion content selector not found, using timeout fallback');
    }
    
    // Additional wait for content to stabilize
    await page.waitForTimeout(8000);
    
    // Try to remove any popups, overlays, or cookie banners
    try {
      await page.evaluate(() => {
        // Remove common popup and overlay elements
        const selectors = [
          '[data-testid="cookie-banner"]',
          '.notion-overlay',
          '.notion-popup',
          '[role="dialog"]',
          '.notion-topbar-share-menu',
          '.notion-help-button',
          '[aria-label="Close"]',
          '.notion-cursor',
          '.notion-presence-container'
        ];
        
        selectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            try {
              el.remove();
            } catch (e) {
              el.style.display = 'none';
            }
          });
        });

        // Hide any floating elements that might interfere
        const floatingElements = document.querySelectorAll('[style*="position: fixed"], [style*="position: absolute"]');
        floatingElements.forEach(el => {
          if (el.getBoundingClientRect().top < 100) {
            el.style.display = 'none';
          }
        });
      });
    } catch (e) {
      console.log('Note: Could not remove all overlays, proceeding with screenshot');
    }
    
    // Take screenshot - REMOVED quality parameter for PNG
    console.log('📸 Taking screenshot...');
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: true
      // Note: quality parameter removed as it's not supported for PNG
    });
    
    console.log(`✅ Screenshot taken successfully (${screenshot.length} bytes)`);
    
    return screenshot;
    
  } catch (error) {
    console.error('❌ Error taking screenshot:', error.message);
    
    // Provide more helpful error context
    if (error.message.includes('timeout')) {
      console.error('💡 Suggestion: The Notion page may be taking too long to load. Check if the URL is accessible.');
    } else if (error.message.includes('quality')) {
      console.error('💡 Note: PNG format does not support quality parameter - this has been fixed.');
    }
    
    throw new Error(`Failed to take screenshot: ${error.message}`);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.log('Note: Browser cleanup had minor issues');
      }
    }
  }
}

module.exports = { takeScreenshot };
