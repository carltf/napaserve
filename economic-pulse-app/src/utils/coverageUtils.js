// Coverage Gap Intelligence — shared utilities
// Used by: napaserve-agent.jsx, napaserve-project-evaluator.jsx
// To add a new category: add to SECONDARY_SOURCES + one regex line in classifyQuery
// To change symbols/colors: edit coverageSignal tier definitions below

export const SECONDARY_SOURCES = {
  'housing': [
    { label: 'Napa County Housing & Community Services', url: 'https://www.napacounty.gov/434/Housing-and-Community-Services' },
    { label: 'CA Dept. of Housing & Community Development', url: 'https://www.hcd.ca.gov/' },
    { label: 'City of Napa Planning Division', url: 'https://www.cityofnapa.org/247/Planning-Division' },
  ],
  'water': [
    { label: 'Napa County Flood Control & Water Resources', url: 'https://www.napacounty.gov/1074/Flood-Water-Resources' },
    { label: 'State Water Resources Control Board', url: 'https://www.waterboards.ca.gov/' },
    { label: 'Napa County Public Works', url: 'https://www.napacounty.gov/2082/Public-Works' },
  ],
  'land_use': [
    { label: 'Napa County Planning, Building & Environmental Services', url: 'https://www.napacounty.gov/589/Planning-Building-Environmental-Services' },
    { label: 'City of Napa Planning Division', url: 'https://www.cityofnapa.org/247/Planning-Division' },
    { label: 'City of Napa General Plan', url: 'https://www.cityofnapa.org/259/General-Plan' },
  ],
  'wine': [
    { label: 'USDA NASS CA Grape Crush Reports', url: 'https://www.nass.usda.gov/Statistics_by_State/California/Publications/Specialty_and_Other_Releases/Grapes/Crush/Reports/index.php' },
    { label: 'Wine Institute CA Statistics', url: 'https://wineinstitute.org/our-industry/statistics/' },
    { label: 'Napa Valley Vintners', url: 'https://napavintners.com/napa_valley/' },
  ],
  'workforce': [
    { label: 'EDD Labor Market Info — Napa MSA', url: 'https://labormarketinfo.edd.ca.gov/geography/msa/napa.html' },
    { label: 'Napa County Workforce Development', url: 'https://www.napacounty.gov/422/Employment-Assistance' },
    { label: 'Napa Valley Community Foundation', url: 'https://www.napavalleycf.org/' },
  ],
  'tourism': [
    { label: 'Visit Napa Valley — Industry Resources', url: 'https://www.visitnapavalley.com/industry/' },
    { label: 'Visit California — Research & Statistics', url: 'https://industry.visitcalifornia.com/research' },
    { label: 'Napa County Treasurer-Tax Collector', url: 'https://www.napacounty.gov/1227/Treasurer---Tax-Collector' },
  ],
  'agriculture': [
    { label: 'USDA NASS CA Grape Crush Reports', url: 'https://www.nass.usda.gov/Statistics_by_State/California/Publications/Specialty_and_Other_Releases/Grapes/Crush/Reports/index.php' },
    { label: 'Napa County Crop Reports', url: 'https://www.napacounty.gov/258/Crop-Reports' },
    { label: 'UC Cooperative Extension — Napa County', url: 'https://ucanr.edu/county/napa-county-ucce' },
  ],
  'safety': [
    { label: 'Napa County Emergency Services', url: 'https://www.napacounty.gov/353/Emergency-Services' },
    { label: 'CAL FIRE — Incident Information', url: 'https://www.fire.ca.gov/incidents/' },
    { label: 'Napa County Sheriff', url: 'https://www.napacounty.gov/1292/Sheriff' },
  ],
  'economy': [
    { label: 'FRED — Napa MSA Economic Data', url: 'https://fred.stlouisfed.org/release/tables?rid=454&eid=784071' },
    { label: 'CA Dept. of Finance — County Profiles', url: 'https://dof.ca.gov/forecasting/demographics/estimates/' },
    { label: 'Napa County Budget & Finance', url: 'https://www.napacounty.gov/423/Budget' },
  ],
  'health': [
    { label: 'Napa County Health & Human Services', url: 'https://www.napacounty.gov/156/Health-Human-Services' },
    { label: 'Napa Valley Community Health', url: 'https://nvch.org/' },
    { label: 'CA Dept. of Public Health', url: 'https://www.cdph.ca.gov/' },
  ],
  'education': [
    { label: 'Napa Valley Unified School District', url: 'https://www.nvusd.org/' },
    { label: 'Napa Valley College', url: 'https://www.napavalley.edu/' },
    { label: 'CA Dept. of Education', url: 'https://www.cde.ca.gov/' },
  ],
  'government': [
    { label: 'Napa County Board of Supervisors', url: 'https://www.napacounty.gov/1316/Board-of-Supervisors' },
    { label: 'City of Napa', url: 'https://www.cityofnapa.org/' },
    { label: 'CA Legislative Information', url: 'https://leginfo.legislature.ca.gov/' },
  ],
};

export function classifyQuery(query) {
  const q = (query || '').toLowerCase();
  if (/housing|afford|rent|home|apartment|residential|hcd/.test(q)) return 'housing';
  if (/water|watershed|flood|drought|groundwater|creek|river/.test(q)) return 'water';
  if (/land use|zoning|general plan|parcel|planning|permit|development/.test(q)) return 'land_use';
  if (/wine|winery|vineyard|cab|cabernet|vintage|tasting|bottle|dtc/.test(q)) return 'wine';
  if (/grape|crush|viticulture|harvest|farming|grower/.test(q)) return 'agriculture';
  if (/workforce|job|employ|wage|labor|worker|hire|career/.test(q)) return 'workforce';
  if (/tourism|hotel|lodging|visitor|hospitality|tasting room|travel/.test(q)) return 'tourism';
  if (/wildfire|fire|emergency|safety|sheriff|crime|police/.test(q)) return 'safety';
  if (/economy|economic|gdp|revenue|fiscal|budget|tax|business/.test(q)) return 'economy';
  if (/health|hospital|mental|wellness|medical|clinic/.test(q)) return 'health';
  if (/school|education|college|student|youth|family|child/.test(q)) return 'education';
  if (/government|policy|supervisor|council|ordinance|regulation|law/.test(q)) return 'government';
  return null;
}

export function coverageSignal(sources) {
  if (!sources || sources.length === 0) return null;
  const count = sources.length;
  const years = sources
    .map(s => s.date || s.published_at)
    .filter(Boolean)
    .map(d => new Date(d).getFullYear())
    .filter(y => !isNaN(y));
  const minYear = years.length ? Math.min(...years) : null;
  const maxYear = years.length ? Math.max(...years) : null;
  const yearRange = !minYear ? null : minYear === maxYear ? `${minYear}` : `${minYear}–${maxYear}`;
  const avgSimilarity = sources.reduce((a, s) => a + (s.similarity || 0), 0) / count;
  let tier, dot, color;
  if (count >= 5 && avgSimilarity >= 0.6) {
    tier = 'Strong'; dot = '●'; color = '#5A7A50';
  } else if (count >= 3 || avgSimilarity >= 0.5) {
    tier = 'Moderate'; dot = '◐'; color = '#8B6914';
  } else {
    tier = 'Thin'; dot = '○'; color = '#8A3A2A';
  }
  return { count, yearRange, tier, dot, color };
}
