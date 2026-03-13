export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = req.body;
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured on server' });
    }

    const tools = [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 5
      }
    ];

    let messages = [...body.messages];
    let replyText = '';
    const sources = [];
    const seenUrls = new Set();
    let iterations = 0;
    const maxIterations = 8;

    while (iterations < maxIterations) {
      iterations++;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'web-search-2025-03-05'
        },
        body: JSON.stringify({
          model: body.model || 'claude-sonnet-4-20250514',
          max_tokens: body.max_tokens || 1500,
          system: body.system,
          tools,
          messages
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({ error: data.error?.message || 'Anthropic API error' });
      }

      // Collect any text blocks
      if (data.content && Array.isArray(data.content)) {
        data.content.forEach(block => {
          if (block.type === 'text' && block.text) {
            replyText += block.text;
          }
        });
      }

      // If stop_reason is end_turn or no tool_use, we're done
      if (data.stop_reason === 'end_turn') break;

      // Handle tool_use blocks
      const toolUseBlocks = (data.content || []).filter(b => b.type === 'tool_use');
      if (toolUseBlocks.length === 0) break;

      // Add assistant turn to messages
      messages.push({ role: 'assistant', content: data.content });

      // Build tool_result blocks
      const toolResults = toolUseBlocks.map(toolUse => {
        // web_search results come back in the tool_use block's output
        // We need to pass them back as tool_result
        let resultContent = [];

        if (toolUse.name === 'web_search' && toolUse.output) {
          if (Array.isArray(toolUse.output)) {
            toolUse.output.forEach(r => {
              if (r.url && !seenUrls.has(r.url)) {
                seenUrls.add(r.url);
                sources.push({ title: r.title || r.url, url: r.url });
              }
              resultContent.push({
                type: 'web_search_result',
                url: r.url,
                title: r.title,
                encrypted_content: r.encrypted_content
              });
            });
          }
        }

        return {
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: resultContent
        };
      });

      messages.push({ role: 'user', content: toolResults });
    }

    // Append web sources to reply if any
    if (sources.length > 0) {
      replyText += '\n\n---\n**Web Sources**\n' +
        sources.slice(0, 6).map(s => `- [${s.title}](${s.url})`).join('\n');
    }

    return res.status(200).json({
      content: [{ type: 'text', text: replyText || 'No response generated.' }]
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export const config = {
  maxDuration: 60
};
