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
    
    // Parse content into blocks
    const contentBlocks = parseMarkdownToNotionBlocks(reportContent);
    console.log(`📊 Total content blocks generated: ${contentBlocks.length}`);
    
    // Initial blocks for the page (header + divider)
    const initialBlocks = [
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
      }
    ];

    // Footer blocks
    const footerBlocks = [
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

    // Combine initial blocks with first batch of content (limit to 95 blocks total)
    const maxInitialBlocks = 95; // Leave room for header and footer
    const firstBatchBlocks = [...initialBlocks, ...contentBlocks.slice(0, maxInitialBlocks - initialBlocks.length - footerBlocks.length), ...footerBlocks];
    
    console.log(`📝 Creating page with ${firstBatchBlocks.length} initial blocks`);
    
    // Create the page with initial content
    const response = await notion.pages.create({
      parent: {
        database_id: process.env.NOTION_DATABASE_ID,
      },
      properties: pageProperties,
      children: firstBatchBlocks,
    });

    console.log(`✅ Created Notion page with ID: ${response.id}`);
    
    // If there are remaining content blocks, append them in batches
    const remainingBlocks = contentBlocks.slice(maxInitialBlocks - initialBlocks.length - footerBlocks.length);
    
    if (remainingBlocks.length > 0) {
      console.log(`📝 Appending ${remainingBlocks.length} remaining blocks in batches...`);
      await appendBlocksInBatches(response.id, remainingBlocks);
    }
    
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

async function appendBlocksInBatches(pageId, blocks) {
  const batchSize = 100; // Notion's limit
  
  for (let i = 0; i < blocks.length; i += batchSize) {
    const batch = blocks.slice(i, i + batchSize);
    console.log(`📝 Appending batch ${Math.floor(i/batchSize) + 1}: ${batch.length} blocks`);
    
    try {
      await notion.blocks.children.append({
        block_id: pageId,
        children: batch,
      });
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (batchError) {
      console.error(`❌ Error appending batch ${Math.floor(i/batchSize) + 1}:`, batchError);
      // Continue with next batch instead of failing completely
    }
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

    // Handle table detection - create structured table-like format
    if (trimmedLine.includes('|') && !inTable) {
      inTable = true;
      tableRows = [trimmedLine];
      continue;
    } else if (trimmedLine.includes('|') && inTable) {
      tableRows.push(trimmedLine);
      continue;
    } else if (inTable && !trimmedLine.includes('|')) {
      // End of table - convert to structured format
      inTable = false;
      
      if (tableRows.length > 0) {
        // Process table rows
        const processedRows = tableRows
          .filter(row => row.trim() && !row.includes('---')) // Skip separator rows
          .map(row => row.split('|').map(cell => cell.trim()).filter(cell => cell));
        
        if (processedRows.length > 0) {
          // First row as header if it looks like one
          const headerRow = processedRows[0];
          const dataRows = processedRows.slice(1);
          
          // Add table header
          if (headerRow.length > 0) {
            blocks.push({
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [{
                  type: 'text',
                  text: { content: '📊 ' + headerRow.join(' | ') },
                  annotations: { bold: true, color: 'blue' }
                }]
              }
            });
            
            // Add separator
            blocks.push({
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [{
                  type: 'text',
                  text: { content: '━'.repeat(Math.min(50, headerRow.join(' | ').length)) },
                  annotations: { color: 'gray' }
                }]
              }
            });
          }
          
          // Add data rows as formatted paragraphs
          dataRows.forEach(row => {
            if (row.length > 0) {
              const formattedRow = row.map((cell, index) => {
                // Make first column bold (usually coin names)
                return {
                  type: 'text',
                  text: { content: index === 0 ? `${cell} | ` : `${cell} | ` },
                  annotations: index === 0 ? { bold: true } : {}
                };
              });
              
              blocks.push({
                object: 'block',
                type: 'paragraph',
                paragraph: {
                  rich_text: formattedRow
                }
              });
            }
          });
          
          // Add spacing after table
          blocks.push({
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ type: 'text', text: { content: ' ' } }]
            }
          });
        }
      }
      tableRows = [];
    }

    // Flush any pending list
    if (currentList.length > 0 && !trimmedLine.startsWith('- ') && !trimmedLine.startsWith('* ')) {
      blocks.push(...currentList);
      currentList = [];
    }

    // Handle different line types
    if (trimmedLine === '') {
      // Skip empty lines to reduce block count
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
    } else if (trimmedLine.length > 0) {
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

  // If still too many blocks, consolidate some content
  if (blocks.length > 90) {
    console.log(`⚠️ Generated ${blocks.length} blocks, consolidating to fit Notion limits...`);
    return consolidateBlocks(blocks, 90);
  }

  return blocks;
}

function consolidateBlocks(blocks, maxBlocks) {
  if (blocks.length <= maxBlocks) return blocks;
  
  const consolidated = [];
  let currentGroup = [];
  let groupText = [];
  
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    
    // Keep headings and important blocks separate
    if (block.type === 'heading_1' || block.type === 'heading_2' || block.type === 'heading_3' || block.type === 'divider') {
      // Flush current group if exists
      if (groupText.length > 0) {
        consolidated.push({
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: groupText.join('\n') } }]
          }
        });
        groupText = [];
      }
      
      consolidated.push(block);
    } else {
      // Consolidate regular paragraphs
      const text = extractTextFromBlock(block);
      if (text) {
        groupText.push(text);
        
        // Flush group when it gets too long or we're near the end
        if (groupText.length >= 5 || consolidated.length + Math.ceil((blocks.length - i) / 5) >= maxBlocks) {
          consolidated.push({
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ type: 'text', text: { content: groupText.join('\n') } }]
            }
          });
          groupText = [];
        }
      }
    }
    
    // Stop if we're approaching the limit
    if (consolidated.length >= maxBlocks - 2) break;
  }
  
  // Flush any remaining group
  if (groupText.length > 0) {
    consolidated.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{ type: 'text', text: { content: groupText.join('\n') } }]
      }
    });
  }
  
  console.log(`📝 Consolidated from ${blocks.length} to ${consolidated.length} blocks`);
  return consolidated;
}

function extractTextFromBlock(block) {
  if (block.type === 'paragraph' && block.paragraph?.rich_text) {
    return block.paragraph.rich_text.map(rt => rt.text?.content || '').join('');
  } else if (block.type === 'bulleted_list_item' && block.bulleted_list_item?.rich_text) {
    return '• ' + block.bulleted_list_item.rich_text.map(rt => rt.text?.content || '').join('');
  }
  return '';
}

function parseInlineMarkdown(text) {
  // Enhanced inline markdown parsing for Notion
  const richText = [];
  let currentIndex = 0;
  
  // Handle **bold** text with proper regex
  const boldRegex = /\*\*([^*]+)\*\*/g;
  let match;
  
  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before bold
    if (match.index > currentIndex) {
      const beforeText = text.substring(currentIndex, match.index);
      if (beforeText.trim()) {
        richText.push({
          type: 'text',
          text: { content: beforeText }
        });
      }
    }
    
    // Add bold text
    richText.push({
      type: 'text',
      text: { content: match[1] },
      annotations: { bold: true }
    });
    
    currentIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (currentIndex < text.length) {
    const remainingText = text.substring(currentIndex);
    if (remainingText.trim()) {
      richText.push({
        type: 'text',
        text: { content: remainingText }
      });
    }
  }
  
  // If no formatting found, return simple text
  if (richText.length === 0) {
    return [{ type: 'text', text: { content: text } }];
  }
  
  return richText;
}

module.exports = { createNotionPage };
