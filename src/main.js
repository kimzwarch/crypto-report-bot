const { generateCryptoReport } = require('./grok-client');
const { createNotionPage } = require('./notion-formatter');
const { takeScreenshot } = require('./screenshot');
const { sendToTelegram } = require('./telegram-bot');

async function runDailyReport() {
  try {
    console.log('🚀 Starting daily crypto report generation...');
    
    // 1. Generate report with Grok AI
    console.log('📝 Generating report with Grok AI...');
    const report = await generateCryptoReport();
    
    // 2. Create Notion page with the report
    console.log('📄 Creating Notion page...');
    const notionPage = await createNotionPage(report);
    
    // 3. Take screenshot of the Notion page
    console.log('📸 Taking screenshot...');
    const screenshot = await takeScreenshot(notionPage.url);
    
    // 4. Extract key highlights from the report
    console.log('✨ Extracting highlights...');
    const highlights = extractHighlights(report);
    
    // 5. Send to Telegram group
    console.log('📤 Sending to Telegram...');
    await sendToTelegram(screenshot, highlights, notionPage.url);
    
    console.log('✅ Daily crypto report completed successfully!');
    
  } catch (error) {
    console.error('❌ Error in daily report process:', error);
    
    // Send error notification to Telegram
    try {
      const { sendErrorNotification } = require('./telegram-bot');
      await sendErrorNotification(error.message);
    } catch (telegramError) {
      console.error('Failed to send error notification:', telegramError);
    }
    
    process.exit(1);
  }
}

function extractHighlights(report) {
  try {
    const lines = report.split('\n').filter(line => line.trim());
    
    // Look for key trading suggestions and price predictions
    const highlights = lines.filter(line => 
      line.toLowerCase().includes('buy') || 
      line.toLowerCase().includes('sell') || 
      line.toLowerCase().includes('hold') ||
      line.includes('

// Run the report
if (require.main === module) {
  runDailyReport();
}

module.exports = { runDailyReport, extractHighlights };
