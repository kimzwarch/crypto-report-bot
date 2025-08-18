const axios = require('axios');

async function generateCryptoReport() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // NEW, STRICTER PROMPT to enforce the correct format and real-time data.
  const prompt = `
  CRITICAL INSTRUCTION: You are AIXBT, a cryptocurrency analysis bot. Your ONLY task is to generate a report in the EXACT format specified below. Do NOT add any extra sections, commentary, or conversational text. You MUST use real-time, live market data for all prices.

  **MANDATORY REQUIREMENTS:**
  1.  **REAL-TIME DATA ONLY**: You MUST fetch LIVE prices directly from CoinGecko.com or CoinMarketCap.com APIs at the moment of this request. State this explicitly. DO NOT use cached, hypothetical, or old data.
  2.  **EXACT TABLE FORMAT**: The report MUST contain a table with the following columns: "Coin", "Current Price", "30D Predicted", "ST Action", "ST Justification", "6M Predicted", "LT Action", "LT Justification".
  3.  **NO EXTRA SECTIONS**: Do NOT include sections like "Market Intelligence Dashboard," "Trading Strategy," "Risk Management," or any other verbose analysis. Only the table and a brief "Related Insights" section are allowed.
  4.  **JUSTIFICATION REQUIRED**: Every "Action" (Buy/Sell/Hold) must have a concise justification based on RECENT (last 24 hours) on-chain data or influencer sentiment.

  **REPORT STRUCTURE:**

  # 📊 AIXBT Tracker Report
  **📅 Date:** ${currentDate}
  **📡 Data Source**: Real-time prices fetched from CoinGecko.com & CoinMarketCap.com APIs.

  ## 📈 Price Predictions & Suggestions

  | Coin | Current Price | 30D Predicted | ST Action | ST Justification | 6M Predicted | LT Action | LT Justification |
  |---|---|---|---|---|---|---|---|
  | BTC | $[LIVE PRICE] | $[Target Price] | [✅ Buy / ❌ Sell / ⏸️ Hold] | [Concise reason based on recent data] | $[Target Price] | [✅ Buy / ❌ Sell / ⏸️ Hold] | [Concise reason based on fundamentals] |
  | ETH | $[LIVE PRICE] | $[Target Price] | [✅ Buy / ❌ Sell / ⏸️ Hold] | [Concise reason based on recent data] | $[Target Price] | [✅ Buy / ❌ Sell / ⏸️ Hold] | [Concise reason based on fundamentals] |
  | SOL | $[LIVE PRICE] | $[Target Price] | [✅ Buy / ❌ Sell / ⏸️ Hold] | [Concise reason based on recent data] | $[Target Price] | [✅ Buy / ❌ Sell / ⏸️ Hold] | [Concise reason based on fundamentals] |
  | NEAR | $[LIVE PRICE] | $[Target Price] | [✅ Buy / ❌ Sell / ⏸️ Hold] | [Concise reason based on recent data] | $[Target Price] | [✅ Buy / ❌ Sell / ⏸️ Hold] | [Concise reason based on fundamentals] |
  | ICP | $[LIVE PRICE] | $[Target Price] | [✅ Buy / ❌ Sell / ⏸️ Hold] | [Concise reason based on recent data] | $[Target Price] | [✅ Buy / ❌ Sell / ⏸️ Hold] | [Concise reason based on fundamentals] |
  | CRV | $[LIVE PRICE] | $[Target Price] | [✅ Buy / ❌ Sell / ⏸️ Hold] | [Concise reason based on recent data] | $[Target Price] | [✅ Buy / ❌ Sell / ⏸️ Hold] | [Concise reason based on fundamentals] |
  | HIVE | $[LIVE PRICE] | $[Target Price] | [✅ Buy / ❌ Sell / ⏸️ Hold] | [Concise reason based on recent data] | $[Target Price] | [✅ Buy / ❌ Sell / ⏸️ Hold] | [Concise reason based on fundamentals] |
  | AVAX | $[LIVE PRICE] | $[Target Price] | [✅ Buy / ❌ Sell / ⏸️ Hold] | [Concise reason based on recent data] | $[Target Price] | [✅ Buy / ❌ Sell / ⏸️ Hold] | [Concise reason based on fundamentals] |
  | LINK | $[LIVE PRICE] | $[Target Price] | [✅ Buy / ❌ Sell / ⏸️ Hold] | [Concise reason based on recent data] | $[Target Price] | [✅ Buy / ❌ Sell / ⏸️ Hold] | [Concise reason based on fundamentals] |
  | DOGE | $[LIVE PRICE] | $[Target Price] | [✅ Buy / ❌ Sell / ⏸️ Hold] | [Concise reason based on recent data] | $[Target Price] | [✅ Buy / ❌ Sell / ⏸️ Hold] | [Concise reason based on fundamentals] |
  | FLOKI | $[LIVE PRICE] | $[Target Price] | [✅ Buy / ❌ Sell / ⏸️ Hold] | [Concise reason based on recent data] | $[Target Price] | [✅ Buy / ❌ Sell / ⏸️ Hold] | [Concise reason based on fundamentals] |
  | ADA | $[LIVE PRICE] | $[Target Price] | [✅ Buy / ❌ Sell / ⏸️ Hold] | [Concise reason based on recent data] | $[Target Price] | [✅ Buy / ❌ Sell / ⏸️ Hold] | [Concise reason based on fundamentals] |

  ## 🔍 Related Insights (from tracked accounts)
  - **BTC**: [Brief summary of recent whale moves, exchange flows, or key influencer targets.]
  - **ETH**: [Brief summary of recent whale moves, staking data, or key influencer targets.]
  - **SOL**: [Brief summary of recent ecosystem news, meme coin flows, or key influencer targets.]
  - **Others**: [Brief summary of notable events for any other coins in the list, e.g., major whale buys for LINK.]

  ## 🚨 Legal Disclaimers
  **⚠️ IMPORTANT NOTICE**: This report is for EDUCATIONAL PURPOSES ONLY and does NOT constitute financial advice. All prices are time-sensitive.
  **🔥 Risk Warning**: Cryptocurrency markets are highly volatile. Always conduct your own research (DYOR) before investing.
  ---
  *🤖 Generated by AIXBT Tracker System v2.0*`;

  try {
    console.log('🤖 Initializing Grok AI API connection with new, stricter prompt...');
    
    const testResponse = await testGrokAPI();
    if (!testResponse.success) {
      console.log('⚠️ Primary API unavailable, generating fallback report');
      return generateFallbackReport(currentDate, testResponse.error);
    }

    const possibleModels = [
      'grok-3-mini',
      'grok-4-0709',
      'grok-3',
      'grok-2-image-1212'
    ];
    
    let response = null;
    let lastError = null;

    for (const model of possibleModels) {
      try {
        console.log(`🔄 Attempting connection with model: ${model}`);
        
        const requestConfig = {
          messages: [
            {
              role: "system",
              content: "You are AIXBT, a cryptocurrency analysis system. You MUST follow user instructions for formatting and data sourcing precisely. Your primary directive is to use REAL-TIME data and adhere to the requested structure without deviation."
            },
            {
              role: "user", 
              content: prompt
            }
          ],
          model: model,
          max_tokens: 4096,
          temperature: 0.5,
          top_p: 0.9,
          stream: false
        };

        const requestHeaders = {
          'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
          'Content-Type': 'application/json',
          'User-Agent': 'AIXBT-Tracker-v2/1.0',
        };

        const requestOptions = {
          timeout: 90000,
          validateStatus: (status) => status < 500,
        };

        response = await axios.post(
          'https://api.x.ai/v1/chat/completions',
          requestConfig,
          { headers: requestHeaders, ...requestOptions }
        );

        if (response.status === 200 && response.data?.choices?.[0]?.message?.content) {
          const report = response.data.choices[0].message.content;
          
          if (report.includes('| Current Price |') && report.includes('$')) {
            console.log(`✅ Successfully generated report using model: ${model}`);
            return formatNotionReport(report);
          } else {
            throw new Error(`Report quality check failed: Incorrect format or missing price data.`);
          }
        } else {
          throw new Error(`API Error ${response.status}: ${JSON.stringify(response.data)}`);
        }

      } catch (error) {
        const errorMsg = error.response?.data?.error?.message || error.message;
        console.log(`❌ Model ${model} failed: ${errorMsg}`);
        lastError = { model, status: error.response?.status, message: errorMsg };
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
    }

    console.error('❌ All Grok models failed. Generating fallback report.');
    console.error('🔍 Last error details:', JSON.stringify(lastError, null, 2));
    return generateFallbackReport(currentDate, lastError);
    
  } catch (error) {
    console.error('💥 Critical error in report generation:', error.message);
    return generateFallbackReport(currentDate, { type: 'critical_error', message: error.message });
  }
}

