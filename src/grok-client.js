const axios = require('axios');

// List of all cryptocurrencies the report will cover
// CORRECTED: Updated CoinGecko IDs for NEAR, TON, and XRP to ensure accurate data fetching.
const COIN_LIST = [
    'bitcoin', 'ethereum', 'solana', 'near', 'internet-computer', 
    'curve-dao-token', 'hive', 'avalanche-2', 'chainlink', 'dogecoin', 
    'floki', 'cardano', 'binancecoin', 'xrp', 'the-open-network', 'polkadot', 'uniswap'
];

/**
 * Fetches live price data from the CoinGecko API.
 * This is the core function to ensure prices are always real-time.
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
        // In case of failure, return null to trigger the fallback report.
        return null;
    }
}

/**
 * Dynamically builds the Markdown table with live price data.
 * @param {object} livePrices - The price data fetched from CoinGecko.
 * @returns {string} A markdown string of the table rows.
 */
function buildPriceTable(livePrices) {
    // Map of coin IDs to their symbols for the report table.
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
        
        // FIXED: Implemented robust price formatting to handle very low-value coins (like Floki)
        // and prevent them from appearing as $0. It now shows more decimal places for prices below $0.01.
        const priceData = livePrices[coinId];
        let price;
        if (priceData && typeof priceData.usd === 'number') {
            const usdValue = priceData.usd;
            // Use more precision for numbers smaller than $0.01, otherwise use standard 2 decimal places.
            const options = {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: usdValue < 0.01 ? 8 : 2,
            };
            price = new Intl.NumberFormat('en-US', options).format(usdValue);
        } else {
            price = 'N/A'; // Fallback for missing data
        }

        // The AI will fill in the rest of the data based on the live price provided.
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
        // If fetching prices fails, we cannot proceed. Generate a fallback report.
        return generateFallbackReport(currentDate, { message: 'Failed to fetch live price data from CoinGecko API.' });
    }

    // --- STEP 2: BUILD THE PROMPT WITH LIVE DATA ---
    const mainPriceTable = buildPriceTable(livePrices);

    // ADDED: Enhanced the prompt to ask for specific insights on more coins, including the ones that were fixed.
    const prompt = `
  CRITICAL INSTRUCTION: You are AIXBT, a crypto analyst. I have provided you with a table containing the REAL-TIME, LIVE prices for several cryptocurrencies. Your task is to complete the table.

  **MANDATORY REQUIREMENTS:**
  1.  **USE PROVIDED PRICES**: You MUST use the "Current Price" data I have provided in the table. Do NOT change it.
  2.  **COMPLETE THE TABLE**: Fill in the missing columns: "30D Predicted", "ST Action", "ST Justification", "6M Predicted", "LT Action", and "LT Justification".
  3.  **STAY IN FORMAT**: Your entire response must be ONLY the completed Markdown table and the "Related Insights" section. Do not add any extra text or conversation.

  **REPORT STRUCTURE:**

  # 📊 AIXBT Tracker Report
  **📅 Date:** ${currentDate}
  **📡 Data Source**: Real-time prices fetched from CoinGecko.com.

  ## 📈 Cryptocurrency Analysis

  | Coin | Current Price | 30D Predicted | ST Action | ST Justification | 6M Predicted | LT Action | LT Justification |
  |---|---|---|---|---|---|---|---|
  ${mainPriceTable}

  ## 🌟 High-Potential Tokens (Top 5)
  *From the list above, select the 5 you believe have the highest potential and summarize why.*

  ## 🔍 Related Insights (from tracked accounts)
  - **BTC**: [Brief summary of recent whale moves or key influencer targets.]
  - **ETH**: [Brief summary of recent staking data or key influencer targets.]
  - **SOL**: [Brief summary of recent ecosystem news or key influencer targets.]
  - **NEAR**: [Brief summary of sharding developments or key influencer targets.]
  - **TON**: [Brief summary of Telegram integration news or key influencer targets.]
  - **XRP**: [Brief summary of legal case developments or partnership news.]

  ## 🚨 Legal Disclaimers
  **⚠️ IMPORTANT NOTICE**: This report is for EDUCATIONAL PURPOSES ONLY. All prices are time-sensitive.
  **🔥 Risk Warning**: Cryptocurrency markets are volatile. DYOR.
  ---
  *🤖 Generated by AIXBT Tracker System v2.0*`;

  try {
    console.log('🤖 Initializing Grok AI API connection with live price data...');
    
    const possibleModels = ['grok-3-mini', 'grok-4-0709']; // Prioritize faster, cheaper model
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
          { headers: requestHeaders, timeout: 120000 }
        );

        if (response.status === 200 && response.data?.choices?.[0]?.message?.content) {
          const report = response.data.choices[0].message.content;
          if (report.includes('| Current Price |')) {
            console.log(`✅ Successfully generated report using model: ${model}`);
            return formatNotionReport(report);
          } else {
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
