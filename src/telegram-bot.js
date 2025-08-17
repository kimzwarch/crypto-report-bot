const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

async function sendToTelegram(screenshot, highlights, notionUrl) {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  try {
    console.log('📤 Sending report to Telegram...');
    
    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
    
    const caption = `🚀 *Daily Crypto Report - ${currentDate}*\n\n${highlights}\n\n📖 [View Full Report on Notion](${notionUrl})\n\n🤖 _Generated automatically by Crypto Report Bot_`;
    
    // Send screenshot with caption
    await bot.sendPhoto(chatId, screenshot, {
      caption: caption,
      parse_mode: 'Markdown',
      disable_web_page_preview: false
    });
    
    console.log('✅ Report sent to Telegram successfully');
    
  } catch (error) {
    console.error('❌ Error sending to Telegram:', error);
    throw new Error(`Failed to send to Telegram: ${error.message}`);
  }
}

async function sendErrorNotification(errorMessage) {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  try {
    const message = `🚨 *Crypto Report Bot Error*\n\nFailed to generate daily report:\n\`${errorMessage}\`\n\nPlease check the logs and fix the issue.`;
    
    await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown'
    });
    
    console.log('✅ Error notification sent to Telegram');
    
  } catch (telegramError) {
    console.error('❌ Failed to send error notification:', telegramError);
  }
}

module.exports = { sendToTelegram, sendErrorNotification };
