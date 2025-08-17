# 🚀 Crypto Report Bot

Automated daily cryptocurrency market analysis system that generates professional reports using Grok AI, formats them in Notion, and distributes via Telegram.

## Features

- 🤖 **AI-Powered Analysis**: Uses Grok AI for comprehensive market analysis
- 📄 **Professional Formatting**: Creates beautiful Notion pages automatically  
- 📸 **Visual Sharing**: Takes screenshots and sends to Telegram
- ⏰ **Fully Automated**: Runs daily via GitHub Actions
- 💰 **Cost Effective**: ~$5-20/month total cost

## Setup

### 1. Required API Keys

- **Grok API Key**: Get from [X AI Platform](https://x.ai)
- **Notion Integration**: Create at [Notion Developers](https://developers.notion.com)
- **Telegram Bot**: Message @BotFather on Telegram

### 2. Environment Variables

Set these as GitHub Secrets:
GROK_API_KEY=your_grok_api_key
NOTION_TOKEN=your_notion_integration_token
NOTION_DATABASE_ID=your_notion_database_id
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id

### 3. Notion Database Setup

Create a database with these properties:
- **Title** (Title)
- **Date** (Date) 
- **Status** (Select: Draft, Published)

### 4. Running

The bot runs automatically daily at 8 AM UTC via GitHub Actions.

To test manually:
```bash
npm install
npm start
