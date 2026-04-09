import { useState, useRef, useEffect } from "react";
import NavBar from "./NavBar";
import Footer from "./Footer";

const WORKER = "https://misty-bush-fc93.tfcarl.workers.dev";

const T = {
  bg: "#F5F0E8",
  surface: "#EDE8DE",
  surfaceDeep: "#E4DDD0",
  ink: "#2C1810",
  accent: "#8B5E3C",
  gold: "#C4A050",
  muted: "#8B7355",
  border: "rgba(44,24,16,0.12)",
};

const fonts = {
  serif: "'Libre Baskerville', Georgia, serif",
  sans: "'Source Sans 3', 'Source Sans Pro', sans-serif",
  mono: "'Courier New', Courier, monospace",
};

// ─── CARD WRAPPER ──────────────────────────────────────────────────────────
function CalcCard({ id, eyebrow, title, articleLabel, articleHref, howTo, sources, children }) {
  return (
    <div id={id} style={{ background: T.surface, borderRadius: 4, padding: "32px 36px 28px", marginBottom: 48, border: `1px solid ${T.border}` }}>
      {/* Eyebrow */}
      <div style={{ fontFamily: fonts.mono, fontSize: 11, color: T.gold, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
        {eyebrow}
      </div>
      {/* Title */}
      <h2 style={{ fontFamily: fonts.serif, fontSize: 24, fontWeight: 700, color: T.ink, margin: "0 0 10px" }}>{title}</h2>
      {/* Article link */}
      {articleHref && (
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontFamily: fonts.sans, fontSize: 13, color: T.muted }}>From: </span>
          <a href={articleHref} style={{ fontFamily: fonts.sans, fontSize: 13, color: T.accent, textDecoration: "none", fontStyle: "italic" }}>
            "{articleLabel}"
          </a>
          <span style={{ fontFamily: fonts.sans, fontSize: 13, color: T.muted }}> → napaserve.org</span>
        </div>
      )}
      {articleHref === null && articleLabel && (
        <div style={{ marginBottom: 16, fontFamily: fonts.sans, fontSize: 13, color: T.muted, fontStyle: "italic" }}>
          Originally published on <a href="https://napavalleyfocus.substack.com/p/under-the-hood-the-dismal-math-of" target="_blank" rel="noopener noreferrer" style={{ color: T.accent, textDecoration: "none" }}>Napa Valley Features · Substack</a> (November 2025)
        </div>
      )}
      {/* How to use */}
      <p style={{ fontFamily: fonts.sans, fontSize: 15, color: T.ink, lineHeight: 1.6, margin: "0 0 24px", borderLeft: `3px solid ${T.gold}`, paddingLeft: 14 }}>
        {howTo}
      </p>
      {/* Calculator */}
      <div style={{ background: T.bg, borderRadius: 3, padding: "24px 28px", border: `1px solid ${T.border}` }}>
        {children}
      </div>
      {/* Sources */}
      {sources && (
        <p style={{ fontFamily: fonts.sans, fontSize: 12, color: T.muted, margin: "18px 0 0", lineHeight: 1.5 }}>
          <strong>Sources:</strong> {sources}
        </p>
      )}
      <p style={{ fontFamily: fonts.sans, fontSize: 11, color: T.muted, margin: "8px 0 0", fontStyle: "italic" }}>
        Directional estimates only — not a BEA or county economic forecast.
      </p>
    </div>
  );
}

// ─── SHARED UI PRIMITIVES ──────────────────────────────────────────────────
function PresetButtons({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          style={{
            padding: "6px 14px",
            fontFamily: fonts.sans,
            fontSize: 13,
            fontWeight: 600,
            border: `1.5px solid ${value === o.value ? T.accent : T.border}`,
            background: value === o.value ? T.accent : "transparent",
            color: value === o.value ? "#fff" : T.ink,
            borderRadius: 3,
            cursor: "pointer",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Slider({ min, max, step, value, onChange, label, formatValue }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontFamily: fonts.sans, fontSize: 13, color: T.muted }}>{label}</span>
        <span style={{ fontFamily: fonts.mono, fontSize: 13, color: T.accent, fontWeight: 700 }}>
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: T.accent }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
        <span style={{ fontFamily: fonts.mono, fontSize: 11, color: T.muted }}>{formatValue ? formatValue(min) : min}</span>
        <span style={{ fontFamily: fonts.mono, fontSize: 11, color: T.muted }}>{formatValue ? formatValue(max) : max}</span>
      </div>
    </div>
  );
}

