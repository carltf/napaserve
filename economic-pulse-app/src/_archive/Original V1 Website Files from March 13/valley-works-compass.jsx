import { useState, useRef, useEffect, useCallback } from "react";

// ─── Valley Works Compass Chart ───────────────────────────────────────────────
// Framework: Jobs · People · Place (3 pillars × 3 sub-axes each = 9 dimensions)
// Visualization: Before/After current condition vs projected project impact
// ─────────────────────────────────────────────────────────────────────────────

const PILLARS = [
  {
    id: "jobs",
    label: "JOBS",
    color: "#C8A96E",
    axes: [
      { id: "new_jobs",      label: "New Durable Jobs",    description: "Net operating jobs at or above median wage" },
      { id: "wage_quality",  label: "Wage Quality",        description: "Alignment with local median / self-sufficiency standard" },
      { id: "sector_risk",   label: "Sector Resilience",   description: "Diversification vs concentration; cycle sensitivity" },
    ],
  },
  {
    id: "people",
    label: "PEOPLE",
    color: "#7EB8A4",
    axes: [
      { id: "young_families", label: "Young Families",    description: "Housing affordability, school quality, childcare access" },
      { id: "current_pop",    label: "Current Residents", description: "Displacement risk, service burden, community stability" },
      { id: "elder_pop",      label: "Elder Population",  description: "Fixed-income affordability, health access, mobility" },
    ],
  },
  {
    id: "place",
    label: "PLACE",
    color: "#9B8EC4",
    axes: [
      { id: "land_use",    label: "Land Efficiency",    description: "Productivity per acre relative to regional scarcity" },
      { id: "fiscal_net",  label: "Net Fiscal Balance", description: "Recurring revenues vs service obligations" },
      { id: "environment", label: "Environmental Fit",  description: "Soil, water, habitat, and long-term land viability" },
    ],
  },
];

const ALL_AXES = PILLARS.flatMap((p) =>
  p.axes.map((a) => ({ ...a, pillarId: p.id, pillarLabel: p.label, color: p.color }))
);

const DATASET_COLORS = {
  baseline: { stroke: "#8DA7BE", fill: "rgba(141,167,190,0.18)", label: "Current Condition" },
  project:  { stroke: "#C8A96E", fill: "rgba(200,169,110,0.22)", label: "Project Impact" },
  target:   { stroke: "#7EB8A4", fill: "rgba(126,184,164,0.18)", label: "Target / Ideal" },
};

const DEFAULT_DATA = {
  baseline: [5, 4, 6,   6, 5, 7,   5, 4, 6],
  project:  [7, 6, 5,   5, 4, 6,   7, 6, 5],
  target:   [9, 8, 8,   8, 8, 8,   8, 9, 8],
};

const GRID_RINGS = [2, 4, 6, 8, 10];
const MAX_VALUE = 10;
const CENTER_RADIUS = 32;

