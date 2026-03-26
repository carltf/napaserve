const TOWN_ORDER = ['valley-wide', 'american-canyon', 'calistoga', 'napa', 'st-helena', 'yountville'];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  try {
    const { events, date_range_start, date_range_end } = req.body || {};
    if (!events || !events.length) {
      return res.status(400).json({ error: 'No events provided' });
    }

    const today = date_range_start || new Date().toISOString().slice(0, 10);
    const endDate = date_range_end || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);

    // Group by town for the AI prompt
    const byTown = {};
    for (const ev of events) {
      const t = ev.town || 'napa';
      if (!byTown[t]) byTown[t] = [];
      byTown[t].push(ev);
    }

    const townKeys = Object.keys(byTown).sort((a, b) => {
      const ai = TOWN_ORDER.indexOf(a);
      const bi = TOWN_ORDER.indexOf(b);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });

    const eventSummary = townKeys.map(town => {
      const label = townDisplay(town);
      const lines = byTown[town].map(e => {
        const tag = e.is_recurring ? '(R)' : '(N)';
        return `  ${tag} ${e.title} — ${e.event_date}${e.venue_name ? ', ' + e.venue_name : ''}`;
      }).join('\n');
      return `${label}:\n${lines}`;
    }).join('\n\n');

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `You are writing the opening paragraph for the Napa Valley Features Weekender, a weekly events email for Napa County, California.

Format rules:
- Start with "NAPA VALLEY, Calif. \u2014" as an AP-style dateline
- 2-3 sentences after the dateline, warm and local, in the style of: "Welcome to the Napa Valley Features Weekender, your guide to local events and experiences. Each Friday we deliver a Scan and Plan format organized by town..."
- Reference specific events, venues, or towns from the list below
- NEVER use these words: curate, civic, discover, explore
- Keep it conversational, like a trusted local neighbor sharing what's happening this week

Events for ${today} through ${endDate}:

${eventSummary}`,
        }],
      }),
    });

    const claudeData = await claudeRes.json();
    if (claudeData.error) {
      console.error('Claude API error:', claudeData.error);
      return res.status(502).json({ error: 'AI intro generation failed' });
    }

    const ai_intro = claudeData.content?.[0]?.text || '';
    return res.status(200).json({ ai_intro });
  } catch (err) {
    console.error('digest-intro error:', err);
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
}

function townDisplay(town) {
  if (!town) return 'Napa';
  const names = { 'valley-wide': 'Valley-Wide', 'american-canyon': 'American Canyon', 'st-helena': 'St. Helena' };
  if (names[town]) return names[town];
  return town.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export const maxDuration = 30;
