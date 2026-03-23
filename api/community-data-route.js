// ============================================================
// NapaServe Cloudflare Worker — Community Data Route
// Endpoint: /api/community-data
//
// Serves community_observations from Supabase.
// Designed to power dynamic charts in Under the Hood articles.
//
// Query parameters:
//   domain      required  e.g. 'grape_crush', 'lodging'
//   geography   optional  e.g. 'Napa County' (comma-separated for multiple)
//   metric      optional  e.g. 'weighted_avg_price_per_ton'
//   dimension   optional  e.g. 'varietal|Cabernet Sauvignon|district|4'
//   period_from optional  e.g. '2023-01-01'
//   period_to   optional  e.g. '2025-12-31'
//   report_type optional  e.g. 'preliminary', 'final'
//   limit       optional  default 200, max 1000
//
// Examples:
//   /api/community-data?domain=grape_crush&geography=Sonoma County
//   /api/community-data?domain=grape_crush&geography=Napa County,Sonoma County,Lake County&metric=weighted_avg_price_per_ton
//   /api/community-data?domain=lodging&geography=Napa County&period_from=2026-01-01
// ============================================================

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function handleCommunityData(request, env) {
  // ── CORS preflight ───────────────────────────────────────
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (request.method !== 'GET') {
    return jsonError('Method not allowed', 405);
  }

  const url    = new URL(request.url);
  const params = url.searchParams;

  // ── Validate required params ─────────────────────────────
  const domain = params.get('domain');
  if (!domain) {
    return jsonError('Missing required parameter: domain', 400);
  }

  // Whitelist domains to prevent arbitrary queries
  const ALLOWED_DOMAINS = [
    'grape_crush', 'lodging', 'employment', 'population',
    'housing', 'weather', 'traffic', 'wine_production',
    'wine_auction', 'winery_licenses', 'tax_revenue', 'tot',
    'macro_economic',
  ];
  if (!ALLOWED_DOMAINS.includes(domain)) {
    return jsonError(`Unknown domain: ${domain}`, 400);
  }

  // ── Parse optional params ────────────────────────────────
  const geographies  = params.get('geography')
    ? params.get('geography').split(',').map(g => g.trim())
    : null;
  const metric       = params.get('metric')    || null;
  const dimension    = params.get('dimension') || null;
  const period_from  = params.get('period_from') || null;
  const period_to    = params.get('period_to')   || null;
  const report_type  = params.get('report_type') || null;
  const limit        = Math.min(parseInt(params.get('limit') || '200'), 1000);

  // ── Build Supabase query via REST API ────────────────────
  const SUPABASE_URL = env.SUPABASE_URL;
  const SUPABASE_KEY = env.SUPABASE_KEY;

  // Select columns — exclude heavy/internal fields from response
  const select = [
    'geography',
    'geography_type',
    'domain',
    'metric',
    'dimension',
    'period_type',
    'period_start',
    'period_end',
    'value',
    'value_text',
    'unit',
    'report_type',
    'confidence',
    'source_name',
    'notes',
  ].join(',');

  let queryUrl = `${SUPABASE_URL}/rest/v1/community_observations`
    + `?select=${select}`
    + `&domain=eq.${encodeURIComponent(domain)}`
    + `&order=geography.asc,dimension.asc,period_start.asc`
    + `&limit=${limit}`;

  // Geography filter — single or multiple
  if (geographies && geographies.length === 1) {
    queryUrl += `&geography=eq.${encodeURIComponent(geographies[0])}`;
  } else if (geographies && geographies.length > 1) {
    queryUrl += `&geography=in.(${geographies.map(g => `"${g}"`).join(',')})`;
  }

  if (metric) {
    queryUrl += `&metric=eq.${encodeURIComponent(metric)}`;
  }

  if (dimension) {
    // Support partial match with ilike for flexibility
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
  let data;
  try {
    const response = await fetch(queryUrl, {
      headers: {
        'apikey':        SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type':  'application/json',
      },
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Supabase error:', err);
      return jsonError('Database query failed', 502);
    }

    data = await response.json();
  } catch (err) {
    console.error('Fetch error:', err);
    return jsonError('Failed to reach database', 502);
  }

  // ── Shape the response ───────────────────────────────────
  // Group by geography for easier consumption by chart components
  const grouped = {};
  for (const row of data) {
    const key = row.geography;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(row);
  }

  const responseBody = {
    domain,
    count:   data.length,
    grouped,
    rows:    data,
    meta: {
      filters: {
        domain,
        geographies,
        metric,
        dimension,
        period_from,
        period_to,
        report_type,
      },
      source: 'NapaServe Community Data Commons',
      note:   'All values from CDFA/USDA-NASS, STR, EDD and other verified sources. '
            + 'See source_name and notes fields for provenance.',
    },
  };

  return new Response(JSON.stringify(responseBody, null, 2), {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600', // 1 hour cache
    },
  });
}

// ── Helper ───────────────────────────────────────────────
function jsonError(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}
