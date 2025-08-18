const { Client } = require('@notionhq/client');

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

async function createNotionPage(reportContent) {
  try {
    console.log('📝 Creating Notion page with new, simplified formatting logic...');
    
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

    // --- 2. Clean and Prepare Report Content ---
    // Remove any conversational text before the main report header
    let finalReportContent = reportContent;
    const reportStartIndex = reportContent.indexOf('# 📊 AIXBT Tracker Report');
    if (reportStartIndex > 0) {
        console.log('Trimming conversational text from the beginning of the report.');
        finalReportContent = reportContent.substring(reportStartIndex);
    }

    // --- 3. Construct Notion Blocks (Simplified Method) ---
    // The most reliable way to preserve table formatting is to use a code block.
    const contentBlocks = [
      {
        object: 'block',
        type: 'heading_1',
        heading_1: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: `📊 AIXBT Crypto Tracker - ${dateString}`,
              },
            },
          ],
        },
      },
      {
        object: 'block',
        type: 'divider',
        divider: {}
      },
      {
        // Use a code block to perfectly preserve the table's formatting
        object: 'block',
        type: 'code',
        code: {
          rich_text: [{
            type: 'text',
            text: {
              content: finalReportContent,
            }
          }],
          language: 'markdown' // Set language for potential syntax highlighting
        }
      },
      {
        object: 'block',
        type: 'divider',
        divider: {}
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: `Generated automatically on ${new Date().toLocaleString()} by AIXBT Tracker Bot 🎯`,
              },
              annotations: {
                italic: true,
                color: 'gray'
              }
            },
          ],
        },
      },
    ];

    // --- 4. Create the Notion Page ---
    console.log(`🏗️ Creating page with ${contentBlocks.length} blocks...`);
    const response = await notion.pages.create({
      parent: {
        database_id: process.env.NOTION_DATABASE_ID,
      },
      properties: pageProperties,
      children: contentBlocks, // Send all blocks at once
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
