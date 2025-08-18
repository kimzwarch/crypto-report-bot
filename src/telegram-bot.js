const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

// Telegram's official character limit for a photo caption
const TELEGRAM_CAPTION_LIMIT = 1024;

/**
 * Escapes special characters in a string for Telegram's Markdown parser.
 * @param {string} text The text to sanitize.
 * @returns {string} The sanitized text.
 */
function escapeMarkdown(text) {
  if (!text) {
    return '';
  }
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
    
    const header = `🎯 *AIXBT Crypto Tracker - ${currentDate}*\n\n`;
    const footer = `\n\n📊 [View Complete Trading Analysis](${notionUrl})\n\n🤖 _Automated AIXBT tracking system_`;
    
    // Defensive check: If header and footer alone are too long, send a minimal caption.
    if (header.length + footer.length >= TELEGRAM_CAPTION_LIMIT) {
      console.error('❌ Caption is too long due to header/footer length. Sending minimal fallback caption.');
      const minimalCaption = `🎯 *AIXBT Report - ${currentDate}*\n\n[View Full Report](${notionUrl})\n\n(The summary was too long to display)`;
      await bot.sendPhoto(chatId, screenshot, {
          caption: minimalCaption,
          parse_mode: 'Markdown'
      });
      console.log('✅ Fallback report sent to Telegram successfully.');
      return; // Stop execution to prevent errors
    }
    
    // Sanitize the highlights content
    const sanitizedHighlights = escapeMarkdown(highlights);
    let finalHighlights = sanitizedHighlights;
    
    // Calculate the exact available length for highlights
    const availableLength = TELEGRAM_CAPTION_LIMIT - header.length - footer.length;
    
    // Truncate the highlights if they exceed the available space
    if (finalHighlights.length > availableLength) {
      console.log('⚠️ Highlights text is too long, truncating for Telegram...');
      // The ellipsis "..." adds 3 characters.
      finalHighlights = finalHighlights.substring(0, availableLength - 3) + '...';
    }
    
    const caption = header + finalHighlights + footer;
    
    // Send screenshot with the correctly sized caption
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
