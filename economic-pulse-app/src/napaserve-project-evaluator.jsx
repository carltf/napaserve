import { useState } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// FRAMEWORK
// ═══════════════════════════════════════════════════════════════════════════

const PILLARS = [
  { id: "jobs", label: "Jobs", color: "#C8A96E", axes: [
    { id: "new_jobs", label: "New Durable Jobs", desc: "Net operating jobs at or above median wage" },
    { id: "wage_quality", label: "Wage Quality", desc: "Alignment with local median / self-sufficiency standard" },
    { id: "sector_risk", label: "Sector Resilience", desc: "Diversification vs concentration; cycle sensitivity" },
  ]},
  { id: "people", label: "People", color: "#7EB8A4", axes: [
    { id: "young_families", label: "Young Families", desc: "Housing affordability, school quality, childcare access" },
    { id: "current_pop", label: "Current Residents", desc: "Displacement risk, service burden, community stability" },
    { id: "elder_pop", label: "Elder Population", desc: "Fixed-income affordability, health access, mobility" },
  ]},
  { id: "place", label: "Place", color: "#9B8EC4", axes: [
    { id: "land_use", label: "Land Efficiency", desc: "Productivity per acre relative to regional scarcity" },
    { id: "fiscal_net", label: "Net Fiscal Balance", desc: "Recurring revenues vs service obligations" },
    { id: "water", label: "Water Demand", desc: "Net draw on local water supply and groundwater" },
    { id: "wildfire", label: "Wildfire Risk", desc: "Ignition potential, evacuation burden, and suppression cost" },
    { id: "biodiversity", label: "Biodiversity & Habitat", desc: "Impact on native species, wildlife corridors, and ecological function" },
  ]},
];

const ALL_AXES = PILLARS.flatMap(p => p.axes.map(a => ({ ...a, pillarId: p.id, color: p.color })));