function polarToXY(angle, radius, cx, cy) {
  const rad = (angle - 90) * (Math.PI / 180);
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

function CompassChart({ width = 560, height = 560, data, activeDatasets, hoveredAxis, onAxisHover }) {
  const cx = width / 2;
  const cy = height / 2;
  const outerRadius = Math.min(width, height) / 2 - 80;
  const numAxes = ALL_AXES.length;
  const angleStep = 360 / numAxes;

  const ringRadius = (val) => CENTER_RADIUS + ((val / MAX_VALUE) * (outerRadius - CENTER_RADIUS));

  // Axis spoke endpoints
  const axisPoints = ALL_AXES.map((_, i) => {
    const angle = i * angleStep;
    return {
      inner: polarToXY(angle, CENTER_RADIUS, cx, cy),
      outer: polarToXY(angle, outerRadius, cx, cy),
      label: polarToXY(angle, outerRadius + 28, cx, cy),
      angle,
    };
  });

  // Polygon for a dataset
  const polygon = (values) =>
    values
      .map((val, i) => {
        const angle = i * angleStep;
        const r = ringRadius(val);
        const pt = polarToXY(angle, r, cx, cy);
        return `${pt.x},${pt.y}`;
      })
      .join(" ");

  // Compass rose ticks at each 45°
  const compassTicks = [0, 45, 90, 135, 180, 225, 270, 315];
  const compassLabels = { 0: "N", 90: "E", 180: "S", 270: "W" };

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e2535" />
          <stop offset="100%" stopColor="#111620" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="softglow">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Background circle */}
      <circle cx={cx} cy={cy} r={outerRadius + 60} fill="url(#bgGrad)" />

      {/* Compass rose outer decoration */}
      {compassTicks.map((deg) => {
        const isMajor = deg % 90 === 0;
        const inner = polarToXY(deg, outerRadius + 36, cx, cy);
        const outer = polarToXY(deg, outerRadius + 52, cx, cy);
        const lpt = polarToXY(deg, outerRadius + 62, cx, cy);
        return (
          <g key={deg}>
            <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
              stroke={isMajor ? "#C8A96E" : "#4a5568"} strokeWidth={isMajor ? 2 : 1} />
            {isMajor && compassLabels[deg] && (
              <text x={lpt.x} y={lpt.y} textAnchor="middle" dominantBaseline="central"
                fill="#C8A96E" fontSize="11" fontFamily="'Courier New', monospace" fontWeight="bold"
                filter="url(#glow)">
                {compassLabels[deg]}
              </text>
            )}
          </g>
        );
      })}

      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={outerRadius + 36} fill="none" stroke="#C8A96E" strokeWidth="0.5" opacity="0.4" />
      <circle cx={cx} cy={cy} r={outerRadius + 40} fill="none" stroke="#C8A96E" strokeWidth="0.25" opacity="0.2" />

      {/* Grid rings */}
      {GRID_RINGS.map((val) => {
        const r = ringRadius(val);
        const isOuter = val === 10;
        return (
          <g key={val}>
            <circle cx={cx} cy={cy} r={r} fill="none"
              stroke={isOuter ? "#C8A96E" : "#2d3748"} strokeWidth={isOuter ? 1 : 0.5}
              strokeDasharray={isOuter ? "none" : "3 3"} opacity={isOuter ? 0.6 : 0.5} />
            <text x={cx + 4} y={cy - r + 3} fill="#4a5568" fontSize="8"
              fontFamily="'Courier New', monospace">{val}</text>
          </g>
        );
      })}

      {/* Pillar sector shading */}
      {PILLARS.map((pillar, pi) => {
        const startIdx = pi * 3;
        const endIdx = startIdx + 2;
        const startAngle = startIdx * angleStep - angleStep / 2;
        const endAngle = endIdx * angleStep + angleStep / 2;
        const pts = [];
        for (let a = startAngle; a <= endAngle; a += 5) {
          const pt = polarToXY(a, outerRadius, cx, cy);
          pts.push(`${pt.x},${pt.y}`);
        }
        pts.unshift(`${cx},${cy}`);
        return (
          <polygon key={pillar.id} points={pts.join(" ")}
            fill={pillar.color} opacity="0.04" />
        );
      })}

      {/* Axis spokes */}
      {axisPoints.map((ap, i) => {
        const axis = ALL_AXES[i];
        const isHovered = hoveredAxis === axis.id;
        return (
          <line key={i} x1={ap.inner.x} y1={ap.inner.y} x2={ap.outer.x} y2={ap.outer.y}
            stroke={isHovered ? axis.color : "#2d3748"}
            strokeWidth={isHovered ? 1.5 : 0.75}
            opacity={isHovered ? 0.9 : 0.6} />
        );
      })}

      {/* Data polygons */}
      {Object.entries(data).map(([key, values]) => {
        if (!activeDatasets[key]) return null;
        const dc = DATASET_COLORS[key];
        return (
          <g key={key}>
            <polygon points={polygon(values)} fill={dc.fill} stroke={dc.stroke}
              strokeWidth="1.5" strokeLinejoin="round" filter="url(#softglow)" />
            {values.map((val, i) => {
              const angle = i * angleStep;
              const r = ringRadius(val);
              const pt = polarToXY(angle, r, cx, cy);
              return (
                <circle key={i} cx={pt.x} cy={pt.y} r={3}
                  fill={dc.stroke} stroke="#111620" strokeWidth="1" />
              );
            })}
          </g>
        );
      })}

      {/* Center */}
      <circle cx={cx} cy={cy} r={CENTER_RADIUS} fill="#111620" stroke="#C8A96E" strokeWidth="0.75" opacity="0.8" />
      <circle cx={cx} cy={cy} r={4} fill="#C8A96E" filter="url(#glow)" />
      <text x={cx} y={cy - 12} textAnchor="middle" fill="#C8A96E" fontSize="7"
        fontFamily="'Courier New', monospace" letterSpacing="1">VALLEY</text>
      <text x={cx} y={cy + 4} textAnchor="middle" fill="#C8A96E" fontSize="7"
        fontFamily="'Courier New', monospace" letterSpacing="1">WORKS</text>
      <text x={cx} y={cy + 15} textAnchor="middle" fill="#4a5568" fontSize="5.5"
        fontFamily="'Courier New', monospace" letterSpacing="0.5">EVALUATOR</text>

      {/* Axis labels */}
      {axisPoints.map((ap, i) => {
        const axis = ALL_AXES[i];
        const isHovered = hoveredAxis === axis.id;
        const angle = ap.angle;
        const isTop = angle < 30 || angle > 330;
        const isBottom = angle > 150 && angle < 210;
        const isRight = angle >= 30 && angle <= 150;
        const isLeft = angle >= 210 && angle <= 330;
        let anchor = "middle";
        if (isRight) anchor = "start";
        if (isLeft) anchor = "end";

        // Split label into two lines if long
        const words = axis.label.split(" ");
        const line1 = words.slice(0, Math.ceil(words.length / 2)).join(" ");
        const line2 = words.length > 1 ? words.slice(Math.ceil(words.length / 2)).join(" ") : null;

        const labelPt = polarToXY(angle, outerRadius + (isTop || isBottom ? 22 : 18), cx, cy);
        const pillar = PILLARS.find((p) => p.id === axis.pillarId);

        return (
          <g key={i} style={{ cursor: "pointer" }}
            onMouseEnter={() => onAxisHover(axis.id)}
            onMouseLeave={() => onAxisHover(null)}>
            <text x={labelPt.x} y={labelPt.y - (line2 ? 5 : 0)}
              textAnchor={anchor} dominantBaseline="central"
              fill={isHovered ? pillar.color : "#a0aec0"}
              fontSize={isHovered ? "9.5" : "8.5"}
              fontFamily="'Courier New', monospace"
              fontWeight={isHovered ? "bold" : "normal"}
              letterSpacing="0.3">
              {line1}
            </text>
            {line2 && (
              <text x={labelPt.x} y={labelPt.y + 8}
                textAnchor={anchor} dominantBaseline="central"
                fill={isHovered ? pillar.color : "#a0aec0"}
                fontSize={isHovered ? "9.5" : "8.5"}
                fontFamily="'Courier New', monospace"
                fontWeight={isHovered ? "bold" : "normal"}
                letterSpacing="0.3">
                {line2}
              </text>
            )}
          </g>
        );
      })}

      {/* Pillar arc labels */}
      {PILLARS.map((pillar, pi) => {
        const midIdx = pi * 3 + 1;
        const midAngle = midIdx * angleStep;
        const labelPt = polarToXY(midAngle, outerRadius - 18, cx, cy);
        return (
          <text key={pillar.id} x={labelPt.x} y={labelPt.y}
            textAnchor="middle" dominantBaseline="central"
            fill={pillar.color} fontSize="8" opacity="0.45"
            fontFamily="'Courier New', monospace" letterSpacing="3">
            {pillar.label}
          </text>
        );
      })}
    </svg>
  );
}

