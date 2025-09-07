const axios = require('axios');

// List of all cryptocurrencies the report will cover
const COIN_LIST = [
    'bitcoin', 'ethereum', 'solana', 'near', 'internet-computer',
    'curve-dao-token', 'hive', 'avalanche-2', 'chainlink', 'dogecoin',
    'floki', 'cardano', 'binancecoin', 'xrp', 'the-open-network', 'polkadot', 'uniswap'
];

/**
 * Fetches live price data from the CoinGecko API.
 */
async function getLiveCoinData() {
    console.log('Fetching live cryptocurrency prices from CoinGecko...');
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
            params: {
                ids: COIN_LIST.join(','),
                vs_currencies: 'usd',
            }
        });
        console.log('Successfully fetched live price data.');
        return response.data;
    } catch (error) {
        console.error('❌ Critical Error: Could not fetch live coin data from CoinGecko.', error.message);
        return null;
    }
}

/**
 * Dynamically builds the Markdown table with live price data.
 * @param {object} livePrices - The price data fetched from CoinGecko.
 * @returns {string} A markdown string of the table rows.
 */
function buildPriceTable(livePrices) {
    const symbols = {
        'bitcoin': 'BTC', 'ethereum': 'ETH', 'solana': 'SOL', 'near': 'NEAR',
        'internet-computer': 'ICP', 'curve-dao-token': 'CRV', 'hive': 'HIVE',
        'avalanche-2': 'AVAX', 'chainlink': 'LINK', 'dogecoin': 'DOGE', 'floki': 'FLOKI',
        'cardano': 'ADA', 'binancecoin': 'BNB', 'xrp': 'XRP', 'the-open-network': 'TON',
        'polkadot': 'DOT', 'uniswap': 'UNI'
    };

    let tableRows = '';
    for (const coinId of COIN_LIST) {
        const symbol = symbols[coinId];

        const priceData = livePrices[coinId];
        let price;
        if (priceData && typeof priceData.usd === 'number') {
            const usdValue = priceData.usd;
            const options = {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: usdValue < 0.01 ? 8 : 2,
            };
            price = new Intl.NumberFormat('en-US', options).format(usdValue);
        } else {
            price = 'N/A';
        }

        tableRows += `| ${symbol} | ${price} | [AI to predict] | [AI to recommend] | [AI to justify] | [AI to predict] | [AI to recommend] | [AI to justify] |\n`;
    }
    return tableRows;
}