const QUESTIONS = {
  jobs: [
    { id: "j1", label: "How many permanent (not construction) jobs does this create?", type: "number", placeholder: "e.g. 25", key: "perm_jobs" },
    { id: "j2", label: "What share of those jobs pay at or above Napa's median wage ($52/hr / $109K year)?", type: "select", options: [
      { value: "most", label: "Most (75%+)" }, { value: "half", label: "About half" },
      { value: "some", label: "Some (25%)" }, { value: "few", label: "Few or none" },
    ], key: "wage_share" },
    { id: "j3", label: "Are these jobs year-round or seasonal?", type: "select", options: [
      { value: "year_round", label: "Year-round, full-time" },
      { value: "mostly", label: "Mostly year-round with slow periods" },
      { value: "seasonal", label: "Seasonal (harvest, tourism peaks)" },
    ], key: "durability" },
    { id: "j4", label: "Does this diversify Napa's economy beyond wine and hospitality?", type: "select", options: [
      { value: "yes", label: "Yes \u2014 new sector (tech, healthcare, manufacturing)" },
      { value: "adjacent", label: "Adjacent \u2014 related but different (ag-tech, culinary innovation)" },
      { value: "same", label: "Same sector \u2014 more wine/hospitality" },
    ], key: "diversification" },
    { id: "j5", label: "Can local residents realistically fill these jobs?", type: "select", options: [
      { value: "yes", label: "Yes \u2014 skills match the local workforce" },
      { value: "with_training", label: "With training \u2014 pipeline needed" },
      { value: "unlikely", label: "Unlikely \u2014 would need outside recruitment" },
    ], key: "local_capture" },
  ],
  people: [
    { id: "p1", label: "Does this project increase or decrease housing costs nearby?", type: "select", options: [
      { value: "decrease", label: "Adds affordable units \u2014 helps reduce costs" },
      { value: "neutral", label: "No significant effect on housing costs" },
      { value: "increase", label: "Likely pushes rents or prices up" },
    ], key: "housing_cost" },
    { id: "p2", label: "Does it displace anyone currently living or working on the site?", type: "select", options: [
      { value: "no", label: "No \u2014 vacant or underused land" },
      { value: "some", label: "Some displacement, but alternatives exist" },
      { value: "yes", label: "Yes \u2014 residents, businesses, or farmworkers displaced" },
    ], key: "displacement" },
    { id: "p3", label: "Does it include childcare, transit, or workforce services?", type: "select", options: [
      { value: "multiple", label: "Multiple services (childcare + transit, etc.)" },
      { value: "one", label: "One support service included" },
      { value: "none", label: "No support services" },
    ], key: "services" },
    { id: "p4", label: "How does it affect seniors on fixed incomes?", type: "select", options: [
      { value: "helps", label: "Directly helpful \u2014 healthcare, affordable housing, mobility" },
      { value: "neutral", label: "No direct impact on seniors" },
      { value: "burden", label: "Could increase costs or reduce access" },
    ], key: "elder_impact" },
    { id: "p5", label: "Does it increase or reduce demand on public services?", type: "select", options: [
      { value: "reduces", label: "Reduces demand or directly funds services" },
      { value: "neutral", label: "Roughly neutral on public services" },
      { value: "increases", label: "Adds significant demand without funding" },
    ], key: "service_demand" },
  ],
  place: [
    { id: "l1", label: "How many acres does this use?", type: "number", placeholder: "e.g. 5", key: "acreage" },
    { id: "l2", label: "What's currently on the site?", type: "select", options: [
      { value: "vacant", label: "Vacant lot or abandoned/derelict building" },
      { value: "existing_bldg", label: "Existing building being repurposed or renovated" },
      { value: "ag_low", label: "Low-productivity agriculture" },
      { value: "ag_active", label: "Active vineyard or farmland" },
      { value: "open_space", label: "Open space, habitat, or watershed" },
    ], key: "current_use" },
    { id: "l3", label: "Will it generate more tax revenue than it costs in services?", type: "select", options: [
      { value: "strong_positive", label: "Strong net positive \u2014 significant tax base" },
      { value: "slight_positive", label: "Slight net positive" },
      { value: "neutral", label: "Roughly break-even" },
      { value: "negative", label: "Net cost to the county" },
    ], key: "fiscal" },
    { id: "l4", label: "Does it require new roads, water, or sewer infrastructure?", type: "select", options: [
      { value: "none", label: "Uses existing infrastructure" },
      { value: "minor", label: "Minor upgrades needed" },
      { value: "major", label: "Significant new infrastructure required" },
    ], key: "infrastructure" },
    { id: "l5", label: "How much water will this project demand?", type: "select", options: [
      { value: "reduces", label: "Reduces net water use (e.g. replaces high-use with low-use)" },
      { value: "minimal", label: "Minimal \u2014 low-water design, drought-tolerant landscaping" },
      { value: "moderate", label: "Moderate \u2014 typical commercial/residential demand" },
      { value: "heavy", label: "Heavy \u2014 pools, irrigation, processing, or high occupancy" },
    ], key: "water_demand" },
    { id: "l6", label: "Is this site in or near a high wildfire risk area?", type: "select", options: [
      { value: "urban", label: "Urban or low-risk area \u2014 well within city limits" },
      { value: "moderate", label: "Moderate risk \u2014 near wildland-urban interface but accessible" },
      { value: "high", label: "High risk \u2014 in or adjacent to fire-prone hillsides or canyons" },
      { value: "very_high", label: "Very high risk \u2014 limited evacuation routes, steep terrain" },
    ], key: "fire_risk" },
    { id: "l7", label: "Does this project add people or activity that increases fire ignition potential?", type: "select", options: [
      { value: "no", label: "No \u2014 low-activity use, fire-hardened construction" },
      { value: "some", label: "Some \u2014 standard construction with defensible space" },
      { value: "yes", label: "Yes \u2014 events, outdoor activity, or construction in fire-prone area" },
    ], key: "fire_ignition" },
    { id: "l8", label: "How does it affect local wildlife, native plants, or habitat connectivity?", type: "select", options: [
      { value: "positive", label: "Restores or enhances habitat \u2014 native planting, corridor preservation" },
      { value: "neutral", label: "Minimal impact \u2014 already developed site, standard mitigation" },
      { value: "negative", label: "Removes habitat, fragments corridors, or displaces wildlife" },
    ], key: "habitat_impact" },
    { id: "l9", label: "Does it affect productive agricultural soil?", type: "select", options: [
      { value: "no", label: "No \u2014 non-agricultural land or already paved" },
      { value: "low_value", label: "Low-value agricultural soil" },
      { value: "prime", label: "Yes \u2014 prime farmland or high-quality vineyard soil" },
    ], key: "soil_impact" },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// SCORING
// ═══════════════════════════════════════════════════════════════════════════

function calculateScores(a) {
  const s = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]; // 11 axes
  // JOBS [0-2]
  const jobs = Number(a.perm_jobs) || 0;
  let j0 = jobs >= 100 ? 9 : jobs >= 50 ? 8 : jobs >= 25 ? 7 : jobs >= 10 ? 5 : jobs >= 1 ? 3 : 1;
  if (a.durability === "seasonal") j0 -= 2;
  if (a.durability === "mostly") j0 -= 0.5;
  if (a.local_capture === "yes") j0 += 1;
  if (a.local_capture === "unlikely") j0 -= 1.5;
  s[0] = Math.max(0, Math.min(10, j0));
  s[1] = { most: 9, half: 6, some: 3.5, few: 1.5 }[a.wage_share] ?? 5;
  s[2] = { yes: 9, adjacent: 6.5, same: 3 }[a.diversification] ?? 5;

  // PEOPLE [3-5]
  let f3 = { decrease: 8, neutral: 5, increase: 2 }[a.housing_cost] ?? 5;
  if (a.services === "multiple") f3 += 2; if (a.services === "one") f3 += 1;
  s[3] = Math.max(0, Math.min(10, f3));
  let r4 = { no: 8, some: 5, yes: 2 }[a.displacement] ?? 5;
  if (a.service_demand === "reduces") r4 += 1.5; if (a.service_demand === "increases") r4 -= 2;
  s[4] = Math.max(0, Math.min(10, r4));
  s[5] = { helps: 8.5, neutral: 5, burden: 2 }[a.elder_impact] ?? 5;

  // PLACE [6-10]
  // Land Efficiency [6]
  let l6 = { existing_bldg: 9, vacant: 8, ag_low: 6, ag_active: 3, open_space: 1.5 }[a.current_use] ?? 5;
  const acres = Number(a.acreage) || 0;
  if (acres > 50) l6 -= 1; if (acres <= 2) l6 += 1;
  if (a.infrastructure === "none") l6 += 1; if (a.infrastructure === "major") l6 -= 2;
  if (a.soil_impact === "prime") l6 -= 2; if (a.soil_impact === "low_value") l6 -= 0.5;
  s[6] = Math.max(0, Math.min(10, l6));

  // Net Fiscal Balance [7]
  s[7] = { strong_positive: 9, slight_positive: 7, neutral: 5, negative: 2 }[a.fiscal] ?? 5;

  // Water Demand [8] — higher score = less water demand = better
  s[8] = { reduces: 9.5, minimal: 8, moderate: 5, heavy: 2 }[a.water_demand] ?? 5;

  // Wildfire Risk [9] — higher score = lower risk = better
  let fire = { urban: 9, moderate: 6, high: 3, very_high: 1 }[a.fire_risk] ?? 5;
  if (a.fire_ignition === "yes") fire -= 1.5;
  if (a.fire_ignition === "no") fire += 0.5;
  s[9] = Math.max(0, Math.min(10, fire));

  // Biodiversity & Habitat [10]
  let bio = { positive: 9, neutral: 5.5, negative: 2 }[a.habitat_impact] ?? 5;
  if (a.soil_impact === "prime") bio -= 1; // prime ag soil often supports biodiversity
  s[10] = Math.max(0, Math.min(10, bio));

  return s.map(v => Math.round(v * 2) / 2);
}

function getRating(scores) {
  // Calculate pillar averages with variable axis counts
  const pillarRanges = [[0,3],[3,6],[6,11]]; // Jobs 0-2, People 3-5, Place 6-10
  const pa = pillarRanges.map(([s,e]) => {
    const slice = scores.slice(s, e);
    return slice.reduce((a,b) => a+b, 0) / slice.length;
  });
  const avg = pa.reduce((a,b)=>a+b,0)/3, mn = Math.min(...pa);
  if (avg >= 7.5 && mn >= 6) return { label: "Strong", color: "#5B8A5A", desc: "Net positive across all three pillars with manageable risks" };
  if (avg >= 6 && mn >= 4.5) return { label: "Moderate", color: "#C8A96E", desc: "Net positive in at least two pillars, addressable gaps in the third" };
  if (avg >= 4.5 && mn >= 3) return { label: "Weak-to-Moderate", color: "#D4935A", desc: "Real benefits offset by concentration, mismatch, or fiscal uncertainty" };
  if (avg >= 3) return { label: "Weak", color: "#B85C38", desc: "Benefits do not outweigh structural liabilities under current design" };
  return { label: "Misaligned", color: "#8B3A3A", desc: "Worsens regional resilience with no clear modification pathway" };
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPASS (compact SVG)
// ═══════════════════════════════════════════════════════════════════════════

function polar(angle, r, cx, cy) {
  const rad = (angle - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function Compass({ scores, size = 420 }) {
  const numAxes = ALL_AXES.length;
  const step = 360 / numAxes;
  const cx = size/2, cy = size/2, oR = size/2 - 65, cR = 24;
  const rr = v => cR + (v/10)*(oR-cR);
  const poly = vals => vals.map((v,i) => { const p = polar(i*step,rr(v),cx,cy); return `${p.x},${p.y}`; }).join(" ");
  const pts = ALL_AXES.map((_,i) => ({ o: polar(i*step,oR,cx,cy), n: polar(i*step,cR,cx,cy), l: polar(i*step,oR+24,cx,cy), a: i*step }));

  // Calculate pillar start/end indices for sector shading
  let axisIdx = 0;
  const pillarSectors = PILLARS.map(p => {
    const start = axisIdx;
    axisIdx += p.axes.length;
    return { ...p, startIdx: start, endIdx: axisIdx - 1 };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{overflow:"visible"}}>
      <defs>
        <radialGradient id="cBg"><stop offset="0%" stopColor="#1e2535"/><stop offset="100%" stopColor="#111620"/></radialGradient>
        <filter id="gl"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <circle cx={cx} cy={cy} r={oR+44} fill="url(#cBg)"/>
      {[0,90,180,270].map(d=>{const i=polar(d,oR+28,cx,cy),o=polar(d,oR+38,cx,cy),lp=polar(d,oR+48,cx,cy);return(<g key={d}><line x1={i.x} y1={i.y} x2={o.x} y2={o.y} stroke="#C8A96E" strokeWidth={1.5}/><text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="central" fill="#C8A96E" fontSize="9" fontFamily="'Courier New',monospace" fontWeight="bold" filter="url(#gl)">{{0:"N",90:"E",180:"S",270:"W"}[d]}</text></g>);})}
      <circle cx={cx} cy={cy} r={oR+28} fill="none" stroke="#C8A96E" strokeWidth="0.5" opacity="0.3"/>
      {[2,4,6,8,10].map(v=><circle key={v} cx={cx} cy={cy} r={rr(v)} fill="none" stroke={v===10?"#C8A96E":"#2d3748"} strokeWidth={v===10?0.8:0.5} strokeDasharray={v===10?"none":"3 3"} opacity={v===10?0.5:0.4}/>)}
      {pillarSectors.map((p) => {
        const sa = p.startIdx * step - step/2, ea = p.endIdx * step + step/2;
        const pp = [`${cx},${cy}`];
        for (let a = sa; a <= ea; a += 5) { const pt = polar(a, oR, cx, cy); pp.push(`${pt.x},${pt.y}`); }
        return <polygon key={p.id} points={pp.join(" ")} fill={p.color} opacity="0.04" />;
      })}
      {pts.map((p,i)=><line key={i} x1={p.n.x} y1={p.n.y} x2={p.o.x} y2={p.o.y} stroke="#2d3748" strokeWidth="0.6" opacity="0.6"/>)}
      <polygon points={poly(Array(numAxes).fill(5))} fill="rgba(141,167,190,0.08)" stroke="#8DA7BE" strokeWidth="1" strokeDasharray="4 3" opacity="0.4"/>
      <polygon points={poly(scores)} fill="rgba(200,169,110,0.18)" stroke="#C8A96E" strokeWidth="2" strokeLinejoin="round" filter="url(#gl)"/>
      {scores.map((v,i)=>{const p=polar(i*step,rr(v),cx,cy);return<circle key={i} cx={p.x} cy={p.y} r={3.5} fill="#C8A96E" stroke="#111620" strokeWidth="1.5"/>;})}
      <circle cx={cx} cy={cy} r={cR} fill="#111620" stroke="#C8A96E" strokeWidth="0.5" opacity="0.8"/>
      <circle cx={cx} cy={cy} r={3} fill="#C8A96E" filter="url(#gl)"/>
      {pts.map((p,i)=>{const ax=ALL_AXES[i],an=p.a;let anc="middle";if(an>=30&&an<=150)anc="start";if(an>=210&&an<=330)anc="end";const w=ax.label.split(" "),l1=w.slice(0,Math.ceil(w.length/2)).join(" "),l2=w.length>1?w.slice(Math.ceil(w.length/2)).join(" "):null;return(<g key={i}><text x={p.l.x} y={p.l.y-(l2?4:0)} textAnchor={anc} dominantBaseline="central" fill="#a0aec0" fontSize="7.5" fontFamily="'Courier New',monospace">{l1}</text>{l2&&<text x={p.l.x} y={p.l.y+8} textAnchor={anc} dominantBaseline="central" fill="#a0aec0" fontSize="7.5" fontFamily="'Courier New',monospace">{l2}</text>}</g>);})}
      {pillarSectors.map((p) => {
        const midIdx = p.startIdx + Math.floor(p.axes.length / 2);
        const m = polar(midIdx * step, oR - 14, cx, cy);
        return <text key={p.id} x={m.x} y={m.y} textAnchor="middle" dominantBaseline="central" fill={p.color} fontSize="7" opacity="0.4" fontFamily="'Courier New',monospace" letterSpacing="3">{p.label.toUpperCase()}</text>;
      })}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

export default function ProjectEvaluator() {
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [answers, setAnswers] = useState({});
  const [activePillar, setActivePillar] = useState("jobs");

  const update = (key, val) => setAnswers(prev => ({ ...prev, [key]: val }));
  const scores = calculateScores(answers);
  const rating = getRating(scores);
  const answered = Object.keys(answers).filter(k => answers[k] !== "" && answers[k] != null).length;
  const total = Object.values(QUESTIONS).flat().length;
  const progress = Math.round((answered / total) * 100);
  const pp = (id) => { const qs = QUESTIONS[id]||[]; return { done: qs.filter(q => answers[q.key] != null && answers[q.key] !== "").length, all: qs.length }; };

  const resetProject = () => { setProjectName(""); setProjectDesc(""); setAnswers({}); setActivePillar("jobs"); setReport(null); setReportError(null); };

  const [report, setReport] = useState(null);
  const [reportError, setReportError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateReport = async () => {
    setGenerating(true);
    setReport(null);
    setReportError(null);

    const pillarAvgs = [0,1,2].map(i => (scores.slice(i*3,i*3+3).reduce((a,b)=>a+b,0)/3).toFixed(1));

    // Build a readable summary of answers
    const answerSummary = Object.entries(QUESTIONS).map(([pillar, qs]) => {
      const pillarLabel = PILLARS.find(p => p.id === pillar)?.label || pillar;
      const lines = qs.map(q => {
        const val = answers[q.key];
        if (val == null || val === "") return null;
        if (q.type === "number") return `  ${q.label} → ${val}`;
        const opt = q.options?.find(o => o.value === val);
        return `  ${q.label} → ${opt?.label || val}`;
      }).filter(Boolean);
      return `${pillarLabel}:\n${lines.join("\n")}`;
    }).join("\n\n");

    const scoresSummary = PILLARS.map((p, pi) =>
      `${p.label}: ${p.axes.map((a, ai) => `${a.label}=${scores[pi*3+ai]}`).join(", ")} (avg ${pillarAvgs[pi]})`
    ).join("\n");

    const prompt = `You are the Valley Works Collaborative Evaluator, a structural economic analyst for Napa County. Assess the following project using the Jobs-People-Place framework.

PROJECT: ${projectName || "Unnamed Project"}
DESCRIPTION: ${projectDesc || "No description provided."}

QUESTIONNAIRE RESPONSES:
${answerSummary}

CALCULATED COMPASS SCORES (0-10 scale):
${scoresSummary}

ALIGNMENT RATING: ${rating.label} — ${rating.desc}

Generate a structured assessment report with these sections:

1. SITUATION — 2-3 sentences on the current regional context this project operates within.

2. STRUCTURAL CONFLICT — The underlying tension or constraint this project addresses or worsens.

3. EVALUATION
   Jobs: Assess durable employment, wage quality relative to Napa's ~$25/hr median, sector diversification, and local workforce capture.
   People: Assess impact on young families, current residents (displacement, services), and seniors.
   Place: Assess land use efficiency, net fiscal contribution, infrastructure needs, and environmental fit.

4. KEY RISKS — Top 3-4 risks, each with a trigger condition and what to watch for.

5. MODIFICATION PATHWAYS — If alignment is less than Strong, provide 2-3 specific design changes that would improve the weakest pillar scores. Be concrete (e.g., "require 20% of ground-floor space for non-hospitality commercial tenants at below-market rates").

6. CONCLUSION — One-sentence counterfactual (strongest argument in favor), the alignment rating, and 2-3 conditions that would change the rating.

Write in a neutral, analytical tone. Short paragraphs. No promotional language. Separate fact from inference. Reference Napa County specifics (Agricultural Preserve, wildfire risk, housing constraints, wine/tourism dependence) where relevant.`;

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (data.error) {
        setReportError(`API error: ${data.error}`);
      } else {
        setReport(data.text || "No response generated.");
      }
    } catch (err) {
      setReportError(`Failed to connect: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(175deg, #1C120C 0%, #2A1A0E 30%, #1E1408 60%, #0F0A06 100%)", fontFamily: "'Source Sans 3','Source Sans Pro',-apple-system,sans-serif", color: "#F5E6C8" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Source+Sans+3:wght@300;400;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
      <div style={{ height: 3, background: "linear-gradient(90deg, transparent, #8B6914 20%, #C4A050 50%, #8B6914 80%, transparent)" }} />

      {/* Header */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ width: 6, height: 6, background: "#C4A050", borderRadius: "50%" }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "#8B6914", textTransform: "uppercase" }}>NapaServe</span>
            </div>
            <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(26px,4vw,38px)", fontWeight: 900, color: "#F5E6C8", margin: "0 0 4px", letterSpacing: -0.5 }}>Project Evaluator</h1>
            <p style={{ fontSize: 15, color: "#9B8968", margin: "0 0 24px" }}>Structural resilience analysis — answer the questions below to see how a project scores across Jobs, People, and Place</p>
          </div>
          <button onClick={resetProject} style={{
            padding: "10px 20px", fontSize: 13, fontWeight: 600, fontFamily: "'Source Sans 3',sans-serif",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,105,20,0.25)",
            color: "#C4A050", borderRadius: 8, cursor: "pointer", transition: "all 0.2s",
            marginTop: 8,
          }}>+ New Project</button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 60px", display: "flex", gap: 28, flexWrap: "wrap" }}>

        {/* LEFT: Questions */}
        <div style={{ flex: "1 1 440px", minWidth: 0 }}>

          {/* Project info */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(139,105,20,0.18)", borderRadius: 12, padding: 24, marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#8B6914", textTransform: "uppercase", marginBottom: 14 }}>Project Details</div>
            <input value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Project name..."
              style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px solid rgba(139,105,20,0.3)", color: "#F5E6C8", fontFamily: "'Playfair Display',Georgia,serif", fontSize: 20, padding: "8px 0", outline: "none", marginBottom: 14, boxSizing: "border-box" }} />
            <textarea value={projectDesc} onChange={e => setProjectDesc(e.target.value)} placeholder="Brief description of the project or proposal..." rows={3}
              style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(139,105,20,0.15)", color: "#C4B08A", fontFamily: "'Source Sans 3',sans-serif", fontSize: 14, padding: 12, outline: "none", borderRadius: 8, resize: "vertical", boxSizing: "border-box", lineHeight: 1.5 }} />
          </div>

          {/* Progress */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(139,105,20,0.18)", borderRadius: 12, padding: "16px 24px", marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#9B8968" }}>Assessment Progress</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#C4A050", fontFamily: "'JetBrains Mono',monospace" }}>{answered}/{total}</span>
            </div>
            <div style={{ height: 4, background: "rgba(139,105,20,0.15)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #C8A96E, #7EB8A4)", borderRadius: 3, transition: "width 0.4s ease" }} />
            </div>
          </div>

          {/* Pillar tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
            {PILLARS.map(p => {
              const pr = pp(p.id);
              const active = activePillar === p.id;
              return (
                <button key={p.id} onClick={() => setActivePillar(p.id)} style={{
                  flex: 1, padding: "12px 10px", fontSize: 14, fontWeight: 600, fontFamily: "'Source Sans 3',sans-serif",
                  background: active ? `${p.color}18` : "rgba(255,255,255,0.02)",
                  border: `1px solid ${active ? p.color + "55" : "rgba(139,105,20,0.12)"}`,
                  color: active ? p.color : "#7A6B50", cursor: "pointer", borderRadius: 8, transition: "all 0.2s",
                }}>
                  {p.label}
                  <span style={{ display: "block", fontSize: 11, marginTop: 3, opacity: 0.6, fontWeight: 400 }}>{pr.done} of {pr.all} answered</span>
                </button>
              );
            })}
          </div>

          {/* Questions */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(139,105,20,0.18)", borderRadius: 12, padding: 24 }}>
            {(QUESTIONS[activePillar] || []).map((q, qi, arr) => (
              <div key={q.id} style={{ marginBottom: qi < arr.length - 1 ? 28 : 0 }}>
                <label style={{ display: "block", fontSize: 15, color: "#E8DDD0", lineHeight: 1.5, marginBottom: 10, fontWeight: 400 }}>
                  {q.label}
                </label>
                {q.type === "number" ? (
                  <input type="number" value={answers[q.key] || ""} onChange={e => update(q.key, e.target.value)} placeholder={q.placeholder}
                    style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(139,105,20,0.2)", color: "#F5E6C8", fontFamily: "'JetBrains Mono',monospace", fontSize: 16, padding: "10px 14px", borderRadius: 8, outline: "none", boxSizing: "border-box" }} />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {q.options.map(opt => {
                      const sel = answers[q.key] === opt.value;
                      const pillar = PILLARS.find(p => p.id === activePillar);
                      return (
                        <button key={opt.value} onClick={() => update(q.key, opt.value)} style={{
                          textAlign: "left", padding: "12px 16px", fontSize: 14, fontFamily: "'Source Sans 3',sans-serif", lineHeight: 1.4,
                          background: sel ? `${pillar.color}15` : "rgba(255,255,255,0.01)",
                          border: `1px solid ${sel ? pillar.color + "55" : "rgba(139,105,20,0.12)"}`,
                          color: sel ? "#F5E6C8" : "#9B8968",
                          cursor: "pointer", borderRadius: 8, transition: "all 0.15s",
                        }}>{opt.label}</button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Compass + Scores */}
        <div style={{ flex: "1 1 440px", minWidth: 0 }}>

          {/* Rating */}
          {answered >= 5 && (
            <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${rating.color}33`, borderRadius: 12, padding: "20px 24px", marginBottom: 20, textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#8B6914", textTransform: "uppercase", marginBottom: 8 }}>Alignment Rating</div>
              <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 28, fontWeight: 700, color: rating.color, marginBottom: 6 }}>{rating.label}</div>
              <p style={{ fontSize: 14, color: "#9B8968", margin: 0, lineHeight: 1.5 }}>{rating.desc}</p>
            </div>
          )}

          {/* Compass */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(139,105,20,0.15)", borderRadius: 14, padding: "12px 0", marginBottom: 20, display: "flex", justifyContent: "center" }}>
            <Compass scores={scores} size={400} />
          </div>

          {/* Score bars */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(139,105,20,0.18)", borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#8B6914", textTransform: "uppercase", marginBottom: 16 }}>Axis Scores</div>
            {(() => {
              let axIdx = 0;
              return PILLARS.map((p, pi) => {
                const startIdx = axIdx;
                const axes = p.axes.map((a, ai) => {
                  const idx = axIdx++;
                  const v = scores[idx];
                  return (
                    <div key={a.id} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, color: "#C4B08A" }}>{a.label}</span>
                        <span style={{ fontSize: 14, color: p.color, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{v}</span>
                      </div>
                      <div style={{ height: 5, background: "rgba(139,105,20,0.1)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(v / 10) * 100}%`, background: p.color, borderRadius: 3, transition: "width 0.5s ease", boxShadow: `0 0 8px ${p.color}44` }} />
                      </div>
                      <div style={{ fontSize: 11, color: "#6B5B40", marginTop: 2 }}>{a.desc}</div>
                    </div>
                  );
                });
                const pillarScores = scores.slice(startIdx, startIdx + p.axes.length);
                const avg = (pillarScores.reduce((a,b)=>a+b,0) / pillarScores.length).toFixed(1);
                return (
                  <div key={p.id} style={{ marginBottom: pi < PILLARS.length - 1 ? 20 : 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: p.color, letterSpacing: 1, marginBottom: 10 }}>{p.label} <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.6 }}>({p.axes.length} dimensions)</span></div>
                    {axes}
                    <div style={{ fontSize: 12, color: "#7A6B50", marginTop: 4, textAlign: "right", fontFamily: "'JetBrains Mono',monospace" }}>
                      pillar avg: {avg}
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 16, fontSize: 12, color: "#6B5B40" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 16, height: 2, background: "#8DA7BE", display: "inline-block", opacity: 0.5 }} /> Regional baseline (5.0)</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 16, height: 2, background: "#C8A96E", display: "inline-block" }} /> Project impact</span>
          </div>

          {/* Generate Report button */}
          <button
            disabled={answered < 8 || generating}
            onClick={generateReport}
            style={{
              width: "100%", marginTop: 24, padding: "16px 24px",
              fontSize: 15, fontWeight: 700, fontFamily: "'Source Sans 3',sans-serif", letterSpacing: 0.5,
              background: answered >= 8 ? "linear-gradient(135deg, #8B6914, #C4A050)" : "rgba(139,105,20,0.15)",
              color: answered >= 8 ? "#1C120C" : "#6B5B40",
              border: "none", borderRadius: 10, cursor: answered >= 8 && !generating ? "pointer" : "default",
              transition: "all 0.3s ease",
              opacity: answered >= 8 ? 1 : 0.5,
            }}
          >
            {generating ? "Generating Report..." : answered >= 8 ? "Generate Full Report" : `Answer ${8 - answered} more questions`}
          </button>

          {/* Report output */}
          {report && (
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(139,105,20,0.18)", borderRadius: 12, padding: 28, marginTop: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#8B6914", textTransform: "uppercase" }}>Structural Assessment</div>
                <button onClick={() => { navigator.clipboard.writeText(report); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{
                  padding: "6px 14px", fontSize: 11, fontWeight: 600, fontFamily: "'Source Sans 3',sans-serif",
                  background: copied ? "rgba(91,138,90,0.2)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${copied ? "rgba(91,138,90,0.4)" : "rgba(139,105,20,0.25)"}`,
                  color: copied ? "#5B8A5A" : "#C4A050", borderRadius: 6, cursor: "pointer", transition: "all 0.2s",
                }}>{copied ? "✓ Copied" : "Copy Report"}</button>
              </div>
              <div style={{ fontFamily: "'Source Sans 3',sans-serif" }}>
                {report.split("\n").map((line, i) => {
                  const trimmed = line.trim();
                  if (!trimmed) return <div key={i} style={{ height: 12 }} />;

                  // H1
                  if (/^# /.test(trimmed)) return (
                    <h2 key={i} style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 22, fontWeight: 900, color: "#F5E6C8", margin: "24px 0 8px", lineHeight: 1.2 }}>
                      {trimmed.replace(/^# /, "")}
                    </h2>
                  );
                  // H2
                  if (/^## /.test(trimmed)) return (
                    <h3 key={i} style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 18, fontWeight: 700, color: "#C4A050", margin: "20px 0 6px", lineHeight: 1.3 }}>
                      {trimmed.replace(/^## /, "")}
                    </h3>
                  );
                  // H3
                  if (/^### /.test(trimmed)) return (
                    <h4 key={i} style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1.5, color: "#8B6914", textTransform: "uppercase", margin: "20px 0 8px" }}>
                      {trimmed.replace(/^### /, "")}
                    </h4>
                  );

                  // Bold text within paragraphs
                  const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
                  return (
                    <p key={i} style={{ fontSize: 14, color: "#C4B08A", lineHeight: 1.75, margin: "0 0 8px" }}>
                      {parts.map((part, j) => {
                        if (/^\*\*(.+)\*\*$/.test(part)) {
                          const inner = part.replace(/^\*\*|\*\*$/g, "");
                          // Alignment ratings get special colors
                          if (/Strong/.test(inner)) return <span key={j} style={{ fontWeight: 700, color: "#5B8A5A" }}>{inner}</span>;
                          if (/Moderate/.test(inner)) return <span key={j} style={{ fontWeight: 700, color: "#C8A96E" }}>{inner}</span>;
                          if (/Weak/.test(inner)) return <span key={j} style={{ fontWeight: 700, color: "#B85C38" }}>{inner}</span>;
                          if (/Misaligned/.test(inner)) return <span key={j} style={{ fontWeight: 700, color: "#8B3A3A" }}>{inner}</span>;
                          return <span key={j} style={{ fontWeight: 700, color: "#F5E6C8" }}>{inner}</span>;
                        }
                        return <span key={j}>{part}</span>;
                      })}
                    </p>
                  );
                })}
              </div>
            </div>
          )}

          {reportError && (
            <div style={{ background: "rgba(184,92,56,0.1)", border: "1px solid rgba(184,92,56,0.3)", borderRadius: 10, padding: "16px 20px", marginTop: 16 }}>
              <p style={{ fontSize: 14, color: "#B85C38", margin: 0 }}>{reportError}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
