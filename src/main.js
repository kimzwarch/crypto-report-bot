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
    
    // Look for important indicators
    const highlights = lines.filter(line => 
      line.includes('📈') || 
      line.includes('📉') || 
      line.includes('🔥') || 
      line.includes('⚠️') ||
      line.includes('%') ||
      line.toLowerCase().includes('alert') ||
      line.toLowerCase().includes('breakout') ||
      line.toLowerCase().includes('support') ||
      line.toLowerCase().includes('resistance')
    ).slice(0, 5); // Get top 5 highlights
    
    if (highlights.length > 0) {
      return `🔍 *Key Highlights:*\n\n${highlights.join('\n')}`;
    }
    
    // Fallback to first few meaningful lines
    const meaningfulLines = lines
      .filter(line => line.length > 20 && !line.startsWith('#'))
      .slice(0, 3);
    
    return meaningfulLines.length > 0 
      ? `📊 *Market Summary:*\n\n${meaningfulLines.join('\n\n')}`
      : '📈 Daily crypto market analysis completed - check full report for details.';
      
  } catch (error) {
    console.error('Error extracting highlights:', error);
    return '📊 Crypto market analysis completed - check full report for details.';
  }
}

// Run the report
if (require.main === module) {
  runDailyReport();
}

module.exports = { runDailyReport, extractHighlights };
