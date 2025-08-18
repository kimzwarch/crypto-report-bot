const axios = require('axios');

async function generateCryptoReport() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // FINAL, MOST STRICT PROMPT to enforce format and content.
  const prompt = `
  CRITICAL INSTRUCTION: Generate a report in the EXACT format below. You MUST use real-time, live market data for all prices. The output MUST be a valid, Notion-compatible Markdown table.

  **MANDATORY REQUIREMENTS:**
  1.  **REAL-TIME DATA ONLY**: Fetch LIVE prices from CoinGecko.com or CoinMarketCap.com APIs. Do NOT use cached or hypothetical data.
  2.  **EXACT TABLE FORMAT**: The entire cryptocurrency analysis section MUST be a single, valid Markdown table.
  3.  **TWO SECTIONS REQUIRED**: The report must contain the main analysis table AND the "High-Potential Tokens" table.
  4.  **JUSTIFICATION REQUIRED**: Every recommendation must have a concise justification based on RECENT (last 24 hours) data.

  **REPORT STRUCTURE:**

  # 📊 AIXBT Tracker Report
  **📅 Date:** ${currentDate}
  **📡 Data Source**: Real-time prices fetched from CoinGecko.com & CoinMarketCap.com APIs.

  ## 📈 Cryptocurrency Analysis

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

  ## 🌟 High-Potential Tokens (Top 5)
  *Select 5 promising tokens from the top 100 market cap (excluding those above) and analyze them using the exact same table format.*

  | Coin | Current Price | 30D Predicted | ST Action | ST Justification | 6M Predicted | LT Action | LT Justification |
  |---|---|---|---|---|---|---|---|
  | [Token 1] | $[LIVE PRICE] | $[Target] | [Action] | [Reason] | $[Target] | [Action] | [Reason] |
  | [Token 2] | $[LIVE PRICE] | $[Target] | [Action] | [Reason] | $[Target] | [Action] | [Reason] |
  | [Token 3] | $[LIVE PRICE] | $[Target] | [Action] | [Reason] | $[Target] | [Action] | [Reason] |
  | [Token 4] | $[LIVE PRICE] | $[Target] | [Action] | [Reason] | $[Target] | [Action] | [Reason] |
  | [Token 5] | $[LIVE PRICE] | $[Target] | [Action] | [Reason] | $[Target] | [Action] | [Reason] |

  ## 🔍 Related Insights (from tracked accounts)
  - **BTC**: [Brief summary of recent whale moves or key influencer targets.]
  - **ETH**: [Brief summary of recent staking data or key influencer targets.]
  - **SOL**: [Brief summary of recent ecosystem news or key influencer targets.]
  - **Others**: [Brief summary of notable events for any other coins in the list.]

  ## 🚨 Legal Disclaimers
  **⚠️ IMPORTANT NOTICE**: This report is for EDUCATIONAL PURPOSES ONLY. All prices are time-sensitive.
  **🔥 Risk Warning**: Cryptocurrency markets are volatile. Always conduct your own research (DYOR).
  ---
  *🤖 Generated by AIXBT Tracker System v2.0*`;

  try {
    console.log('🤖 Initializing Grok AI API connection with final, strict prompt...');
    
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
              content: "You are AIXBT, a cryptocurrency analysis bot. You MUST follow user instructions for formatting and data sourcing precisely. Your primary directive is to use REAL-TIME data and adhere to the requested structure without deviation. The output must be a valid markdown table."
            },
            {
              role: "user", 
              content: prompt
            }
          ],
          model: model,
          max_tokens: 8000, // Increased max_tokens to accommodate the larger report
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
          timeout: 120000, // Increased timeout for the larger request
          validateStatus: (status) => status < 500,
        };

        response = await axios.post(
          'https://api.x.ai/v1/chat/completions',
          requestConfig,
          { headers: requestHeaders, ...requestOptions }
        );

        if (response.status === 200 && response.data?.choices?.[0]?.message?.content) {
          const report = response.data.choices[0].message.content;
          
          if (report.includes('| Current Price |') && report.includes('High-Potential Tokens')) {
            console.log(`✅ Successfully generated report using model: ${model}`);
            return formatNotionReport(report);
          } else {
            throw new Error(`Report quality check failed: Incorrect format or missing required sections.`);
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
