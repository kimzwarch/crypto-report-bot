const axios = require('axios');

async function generateCryptoReport() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const prompt = `Generate a comprehensive daily cryptocurrency market analysis report for ${currentDate}. Include:

## 📊 Market Overview
- Overall market sentiment and key metrics
- Total market cap changes
- Bitcoin dominance
- Fear & Greed Index assessment

## 🚀 Top Performers (24h)
- Best performing cryptocurrencies
- Percentage gains and volume data
- Reasons for price movements

## 📉 Market Movers & Shakers
- Significant price movements (both up and down)
- Unusual volume spikes
- New listings or delistings

## 🔍 Technical Analysis
- Bitcoin (BTC) key levels
- Ethereum (ETH) technical outlook  
- Important support/resistance levels
- Chart patterns to watch

## 📰 Market News Impact
- Recent news affecting crypto prices
- Regulatory updates
- Institutional adoption news
- DeFi/NFT developments

## ⚠️ Risk Assessment
- Current market risks
- Volatility indicators
- Liquidation levels to watch

## 🔮 Tomorrow's Outlook
- Key events to monitor
- Expected market catalysts
- Price targets and predictions

Format with clear headings, bullet points, emojis for visual appeal, and specific data points. Be professional but engaging. Include percentage changes and price levels where relevant.`;

  try {
    console.log('🤖 Calling Grok AI API...');
    
    const response = await axios.post('https://api.x.ai/v1/chat/completions', {
      messages: [
        {
          role: "system",
          content: "You are a professional cryptocurrency market analyst with deep expertise in technical analysis, market sentiment, and blockchain technology. Provide detailed, accurate, and actionable market analysis with specific data points, price levels, and trading insights. Use emojis strategically for visual appeal but maintain professional tone."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      model: "grok-beta",
      max_tokens: 4000,
      temperature: 0.7,
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from Grok API');
    }

    const report = response.data.choices[0].message.content;
    console.log(`✅ Generated report: ${report.length} characters`);
    
    return report;
    
  } catch (error) {
    console.error('❌ Error generating report with Grok:', error.message);
    
    if (error.response) {
      console.error('API Response Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    
    throw new Error(`Failed to generate crypto report: ${error.message}`);
  }
}

module.exports = { generateCryptoReport };
