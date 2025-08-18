const axios = require('axios');

async function generateCryptoReport() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const prompt = `Generate a comprehensive daily cryptocurrency tracking report for Notion with professional formatting and real-time market data.

# 📊 AIXBT Crypto Tracker Report
**📅 Date:** ${currentDate}

## 🚨 CRITICAL REQUIREMENTS
- **MANDATORY**: Fetch LIVE prices from CoinGecko.com or CoinMarketCap.com APIs 
- **MANDATORY**: Use current market data - NO hypothetical or cached prices
- **MANDATORY**: Base analysis on RECENT social sentiment and on-chain data

## 📈 Cryptocurrency Analysis

Analyze each asset using this EXACT format:

### 🟠 Bitcoin (BTC)
| **Metric** | **Value** | **Analysis** |
|------------|-----------|--------------|
| **Current Price** | $[LIVE PRICE] | [Price context] |
| **24h Change** | [%] | [Trend analysis] |
| **30D Target** | $[target] | ✅ BUY / ❌ SELL / ⏸️ HOLD |
| **6M Target** | $[target] | ✅ BUY / ❌ SELL / ⏸️ HOLD |
| **Short-Term Reason** | [1-2 sentences based on tracked accounts] |
| **Long-Term Reason** | [1-2 sentences based on fundamentals] |

### 🔵 Ethereum (ETH)
| **Metric** | **Value** | **Analysis** |
|------------|-----------|--------------|
| **Current Price** | $[LIVE PRICE] | [Price context] |
| **24h Change** | [%] | [Trend analysis] |
| **30D Target** | $[target] | ✅ BUY / ❌ SELL / ⏸️ HOLD |
| **6M Target** | $[target] | ✅ BUY / ❌ SELL / ⏸️ HOLD |
| **Short-Term Reason** | [Analysis based on tracked accounts] |
| **Long-Term Reason** | [Fundamental analysis] |

Continue this EXACT table format for: **Solana (SOL)**, **NEAR Protocol (NEAR)**, **Internet Computer (ICP)**, **Curve (CRV)**, **Hive (HIVE)**, **Avalanche (AVAX)**, **Chainlink (LINK)**, **Dogecoin (DOGE)**, **Floki (FLOKI)**, **Cardano (ADA)**

## 🌟 High-Potential Tokens (Top 5)
Select 5 promising tokens from top 100 market cap and analyze using the same table format.

## 📊 Market Intelligence Dashboard

### 🐋 Whale Activity Monitor
- **Major Movements**: [Significant whale transactions and institutional flows]
- **Notable Wallets**: [Key wallet activities affecting market sentiment]

### 📈 On-Chain Metrics Summary  
- **Network Activity**: [Transaction volumes, active addresses]
- **DeFi Metrics**: [TVL changes, yield farming trends]
- **Development Activity**: [GitHub commits, protocol upgrades]

### 💬 Social Sentiment Analysis
- **Bullish Signals**: [Positive sentiment from tracked accounts]
- **Bearish Concerns**: [Negative sentiment and warnings]
- **Neutral/Mixed**: [Uncertain market conditions]

### 🔥 Trending Narratives
- **Hot Topics**: [Emerging crypto trends and discussions]
- **Sector Rotation**: [Capital flow between different crypto sectors]

## 📌 Trading Strategy Guide

### ⚡ Short-Term Signals (30 Days)
- **✅ STRONG BUY**: Exceptional momentum with multiple positive catalysts
- **🟢 BUY**: Solid momentum with positive technical/fundamental signals  
- **⏸️ HOLD**: Mixed signals requiring patience and monitoring
- **🟡 CAUTION**: Uncertain conditions with conflicting indicators
- **❌ SELL**: Clear bearish signals indicating potential decline

### 🎯 Long-Term Outlook (6 Months)
- **✅ ACCUMULATE**: Strong fundamentals with significant growth potential
- **🟢 BUY & HOLD**: Solid fundamentals with steady growth expected
- **⏸️ MONITOR**: Stable but limited upside, watch for catalysts
- **🟡 REASSESS**: Fundamental concerns requiring closer evaluation
- **❌ AVOID**: Serious fundamental issues or competitive threats

## ⚠️ Risk Management Framework

### 🎲 Portfolio Allocation Guidance
- **High Conviction (BTC/ETH)**: 40-60% allocation
- **Large Cap Alts**: 20-30% allocation  
- **Mid Cap Opportunities**: 10-20% allocation
- **Small Cap/Speculative**: 5-10% maximum

### 🛡️ Risk Controls
- **Stop Losses**: Recommended levels for position protection
- **Take Profits**: Strategic exit points for profit realization
- **Position Sizing**: Maximum exposure per asset class

## 📋 Data Sources & Methodology

**🔍 Price Data Sources**: 
- Primary: CoinGecko.com API (real-time)
- Secondary: CoinMarketCap.com API (verification)
- Tertiary: DEX aggregators for accurate pricing

**📱 Intelligence Sources**: 
@aixbt_agent, @OnchainDataNerd, @ASvanevik, @DefiIgnas, @simononchain, @zachxbt, @lookonchain, @WuBlockchain, @0xngmi, @CryptoHayes, @CryptoKaleo, @Pentosh1, @stacy_muur, @MikybullCrypto, @CryptoGirlNova, @0xbeinginvested, @ChainROI, @100xDarren, @Chyan, @cryptorinweb3

**📊 Analysis Framework**:
- Technical Analysis: Chart patterns, support/resistance levels
- Fundamental Analysis: Network metrics, adoption trends  
- Sentiment Analysis: Social media, news sentiment scoring
- On-Chain Analysis: Transaction data, whale movements

## 🚨 Legal Disclaimers

**⚠️ IMPORTANT NOTICE**: This report is for EDUCATIONAL PURPOSES ONLY and does NOT constitute financial advice. Cryptocurrency investments carry extreme volatility and risk of total loss.

**🔥 Risk Warning**: 
- Crypto markets are highly speculative and volatile
- Past performance does not guarantee future results  
- Only invest what you can afford to lose completely
- Always conduct your own research (DYOR) before investing
- Consider consulting with licensed financial advisors

**📊 Data Accuracy**: While we strive for accuracy, market data can change rapidly. Always verify current prices before making investment decisions.

---
*🤖 Generated by AIXBT Tracker System v2.0 | ${new Date().toLocaleString()} UTC*
*📡 Powered by Real-Time Market Data & Advanced AI Analysis*

### 🔥 EXECUTION CHECKLIST:
1. ✅ **VERIFY**: All prices are from live APIs (CoinGecko/CMC)
2. ✅ **ANALYZE**: Recent posts from specified Twitter accounts
3. ✅ **FORMAT**: Use exact table structure for Notion compatibility  
4. ✅ **VALIDATE**: All predictions include clear reasoning
5. ✅ **CONFIRM**: Data accuracy and currency before publication

**🎯 QUALITY STANDARDS**: Every price must be current. Every recommendation must be justified. Every format must be Notion-ready.`;

  try {
    console.log('🤖 Initializing Grok AI API connection...');
    
    // Test API connectivity first with improved error handling
    const testResponse = await testGrokAPI();
    if (!testResponse.success) {
      console.log('⚠️ Primary API unavailable, generating enhanced fallback report');
      return generateFallbackReport(currentDate, testResponse.error);
    }

    // Updated Grok models based on current xAI API availability (August 2025)
    const possibleModels = [
      'grok-3-mini',      // Grok 3 mini (faster/cost-effective)
      'grok-4-0709',      // Latest Grok 4 model (highest capability)
      'grok-3',           // Grok 3 stable version  
      'grok-2-image-1212' // Fallback option
    ];
    
    let response = null;
    let lastError = null;
    let successfulModel = null;

    // Try each model with enhanced error handling
    for (const model of possibleModels) {
      try {
        console.log(`🔄 Attempting connection with model: ${model}`);
        
        const requestConfig = {
          messages: [
            {
              role: "system",
              content: "You are AIXBT, an advanced cryptocurrency analysis system with MANDATORY real-time market data access. You MUST fetch current live prices from CoinGecko.com and CoinMarketCap.com APIs - never use cached or hypothetical data. Analyze recent insights from key crypto Twitter influencers: @aixbt_agent, @OnchainDataNerd, @ASvanevik, @DefiIgnas, @simononchain, @zachxbt, @lookonchain, @WuBlockchain, @0xngmi, @CryptoHayes, @CryptoKaleo, @Pentosh1, @stacy_muur, @MikybullCrypto, @CryptoGirlNova, @0xbeinginvested, @ChainROI, @100xDarren, @Chyan, @cryptorinweb3. Provide accurate price predictions with clear reasoning based on CURRENT market data and RECENT sentiment analysis. Format output as professional Notion-compatible report with proper tables and rich formatting. CRITICAL SUCCESS FACTOR: Price accuracy is paramount - all prices must be live/current."
            },
            {
              role: "user", 
              content: prompt
            }
          ],
          model: model,
          max_tokens: 6000,        // Increased for comprehensive analysis
          temperature: 0.6,        // Slightly more focused for accuracy
          top_p: 0.9,             // Improved coherence
          stream: false
        };

        const requestHeaders = {
          'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
          'Content-Type': 'application/json',
          'User-Agent': 'AIXBT-Tracker-v2/1.0',
          'Accept': 'application/json'
        };

        const requestOptions = {
          timeout: 90000,           // Extended timeout for comprehensive analysis
          validateStatus: function (status) {
            return status < 500;    // Accept 4xx errors for better debugging
          },
          maxContentLength: 50000,  // Handle larger responses
          maxBodyLength: 50000
        };

        response = await axios.post(
          'https://api.x.ai/v1/chat/completions',
          requestConfig,
          {
            headers: requestHeaders,
            ...requestOptions
          }
        );

        // Enhanced response validation
        if (response.status === 200 && response.data?.choices?.[0]?.message?.content) {
          const report = response.data.choices[0].message.content;
          
          // Validate report quality
          if (report.length > 500 && report.includes('Current Price') && report.includes('$')) {
            console.log(`✅ Successfully generated report using model: ${model}`);
            console.log(`📊 Report length: ${report.length} characters`);
            console.log(`🎯 Model performance: ${response.data.usage ? JSON.stringify(response.data.usage) : 'Unknown'}`);
            
            successfulModel = model;
            return formatNotionReport(report);
          } else {
            throw new Error(`Report quality check failed: insufficient content or missing price data`);
          }
        } else if (response.status === 401) {
          throw new Error(`Authentication failed - check API key validity`);
        } else if (response.status === 429) {
          console.log(`⏳ Rate limit hit for ${model}, waiting before next attempt...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          throw new Error(`Rate limit exceeded`);
        } else {
          throw new Error(`API Error ${response.status}: ${JSON.stringify(response.data)}`);
        }

      } catch (error) {
        const errorMsg = error.response?.data?.error?.message || error.message;
        console.log(`❌ Model ${model} failed: ${errorMsg}`);
        lastError = {
          model: model,
          status: error.response?.status,
          message: errorMsg,
          timestamp: new Date().toISOString()
        };
        
        // Brief delay between model attempts
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
    }

    // Enhanced fallback reporting if all models fail
    console.error('❌ All Grok models failed. Generating comprehensive fallback report...');
    console.error('🔍 Last error details:', JSON.stringify(lastError, null, 2));
    
    return generateFallbackReport(currentDate, lastError);
    
  } catch (error) {
    console.error('💥 Critical error in report generation:', error.message);
    console.error('🔧 Stack trace:', error.stack);
    return generateFallbackReport(currentDate, {
      type: 'critical_error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

async function testGrokAPI() {
  try {
    console.log('🔍 Testing Grok API connectivity...');
    
    const response = await axios.get('https://api.x.ai/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'AIXBT-Tracker-v2/1.0'
      },
      timeout: 15000
    });
    
    if (response.status === 200 && response.data?.data) {
      const availableModels = response.data.data.map(m => m.id);
      console.log('✅ Grok API connectivity confirmed');
      console.log('📋 Available models:', availableModels.join(', '));
      
      return { 
        success: true, 
        models: availableModels,
        totalModels: availableModels.length
      };
    } else {
      return { 
        success: false, 
        error: `Unexpected response structure: ${response.status}`,
        response: response.data
      };
    }
  } catch (error) {
    const errorDetails = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      timestamp: new Date().toISOString()
    };
    
    console.log('⚠️ Grok API connectivity test failed:', JSON.stringify(errorDetails, null, 2));
    
    return { 
      success: false, 
      error: errorDetails
    };
  }
}

function formatNotionReport(report) {
  try {
    console.log('🎨 Formatting report for Notion compatibility...');
    
    // Enhanced Notion formatting
    let formattedReport = report
      // Fix bold formatting for Notion
      .replace(/\*\*([^*]+)\*\*/g, '**$1**')
      // Ensure proper table formatting
      .replace(/\|\s*\*\*([^*]+)\*\*\s*\|/g, '| **$1** |')
      // Clean up extra spaces in tables
      .replace(/\|\s+/g, '| ')
      .replace(/\s+\|/g, ' |')
      // Ensure proper emoji spacing
      .replace(/([📊🔥⚡🎯✅❌⏸️🟢🟡🔴])\s*/g, '$1 ')
      // Clean up multiple newlines
      .replace(/\n{3,}/g, '\n\n')
      // Ensure proper section headers
      .replace(/^(#{1,6})\s*(.+)$/gm, '$1 $2');

    console.log('✅ Report successfully formatted for Notion');
    return formattedReport;
    
  } catch (error) {
    console.log('⚠️ Error in report formatting, returning original:', error.message);
    return report;
  }
}

function generateFallbackReport(currentDate, errorInfo = null) {
  const timestamp = new Date().toLocaleString();
  const errorSection = errorInfo ? 
    `\n## 🔧 Technical Details\n**Error Type**: ${errorInfo.type || 'API_ERROR'}\n**Message**: ${errorInfo.message || 'Unknown error'}\n**Timestamp**: ${errorInfo.timestamp || timestamp}` : '';

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
