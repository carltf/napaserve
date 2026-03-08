import { useState, useMemo, useCallback } from "react";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from "recharts";

const RAW_DATA = [
  { date: "2019-12-01", count: 1681 },
  { date: "2020-12-01", count: 1744 },
  { date: "2021-12-01", count: 1775 },
  { date: "2022-12-01", count: 1856 },
  { date: "2023-12-01", count: 1841 },
  { date: "2024-02-01", count: 1870 },
  { date: "2024-02-08", count: 1872 },
  { date: "2024-02-15", count: 1877 },
  { date: "2024-02-22", count: 1882 },
  { date: "2024-02-29", count: 1880 },
  { date: "2024-03-07", count: 1881 },
  { date: "2024-03-14", count: 1884 },
  { date: "2024-03-19", count: 1886 },
  { date: "2024-03-28", count: 1890 },
  { date: "2024-04-03", count: 1891 },
  { date: "2024-04-11", count: 1895 },
  { date: "2024-04-16", count: 1896 },
  { date: "2024-04-23", count: 1896 },
  { date: "2024-05-02", count: 1899 },
  { date: "2024-05-09", count: 1899 },
  { date: "2024-05-16", count: 1903 },
  { date: "2024-05-23", count: 1907 },
  { date: "2024-05-30", count: 1908 },
  { date: "2024-06-06", count: 1908 },
  { date: "2024-06-13", count: 1905 },
  { date: "2024-06-20", count: 1903 },
  { date: "2024-06-27", count: 1903 },
  { date: "2024-07-04", count: 1910 },
  { date: "2024-07-11", count: 1909 },
  { date: "2024-07-18", count: 1894 },
  { date: "2024-07-25", count: 1892 },
  { date: "2024-08-01", count: 1890 },
  { date: "2024-08-08", count: 1888 },
  { date: "2024-08-13", count: 1890 },
  { date: "2024-08-19", count: 1890 },
  { date: "2024-08-26", count: 1890 },
  { date: "2024-09-02", count: 1893 },
  { date: "2024-09-12", count: 1888 },
  { date: "2024-09-19", count: 1884 },
  { date: "2024-09-26", count: 1886 },
  { date: "2024-10-03", count: 1890 },
  { date: "2024-10-10", count: 1892 },
  { date: "2024-10-17", count: 1851 },
  { date: "2024-10-24", count: 1851 },
  { date: "2024-10-29", count: 1855 },
  { date: "2024-11-05", count: 1858 },
  { date: "2024-11-14", count: 1859 },
  { date: "2024-11-18", count: 1862 },
  { date: "2024-11-28", count: 1867 },
  { date: "2024-12-02", count: 1867 },
  { date: "2024-12-12", count: 1876 },
  { date: "2024-12-21", count: 1882 },
  { date: "2024-12-28", count: 1884 },
  { date: "2025-01-07", count: 1887 },
  { date: "2025-01-14", count: 1891 },
  { date: "2025-01-21", count: 1889 },
  { date: "2025-01-28", count: 1895 },
  { date: "2025-02-04", count: 1900 },
  { date: "2025-02-11", count: 1902 },
  { date: "2025-02-18", count: 1907 },
  { date: "2025-02-25", count: 1910 },
  { date: "2025-03-04", count: 1915 },
  { date: "2025-03-11", count: 1920 },
  { date: "2025-03-18", count: 1923 },
  { date: "2025-03-25", count: 1926 },
  { date: "2025-04-01", count: 1927 },
  { date: "2025-04-08", count: 1926 },
  { date: "2025-04-15", count: 1927 },
  { date: "2025-04-22", count: 1926 },
  { date: "2025-04-29", count: 1926 },
  { date: "2025-05-06", count: 1926 },
  { date: "2025-05-13", count: 1926 },
  { date: "2025-05-20", count: 1929 },
  { date: "2025-05-27", count: 1932 },
  { date: "2025-06-03", count: 1933 },
  { date: "2025-06-10", count: 1934 },
  { date: "2025-06-17", count: 1930 },
  { date: "2025-06-24", count: 1928 },
  { date: "2025-07-01", count: 1925 },
  { date: "2025-07-08", count: 1895 },
  { date: "2025-07-15", count: 1898 },
  { date: "2025-07-22", count: 1898 },
  { date: "2025-07-29", count: 1898 },
  { date: "2025-08-05", count: 1899 },
  { date: "2025-08-12", count: 1898 },
  { date: "2025-08-19", count: 1898 },
  { date: "2025-08-26", count: 1901 },
  { date: "2025-09-02", count: 1902 },
  { date: "2025-09-09", count: 1894 },
  { date: "2025-09-16", count: 1895 },
  { date: "2025-09-23", count: 1899 },
  { date: "2025-09-30", count: 1897 },
  { date: "2025-10-07", count: 1895 },
  { date: "2025-10-14", count: 1827 },
  { date: "2025-10-21", count: 1830 },
  { date: "2025-10-28", count: 1831 },
  { date: "2025-11-04", count: 1836 },
  { date: "2026-01-06", count: 1839 },
  { date: "2026-01-13", count: 1848 },
  { date: "2026-01-20", count: 1852 },
  { date: "2026-01-27", count: 1853 },
  { date: "2026-02-03", count: 1854 },
  { date: "2026-02-10", count: 1854 },
  { date: "2026-02-17", count: 1855 },
  { date: "2026-02-24", count: 1854 },
];