function OutputGrid({ items }) {
  const [mobile, setMobile] = React.useState(window.innerWidth < 600);
  React.useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 600);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  const cols = mobile ? Math.min(2, items.length) : items.length;
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12, marginTop: 20 }}>
      {items.map((item) => (
        <div key={item.label} style={{ background: T.surface, borderRadius: 3, padding: "16px 14px", textAlign: "center", border: `1px solid ${T.border}` }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 20, fontWeight: 700, color: T.accent, marginBottom: 4 }}>{item.value}</div>
          <div style={{ fontFamily: fonts.sans, fontSize: 12, color: T.muted, lineHeight: 1.3 }}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}

function OutputText({ text }) {
  return (
    <div style={{ marginTop: 18, padding: "14px 16px", background: T.surface, borderRadius: 3, borderLeft: `3px solid ${T.accent}`, fontFamily: fonts.sans, fontSize: 14, color: T.ink, lineHeight: 1.6 }}>
      {text}
    </div>
  );
}

// ─── CALCULATOR 1: VINEYARD ACRE IMPACT ───────────────────────────────────
function VineyardCalc() {
  const [tonsPerAcre, setTonsPerAcre] = useState(3);
  const [pricePerTon, setPricePerTon] = useState(7000);
  const [harvestCost, setHarvestCost] = useState(350);
  const [multiplier, setMultiplier] = useState(10.3);
  const [replantCost, setReplantCost] = useState(50000);
  const [acresA, setAcresA] = useState(8000);
  const [acresB, setAcresB] = useState(3000);
  const [acresC, setAcresC] = useState(0);

  const netPerAcre = tonsPerAcre * (pricePerTon - harvestCost);
  const grossRevenueA = acresA * tonsPerAcre * pricePerTon;
  const netLossA = acresA * netPerAcre;
  const communityA_25 = netLossA * multiplier * 0.25 * 5;
  const communityA_50 = netLossA * multiplier * 0.50 * 5;
  const communityA_100 = netLossA * multiplier * 1.00 * 5;

  const netLossB = acresB * netPerAcre;
  const communityB_25 = netLossB * multiplier * 0.25 * 5;
  const communityB_50 = netLossB * multiplier * 0.50 * 5;
  const communityB_100 = netLossB * multiplier * 1.00 * 5;

  const replantTotal = acresC * replantCost;
  const netLossC = acresC * netPerAcre + replantTotal;

  const fmt = (n) => n >= 1e9 ? `$${(n/1e9).toFixed(2)}B` : n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : `$${n.toLocaleString()}`;
  const fmtM = (n) => `$${(n/1e6).toFixed(1)}M`;

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Tons per acre", value: tonsPerAcre, min: 1, max: 6, step: 0.5, set: setTonsPerAcre, fmt: v => `${v} t/ac` },
          { label: "Price per ton ($)", value: pricePerTon, min: 2000, max: 15000, step: 500, set: setPricePerTon, fmt: v => `$${v.toLocaleString()}` },
          { label: "Harvest cost per ton ($)", value: harvestCost, min: 100, max: 1000, step: 50, set: setHarvestCost, fmt: v => `$${v}` },
          { label: "Economic multiplier", value: multiplier, min: 5, max: 15, step: 0.1, set: setMultiplier, fmt: v => `${v.toFixed(1)}×` },
          { label: "Replant cost per acre ($)", value: replantCost, min: 20000, max: 100000, step: 5000, set: setReplantCost, fmt: v => `$${v.toLocaleString()}` },
        ].map(({ label, value, min, max, step, set, fmt }) => (
          <div key={label}>
            <Slider label={label} min={min} max={max} step={step} value={value} onChange={set} formatValue={fmt} />
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 8 }}>
        {[
          { label: "Scenario A — Acres skipped (maintained)", value: acresA, min: 0, max: 15000, step: 500, set: setAcresA },
          { label: "Scenario B — Acres removed (not replanted)", value: acresB, min: 0, max: 10000, step: 500, set: setAcresB },
          { label: "Scenario C — Acres removed (replanted)", value: acresC, min: 0, max: 5000, step: 100, set: setAcresC },
        ].map(({ label, value, min, max, step, set }) => (
          <div key={label}>
            <Slider label={label} min={min} max={max} step={step} value={value} onChange={set} formatValue={v => `${v.toLocaleString()} ac`} />
          </div>
        ))}
      </div>

      <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 20, paddingTop: 20 }}>
        <div style={{ fontFamily: fonts.sans, fontSize: 12, color: T.muted, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Per-Acre Grower Loss</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          <div style={{ background: T.surface, padding: "12px 14px", borderRadius: 3, border: `1px solid ${T.border}` }}>
            <div style={{ fontFamily: fonts.mono, fontSize: 22, color: T.accent, fontWeight: 700 }}>{fmt(netPerAcre)}</div>
            <div style={{ fontFamily: fonts.sans, fontSize: 12, color: T.muted }}>Net loss per acre (grower)</div>
          </div>
          <div style={{ background: T.surface, padding: "12px 14px", borderRadius: 3, border: `1px solid ${T.border}` }}>
            <div style={{ fontFamily: fonts.mono, fontSize: 22, color: T.accent, fontWeight: 700 }}>{fmt(netPerAcre * multiplier)}</div>
            <div style={{ fontFamily: fonts.sans, fontSize: 12, color: T.muted }}>Community impact per acre (1 yr)</div>
          </div>
        </div>

        {acresA > 0 && (
          <>
            <div style={{ fontFamily: fonts.sans, fontSize: 12, color: T.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Scenario A — Skipped, Maintained ({acresA.toLocaleString()} acres) · 5-Year Community Impact</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
              {[["Conservative (25%)", communityA_25], ["Moderate (50%)", communityA_50], ["Full (100%)", communityA_100]].map(([l, v]) => (
                <div key={l} style={{ background: T.surface, padding: "10px 12px", borderRadius: 3, border: `1px solid ${T.border}`, textAlign: "center" }}>
                  <div style={{ fontFamily: fonts.mono, fontSize: 16, color: T.accent, fontWeight: 700 }}>{fmtM(v)}</div>
                  <div style={{ fontFamily: fonts.sans, fontSize: 11, color: T.muted }}>{l}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {acresB > 0 && (
          <>
            <div style={{ fontFamily: fonts.sans, fontSize: 12, color: T.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Scenario B — Removed, Not Replanted ({acresB.toLocaleString()} acres) · 5-Year Community Impact</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
              {[["Conservative (25%)", communityB_25], ["Moderate (50%)", communityB_50], ["Full (100%)", communityB_100]].map(([l, v]) => (
                <div key={l} style={{ background: T.surface, padding: "10px 12px", borderRadius: 3, border: `1px solid ${T.border}`, textAlign: "center" }}>
                  <div style={{ fontFamily: fonts.mono, fontSize: 16, color: T.accent, fontWeight: 700 }}>{fmtM(v)}</div>
                  <div style={{ fontFamily: fonts.sans, fontSize: 11, color: T.muted }}>{l}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {acresC > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={{ background: T.surface, padding: "10px 12px", borderRadius: 3, border: `1px solid ${T.border}` }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 16, color: T.accent, fontWeight: 700 }}>{fmt(replantTotal)}</div>
              <div style={{ fontFamily: fonts.sans, fontSize: 11, color: T.muted }}>Scenario C — Replant capital ({acresC.toLocaleString()} ac)</div>
            </div>
            <div style={{ background: T.surface, padding: "10px 12px", borderRadius: 3, border: `1px solid ${T.border}` }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 16, color: T.accent, fontWeight: 700 }}>{fmt(netLossC)}</div>
              <div style={{ fontFamily: fonts.sans, fontSize: 11, color: T.muted }}>Total loss incl. replant cost</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── CALCULATOR 2: WINE INDUSTRY CONTRACTION ──────────────────────────────
const BASE_JOBS = 55875;
const BASE_WAGES = 3824.8; // $M
const BASE_TAX = 507.1; // $M county/local total
const BASE_PROP = 156.0; // $M property tax component

function ContractionCalc() {
  const [pct, setPct] = useState(0);
  const presets = [
    { label: "+5%", value: 5 },
    { label: "0%", value: 0 },
    { label: "−5%", value: -5 },
    { label: "−10%", value: -10 },
    { label: "−20%", value: -20 },
    { label: "−30%", value: -30 },
  ];

  const factor = 1 + pct / 100;
  const jobs = Math.round(BASE_JOBS * factor);
  const wages = (BASE_WAGES * factor).toFixed(1);
  const tax = (BASE_TAX * factor).toFixed(1);
  const propTax = (BASE_PROP * factor).toFixed(1);
  const jobDelta = jobs - BASE_JOBS;
  const wageDelta = (BASE_WAGES * factor - BASE_WAGES).toFixed(1);
  const taxDelta = (BASE_TAX * factor - BASE_TAX).toFixed(1);

  const sign = (n) => Number(n) >= 0 ? `+${n}` : `${n}`;
  const fmtDelta = (n) => Number(n) === 0 ? "—" : `${sign(n)}M`;

  const narrative = (() => {
    if (pct === 0) return `At flat — zero percent change from the 2022 base — the county retains ${BASE_JOBS.toLocaleString()} wine-related jobs, $${BASE_WAGES}M in wages and $${BASE_TAX}M in annual county and local tax revenue.`;
    if (pct > 0) return `At +${pct}% growth from the 2022 base, the county would support ${jobs.toLocaleString()} wine-related jobs (+${jobDelta.toLocaleString()}), $${wages}M in wages and $${tax}M in annual tax revenue.`;
    const absP = Math.abs(pct);
    const absJ = Math.abs(jobDelta).toLocaleString();
    const absT = Math.abs(Number(taxDelta)).toFixed(1);
    const absW = Math.abs(Number(wageDelta)).toFixed(1);
    if (absP <= 5) return `At a ${absP}% contraction, the county loses approximately ${absJ} wine-related jobs, $${absW}M in wages and $${absT}M in annual tax revenue.`;
    if (absP <= 10) return `A ${absP}% contraction removes approximately ${absJ} wine-related jobs from the county economy, with $${absT}M less in annual tax revenue flowing to local government.`;
    return `At ${absP}% contraction, the losses reach ${absJ} jobs, $${absW}M in wages and $${absT}M in annual local tax revenue — approaching ${Math.round(Number(tax) / 550 * 100)}% of the county's total local tax collections.`;
  })();

  return (
    <>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontFamily: fonts.sans, fontSize: 13, color: T.muted, marginBottom: 10 }}>Select a scenario or use the slider:</div>
        <PresetButtons options={presets} value={pct} onChange={setPct} />
      </div>
      <Slider
        label="Industry change from 2022 baseline"
        min={-35}
        max={10}
        step={1}
        value={pct}
        onChange={setPct}
        formatValue={(v) => v > 0 ? `+${v}%` : `${v}%`}
      />
      <div style={{ marginTop: 20, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: fonts.sans, fontSize: 14 }}>
          <thead>
            <tr>
              {["Metric", "2022 Baseline", `At ${pct >= 0 ? "+" : ""}${pct}%`, "Change"].map(h => (
                <th key={h} style={{ padding: "8px 12px", background: T.surface, color: T.muted, fontWeight: 600, fontSize: 11, textAlign: "left", borderBottom: `1px solid ${T.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { metric: "Wine-related jobs", base: BASE_JOBS.toLocaleString(), proj: jobs.toLocaleString(), delta: jobDelta === 0 ? "—" : (jobDelta > 0 ? `+${jobDelta.toLocaleString()}` : jobDelta.toLocaleString()), neg: jobDelta < 0 },
              { metric: "Annual wages", base: `$${BASE_WAGES}M`, proj: `$${wages}M`, delta: fmtDelta(wageDelta), neg: Number(wageDelta) < 0 },
              { metric: "County & local tax", base: `$${BASE_TAX}M`, proj: `$${tax}M`, delta: fmtDelta(taxDelta), neg: Number(taxDelta) < 0 },
              { metric: "Property tax (component)", base: `$${BASE_PROP}M`, proj: `$${propTax}M`, delta: fmtDelta((BASE_PROP * factor - BASE_PROP).toFixed(1)), neg: pct < 0 },
            ].map((row, i) => (
              <tr key={row.metric} style={{ background: i % 2 === 0 ? "transparent" : T.surface }}>
                <td style={{ padding: "9px 12px", color: T.ink, fontWeight: 500 }}>{row.metric}</td>
                <td style={{ padding: "9px 12px", color: T.muted, fontFamily: fonts.mono, fontSize: 13 }}>{row.base}</td>
                <td style={{ padding: "9px 12px", color: T.accent, fontFamily: fonts.mono, fontSize: 13, fontWeight: 700 }}>{row.proj}</td>
                <td style={{ padding: "9px 12px", fontFamily: fonts.mono, fontSize: 13, color: row.neg ? T.accent : "#5B8A5B" }}>{row.delta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <OutputText text={narrative} />
      <div style={{ marginTop: 12, padding: "10px 14px", background: T.surface, borderRadius: 3, fontFamily: fonts.sans, fontSize: 12, color: T.muted, lineHeight: 1.5, borderLeft: `3px solid ${T.border}` }}>
        <strong style={{ color: T.ink }}>Prop. 13 note:</strong> Property tax assessments do not automatically decline. Wine-related properties generated $156M — 27% of all county property tax — in 2022. Seven of the ten largest taxpayers that year were wine or vineyard properties. Actual revenue impacts depend on ownership changes and reassessment timing.
      </div>
    </>
  );
}

// ─── CALCULATOR 3: SUPPLY SHOCK IMPACT ESTIMATOR ─────────────────────────
const SC_BASE_JOBS = 55875;
const SC_BASE_WAGES = 3820; // $M
const SC_HOSP_SPEND = 1200; // $M annual leisure & hospitality spend
const SC_WINE_MARGIN = 0.18;
const SC_COUNTY_GDP = 14590; // $M nominal

function SupplyShockCalc() {
  const [inputCost, setInputCost] = useState(10); // % increase
  const [visitorDecline, setVisitorDecline] = useState(10); // % decline (positive = worse)
  const [duration, setDuration] = useState(6); // months

  const inputPresets = [
    { label: "+5%", value: 5 },
    { label: "+10%", value: 10 },
    { label: "+20%", value: 20 },
    { label: "+30%", value: 30 },
  ];
  const visitorPresets = [
    { label: "−5%", value: 5 },
    { label: "−10%", value: 10 },
    { label: "−15%", value: 15 },
    { label: "−25%", value: 25 },
  ];
  const durationPresets = [
    { label: "3 months", value: 3 },
    { label: "6 months", value: 6 },
    { label: "12 months", value: 12 },
  ];

  // Exact methodology from source file
  const durationFactor = duration === 3 ? 0.25 : duration === 6 ? 0.5 : 1.0;
  const wineJobsAtRisk = Math.round(SC_BASE_JOBS * (inputCost / 100) * SC_WINE_MARGIN * durationFactor * 1.08);
  const hospJobsAtRisk = Math.round((visitorDecline / 100) * SC_HOSP_SPEND * durationFactor / 50);
  const jobsAtRisk = wineJobsAtRisk + hospJobsAtRisk;
  const wagePressure = Math.round(SC_BASE_WAGES * (inputCost / 100) * SC_WINE_MARGIN * durationFactor * 1.08 +
    (visitorDecline / 100) * SC_HOSP_SPEND * durationFactor * 0.15);
  const gdpGapWidening = Math.round(
    (inputCost / 100 * SC_BASE_WAGES * 0.6 + visitorDecline / 100 * SC_HOSP_SPEND * 0.6) * durationFactor
  );

  // SVG pie — "every $1 of apparent growth"
  const existingInflation = 87;
  const shockCents = Math.min(Math.round((gdpGapWidening / SC_COUNTY_GDP) * 100 * 10), 10);
  const realCents = Math.max(100 - existingInflation - shockCents, 0);

  // SVG donut chart
  const cx = 60, cy = 60, r = 48, stroke = 20;
  const circ = 2 * Math.PI * r;
  const seg1 = (existingInflation / 100) * circ;
  const seg2 = (shockCents / 100) * circ;
  const seg3 = realCents > 0 ? (realCents / 100) * circ : 0;
  const gap1 = circ - seg1;
  const gap2 = circ - seg2;
  const gap3 = circ - seg3;
  const offset2 = circ - seg1;
  const offset3 = circ - seg1 - seg2;

  const narrative = `At a +${inputCost}% input cost increase and −${visitorDecline}% visitor decline sustained for ${duration} months, the model estimates ${jobsAtRisk.toLocaleString()} additional jobs at risk, $${wagePressure}M in annualized wage pressure, and a $${gdpGapWidening}M widening of the gap between nominal and real GDP — layered on top of the structural fragility Napa was already carrying before the Hormuz shock.`;

  const highWarning = jobsAtRisk > 2000;

  return (
    <>
      <div style={{ background: T.surface, padding: "10px 14px", borderRadius: 3, marginBottom: 20, fontFamily: fonts.sans, fontSize: 13, color: T.muted, lineHeight: 1.5 }}>
        <strong style={{ color: T.ink }}>Pre-shock baseline (Insel &amp; Company, 2022):</strong> {SC_BASE_JOBS.toLocaleString()} wine-related jobs · $3.82B wages · 72% of county employment.<br />
        <strong style={{ color: T.ink }}>GDP gap already present:</strong> 87¢ of every dollar of apparent growth since 2016 was inflation.
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: fonts.sans, fontSize: 13, color: T.muted, marginBottom: 8 }}>Input cost increase (fuel, freight, parts):</div>
        <PresetButtons options={inputPresets} value={inputCost} onChange={setInputCost} />
        <Slider label="Custom input cost increase" min={0} max={30} step={1} value={inputCost} onChange={setInputCost} formatValue={v => `+${v}%`} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: fonts.sans, fontSize: 13, color: T.muted, marginBottom: 8 }}>Visitor spend decline:</div>
        <PresetButtons options={visitorPresets} value={visitorDecline} onChange={setVisitorDecline} />
        <Slider label="Custom visitor decline" min={0} max={25} step={1} value={visitorDecline} onChange={setVisitorDecline} formatValue={v => `−${v}%`} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: fonts.sans, fontSize: 13, color: T.muted, marginBottom: 8 }}>Duration of shock:</div>
        <PresetButtons options={durationPresets} value={duration} onChange={setDuration} />
      </div>

      <OutputGrid items={[
        { label: "Jobs at additional risk", value: jobsAtRisk.toLocaleString() },
        { label: "Wage pressure / yr", value: `$${wagePressure}M` },
        { label: "GDP gap widening", value: `$${gdpGapWidening}M` },
      ]} />

      {/* SVG donut — every $1 of apparent growth */}
      <div style={{ marginTop: 20, background: T.surface, borderRadius: 3, padding: "16px", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ flexShrink: 0 }}>
          <svg width={120} height={120} viewBox="0 0 120 120">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.gold} strokeWidth={stroke}
              strokeDasharray={`${seg1} ${gap1}`} strokeDashoffset={circ / 4} />
            {shockCents > 0 && (
              <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.accent} strokeWidth={stroke}
                strokeDasharray={`${seg2} ${gap2}`} strokeDashoffset={circ / 4 - seg1} />
            )}
            {realCents > 0 && (
              <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.muted} strokeWidth={stroke}
                strokeDasharray={`${seg3} ${gap3}`} strokeDashoffset={circ / 4 - seg1 - seg2} />
            )}
            <text x={cx} y={cy - 6} textAnchor="middle" fontFamily={fonts.mono} fontSize={9} fill={T.muted}>EVERY $1</text>
            <text x={cx} y={cy + 6} textAnchor="middle" fontFamily={fonts.mono} fontSize={9} fill={T.muted}>OF GROWTH</text>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 11, color: T.gold, letterSpacing: "0.1em", marginBottom: 10, textTransform: "uppercase" }}>Every $1 of Apparent Growth</div>
          {[
            { color: T.gold, label: `${existingInflation}¢`, desc: "already inflation (pre-shock)" },
            { color: T.accent, label: `+${shockCents}¢`, desc: "this shock" },
            { color: T.muted, label: `${realCents}¢`, desc: "real output remaining" },
          ].map(({ color, label, desc }) => (
            <div key={desc} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
              <span style={{ fontFamily: fonts.mono, fontSize: 12, color, fontWeight: 700 }}>{label}</span>
              <span style={{ fontFamily: fonts.sans, fontSize: 12, color: T.muted }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>

      <OutputText text={narrative} />
      {highWarning && (
        <div style={{ marginTop: 10, padding: "10px 14px", background: "#FDF3E7", borderRadius: 3, borderLeft: `3px solid ${T.gold}`, fontFamily: fonts.sans, fontSize: 13, color: T.ink }}>
          At this level, the compound effect of input cost increases and visitor decline represents a significant employment shock — comparable in scale to disruptions documented in 2020.
        </div>
      )}
      <div style={{ marginTop: 12, fontFamily: fonts.sans, fontSize: 12, color: T.muted, lineHeight: 1.5 }}>
        Property tax assessments do not automatically decline under Proposition 13. Actual revenue impacts depend on ownership changes and reassessment timing.
      </div>
    </>
  );
}

// ─── CALCULATOR 4: ASSET REPRICING SCENARIO ───────────────────────────────
const ASSET_BASE = 4000; // $M
const GDP_BASELINE = 11313; // $M (2017 chained)
const MULTIPLIER = 0.4;

function AssetRepricingCalc() {
  const [haircut, setHaircut] = useState(20);
  const presets = [
    { label: "Scenario A — 11%", value: 11 },
    { label: "Scenario B — 20%", value: 20 },
  ];

  const drag = (ASSET_BASE * (haircut / 100) * MULTIPLIER).toFixed(0);
  const dragPct = ((drag / GDP_BASELINE) * 100).toFixed(1);
  const gdp2026 = (GDP_BASELINE - Number(drag)).toFixed(0);

  const scenarios = [
    { rate: "−11%", basis: "vs. original loan $220M → $195M", drag: `−$${(ASSET_BASE * 0.11 * MULTIPLIER).toFixed(0)}M`, pct: `−${(ASSET_BASE * 0.11 * MULTIPLIER / GDP_BASELINE * 100).toFixed(1)}%`, label: "A" },
    { rate: "−20%", basis: "vs. total debt stack $243.6M → $195M", drag: `−$${(ASSET_BASE * 0.20 * MULTIPLIER).toFixed(0)}M`, pct: `−${(ASSET_BASE * 0.20 * MULTIPLIER / GDP_BASELINE * 100).toFixed(1)}%`, label: "B (current)" },
    { rate: "−8.8%", basis: "2020 actual GDP decline", drag: "−$1,003M", pct: "−8.8%", label: "Reference" },
  ];

  // GDP bar chart (normalized to 2024 = 100%)
  const gdpData = [
    { year: "2019", val: 11000 },
    { year: "2020", val: 10310 },
    { year: "2021", val: 11540 },
    { year: "2022", val: 11100 },
    { year: "2023", val: 11200 },
    { year: "2024", val: 11313 },
    { year: "2026\nscenario", val: Number(gdp2026), scenario: true },
  ];
  const maxVal = 12000;

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: fonts.sans, fontSize: 13, color: T.muted, marginBottom: 10 }}>Select a scenario or use the slider:</div>
        <PresetButtons options={presets} value={haircut} onChange={setHaircut} />
        <Slider label="Asset repricing rate" min={0} max={30} step={1} value={haircut} onChange={setHaircut} formatValue={v => `−${v}%`} />
      </div>

      {/* GDP mini bar chart — normalized from floor so differences are visible */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: fonts.sans, fontSize: 12, color: T.muted, marginBottom: 10 }}>
          Napa County real GDP 2019–2026 scenario (BEA 2017 chained dollars)
        </div>
        {(() => {
          const FLOOR = 9500; // chart floor in $M — makes deltas visible
          const CHART_H = 120; // px
          const allVals = gdpData.map(d => d.val);
          const peak = Math.max(...allVals);
          const scale = (v) => Math.max(0, Math.round(((v - FLOOR) / (peak - FLOOR)) * CHART_H));
          return (
            <div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: CHART_H + 4, position: "relative" }}>
                {gdpData.map(({ year, val, scenario }) => {
                  const h = scale(val);
                  return (
                    <div key={year} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      <div style={{ fontFamily: fonts.mono, fontSize: 9, color: scenario ? T.accent : T.muted, whiteSpace: "nowrap" }}>
                        ${(val/1000).toFixed(1)}B
                      </div>
                      <div style={{ position: "relative", width: "100%" }}>
  
                        <div style={{ width: "100%", height: h, background: scenario ? T.accent : T.gold, borderRadius: "2px 2px 0 0", border: scenario ? `1.5px solid ${T.accent}` : "none", transition: "height 0.4s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                {gdpData.map(({ year, scenario }) => (
                  <div key={year} style={{ flex: 1, textAlign: "center", fontFamily: fonts.mono, fontSize: 9, color: scenario ? T.accent : T.muted, lineHeight: 1.3, whiteSpace: "pre-line" }}>
                    {year}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 6, fontFamily: fonts.sans, fontSize: 11, color: T.muted }}>
                2026 bar = 2024 baseline minus estimated repricing drag. At 0% repricing, 2026 bar equals 2024 baseline exactly.
              </div>
            </div>
          );
        })()}
      </div>

      <OutputGrid items={[
        { label: "2024 real GDP baseline", value: "$11.31B" },
        { label: "Repricing rate", value: `−${haircut}%` },
        { label: "Estimated GDP drag", value: `−$${drag}M` },
        { label: "% of 2024 baseline", value: `−${dragPct}%` },
      ]} />

      {/* Scenario comparison table */}
      <div style={{ marginTop: 20, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: fonts.sans, fontSize: 13 }}>
          <thead>
            <tr>
              {["Scenario", "Rate", "Basis", "Est. GDP drag", "% of base"].map(h => (
                <th key={h} style={{ padding: "8px 10px", background: T.surface, color: T.muted, fontWeight: 600, fontSize: 11, textAlign: "left", borderBottom: `1px solid ${T.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scenarios.map((s, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : T.surface }}>
                <td style={{ padding: "7px 10px", color: T.ink, fontWeight: s.label.includes("current") ? 700 : 400 }}>{s.label}</td>
                <td style={{ padding: "7px 10px", color: T.accent, fontFamily: fonts.mono }}>{s.rate}</td>
                <td style={{ padding: "7px 10px", color: T.muted, fontSize: 12 }}>{s.basis}</td>
                <td style={{ padding: "7px 10px", color: T.accent, fontFamily: fonts.mono }}>{s.drag}</td>
                <td style={{ padding: "7px 10px", color: T.muted, fontFamily: fonts.mono }}>{s.pct}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Progress bar */}
      <div style={{ marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontFamily: fonts.sans, fontSize: 11, color: T.muted }}>
          <span>Estimated drag as % of 2024 real GDP</span>
          <span style={{ fontFamily: fonts.mono, color: T.accent }}>{dragPct}%</span>
        </div>
        <div style={{ height: 8, background: T.surface, borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${Math.min(dragPct / 10 * 100, 100)}%`, background: T.accent, borderRadius: 4, transition: "width 0.3s" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: fonts.mono, fontSize: 10, color: T.muted, marginTop: 2 }}>
          <span>0%</span><span>2.5%</span><span>5%</span><span>7.5%</span><span>10%</span>
        </div>
      </div>
    </>
  );
}

// ─── REGIONAL CONTRACTION TRACKER ────────────────────────────────────────
// UPDATE THIS DATA MANUALLY as new events are confirmed and sourced.
// Each entry: { date, category, headline, detail, source, sourceUrl }
// Categories: "Hospitality", "Production", "Transaction", "Distribution"

const TRACKER_EVENTS = [
  // ── 2026 ──
  {
    date: "Apr 12, 2026",
    category: "Hospitality",
    headline: "Charlie Palmer Steak closes at Archer Hotel Napa",
    detail: "High-profile full-service steakhouse at 1230 First St. closed after nearly a decade. Hotel redeveloping space as lobby lounge. Charlie Palmer Collective pursuing new wine country location.",
    source: "SF Chronicle / North Bay Business Journal",
    sourceUrl: "https://www.sfchronicle.com/",
  },
  {
    date: "Apr 9, 2026",
    category: "Transaction",
    headline: "Lawsuit filed against Stanly Ranch developers",
    detail: "$100M lawsuit by The Nichols Partnership and Stanly Ranch Resort Napa LLC against GA Development Napa Valley LP and Mandrake Capital Partners filed March 6, 2026, in New York State Supreme Court.",
    source: "The Reset Spreads — Napa Valley Features",
    sourceUrl: "https://napaserve.org/under-the-hood/napa-structural-reset-2026",
  },
  {
    date: "Mar 27, 2026",
    category: "Transaction",
    headline: "Stanly Ranch sold at foreclosure for $195M",
    detail: "Blackstone Real Estate acquired hotel portion at courthouse auction. Original loan ~$220M; total debt stack $243.6M. 11–20% haircut depending on measurement. Auberge Resorts continues management.",
    source: "Napa Valley Register / Bloomberg",
    sourceUrl: "https://napaserve.org/under-the-hood/napa-structural-reset-2026",
  },
  {
    date: "Feb 12, 2026",
    category: "Production",
    headline: "Gallo files WARN for 93 jobs across 5 North Coast sites",
    detail: "The Ranch Winery at 105 Zinfandel Lane, St. Helena closes Apr 15 (56 jobs). Additional layoffs at Louis M. Martini, Orin Swift, J Vineyards, Frei Ranch. Gallo cited 'long-term business strategy alignment.'",
    source: "CBS SF / Press Democrat",
    sourceUrl: "https://napaserve.org/under-the-hood/napa-structural-reset-2026",
  },
  {
    date: "Feb 2026",
    category: "Transaction",
    headline: "Trinchero lists two premium vineyard properties",
    detail: "Haystack Vineyard on Atlas Peak listed at $5.5M; Clouds Nest Vineyard on Mount Veeder at $4.5M. Described as 'proactive step' for long-term sustainability — separate from Mumm Napa acquisition.",
    source: "SF Chronicle",
    sourceUrl: "https://www.sfchronicle.com/",
  },
  {
    date: "Jan 2026",
    category: "Hospitality",
    headline: "Boisset closes JCB Tasting Salon in Yountville",
    detail: "Last Boisset location in Yountville's JCB Village — Atelier by JCB and Senses by JCB had already closed. Closed when lease expired. Experiences consolidating to Buena Vista Winery estate in Sonoma.",
    source: "SF Chronicle",
    sourceUrl: "https://www.sfchronicle.com/",
  },
  // ── 2025 ──
  {
    date: "Dec 2025",
    category: "Transaction",
    headline: "Cain Vineyards brand acquired by Third Leaf Partners; land sold separately",
    detail: "SF investment firm bought brand and inventory. 500-acre Spring Mountain estate selling to undisclosed buyer. Long-term grape supply contract in negotiation. Two-thirds of vineyard replanted post-2020 Glass Fire.",
    source: "SF Chronicle / The Real Deal",
    sourceUrl: "https://www.sfchronicle.com/",
  },
  {
    date: "Dec 2025",
    category: "Transaction",
    headline: "Trinchero acquires Mumm Napa from Pernod Ricard",
    detail: "Deal includes Rutherford winery, brand, inventory and long-term lease on Deveaux Ranch in Carneros. Mumm produced ~334,000 cases prior year.",
    source: "Wine Spectator / Shanken News Daily",
    sourceUrl: "https://www.winespectator.com/",
  },
  {
    date: "Late 2025",
    category: "Hospitality",
    headline: "Boisset closes Chateau Buena Vista in downtown Napa",
    detail: "Consolidated to Buena Vista Winery estate in Sonoma. Part of broader Boisset tasting room rationalization across Napa and Yountville.",
    source: "SF Chronicle",
    sourceUrl: "https://www.sfchronicle.com/",
  },
  {
    date: "Oct 2025",
    category: "Transaction",
    headline: "Stanly Ranch default notice recorded",
    detail: "SRGA LP defaults on loan that grew to $243.6M total debt. Property had opened April 2022 — 135 rooms, Michelin key, 700+ acres in Carneros.",
    source: "Napa Valley Register",
    sourceUrl: "https://napaserve.org/under-the-hood/napa-structural-reset-2026",
  },
  {
    date: "Sep 2025",
    category: "Distribution",
    headline: "Republic National exits California — 2,500+ brands disrupted",
    detail: "RNDC cited rising operational costs, industry headwinds and supplier losses. Exit effective September 2, 2025.",
    source: "SF Chronicle",
    sourceUrl: "https://www.sfchronicle.com/",
  },
  {
    date: "Sep 2025",
    category: "Production",
    headline: "Gallo closes Courtside Cellars in San Luis Obispo County",
    detail: "47 additional jobs eliminated. Second major Gallo capacity reduction in California in six months.",
    source: "SF Chronicle",
    sourceUrl: "https://www.sfchronicle.com/",
  },
];

const CATEGORY_COLORS = {
  Hospitality: { bg: "#FDF3E7", border: "#C4A050", dot: "#C4A050" },
  Production:  { bg: "#F0EBF5", border: "#7B5EA7", dot: "#7B5EA7" },
  Transaction: { bg: "#EBF0F5", border: "#4A7FA5", dot: "#4A7FA5" },
  Distribution:{ bg: "#F0F5EB", border: "#5A8A5A", dot: "#5A8A5A" },
};

function ContractionTracker() {
  const [filter, setFilter] = useState("All");
  const categories = ["All", "Hospitality", "Production", "Transaction", "Distribution"];

  const filtered = filter === "All"
    ? TRACKER_EVENTS
    : TRACKER_EVENTS.filter(e => e.category === filter);

  return (
    <div>
      {/* Filter buttons */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
        {categories.map(cat => {
          const c = CATEGORY_COLORS[cat];
          const active = filter === cat;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                padding: "6px 14px",
                fontFamily: fonts.sans,
                fontSize: 13,
                fontWeight: 600,
                border: `1.5px solid ${active ? (c ? c.border : T.ink) : T.border}`,
                background: active ? (c ? c.bg : T.surface) : "transparent",
                color: active ? (c ? c.border : T.ink) : T.muted,
                borderRadius: 3,
                cursor: "pointer",
              }}
            >
              {cat}
            </button>
          );
        })}
        <span style={{ fontFamily: fonts.sans, fontSize: 12, color: T.muted, alignSelf: "center", marginLeft: 8 }}>
          {filtered.length} event{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Category legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
        {Object.entries(CATEGORY_COLORS).map(([cat, c]) => (
          <div key={cat} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.dot }} />
            <span style={{ fontFamily: fonts.sans, fontSize: 12, color: T.muted }}>{cat}</span>
          </div>
        ))}
      </div>

      {/* Event list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {filtered.map((event, i) => {
          const c = CATEGORY_COLORS[event.category];
          return (
            <div key={i} style={{ display: "flex", gap: 0, position: "relative" }}>
              {/* Timeline spine */}
              <div style={{ width: 32, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: c.dot, border: `2px solid ${T.bg}`, marginTop: 18, zIndex: 1, flexShrink: 0 }} />
                {i < filtered.length - 1 && (
                  <div style={{ width: 2, flex: 1, background: T.border, marginTop: 2 }} />
                )}
              </div>
              {/* Event card */}
              <div style={{ flex: 1, marginBottom: 16, paddingBottom: 4 }}>
                <div style={{ background: c.bg, borderRadius: 3, border: `1px solid ${c.border}`, borderLeft: `3px solid ${c.border}`, padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
                    <span style={{ fontFamily: fonts.mono, fontSize: 10, color: c.border, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 }}>
                      {event.category}
                    </span>
                    <span style={{ fontFamily: fonts.mono, fontSize: 11, color: T.muted }}>{event.date}</span>
                  </div>
                  <div style={{ fontFamily: fonts.serif, fontSize: 15, fontWeight: 700, color: T.ink, marginBottom: 6, lineHeight: 1.3 }}>
                    {event.headline}
                  </div>
                  <div style={{ fontFamily: fonts.sans, fontSize: 13, color: T.ink, lineHeight: 1.6, marginBottom: 8 }}>
                    {event.detail}
                  </div>
                  <div style={{ fontFamily: fonts.sans, fontSize: 11, color: T.muted }}>
                    Source:{" "}
                    <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: T.accent, textDecoration: "none" }}>
                      {event.source}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin note */}
      <div style={{ marginTop: 16, padding: "12px 16px", background: T.surface, borderRadius: 3, border: `1px solid ${T.border}`, fontFamily: fonts.sans, fontSize: 12, color: T.muted, lineHeight: 1.5 }}>
        <strong style={{ color: T.ink }}>Editorial note:</strong> This tracker is updated manually as events are confirmed from primary sources. Entries document closures, transactions and capacity moves across the Napa Valley regional economy. Not exhaustive — coverage focuses on events with confirmed sourcing. To suggest an addition, <a href="/about#contact" style={{ color: T.accent, textDecoration: "none" }}>contact the newsroom</a>.
      </div>
    </div>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────
export default function CalculatorsPage() {
  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: fonts.sans }}>
      <NavBar />

      <main style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px 0" }}>

        {/* Page header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 11, color: T.gold, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
            Under the Hood · NapaServe
          </div>
          <h1 style={{ fontFamily: fonts.serif, fontSize: 34, fontWeight: 700, color: T.ink, margin: "0 0 16px", lineHeight: 1.2 }}>
            Models &amp; Calculators
          </h1>
          <p style={{ fontFamily: fonts.sans, fontSize: 16, color: T.ink, lineHeight: 1.7, margin: "0 0 16px", maxWidth: 680 }}>
            These tools are built from the data and methodology behind the Under the Hood series. Each calculator lets you adjust the inputs and see how the numbers move — modeling the economic pressures documented in our reporting on Napa's wine industry, supply chain exposure and asset repricing cycle.
          </p>
          <p style={{ fontFamily: fonts.sans, fontSize: 15, color: T.muted, lineHeight: 1.6, margin: 0, maxWidth: 680 }}>
            All outputs are directional estimates only. They are not BEA projections, county economic forecasts or investment guidance. The underlying data and methodology are documented in each source article.
          </p>
          <div style={{ borderBottom: `2px solid ${T.gold}`, marginTop: 32 }} />
        </div>

        {/* ── JUMP-TO NAV ── */}
        <div style={{ marginBottom: 48, overflowX: "auto" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { label: "Vineyard Impact", href: "#vineyard" },
              { label: "Industry Contraction", href: "#contraction" },
              { label: "Supply Shock", href: "#supply-shock" },
              { label: "Asset Repricing", href: "#asset-repricing" },
              { label: "Contraction Tracker", href: "#tracker" },
            ].map(({ label, href }) => (
              <a
                key={href}
                href={href}
                style={{
                  display: "inline-block",
                  padding: "8px 16px",
                  fontFamily: fonts.sans,
                  fontSize: 13,
                  fontWeight: 600,
                  color: T.accent,
                  background: T.surface,
                  border: `1.5px solid ${T.border}`,
                  borderRadius: 3,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* ── CALCULATOR 1 ── */}
        <CalcCard
          id="vineyard"
          eyebrow="Under the Hood · Napa Valley Features · November 2025"
          title="Vineyard Acre Impact Calculator"
          articleLabel="The Dismal Math of Napa's Skipped Acres"
          articleHref={null}
          howTo="Enter your own tonnage, price and cost assumptions, then set acres for each scenario: land skipped but maintained, land removed without replanting, and land removed and replanted. The calculator shows per-acre grower loss and five-year community economic impact at three confidence levels using the county economic multiplier."
          sources="California Department of Food and Agriculture, 2025 Crush Report; Napa Valley Vintners, Economic Impact Study (Insel & Company, May 2025). Economic multiplier 10.3× from Insel & Company county model."
        >
          <VineyardCalc />
        </CalcCard>

        {/* ── CALCULATOR 2 ── */}
        <CalcCard
          id="contraction"
          eyebrow="Under the Hood · Napa Valley Features · March 24, 2026"
          title="Wine Industry Contraction Calculator"
          articleLabel="Napa's Economy Looks Bigger Than It Is"
          articleHref="/under-the-hood/napa-gdp-2024"
          howTo="Select a preset contraction or expansion scenario, or use the slider to set a custom percentage. The calculator scales from the 2022 Insel & Company baseline — 55,875 wine-related jobs, $3.82B in wages, $507M in annual tax revenue — to show what each scenario means for county employment and the tax base."
          sources="Insel & Company for Napa Valley Vintners, Economic Impact Study, May 2025 (2022 data). Bureau of Economic Analysis via FRED (REALGDPALL06055, GDPALL06055)."
        >
          <ContractionCalc />
        </CalcCard>

        {/* ── CALCULATOR 3 ── */}
        <CalcCard
          id="supply-shock"
          eyebrow="Under the Hood · Napa Valley Features · March 28, 2026"
          title="Napa Valley Supply Shock Impact Estimator"
          articleLabel="Under the Hood: How a Global Supply Shock Reaches Napa Valley"
          articleHref="/under-the-hood/napa-supply-chain-2026"
          howTo="Adjust input cost increases (fuel, freight, parts), visitor spend decline and shock duration to model how the Hormuz supply shock compounds with Napa's pre-existing economic fragility. Outputs show additional jobs at risk, annualized wage pressure and the estimated widening of the gap between nominal and real GDP."
          sources="Insel & Company for Napa Valley Vintners (2022 baseline). UNCTAD Hormuz Disruptions report (March 2026). BEA FRED REALGDPALL06055. Methodology: cost shock at 18% avg operating margin; visitor spend from estimated $1.2B annual L&H spend; duration factors 0.25× (3mo), 0.5× (6mo), 1.0× (12mo); GDP gap at 60% nominal pass-through; pre-existing wine contraction factor 1.08×."
        >
          <SupplyShockCalc />
        </CalcCard>

        {/* ── CALCULATOR 4 ── */}
        <CalcCard
          id="asset-repricing"
          eyebrow="Under the Hood · Napa Valley Features · April 4, 2026"
          title="Asset Repricing Scenario Calculator"
          articleLabel="The Reset Spreads"
          articleHref="/under-the-hood/napa-structural-reset-2026"
          howTo="Set an asset haircut percentage — or use Scenario A (11%, vs. original $220M loan) or Scenario B (20%, vs. $243.6M total debt stack), both derived from the Stanly Ranch foreclosure auction. The calculator applies that rate to the ~$4B of Napa hospitality and premium wine real estate directly exposed to repricing, using a 0.4× indirect GDP multiplier."
          sources="Stanly Ranch deed, Napa County recorder (March 27, 2026). Bloomberg ($243.6M total debt stack, March 30, 2026). BEA FRED REALGDPALL06055 (Napa 2024 real GDP, 2017 chained dollars). Asset base ~$4B = Napa hospitality and premium wine RE directly subject to transaction-level price discovery in the current cycle."
        >
          <AssetRepricingCalc />
        </CalcCard>

        {/* ── REGIONAL CONTRACTION TRACKER ── */}
        <div id="tracker" style={{ marginBottom: 60 }}>
          <div style={{ borderTop: `2px solid ${T.gold}`, marginBottom: 32 }} />
          <div style={{ fontFamily: fonts.mono, fontSize: 11, color: T.gold, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
            Under the Hood · Running Record
          </div>
          <h2 style={{ fontFamily: fonts.serif, fontSize: 28, fontWeight: 700, color: T.ink, margin: "0 0 12px" }}>
            Regional Contraction Tracker
          </h2>
          <p style={{ fontFamily: fonts.sans, fontSize: 15, color: T.ink, lineHeight: 1.7, margin: "0 0 8px", maxWidth: 680 }}>
            A running record of closures, transactions and capacity moves across Napa Valley — updated manually as events are confirmed and sourced. Based on the timeline methodology from <a href="/under-the-hood/napa-structural-reset-2026" style={{ color: T.accent, textDecoration: "none" }}>"The Reset Spreads"</a> (April 2026).
          </p>
          <p style={{ fontFamily: fonts.sans, fontSize: 13, color: T.muted, lineHeight: 1.6, margin: "0 0 28px" }}>
            Each entry is sourced and categorized. Categories: Hospitality Closures · Production / Capacity · Deal Structure / Transactions · Distribution / Macro.
          </p>
          <ContractionTracker />
        </div>

        {/* Back link */}
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <a href="/under-the-hood" style={{ fontFamily: fonts.sans, fontSize: 14, color: T.accent, textDecoration: "none" }}>
            ← Back to Under the Hood
          </a>
        </div>

      </main>

      <Footer />
    </div>
  );
}