function ScoreBar({ label, value, color, max = 10 }) {
  return (
    <div style={{ marginBottom: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
        <span style={{ fontSize: "10px", fontFamily: "'Courier New', monospace", color: "#a0aec0", letterSpacing: "0.5px" }}>
          {label}
        </span>
        <span style={{ fontSize: "10px", fontFamily: "'Courier New', monospace", color }}>
          {value}/{max}
        </span>
      </div>
      <div style={{ height: "3px", background: "#1e2535", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${(value / max) * 100}%`,
          background: color, borderRadius: "2px",
          transition: "width 0.5s ease",
          boxShadow: `0 0 6px ${color}`,
        }} />
      </div>
    </div>
  );
}

export default function ValleyWorksCompass() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [activeDatasets, setActiveDatasets] = useState({ baseline: true, project: true, target: false });
  const [hoveredAxis, setHoveredAxis] = useState(null);
  const [editingDataset, setEditingDataset] = useState("project");
  const [projectName, setProjectName] = useState("Proposed Development");
  const [tooltip, setTooltip] = useState(null);

  const toggleDataset = (key) => {
    setActiveDatasets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateValue = (dataset, axisIdx, value) => {
    const clamped = Math.max(0, Math.min(MAX_VALUE, Number(value)));
    setData((prev) => {
      const updated = [...prev[dataset]];
      updated[axisIdx] = clamped;
      return { ...prev, [dataset]: updated };
    });
  };

  const hoveredAxisData = hoveredAxis ? ALL_AXES.find((a) => a.id === hoveredAxis) : null;
  const hoveredIdx = hoveredAxisData ? ALL_AXES.indexOf(hoveredAxisData) : null;

  // Aggregate pillar scores
  const pillarScores = (dataset) =>
    PILLARS.map((p, pi) => {
      const vals = data[dataset]?.slice(pi * 3, pi * 3 + 3) || [0, 0, 0];
      return (vals.reduce((a, b) => a + b, 0) / 3).toFixed(1);
    });

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d1117",
      color: "#e2e8f0",
      fontFamily: "'Courier New', monospace",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "32px 16px",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "28px", maxWidth: "640px" }}>
        <div style={{
          fontSize: "10px", letterSpacing: "4px", color: "#C8A96E",
          marginBottom: "6px", opacity: 0.8,
        }}>
          VALLEY WORKS COLLABORATIVE
        </div>
        <h1 style={{
          fontSize: "22px", fontWeight: "400", letterSpacing: "2px",
          color: "#e2e8f0", margin: "0 0 6px", lineHeight: 1.2,
        }}>
          STRUCTURAL COMPASS
        </h1>
        <div style={{ fontSize: "10px", color: "#4a5568", letterSpacing: "2px" }}>
          JOBS · PEOPLE · PLACE  —  CURRENT CONDITION vs PROJECT IMPACT
        </div>
        <div style={{ marginTop: "12px" }}>
          <input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            style={{
              background: "transparent", border: "none", borderBottom: "1px solid #2d3748",
              color: "#C8A96E", fontFamily: "'Courier New', monospace", fontSize: "12px",
              textAlign: "center", width: "280px", padding: "4px 0", outline: "none",
              letterSpacing: "1px",
            }}
            placeholder="Project name..."
          />
        </div>
      </div>

      {/* Main layout */}
      <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", flexWrap: "wrap", justifyContent: "center", width: "100%", maxWidth: "1100px" }}>

        {/* Left panel - Pillar scores */}
        <div style={{ width: "200px", flexShrink: 0 }}>
          <div style={{
            background: "#111620", border: "1px solid #1e2535",
            borderRadius: "4px", padding: "16px", marginBottom: "16px",
          }}>
            <div style={{ fontSize: "9px", letterSpacing: "2px", color: "#4a5568", marginBottom: "14px" }}>
              PILLAR AVERAGES
            </div>
            {Object.entries(activeDatasets).filter(([, v]) => v).map(([key]) => {
              const scores = pillarScores(key);
              const dc = DATASET_COLORS[key];
              return (
                <div key={key} style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "8px", color: dc.stroke, letterSpacing: "1px", marginBottom: "8px" }}>
                    — {dc.label.toUpperCase()}
                  </div>
                  {PILLARS.map((p, pi) => (
                    <ScoreBar key={p.id} label={p.label} value={scores[pi]} color={p.color} />
                  ))}
                </div>
              );
            })}
          </div>

          {/* Dataset toggles */}
          <div style={{ background: "#111620", border: "1px solid #1e2535", borderRadius: "4px", padding: "16px" }}>
            <div style={{ fontSize: "9px", letterSpacing: "2px", color: "#4a5568", marginBottom: "12px" }}>DATASETS</div>
            {Object.entries(DATASET_COLORS).map(([key, dc]) => (
              <div key={key} style={{ marginBottom: "8px" }}>
                <button
                  onClick={() => toggleDataset(key)}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    background: "none", border: "none", cursor: "pointer", padding: "4px 0", width: "100%",
                  }}>
                  <div style={{
                    width: "24px", height: "2px",
                    background: activeDatasets[key] ? dc.stroke : "#2d3748",
                    boxShadow: activeDatasets[key] ? `0 0 6px ${dc.stroke}` : "none",
                    transition: "all 0.3s",
                  }} />
                  <span style={{
                    fontSize: "9px", letterSpacing: "1px",
                    color: activeDatasets[key] ? dc.stroke : "#4a5568",
                    transition: "color 0.3s",
                  }}>
                    {dc.label.toUpperCase()}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div style={{ position: "relative" }}>
          <CompassChart
            width={520}
            height={520}
            data={data}
            activeDatasets={activeDatasets}
            hoveredAxis={hoveredAxis}
            onAxisHover={setHoveredAxis}
          />

          {/* Axis tooltip */}
          {hoveredAxisData && (
            <div style={{
              position: "absolute", bottom: "8px", left: "50%", transform: "translateX(-50%)",
              background: "#111620", border: `1px solid ${hoveredAxisData.color}`,
              borderRadius: "4px", padding: "10px 16px", textAlign: "center",
              minWidth: "240px", pointerEvents: "none",
            }}>
              <div style={{ fontSize: "8px", letterSpacing: "2px", color: hoveredAxisData.color, marginBottom: "4px" }}>
                {hoveredAxisData.pillarLabel}
              </div>
              <div style={{ fontSize: "11px", color: "#e2e8f0", marginBottom: "4px", letterSpacing: "0.5px" }}>
                {hoveredAxisData.label}
              </div>
              <div style={{ fontSize: "9px", color: "#718096" }}>
                {hoveredAxisData.description}
              </div>
              {hoveredIdx !== null && (
                <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "8px" }}>
                  {Object.entries(DATASET_COLORS).map(([key, dc]) => activeDatasets[key] && (
                    <div key={key} style={{ fontSize: "9px" }}>
                      <span style={{ color: "#718096" }}>{dc.label.split(" ")[0]}: </span>
                      <span style={{ color: dc.stroke, fontWeight: "bold" }}>{data[key][hoveredIdx]}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right panel - Data editor */}
        <div style={{ width: "200px", flexShrink: 0 }}>
          <div style={{ background: "#111620", border: "1px solid #1e2535", borderRadius: "4px", padding: "16px" }}>
            <div style={{ fontSize: "9px", letterSpacing: "2px", color: "#4a5568", marginBottom: "12px" }}>
              EDIT VALUES (0–10)
            </div>

            {/* Dataset selector */}
            <div style={{ display: "flex", gap: "4px", marginBottom: "14px" }}>
              {["baseline", "project", "target"].map((key) => {
                const dc = DATASET_COLORS[key];
                return (
                  <button key={key} onClick={() => setEditingDataset(key)}
                    style={{
                      flex: 1, padding: "4px 2px", fontSize: "7px", letterSpacing: "0.5px",
                      background: editingDataset === key ? dc.stroke : "transparent",
                      border: `1px solid ${editingDataset === key ? dc.stroke : "#2d3748"}`,
                      color: editingDataset === key ? "#0d1117" : "#718096",
                      cursor: "pointer", borderRadius: "2px", fontFamily: "'Courier New', monospace",
                      transition: "all 0.2s",
                    }}>
                    {key.toUpperCase()}
                  </button>
                );
              })}
            </div>

            {PILLARS.map((pillar, pi) => (
              <div key={pillar.id} style={{ marginBottom: "14px" }}>
                <div style={{ fontSize: "8px", color: pillar.color, letterSpacing: "1.5px", marginBottom: "6px" }}>
                  {pillar.label}
                </div>
                {pillar.axes.map((axis, ai) => {
                  const idx = pi * 3 + ai;
                  const val = data[editingDataset][idx];
                  return (
                    <div key={axis.id} style={{ marginBottom: "6px" }}>
                      <div style={{ fontSize: "8px", color: "#718096", marginBottom: "3px" }}>
                        {axis.label}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <input
                          type="range" min="0" max="10" step="0.5"
                          value={val}
                          onChange={(e) => updateValue(editingDataset, idx, e.target.value)}
                          style={{ flex: 1, accentColor: pillar.color, height: "2px" }}
                        />
                        <span style={{ fontSize: "10px", color: pillar.color, minWidth: "20px", textAlign: "right" }}>
                          {val}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Reset */}
            <button
              onClick={() => setData(DEFAULT_DATA)}
              style={{
                width: "100%", padding: "6px", marginTop: "4px",
                background: "transparent", border: "1px solid #2d3748",
                color: "#4a5568", fontSize: "8px", letterSpacing: "1px",
                cursor: "pointer", fontFamily: "'Courier New', monospace",
                borderRadius: "2px", transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.target.style.borderColor = "#C8A96E"; e.target.style.color = "#C8A96E"; }}
              onMouseLeave={(e) => { e.target.style.borderColor = "#2d3748"; e.target.style.color = "#4a5568"; }}>
              RESET TO DEFAULT
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: "28px", fontSize: "8px", color: "#2d3748",
        letterSpacing: "1.5px", textAlign: "center", maxWidth: "560px",
      }}>
        SCORES ARE HEURISTIC ASSESSMENTS · 10 = STRONGEST ALIGNMENT · 0 = CRITICAL MISALIGNMENT
        <br />
        HOVER AXES FOR DIMENSION DETAIL · TOGGLE DATASETS TO COMPARE · EDIT VALUES IN RIGHT PANEL
      </div>
    </div>
  );
}
