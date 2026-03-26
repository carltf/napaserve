export default async function handler(req, res) {
  // CORS headers on every response
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Supabase credentials not configured' });
  }

  // ── Date range: today through 14 days out ──────────────
  const today = new Date().toISOString().slice(0, 10);
  const endDate = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);

  // ── Build Supabase REST query ──────────────────────────
  const select = [
    'id', 'title', 'description', 'event_date', 'start_time', 'end_time',
    'venue_name', 'address', 'town', 'category',
    'price_info', 'is_free', 'is_recurring', 'website_url', 'ticket_url',
  ].join(',');

  const queryUrl = `${SUPABASE_URL}/rest/v1/community_events`
    + `?select=${select}`
    + `&status=eq.approved`
    + `&event_date=gte.${today}`
    + `&event_date=lte.${endDate}`
    + `&order=town.asc,event_date.asc,start_time.asc`
    + `&limit=60`;

  // ── Fetch from Supabase ────────────────────────────────
  try {
    const response = await fetch(queryUrl, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Supabase error:', err);
      return res.status(502).json({ error: 'Database query failed' });
    }

    const allEvents = await response.json();

    // ── Deduplicate on title + event_date ────────────────
    const seen = new Set();
    const deduped = allEvents.filter(ev => {
      const key = `${(ev.title || '').toLowerCase().trim()}|${ev.event_date}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Limit to 20 events
    const events = deduped.slice(0, 20);

    // ── Fetch sky events (non-blocking — skip if table missing) ──
    let skyEvents = [];
    try {
      const skyUrl = `${SUPABASE_URL}/rest/v1/astronomical_events`
        + `?select=id,title,description,event_date,end_date,peak_time,viewing_notes,is_notable`
        + `&event_date=gte.${today}`
        + `&event_date=lte.${endDate}`
        + `&order=event_date.asc`;

      const skyRes = await fetch(skyUrl, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (skyRes.ok) {
        skyEvents = await skyRes.json();
      }
    } catch (skyErr) {
      console.error('Sky events fetch error (non-fatal):', skyErr);
    }

    if (events.length === 0 && skyEvents.length === 0) {
      return res.status(200).json({
        draft_id: null,
        events: [],
        skyEvents: [],
        date_range_start: today,
        date_range_end: endDate,
        message: 'No approved events in the next 14 days',
      });
    }

    // ── Save draft to email_digests ──────────────────────
    const eventIds = events.map(e => e.id);

    const draftRow = {
      status: 'draft',
      ai_intro: '',
      event_ids: eventIds,
      date_range_start: today,
      date_range_end: endDate,
    };

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/email_digests`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(draftRow),
    });

    if (!insertRes.ok) {
      const err = await insertRes.text();
      console.error('Supabase insert error:', err);
      return res.status(502).json({ error: 'Database insert failed' });
    }

    const inserted = await insertRes.json();
    const draftId = inserted[0]?.id;

    return res.status(200).json({
      draft_id: draftId,
      events,
      skyEvents,
      date_range_start: today,
      date_range_end: endDate,
    });
  } catch (err) {
    console.error('Fetch error:', err);
    return res.status(502).json({ error: 'Failed to reach database' });
  }
}

export const config = {
  maxDuration: 15,
};
