const { Client } = require('@notionhq/client');

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

// Notion's character limit for a single rich text object (like in a code block)
const NOTION_BLOCK_CHAR_LIMIT = 2000;

async function createNotionPage(reportContent) {
  try {
    console.log('📝 Creating Notion page with new chunking logic...');
    
    const currentDate = new Date();
    const dateString = currentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });

    // --- 1. Define Page Properties ---
    const pageProperties = {
      Title: {
        title: [
          {
            text: {
              content: `🎯 AIXBT Tracker Report - ${dateString}`,
            },
          },
        ],
      },
      Date: {
        date: {
          start: currentDate.toISOString().split('T')[0],
        },
      },
      Status: {
        select: {
          name: "Published",
        },
      }
    };

    // --- 2. Clean Report Content ---
    let finalReportContent = reportContent;
    const reportStartIndex = reportContent.indexOf('# 📊 AIXBT Tracker Report');
    if (reportStartIndex > 0) {
        console.log('Trimming conversational text from the beginning of the report.');
        finalReportContent = reportContent.substring(reportStartIndex);
    }

    // --- 3. Split Content into Chunks to Respect API Limits ---
    const contentChunks = [];
    let currentChunk = '';
    const lines = finalReportContent.split('\n');

    for (const line of lines) {
      // Check if adding the next line would exceed the limit
      if (currentChunk.length + line.length + 1 > NOTION_BLOCK_CHAR_LIMIT) {
        contentChunks.push(currentChunk);
        currentChunk = '';
      }
      currentChunk += line + '\n';
    }
    // Add the last remaining chunk
    if (currentChunk) {
      contentChunks.push(currentChunk);
    }
    console.log(`Report content split into ${contentChunks.length} chunks.`);

    // --- 4. Construct Notion Blocks ---
    const initialBlocks = [
      {
        object: 'block',
        type: 'heading_1',
        heading_1: {
          rich_text: [{ type: 'text', text: { content: `📊 AIXBT Crypto Tracker - ${dateString}` } }],
        },
      },
      { object: 'block', type: 'divider', divider: {} }
    ];

    const contentBlocks = contentChunks.map(chunk => ({
      object: 'block',
      type: 'code',
      code: {
        rich_text: [{ type: 'text', text: { content: chunk } }],
        language: 'markdown',
      },
    }));

    const footerBlocks = [
        { object: 'block', type: 'divider', divider: {} },
        {
            object: 'block',
            type: 'paragraph',
            paragraph: {
                rich_text: [
                    {
                        type: 'text',
                        text: { content: `Generated automatically on ${new Date().toLocaleString()} by AIXBT Tracker Bot 🎯` },
                        annotations: { italic: true, color: 'gray' }
                    },
                ],
            },
        },
    ];

    const allBlocks = [...initialBlocks, ...contentBlocks, ...footerBlocks];

    // --- 5. Create the Notion Page ---
    // Notion has a limit of 100 blocks per request, this should be safe.
    console.log(`🏗️ Creating page with ${allBlocks.length} total blocks...`);
    const response = await notion.pages.create({
      parent: { database_id: process.env.NOTION_DATABASE_ID },
      properties: pageProperties,
      children: allBlocks,
    });

    console.log(`✅ Created Notion page with ID: ${response.id}`);
    
    return {
      id: response.id,
      url: response.url,
    };
    
  } catch (error) {
    console.error('❌ Error creating Notion page:', error);
    if (error.body) {
      console.error('Notion API Error Details:', JSON.stringify(error.body, null, 2));
    }
    throw new Error(`Failed to create Notion page: ${error.message}`);
  }
}

module.exports = { createNotionPage };
