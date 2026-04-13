async function callAnthropicWithRetry(payload, apiKey, maxRetries = 3) {
  let lastStatus = 0;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(payload),
    });
    lastStatus = res.status;
    if (res.status !== 529) return res;
    if (attempt < maxRetries - 1) {
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  throw new Error(`Anthropic API error ${lastStatus} after ${maxRetries} retries`);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });

  try {
    const { model, max_tokens, messages } = req.body;
    if (!messages) return res.status(400).json({ error: "Missing messages" });

    const response = await callAnthropicWithRetry({
      model: model || "claude-sonnet-4-20250514",
      max_tokens: max_tokens || 2000,
      messages,
    }, ANTHROPIC_API_KEY);

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message || "API error" });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
}