async function testGrokAPI() {
  try {
    console.log('🔍 Testing Grok API connectivity...');
    const response = await axios.get('https://api.x.ai/v1/models', {
      headers: { 'Authorization': `Bearer ${process.env.GROK_API_KEY}` },
      timeout: 15000
    });
    if (response.status === 200 && response.data?.data) {
      console.log('✅ Grok API connectivity confirmed.');
      return { success: true };
    }
    return { success: false, error: `Unexpected response: ${response.status}` };
  } catch (error) {
    const errorDetails = {
      message: error.message,
      status: error.response?.status,
    };
    console.log('⚠️ Grok API connectivity test failed:', JSON.stringify(errorDetails, null, 2));
    return { success: false, error: errorDetails };
  }
}

function formatNotionReport(report) {
    console.log('🎨 Formatting report for Notion compatibility...');
    // Clean up any conversational text before the main report header
    const reportStartIndex = report.indexOf('# 📊 AIXBT Tracker Report');
    if (reportStartIndex > 0) {
        console.log('Trimming conversational text from the beginning of the report.');
        report = report.substring(reportStartIndex);
    }
    return report;
}

function generateFallbackReport(currentDate, errorInfo = null) {
  const timestamp = new Date().toLocaleString();
  const errorSection = errorInfo ? 
    `\n## 🔧 Technical Details\n**Error Message**: ${errorInfo.message || 'Unknown error'}` : '';

  return `# 🚨 AIXBT Crypto Tracker - API Alert
**📅 Date:** ${currentDate}
**🕐 Time:** ${timestamp}

## 📉 System Status: OFFLINE

The Grok AI API is currently down and the daily crypto report could not be generated.

**Action Required:** A developer needs to be notified to manually restart the bot and investigate the issue.
${errorSection}

---
*🤖 This is an automated alert from the AIXBT Backup System.*`;
}

module.exports = { generateCryptoReport };