// Key events for annotation
const EVENTS = [
  { date: "2024-07-04", label: "Peak: 1,910", type: "peak" },
  { date: "2024-10-17", label: "Oct drop: -41", type: "drop" },
  { date: "2025-06-10", label: "All-time high: 1,934", type: "peak" },
  { date: "2025-07-08", label: "Jul drop: -30", type: "drop" },
  { date: "2025-10-14", label: "Oct drop: -68", type: "drop" },
];

const VIEWS = [
  { key: "all", label: "Full History", desc: "Dec 2019 \u2013 Present" },
  { key: "weekly", label: "Weekly Detail", desc: "Feb 2024 \u2013 Present" },
  { key: "recent", label: "Last 6 Months", desc: "Recent Trend" },
];

function formatDate(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function formatDateFull(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: "rgba(28,18,12,0.95)",
      border: "1px solid #8B6914",
      borderRadius: 8,
      padding: "12px 16px",
      backdropFilter: "blur(12px)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    }}>
      <div style={{ fontSize: 11, color: "#C4A050", fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>
        {formatDateFull(d.date)}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#F5E6C8", fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: -0.5 }}>
        {d.count.toLocaleString()}
      </div>
      <div style={{ fontSize: 11, color: "#9B8968", marginTop: 2 }}>active Type-02 licenses</div>
    </div>
  );
}

function StatCard({ label, value, detail, accent }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(139,105,20,0.2)",
      borderRadius: 10,
      padding: "16px 18px",
      flex: 1,
      minWidth: 140,
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#8B6914", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: accent || "#F5E6C8", fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1 }}>{value}</div>
      {detail && <div style={{ fontSize: 11, color: "#7A6B50", marginTop: 4 }}>{detail}</div>}
    </div>
  );
}

export default function NapaWineryLicenseTrend() {
  const [activeView, setActiveView] = useState("weekly");
  const [hoveredEvent, setHoveredEvent] = useState(null);

  const filteredData = useMemo(() => {
    if (activeView === "all") return RAW_DATA;
    if (activeView === "weekly") return RAW_DATA.filter(d => d.date >= "2024-02-01");
    // recent = last 6 months
    return RAW_DATA.filter(d => d.date >= "2025-09-01");
  }, [activeView]);

  const stats = useMemo(() => {
    const weekly = RAW_DATA.filter(d => d.date >= "2024-02-01");
    const allTime = RAW_DATA;
    const peak = Math.max(...allTime.map(d => d.count));
    const peakDate = allTime.find(d => d.count === peak)?.date;
    const current = allTime[allTime.length - 1].count;
    const trough = Math.min(...weekly.map(d => d.count));
    const troughDate = weekly.find(d => d.count === trough)?.date;
    const fromPeak = current - peak;
    const dec2019 = allTime[0].count;
    const netGrowth = current - dec2019;
    const pctGrowth = ((netGrowth / dec2019) * 100).toFixed(1);
    return { peak, peakDate, current, trough, troughDate, fromPeak, dec2019, netGrowth, pctGrowth };
  }, []);

  const yDomain = useMemo(() => {
    const vals = filteredData.map(d => d.count);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const padding = Math.max(10, Math.round((max - min) * 0.08));
    return [Math.floor((min - padding) / 10) * 10, Math.ceil((max + padding) / 10) * 10];
  }, [filteredData]);

  const visibleEvents = useMemo(() => {
    const startDate = filteredData[0]?.date;
    const endDate = filteredData[filteredData.length - 1]?.date;
    return EVENTS.filter(e => e.date >= startDate && e.date <= endDate);
  }, [filteredData]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(175deg, #1C120C 0%, #2A1A0E 30%, #1E1408 60%, #0F0A06 100%)",
      fontFamily: "'Source Sans 3', 'Source Sans Pro', -apple-system, sans-serif",
      color: "#F5E6C8",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Source+Sans+3:wght@300;400;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />

      {/* Decorative top line */}
      <div style={{ height: 3, background: "linear-gradient(90deg, transparent 0%, #8B6914 20%, #C4A050 50%, #8B6914 80%, transparent 100%)" }} />

      {/* Header */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ width: 6, height: 6, background: "#C4A050", borderRadius: "50%" }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "#8B6914", textTransform: "uppercase" }}>NapaServe Economic Pulse</span>
        </div>
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(28px, 5vw, 42px)",
          fontWeight: 900,
          color: "#F5E6C8",
          margin: "0 0 6px",
          letterSpacing: -0.5,
          lineHeight: 1.1,
        }}>
          Napa County Winery Licenses
        </h1>
        <p style={{ fontSize: 15, color: "#9B8968", margin: "0 0 28px", lineHeight: 1.5 }}>
          ABC Type-02 active license count <span style={{ color: "#6B5B40" }}>|</span> Weekly tracking since Feb 2024, annual snapshots from Dec 2019
        </p>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
          <StatCard label="Current" value={stats.current.toLocaleString()} detail={`as of ${formatDate(RAW_DATA[RAW_DATA.length-1].date)}`} />
          <StatCard label="All-time Peak" value={stats.peak.toLocaleString()} detail={formatDate(stats.peakDate)} accent="#C4A050" />
          <StatCard label="From Peak" value={`${stats.fromPeak}`} detail={`${((stats.fromPeak / stats.peak) * 100).toFixed(1)}% below`} accent="#B85C38" />
          <StatCard label="Since Dec '19" value={`+${stats.netGrowth}`} detail={`+${stats.pctGrowth}% growth`} accent="#5B8A5A" />
        </div>

        {/* View toggle */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {VIEWS.map(v => (
            <button
              key={v.key}
              onClick={() => setActiveView(v.key)}
              style={{
                padding: "8px 18px",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 0.5,
                background: activeView === v.key ? "linear-gradient(135deg, #8B6914, #C4A050)" : "rgba(255,255,255,0.04)",
                color: activeView === v.key ? "#1C120C" : "#9B8968",
                border: activeView === v.key ? "none" : "1px solid rgba(139,105,20,0.25)",
                borderRadius: 6,
                cursor: "pointer",
                transition: "all 0.25s ease",
              }}
            >
              {v.label}
            </button>
          ))}
          <span style={{ fontSize: 12, color: "#6B5B40", alignSelf: "center", marginLeft: 8 }}>
            {VIEWS.find(v => v.key === activeView)?.desc}
          </span>
        </div>

        {/* Main Chart */}
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(139,105,20,0.15)",
          borderRadius: 14,
          padding: "24px 12px 12px 0",
          marginBottom: 24,
        }}>
          <ResponsiveContainer width="100%" height={420}>
            <AreaChart data={filteredData} margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
              <defs>
                <linearGradient id="wineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B6914" stopOpacity={0.35} />
                  <stop offset="40%" stopColor="#722F37" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#1C120C" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8B6914" />
                  <stop offset="50%" stopColor="#C4A050" />
                  <stop offset="100%" stopColor="#D4B060" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,105,20,0.08)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#6B5B40", fontFamily: "'JetBrains Mono', monospace" }}
                tickFormatter={(v) => {
                  const d = new Date(v + "T12:00:00");
                  if (activeView === "all") return d.getFullYear().toString();
                  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
                }}
                interval={activeView === "all" ? 0 : activeView === "recent" ? 2 : Math.floor(filteredData.length / 8)}
                axisLine={{ stroke: "rgba(139,105,20,0.15)" }}
                tickLine={false}
              />
              <YAxis
                domain={yDomain}
                tick={{ fontSize: 10, fill: "#6B5B40", fontFamily: "'JetBrains Mono', monospace" }}
                tickFormatter={v => v.toLocaleString()}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#C4A050", strokeWidth: 1, strokeDasharray: "4 4" }} />

              {/* Drop zones */}
              {activeView === "weekly" && (
                <>
                  <ReferenceArea x1="2024-10-10" x2="2024-10-24" fill="#B85C38" fillOpacity={0.06} />
                  <ReferenceArea x1="2025-07-01" x2="2025-07-15" fill="#B85C38" fillOpacity={0.06} />
                  <ReferenceArea x1="2025-10-07" x2="2025-10-21" fill="#B85C38" fillOpacity={0.06} />
                </>
              )}

              <Area
                type="monotone"
                dataKey="count"
                stroke="url(#lineGrad)"
                strokeWidth={2.5}
                fill="url(#wineGrad)"
                dot={activeView === "all" ? { r: 5, fill: "#C4A050", stroke: "#1C120C", strokeWidth: 2 } : false}
                activeDot={{ r: 6, fill: "#C4A050", stroke: "#F5E6C8", strokeWidth: 2 }}
              />

              {/* Event reference lines */}
              {visibleEvents.map((ev, i) => (
                <ReferenceLine
                  key={i}
                  x={ev.date}
                  stroke={ev.type === "peak" ? "#5B8A5A" : "#B85C38"}
                  strokeDasharray="4 4"
                  strokeOpacity={0.5}
                  label={activeView !== "recent" ? {
                    value: ev.label,
                    position: ev.type === "peak" ? "top" : "insideBottomLeft",
                    fill: ev.type === "peak" ? "#5B8A5A" : "#B85C38",
                    fontSize: 10,
                    fontWeight: 600,
                  } : undefined}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Narrative insight */}
        <div style={{
          background: "linear-gradient(135deg, rgba(139,105,20,0.08) 0%, rgba(114,47,55,0.06) 100%)",
          border: "1px solid rgba(139,105,20,0.15)",
          borderRadius: 12,
          padding: "22px 26px",
          marginBottom: 32,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, color: "#8B6914", textTransform: "uppercase", marginBottom: 10 }}>
            The Story in the Data
          </div>
          <p style={{ fontSize: 14, color: "#C4B08A", lineHeight: 1.75, margin: "0 0 12px" }}>
            Napa County's winery license count has followed a <span style={{ color: "#C4A050", fontWeight: 600 }}>sawtooth pattern</span> since
            weekly tracking began in February 2024. Licenses climb steadily for months, then drop sharply &mdash; likely due to
            <span style={{ color: "#B85C38", fontWeight: 600 }}> periodic ABC purges</span> of expired, surrendered, or duplicate records.
          </p>
          <p style={{ fontSize: 14, color: "#C4B08A", lineHeight: 1.75, margin: "0 0 12px" }}>
            Three major drops are visible: <span style={{ color: "#B85C38" }}>October 2024</span> ({"\u2212"}41 in one week),
            <span style={{ color: "#B85C38" }}> July 2025</span> ({"\u2212"}30), and the largest,
            <span style={{ color: "#B85C38" }}> October 2025</span> ({"\u2212"}68), which brought the count to its lowest weekly level of 1,827.
          </p>
          <p style={{ fontSize: 14, color: "#C4B08A", lineHeight: 1.75, margin: 0 }}>
            Despite these corrections, the long-term trend remains positive: from 1,681 in December 2019 to the current 1,854
            (<span style={{ color: "#5B8A5A", fontWeight: 600 }}>+10.3% over six years</span>).
            The all-time weekly peak of 1,934 was reached on June 10, 2025. The current count sits {stats.peak - stats.current} below that high,
            recovering steadily since the October 2025 correction.
          </p>
        </div>

        {/* Year-end comparison */}
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(139,105,20,0.15)",
          borderRadius: 12,
          padding: "22px 26px",
          marginBottom: 40,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, color: "#8B6914", textTransform: "uppercase", marginBottom: 14 }}>
            Year-End Snapshots (December)
          </div>
          <div style={{ display: "flex", gap: 1, alignItems: "flex-end", height: 140 }}>
            {[
              { yr: "2019", val: 1681 },
              { yr: "2020", val: 1744 },
              { yr: "2021", val: 1775 },
              { yr: "2022", val: 1856 },
              { yr: "2023", val: 1841 },
            ].map((y, i) => {
              const minVal = 1650;
              const maxVal = 1870;
              const pct = ((y.val - minVal) / (maxVal - minVal)) * 100;
              const prevVal = i > 0 ? [1681,1744,1775,1856,1841][i-1] : null;
              const delta = prevVal ? y.val - prevVal : null;
              return (
                <div key={y.yr} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#C4A050", fontFamily: "'JetBrains Mono', monospace" }}>
                    {y.val.toLocaleString()}
                  </span>
                  {delta !== null && (
                    <span style={{ fontSize: 10, color: delta >= 0 ? "#5B8A5A" : "#B85C38", fontWeight: 600 }}>
                      {delta >= 0 ? "+" : ""}{delta}
                    </span>
                  )}
                  <div style={{
                    width: "70%",
                    height: `${Math.max(pct, 8)}%`,
                    background: y.yr === "2022" ? "linear-gradient(180deg, #C4A050, #8B6914)" : "linear-gradient(180deg, rgba(139,105,20,0.5), rgba(139,105,20,0.2))",
                    borderRadius: "4px 4px 0 0",
                    transition: "height 0.5s ease",
                  }} />
                  <span style={{ fontSize: 11, color: "#7A6B50", fontWeight: 600 }}>{y.yr}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid rgba(139,105,20,0.12)", padding: "16px 0 32px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 11, color: "#5A4D38" }}>
            Source: CA Department of Alcoholic Beverage Control (ABC) Ad-Hoc License Reports
          </span>
          <span style={{ fontSize: 11, color: "#5A4D38" }}>
            {RAW_DATA.length} data points | Last updated: {formatDate(RAW_DATA[RAW_DATA.length-1].date)}
          </span>
        </div>
      </div>
    </div>
  );
}
