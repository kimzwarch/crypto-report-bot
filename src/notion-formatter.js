const { Client } = require('@notionhq/client');

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

async function createNotionPage(reportContent) {
  try {
    console.log('📝 Creating Notion page...');
    
    const currentDate = new Date();
    const dateString = currentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
    
    const response = await notion.pages.create({
      parent: {
        database_id: process.env.NOTION_DATABASE_ID,
      },
      properties: {
        Title: {
          title: [
            {
              text: {
                content: `🚀 Crypto Daily Report - ${dateString}`,
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
        },
      },
      children: [
        {
          object: 'block',
          type: 'heading_1',
          heading_1: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: `📊 Daily Crypto Analysis - ${dateString}`,
                },
                annotations: {
                  color: 'blue'
                }
              },
            ],
          },
        },
        {
          object: 'block',
          type: 'divider',
          divider: {}
        },
        ...parseMarkdownToNotionBlocks(reportContent),
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
                  content: `Generated automatically on ${new Date().toLocaleString()} by Crypto Report Bot 🤖`,
                },
                annotations: {
                  italic: true,
                  color: 'gray'
                }
              },
            ],
          },
        },
      ],
    });

    console.log(`✅ Created Notion page with ID: ${response.id}`);
    
    return {
      id: response.id,
      url: response.url,
    };
    
  } catch (error) {
    console.error('❌ Error creating Notion page:', error);
    throw new Error(`Failed to create Notion page: ${error.message}`);
  }
}

function parseMarkdownToNotionBlocks(markdown) {
  const lines = markdown.split('\n');
  const blocks = [];
  let currentList = [];
  let inCodeBlock = false;
  let codeContent = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Handle code blocks
    if (trimmedLine.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        blocks.push({
          object: 'block',
          type: 'code',
          code: {
            rich_text: [{ type: 'text', text: { content: codeContent.join('\n') } }],
            language: 'javascript'
          },
        });
        codeContent = [];
        inCodeBlock = false;
      } else {
        // Start code block
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent.push(line);
      continue;
    }

    // Flush any pending list
    if (currentList.length > 0 && !trimmedLine.startsWith('- ') && !trimmedLine.startsWith('* ')) {
      blocks.push(...currentList);
      currentList = [];
    }

    // Handle different line types
    if (trimmedLine === '') {
      // Skip empty lines
      continue;
    } else if (trimmedLine.startsWith('# ')) {
      blocks.push({
        object: 'block',
        type: 'heading_1',
        heading_1: {
          rich_text: [{ type: 'text', text: { content: trimmedLine.substring(2) } }],
        },
      });
    } else if (trimmedLine.startsWith('## ')) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: trimmedLine.substring(3) } }],
        },
      });
    } else if (trimmedLine.startsWith('### ')) {
      blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [{ type: 'text', text: { content: trimmedLine.substring(4) } }],
        },
      });
    } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      currentList.push({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: trimmedLine.substring(2) } }],
        },
      });
    } else {
      // Regular paragraph
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { content: line } }],
        },
      });
    }
  }

  // Flush any remaining list items
  if (currentList.length > 0) {
    blocks.push(...currentList);
  }

  return blocks;
}

module.exports = { createNotionPage };
