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
    
    // First, let's try to get the database to see what properties exist
    let databaseProperties = {};
    try {
      const database = await notion.databases.retrieve({
        database_id: process.env.NOTION_DATABASE_ID,
      });
      databaseProperties = database.properties;
      console.log('📋 Available database properties:', Object.keys(databaseProperties));
    } catch (dbError) {
      console.log('⚠️ Could not retrieve database properties, using defaults');
    }

    // Build properties object based on what exists in the database
    const pageProperties = {
      // Title property (required, should always exist)
      Title: {
        title: [
          {
            text: {
              content: `🎯 AIXBT Tracker Report - ${dateString}`,
            },
          },
        ],
      }
    };

    // Only add Date property if it exists in the database
    if (databaseProperties.Date || databaseProperties.date) {
      const datePropertyName = databaseProperties.Date ? 'Date' : 'date';
      pageProperties[datePropertyName] = {
        date: {
          start: currentDate.toISOString().split('T')[0],
        },
      };
    }

    // Only add Status property if it exists in the database
    if (databaseProperties.Status || databaseProperties.status) {
      const statusPropertyName = databaseProperties.Status ? 'Status' : 'status';
      pageProperties[statusPropertyName] = {
        select: {
          name: "Published",
        },
      };
    }

    // Add any other common property variations
    if (databaseProperties.Published || databaseProperties.published) {
      const publishedPropertyName = databaseProperties.Published ? 'Published' : 'published';
      pageProperties[publishedPropertyName] = {
        checkbox: true
      };
    }

    console.log('🏗️ Creating page with properties:', Object.keys(pageProperties));
    
    const response = await notion.pages.create({
      parent: {
        database_id: process.env.NOTION_DATABASE_ID,
      },
      properties: pageProperties,
      children: [
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
      ],
    });

    console.log(`✅ Created Notion page with ID: ${response.id}`);
    
    return {
      id: response.id,
      url: response.url,
    };
    
  } catch (error) {
    console.error('❌ Error creating Notion page:', error);
    
    // More detailed error logging
    if (error.body) {
      console.error('Notion API Error Details:', JSON.stringify(error.body, null, 2));
    }
    
    throw new Error(`Failed to create Notion page: ${error.message}`);
  }
}

function parseMarkdownToNotionBlocks(markdown) {
  const lines = markdown.split('\n');
  const blocks = [];
  let currentList = [];
  let inCodeBlock = false;
  let codeContent = [];
  let inTable = false;
  let tableRows = [];

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
            language: 'plain text'
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

    // Handle table detection
    if (trimmedLine.includes('|') && !inTable) {
      inTable = true;
      tableRows = [trimmedLine];
      continue;
    } else if (trimmedLine.includes('|') && inTable) {
      tableRows.push(trimmedLine);
      continue;
    } else if (inTable && !trimmedLine.includes('|')) {
      // End of table - convert to bulleted list for now (Notion API tables are complex)
      inTable = false;
      tableRows.forEach(row => {
        if (row.trim() && !row.includes('---')) {
          const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell);
          if (cells.length > 0) {
            blocks.push({
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [{ type: 'text', text: { content: cells.join(' • ') } }],
              },
            });
          }
        }
      });
      tableRows = [];
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
    } else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
      // Bold text as paragraph
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{
            type: 'text',
            text: { content: trimmedLine.slice(2, -2) },
            annotations: { bold: true }
          }],
        },
      });
    } else {
      // Regular paragraph - handle markdown formatting
      const richText = parseInlineMarkdown(line);
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: richText,
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

function parseInlineMarkdown(text) {
  // Simple inline markdown parsing
  const richText = [];
  let currentText = text;
  
  // Handle **bold** text
  const boldRegex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;
  
  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before bold
    if (match.index > lastIndex) {
      richText.push({
        type: 'text',
        text: { content: text.substring(lastIndex, match.index) }
      });
    }
    
    // Add bold text
    richText.push({
      type: 'text',
      text: { content: match[1] },
      annotations: { bold: true }
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    richText.push({
      type: 'text',
      text: { content: text.substring(lastIndex) }
    });
  }
  
  // If no formatting found, return simple text
  if (richText.length === 0) {
    return [{ type: 'text', text: { content: text } }];
  }
  
  return richText;
}

module.exports = { createNotionPage };