async function generateCryptoReport() {
    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // --- STEP 1: FETCH REAL-TIME DATA ---
    const livePrices = await getLiveCoinData();
    if (!livePrices) {
        return generateFallbackReport(currentDate, { message: 'Failed to fetch live price data from CoinGecko API.' });
    }

    // --- STEP 2: BUILD THE PROMPT WITH LIVE DATA ---
    const mainPriceTable = buildPriceTable(livePrices);

    const prompt = `
  You are AIXBT, a crypto analyst. Generate a daily crypto market report.

  **MANDATORY INSTRUCTIONS:**
  1.  **USE REAL-TIME DATA**: Fetch current data for the "Key Market Metrics" table. Use open-source data from CoinMarketCap, CoinGecko, and DefiLlama.
  2.  **USE PROVIDED PRICES**: For the "Cryptocurrency Analysis" table, you MUST use the "Current Price" data provided. Do not change it.
  3.  **COMPLETE ALL TABLES**: Fill in all missing columns in both tables.
  4.  **STRICT FORMAT**: Your entire response MUST be ONLY the completed Markdown tables, "Overall Summary", and "Related Posts" sections. No extra text or conversation.
  5.  **JUSTIFY YOUR ANALYSIS**: "Justification" columns must be brief, objective explanations based on market context, historical trends, or contributing factors. Incorporate insights from the specified Twitter accounts but do not rely on them exclusively.
  6.  **PROVIDE SIGNALS**: The "Implication" and "Action" columns should be "Buy", "Sell", or "Hold" with a short rationale. This is not financial advice.
  7.  **SUMMARIZE**: Write a short "Overall Summary" for a retail investor with a DCA strategy and moderate risk appetite.
  8.  **SUMMARIZE POSTS**: In the "Related Posts from Tracked Accounts" section, summarize recent relevant posts from the specified accounts for each cryptocurrency.
  9.  **CITE SOURCES**: Cite data sources inline where possible.

  **REPORT STRUCTURE:**

  # 📊 AIXBT Tracker Report
  **📅 Date:** ${currentDate}
  **📡 Data Source**: Real-time prices fetched from CoinGecko.com. Additional data from CoinMarketCap, DefiLlama, and X.

  ## 📈 Key Market Metrics

  | Metric | Figure | Changes | Justification | Implication |
  |---|---|---|---|---|
  | Bitcoin Dominance (BTCD) | [Fetch Current %] | [Fetch 24h/7d % Change] | [Explain why BTCD is at this level] | [Hold/Buy/Sell Signal + Rationale] |
  | Fear & Greed Index | [Fetch Current Value/Sentiment] | [Fetch 24h Change] | [Explain the current sentiment level] | [Hold/Buy/Sell Signal + Rationale] |
  | Social Volume (BTC & ETH) | [Fetch Descriptive Summary] | [Fetch 24h/7d Trend] | [Explain the social volume trend] | [Hold/Buy/Sell Signal + Rationale] |
  | Social Sentiment (BTC & ETH) | [Fetch Descriptive Summary] | [Fetch 24h/7d Trend] | [Explain the social sentiment trend] | [Hold/Buy/Sell Signal + Rationale] |
  | DeFi TVL | [Fetch Current $ Value] | [Fetch 24h/7d % Change] | [Explain the TVL change] | [Hold/Buy/Sell Signal + Rationale] |
  | Stablecoins Market Cap | [Fetch Current $ Value] | [Fetch 24h/7d % Change] | [Explain the market cap change] | [Hold/Buy/Sell Signal + Rationale] |
  | DEX Volumes | [Fetch Current $ Value] | [Fetch 24h/7d % Change] | [Explain the volume change] | [Hold/Buy/Sell Signal + Rationale] |
  | Fees Paid in DeFi | [Fetch Current $ Value] | [Fetch 24h/7d % Change] | [Explain the fee changes] | [Hold/Buy/Sell Signal + Rationale] |
  | Perps Volume | [Fetch Current $ Value] | [Fetch 24h/7d % Change] | [Explain the volume change] | [Hold/Buy/Sell Signal + Rationale] |
  | Upcoming Unlocks | [List top 3-5 upcoming unlocks] | [N/A] | [Explain the potential impact] | [Hold/Sell Signal + Rationale] |
  | ETF Inflows | [Fetch Net Inflow/Outflow] | [Fetch Previous Day's Flow] | [Explain the flow trend] | [Hold/Buy/Sell Signal + Rationale] |
  | RWA TVL | [Fetch Current $ Value] | [Fetch 7d/30d % Change] | [Explain the RWA TVL trend] | [Hold/Buy Signal + Rationale] |
  | Bridged Volume | [Fetch Current $ Value] | [Fetch 7d/30d % Change] | [Explain the bridged volume trend] | [Hold/Buy Signal + Rationale] |

  ## 📈 Cryptocurrency Analysis

  | Coin | Current Price | 30D Predicted | ST Action | ST Justification | 6M Predicted | LT Action | LT Justification |
  |---|---|---|---|---|---|---|---|
  ${mainPriceTable}

  ## 📝 Overall Summary
  [Synthesize the signals from both tables into a balanced daily outlook for a retail investor with a DCA strategy and moderate risk appetite.]

  ## 🔍 Related Posts from Tracked Accounts
  *Summarize recent posts from the following Twitter accounts related to each cryptocurrency, providing context for predictions and suggestions: @aixbt_agent, @OnchainDataNerd, @ASvanevik, @DefiIgnas, @simononchain, @zachxbt, @lookonchain, @WuBlockchain, @0xngmi, @CryptoHayes, @CryptoKaleo, @Pentosh1, @stacy_muur, @MikybullCrypto, @CryptoGirlNova, @0xbeinginvested, @ChainROI, @100xDarren, @Chyan, @cryptorinweb3*

  - **BTC**: [Brief summary of recent posts]
  - **ETH**: [Brief summary of recent posts]
  - **SOL**: [Brief summary of recent posts]
  - **... (and so on for other relevant coins)**

  ## 🚨 Legal Disclaimers
  **⚠️ IMPORTANT NOTICE**: This report is for EDUCATIONAL PURPOSES ONLY. All prices are time-sensitive.
  **🔥 Risk Warning**: Cryptocurrency markets are volatile. DYOR.
  ---
  *🤖 Generated by AIXBT Tracker System v2.0*`;

  try {
    console.log('🤖 Initializing Grok AI API connection with live price data...');

    const possibleModels = ['grok-3-mini', 'grok-4-0709'];
    let response = null;
    let lastError = null;

    for (const model of possibleModels) {
      try {
        console.log(`🔄 Attempting connection with model: ${model}`);

        const requestConfig = {
          messages: [{ role: "user", content: prompt }],
          model: model,
          max_tokens: 8000,
          temperature: 0.5
        };

        const requestHeaders = {
          'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
          'Content-Type': 'application/json'
        };

        response = await axios.post(
          'https://api.x.ai/v1/chat/completions',
          requestConfig,
          { headers: requestHeaders, timeout: 180000 }
        );

        if (response.status === 200 && response.data?.choices?.[0]?.message?.content) {
          const report = response.data.choices[0].message.content;
          if (report.includes('| Metric | Figure |') && report.includes('| Coin | Current Price |')) {
            console.log(`✅ Successfully generated report using model: ${model}`);
            return formatNotionReport(report);
          } else {
            console.error('Report quality check failed: Incorrect format.');
            console.error('Received report:', report);
            throw new Error(`Report quality check failed: Incorrect format.`);
          }
        } else {
          throw new Error(`API Error ${response.status}: ${JSON.stringify(response.data)}`);
        }
      } catch (error) {
        const errorMsg = error.response?.data?.error?.message || error.message;
        console.log(`❌ Model ${model} failed: ${errorMsg}`);
        lastError = { model, message: errorMsg };
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
    }
    console.error('❌ All Grok models failed. Generating fallback report.');
    return generateFallbackReport(currentDate, lastError);
  } catch (error) {
    console.error('💥 Critical error in report generation:', error.message);
    return generateFallbackReport(currentDate, { message: error.message });
  }
}

function formatNotionReport(report) {
    const reportStartIndex = report.indexOf('# 📊 AIXBT Tracker Report');
    if (reportStartIndex > 0) {
        report = report.substring(reportStartIndex);
    }
    return report;
}

function generateFallbackReport(currentDate, errorInfo = null) {
  const timestamp = new Date().toLocaleString();
  const errorSection = errorInfo ? `\n**Error Message**: ${errorInfo.message || 'Unknown error'}` : '';
  return `# 🚨 AIXBT Crypto Tracker - API Alert
**📅 Date:** ${currentDate}
**🕐 Time:** ${timestamp}
## 📉 System Status: OFFLINE
The daily crypto report could not be generated.
**Action Required:** A developer needs to investigate the issue.
${errorSection}
---
*🤖 This is an automated alert from the AIXBT Backup System.*`;
}

module.exports = { generateCryptoReport };
