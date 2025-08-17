const axios = require('axios');

async function generateCryptoReport() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const prompt = `Generate a daily cryptocurrency tracking report in the following format:

# AIXBT Tracker Report
**Date:** ${currentDate}

## Price Predictions and Suggestions

Create a detailed table with the following columns for each cryptocurrency:
- **Coin**
- **Current Price (USD)** 
- **Short-Term Predicted Price (USD)** (30 days)
- **Short-Term Suggestion** (Buy, Sell, or Hold)
- **Short-Term Justification**
- **Long-Term Predicted Price (USD)** (6 months) 
- **Long-Term Suggestion** (Buy, Sell, or Hold)
- **Long-Term Justification**

### Required Cryptocurrencies:
**Primary List:** BTC, ETH, SOL, NEAR, ICP, CRV, HIVE, AVAX, LINK, DOGE, FLOKI, ADA

**Additional Tokens:** Include 5 other high-performing tokens from the top 100 market cap on CoinGecko/CoinMarketCap that show strong potential.

### Requirements:
- Use **REAL-TIME PRICES** from CoinGecko or CoinMarketCap data (no hypothetical current prices)
- Base predictions on insights from these Twitter accounts:
  @aixbt_agent, @OnchainDataNerd, @ASvanevik, @DefiIgnas, @simononchain, @zachxbt, @lookonchain, @WuBlockchain, @0xngmi, @CryptoHayes, @CryptoKaleo, @Pentosh1, @stacy_muur, @MikybullCrypto, @CryptoGirlNova, @0xbeinginvested, @ChainROI, @100xDarren, @Chyan, @cryptorinweb3
- Provide specific justifications based on recent sentiment and analysis from these accounts

## Related Posts from Tracked Accounts
Summarize recent insights from the specified Twitter accounts related to each cryptocurrency, providing context for both short-term and long-term predictions.

## How to Use This Tracker
**Short-Term (30 days):**
- **Buy:** Indicates potential growth based on short-term trends
- **Sell:** Suggests potential decline in the short term  
- **Hold:** Reflects uncertainty or balanced short-term outlook

**Long-Term (6 months):**
- **Buy:** Indicates potential growth based on long-term trends
- **Sell:** Suggests potential decline in the long term
- **Hold:** Reflects uncertainty or balanced long-term outlook

**Justifications:** Based on latest insights from tracked accounts reflecting market sentiment, on-chain data, and technical factors.

## Disclaimer
These predictions and suggestions are based on insights from the specified Twitter accounts. They are NOT financial advice. Cryptocurrency markets are highly volatile - conduct your own research before making decisions.

**Important:** Use real-time data from CoinGecko.com or CoinMarketCap.com for current prices. Future price predictions should be based on analysis from the referenced Twitter accounts.`;

  try {
    console.log('🤖 Calling Grok AI API...');
    
    const response = await axios.post('https://api.x.ai/v1/chat/completions', {
      messages: [
        {
          role: "system",
          content: "You are an advanced cryptocurrency tracking system with access to real-time market data from CoinGecko and CoinMarketCap. You follow and analyze insights from top crypto Twitter accounts including @aixbt_agent, @OnchainDataNerd, @ASvanevik, @DefiIgnas, @simononchain, @zachxbt, @lookonchain, @WuBlockchain, @0xngmi, @CryptoHayes, @CryptoKaleo, @Pentosh1, @stacy_muur, @MikybullCrypto, @CryptoGirlNova, @0xbeinginvested, @ChainROI, @100xDarren, @Chyan, and @cryptorinweb3. Provide accurate price predictions and trading suggestions based on current market data and sentiment analysis from these key influencers. Format your response as a professional tracking report with clear tables and actionable insights."
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
