const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

/**
 * Escapes special characters in a string for Telegram's Markdown parser.
 * This prevents formatting errors when the text contains characters like '*' or '_'.
 * @param {string} text The text to sanitize.
 * @returns {string} The sanitized text.
 */
function escapeMarkdown(text) {
  if (!text) {
    return '';
  }
  // For the legacy 'Markdown' parse mode, we primarily need to escape these characters.
  const charsToEscape = /([_*`\[])/g;
  return text.replace(charsToEscape, '\\$1');
}

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
    
    // Sanitize the highlights content to prevent Markdown parsing errors
    const sanitizedHighlights = escapeMarkdown(highlights);
    
    const caption = `🎯 *AIXBT Crypto Tracker - ${currentDate}*\n\n${sanitizedHighlights}\n\n📊 [View Complete Trading Analysis](${notionUrl})\n\n🤖 _Automated AIXBT tracking system_`;
    
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
