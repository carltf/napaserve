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

    const requestBody = {
      ...body,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 5
        }
      ]
    };

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    let replyText = '';
    const seenUrls = new Set();
    const sources = [];

    if (data.content && Array.isArray(data.content)) {
      data.content.forEach(block => {
        if (block.type === 'text') {
          let text = block.text;
          text = text.replace(/---\s*\*?\*?Sources\*?\*?[\s\S]*$/gm, '').trim();
          replyText += text;
        }
        if (block.type === 'tool_result') {
          if (Array.isArray(block.content)) {
            block.content.forEach(r => {
              if (r.type === 'web_search_result' && r.url && !seenUrls.has(r.url)) {
                seenUrls.add(r.url);
                sources.push({ title: r.title || r.url, url: r.url });
              }
            });
          }
        }
      });
    }

    if (sources.length > 0) {
      replyText += '\n\n---\n**Sources**\n' + sources.slice(0, 8).map(s => `- [${s.title}](${s.url})`).join('\n');
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