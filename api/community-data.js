const ALLOWED_DOMAINS = [
  'grape_crush', 'lodging', 'employment', 'population',
  'housing', 'weather', 'traffic', 'wine_production',
  'wine_auction', 'winery_licenses', 'tax_revenue', 'tot',
  'macro_economic',
];

export default async function handler(req, res) {
  // CORS headers on every response
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Supabase credentials not configured' });
  }

  // ── Validate required params ─────────────────────────────
  const { domain, geography, metric, dimension, period_from, period_to, report_type, limit: limitParam } = req.query;

  if (!domain) {
    return res.status(400).json({ error: 'Missing required parameter: domain' });
  }

  if (!ALLOWED_DOMAINS.includes(domain)) {
    return res.status(400).json({ error: `Unknown domain: ${domain}` });
  }

  // ── Parse optional params ────────────────────────────────
  const geographies = geography
    ? geography.split(',').map(g => g.trim())
    : null;
  const limit = Math.min(parseInt(limitParam || '200', 10) || 200, 1000);

  // ── Build Supabase REST query ────────────────────────────
  const select = [
    'geography', 'geography_type', 'domain', 'metric', 'dimension',
    'period_type', 'period_start', 'period_end',
    'value', 'value_text', 'unit',
    'report_type', 'confidence', 'source_name', 'notes',
  ].join(',');

  let queryUrl = `${SUPABASE_URL}/rest/v1/community_observations`
    + `?select=${select}`
    + `&domain=eq.${encodeURIComponent(domain)}`
    + `&order=geography.asc,dimension.asc,period_start.asc`
    + `&limit=${limit}`;

  if (geographies && geographies.length === 1) {
    queryUrl += `&geography=eq.${encodeURIComponent(geographies[0])}`;
  } else if (geographies && geographies.length > 1) {
    queryUrl += `&geography=in.(${geographies.map(g => `"${g}"`).join(',')})`;
  }

  if (metric) {
    queryUrl += `&metric=eq.${encodeURIComponent(metric)}`;
  }

  if (dimension) {
    queryUrl += `&dimension=ilike.${encodeURIComponent('*' + dimension + '*')}`;
  }

  if (period_from) {
    queryUrl += `&period_start=gte.${period_from}`;
  }

  if (period_to) {
    queryUrl += `&period_end=lte.${period_to}`;
  }

  if (report_type) {
    queryUrl += `&report_type=eq.${encodeURIComponent(report_type)}`;
  }

  // ── Fetch from Supabase ──────────────────────────────────
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

    const data = await response.json();

    // ── Group by geography ─────────────────────────────────
    const grouped = {};
    for (const row of data) {
      const key = row.geography;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(row);
    }

    res.setHeader('Cache-Control', 'public, s-maxage=3600');

    return res.status(200).json({
      domain,
      count: data.length,
      grouped,
      rows: data,
      meta: {
        filters: {
          domain,
          geographies: geographies || null,
          metric: metric || null,
          dimension: dimension || null,
          period_from: period_from || null,
          period_to: period_to || null,
          report_type: report_type || null,
        },
        source: 'NapaServe Community Data Commons',
        note: 'All values from CDFA/USDA-NASS, STR, EDD and other verified sources. See source_name and notes fields for provenance.',
      },
    });
  } catch (err) {
    console.error('Fetch error:', err);
    return res.status(502).json({ error: 'Failed to reach database' });
  }
}

export const config = {
  maxDuration: 15,
};
