import { useState, useEffect, useMemo } from "react";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from "recharts";

// ═══════════════════════════════════════════════════════════════════════════
// SUPABASE CONFIG — paste your credentials here
// ═══════════════════════════════════════════════════════════════════════════
const SUPABASE_URL = "https://csenpchwxxepdvjebsrt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_r-Ntp7zKRrH3JIVAjTKYmA_0szFdYGJ";

// ═══════════════════════════════════════════════════════════════════════════
// FETCH DATA FROM SUPABASE
// ═══════════════════════════════════════════════════════════════════════════

async function fetchSnapshots() {
  const url = `${SUPABASE_URL}/rest/v1/economic_pulse_snapshots?select=*&order=run_date.asc`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`Supabase fetch failed: ${res.status}`);
  return res.json();
}

function transformData(rows) {
  const wineryData = [];
  const econData = [];

  for (const r of rows) {
    const d = r.run_date;
    // Winery data — every row that has napa count
    if (r.napa_type02_count != null) {
      wineryData.push({
        date: d,
        napa: Number(r.napa_type02_count),
        ca: r.ca_type02_count != null ? Number(r.ca_type02_count) : undefined,
      });
    }
    // Econ data — rows that have unemployment or home value
    if (r.unemployment_rate != null || r.home_value != null) {
      econData.push({
        date: d,
        unemp: r.unemployment_rate != null ? Number(r.unemployment_rate) : undefined,
        labor: r.labor_force != null ? Number(r.labor_force) : undefined,
        food: r.food_services_employment != null ? Number(r.food_services_employment) : undefined,
        home: r.home_value != null ? Number(r.home_value) : undefined,
        pending: r.days_pending != null ? Number(r.days_pending) : undefined,
        yoy: r.home_value_yoy != null ? Number(r.home_value_yoy) : undefined,
        summary: r.summary,
      });
    }
  }
  return { wineryData, econData };
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const WINERY_EVENTS = [
  { date: "2024-07-04", label: "Peak: 1,910", type: "peak" },
  { date: "2024-10-17", label: "Oct drop: \u221241", type: "drop" },
  { date: "2025-06-10", label: "All-time high: 1,934", type: "peak" },
  { date: "2025-07-08", label: "Jul drop: \u221230", type: "drop" },
  { date: "2025-10-14", label: "Oct drop: \u221268", type: "drop" },
];

const WINERY_VIEWS = [
  { key: "all", label: "Full History", desc: "Dec 2019 \u2013 Present" },
  { key: "weekly", label: "Weekly Detail", desc: "Feb 2024 \u2013 Present" },
  { key: "recent", label: "Last 6 Months", desc: "Recent Trend" },
];

const SECTIONS = [
  { key: "overview", label: "Overview" },
  { key: "winery", label: "Winery Licenses" },
  { key: "labor", label: "Labor Market" },
  { key: "housing", label: "Housing" },
];

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function fD(d){return new Date(d+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});}
function fMo(d){return new Date(d+"T12:00:00").toLocaleDateString("en-US",{month:"short",year:"2-digit"});}
function fDFull(d){return new Date(d+"T12:00:00").toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});}
function f$(v){return "$"+Number(v).toLocaleString("en-US",{maximumFractionDigits:0});}
function fN(v){return Number(v).toLocaleString("en-US");}

function Delta({c,p,s="",inv=false}){
  if(c==null||p==null)return<span style={{color:"#6B5B40",fontSize:12}}>—</span>;
  const d=c-p;if(Math.abs(d)<0.001)return<span style={{color:"#6B5B40",fontSize:12,fontFamily:"'JetBrains Mono',monospace"}}>0{s}</span>;
  let g=d>0;if(inv)g=!g;const col=g?"#5B8A5A":"#B85C38";const ar=d>0?"▲":"▼";
  const fm=Math.abs(d)>=1000?fN(Math.round(d)):Math.abs(d)>=100?Math.round(d):Number(d.toFixed(1));
  return<span style={{color:col,fontSize:12,fontWeight:600,fontFamily:"'JetBrains Mono',monospace"}}>{ar} {d>0?"+":""}{fm}{s}</span>;
}

function StatCard({label,value,detail,accent}){
  return(<div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(139,105,20,0.2)",borderRadius:10,padding:"16px 18px",flex:1,minWidth:140}}>
    <div style={{fontSize:10,fontWeight:700,letterSpacing:2,color:"#8B6914",textTransform:"uppercase",marginBottom:6}}>{label}</div>
    <div style={{fontSize:26,fontWeight:700,color:accent||"#F5E6C8",fontFamily:"'Playfair Display',Georgia,serif",lineHeight:1}}>{value}</div>
    {detail&&<div style={{fontSize:11,color:"#7A6B50",marginTop:4}}>{detail}</div>}
  </div>);
}

function KPI({label,value,delta,icon,color}){
  return(<div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(139,105,20,0.18)",borderRadius:12,padding:"20px 22px",flex:1,minWidth:200,position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",top:12,right:14,fontSize:28,opacity:0.12}}>{icon}</div>
    <div style={{fontSize:10,fontWeight:700,letterSpacing:2.5,color:"#8B6914",textTransform:"uppercase",marginBottom:8}}>{label}</div>
    <div style={{fontSize:32,fontWeight:700,color:color||"#F5E6C8",fontFamily:"'Playfair Display',Georgia,serif",lineHeight:1,marginBottom:6}}>{value}</div>
    <div>{delta}</div>
  </div>);
}

function Tip({active,payload,fmt}){
  if(!active||!payload?.[0])return null;const d=payload[0].payload;
  return(<div style={{background:"rgba(28,18,12,0.95)",border:"1px solid #8B6914",borderRadius:8,padding:"10px 14px",boxShadow:"0 8px 32px rgba(0,0,0,0.4)"}}>
    <div style={{fontSize:10,color:"#C4A050",fontWeight:600,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>{fDFull(d.date)}</div>
    {payload.filter(p=>p.value!=null).map((p,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:8,marginTop:2}}>
      <div style={{width:8,height:8,borderRadius:"50%",background:p.color||p.stroke}}/>
      <span style={{fontSize:14,color:"#F5E6C8",fontWeight:700,fontFamily:"'Playfair Display',Georgia,serif"}}>{fmt?fmt(p.value,p.dataKey):fN(p.value)}</span>
      <span style={{fontSize:10,color:"#7A6B50"}}>{p.name}</span>
    </div>))}
  </div>);
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function EconomicPulseDashboard() {
  const [section, setSection] = useState("overview");
  const [wineryView, setWineryView] = useState("weekly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wineryData, setWineryData] = useState([]);
  const [econData, setEconData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch from Supabase on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchSnapshots();
        if (cancelled) return;
        const { wineryData: w, econData: e } = transformData(rows);
        setWineryData(w);
        setEconData(e);
        setLastUpdated(rows.length > 0 ? rows[rows.length - 1].run_date : null);
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Derived data
  const allNapa = useMemo(() => wineryData.filter(d => d.napa != null), [wineryData]);
  const wineryFiltered = useMemo(() => {
    if (wineryView === "all") return allNapa;
    if (wineryView === "weekly") return allNapa.filter(d => d.date >= "2024-02-01");
    return allNapa.filter(d => d.date >= "2025-09-01");
  }, [wineryView, allNapa]);

  const wStats = useMemo(() => {
    if (allNapa.length === 0) return { peak: 0, peakDate: "", current: 0, fromPeak: 0, dec2019: 0, netGrowth: 0, pctGrowth: "0" };
    const peak = Math.max(...allNapa.map(d => d.napa));
    const peakDate = allNapa.find(d => d.napa === peak)?.date || "";
    const current = allNapa[allNapa.length - 1].napa;
    const fromPeak = current - peak;
    const dec2019 = allNapa[0].napa;
    const netGrowth = current - dec2019;
    const pctGrowth = ((netGrowth / dec2019) * 100).toFixed(1);
    return { peak, peakDate, current, fromPeak, dec2019, netGrowth, pctGrowth };
  }, [allNapa]);

  const wYDomain = useMemo(() => {
    if (wineryFiltered.length === 0) return [1800, 1950];
    const vals = wineryFiltered.map(d => d.napa);
    const mn = Math.min(...vals), mx = Math.max(...vals);
    const pad = Math.max(10, Math.round((mx - mn) * 0.08));
    return [Math.floor((mn - pad) / 10) * 10, Math.ceil((mx + pad) / 10) * 10];
  }, [wineryFiltered]);

  const wEvents = useMemo(() => {
    if (wineryFiltered.length === 0) return [];
    const s = wineryFiltered[0]?.date, e = wineryFiltered[wineryFiltered.length - 1]?.date;
    return WINERY_EVENTS.filter(ev => ev.date >= s && ev.date <= e);
  }, [wineryFiltered]);

  const overviewWinery = useMemo(() => allNapa.filter(d => d.date >= "2024-02-01"), [allNapa]);
  const oMin = overviewWinery.length > 0 ? Math.min(...overviewWinery.map(d => d.napa)) : 1800;
  const oMax = overviewWinery.length > 0 ? Math.max(...overviewWinery.map(d => d.napa)) : 1950;
  const oPad = Math.round((oMax - oMin) * 0.08);

  const latestW = allNapa.length > 0 ? allNapa[allNapa.length - 1] : null;
  const latestE = econData.length > 0 ? econData[econData.length - 1] : null;
  const priorE = econData.length > 1 ? econData[econData.length - 2] : null;

  // ═══ LOADING STATE ═══
  if (loading) {
    return (
      <div style={{minHeight:"100vh",background:"linear-gradient(175deg, #1C120C 0%, #2A1A0E 30%, #1E1408 60%, #0F0A06 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Source Sans 3',sans-serif"}}>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet" />
        <div style={{textAlign:"center"}}>
          <div style={{width:40,height:40,border:"3px solid rgba(139,105,20,0.3)",borderTopColor:"#C4A050",borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto 16px"}}/>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{fontFamily:"'Playfair Display',Georgia,serif",color:"#9B8968",fontSize:16}}>Loading Economic Pulse...</p>
          <p style={{color:"#6B5B40",fontSize:12}}>Fetching from Supabase</p>
        </div>
      </div>
    );
  }

  // ═══ ERROR STATE ═══
  if (error) {
    return (
      <div style={{minHeight:"100vh",background:"linear-gradient(175deg, #1C120C 0%, #2A1A0E 30%, #1E1408 60%, #0F0A06 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Source Sans 3',sans-serif"}}>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet" />
        <div style={{textAlign:"center",maxWidth:480,padding:"0 24px"}}>
          <div style={{fontSize:48,marginBottom:16,opacity:0.5}}>⚠</div>
          <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",color:"#F5E6C8",fontSize:22,margin:"0 0 8px"}}>Connection Error</h2>
          <p style={{color:"#B85C38",fontSize:13,margin:"0 0 16px",fontFamily:"'JetBrains Mono',monospace"}}>{error}</p>
          <p style={{color:"#7A6B50",fontSize:13}}>Check that SUPABASE_URL and SUPABASE_ANON_KEY are set correctly.</p>
        </div>
      </div>
    );
  }

  // ═══ NO DATA ═══
  if (!latestW && !latestE) {
    return (
      <div style={{minHeight:"100vh",background:"linear-gradient(175deg, #1C120C 0%, #2A1A0E 30%, #1E1408 60%, #0F0A06 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Source Sans 3',sans-serif"}}>
        <p style={{color:"#9B8968",fontSize:16}}>No snapshot data found in Supabase.</p>
      </div>
    );
  }

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(175deg, #1C120C 0%, #2A1A0E 30%, #1E1408 60%, #0F0A06 100%)",fontFamily:"'Source Sans 3','Source Sans Pro',-apple-system,sans-serif",color:"#F5E6C8"}}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Source+Sans+3:wght@300;400;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
      <div style={{height:3,background:"linear-gradient(90deg, transparent 0%, #8B6914 20%, #C4A050 50%, #8B6914 80%, transparent 100%)"}} />

      {/* HEADER */}
      <div style={{maxWidth:1100,margin:"0 auto",padding:"36px 24px 0"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
          <div style={{width:6,height:6,background:"#C4A050",borderRadius:"50%"}} />
          <span style={{fontSize:11,fontWeight:700,letterSpacing:3,color:"#8B6914",textTransform:"uppercase"}}>NapaServe</span>
          <span style={{fontSize:11,color:"#5A4D38",marginLeft:4}}>Napa County</span>
        </div>
        <h1 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"clamp(30px,5vw,46px)",fontWeight:900,color:"#F5E6C8",margin:"0 0 4px",letterSpacing:-0.5,lineHeight:1.1}}>Economic Pulse</h1>
        <p style={{fontSize:14,color:"#7A6B50",margin:"0 0 24px"}}>
          Weekly snapshot — {lastUpdated ? fD(lastUpdated) : "Loading..."} <span style={{color:"#5A4D38"}}>|</span> Live from Supabase
          <span style={{color:"#5B8A5A",fontSize:11,marginLeft:8}}>● Connected</span>
        </p>

        <div style={{display:"flex",gap:4,marginBottom:28,borderBottom:"1px solid rgba(139,105,20,0.12)"}}>
          {SECTIONS.map(s=>(<button key={s.key} onClick={()=>setSection(s.key)} style={{padding:"10px 20px",fontSize:13,fontWeight:600,background:"none",color:section===s.key?"#C4A050":"#7A6B50",border:"none",borderBottom:section===s.key?"2px solid #C4A050":"2px solid transparent",cursor:"pointer",transition:"all 0.2s",marginBottom:-1}}>{s.label}</button>))}
        </div>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"0 24px 60px"}}>

        {/* ═══ OVERVIEW ═══ */}
        {section==="overview"&&(<>
          <div style={{display:"flex",gap:14,marginBottom:28,flexWrap:"wrap"}}>
            {latestW && <KPI label="Winery Licenses" value={fN(latestW.napa)} icon="🍷" delta={priorE ? <Delta c={latestW.napa} p={priorE.napa || allNapa[allNapa.length-2]?.napa}/> : <span style={{color:"#6B5B40",fontSize:12}}>—</span>}/>}
            {latestE?.unemp != null && <KPI label="Unemployment" value={latestE.unemp+"%"} icon="📊" color="#C4A050" delta={<Delta c={latestE.unemp} p={priorE?.unemp} s="%" inv/>}/>}
            {latestE?.labor != null && <KPI label="Labor Force" value={fN(latestE.labor)} icon="👷" delta={<Delta c={latestE.labor} p={priorE?.labor}/>}/>}
            {latestE?.home != null && <KPI label="Avg Home Value" value={f$(latestE.home)} icon="🏠" color="#5B8A5A" delta={<Delta c={latestE.home} p={priorE?.home}/>}/>}
          </div>

          {latestE?.summary && (
            <div style={{background:"linear-gradient(135deg, rgba(139,105,20,0.08) 0%, rgba(114,47,55,0.06) 100%)",border:"1px solid rgba(139,105,20,0.15)",borderRadius:12,padding:"20px 24px",marginBottom:28}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:2.5,color:"#8B6914",textTransform:"uppercase",marginBottom:8}}>Weekly Summary</div>
              <p style={{fontSize:14,color:"#C4B08A",lineHeight:1.75,margin:0}}>{latestE.summary}</p>
            </div>
          )}

          {overviewWinery.length >= 2 && (
            <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(139,105,20,0.15)",borderRadius:14,padding:"20px 12px 12px 0",marginBottom:28}}>
              <div style={{paddingLeft:20,marginBottom:8}}><span style={{fontSize:11,fontWeight:700,letterSpacing:2,color:"#8B6914",textTransform:"uppercase"}}>Napa Winery Licenses — Weekly Trend</span></div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={overviewWinery} margin={{top:8,right:16,bottom:4,left:8}}>
                  <defs><linearGradient id="oG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#C4A050" stopOpacity={0.3}/><stop offset="100%" stopColor="#1C120C" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,105,20,0.08)" vertical={false}/>
                  <XAxis dataKey="date" tick={{fontSize:9,fill:"#6B5B40",fontFamily:"'JetBrains Mono',monospace"}} tickFormatter={fMo} interval={Math.floor(overviewWinery.length/6)} axisLine={false} tickLine={false}/>
                  <YAxis domain={[oMin-oPad,oMax+oPad]} tick={{fontSize:9,fill:"#6B5B40",fontFamily:"'JetBrains Mono',monospace"}} axisLine={false} tickLine={false} width={44} tickFormatter={v=>v.toLocaleString()}/>
                  <Tooltip content={<Tip/>}/>
                  <Area type="monotone" dataKey="napa" stroke="#C4A050" strokeWidth={2} fill="url(#oG)" dot={false} name="Napa Type-02"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          <div style={{background:"rgba(139,105,20,0.06)",border:"1px solid rgba(139,105,20,0.1)",borderRadius:8,padding:"12px 18px"}}>
            <span style={{fontSize:10,fontWeight:700,letterSpacing:2,color:"#8B6914",textTransform:"uppercase"}}>Data Sources </span>
            <span style={{fontSize:11,color:"#6B5B40"}}>ABC Licensing · FRED (BLS) · Zillow Research · CA EDD</span>
            <span style={{fontSize:11,color:"#5A4D38",marginLeft:12}}>{wineryData.length} total snapshots</span>
          </div>
        </>)}

        {/* ═══ WINERY LICENSES (FULL) ═══ */}
        {section==="winery"&&(<>
          <div style={{marginBottom:20}}>
            <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"clamp(24px,4vw,34px)",fontWeight:900,color:"#F5E6C8",margin:"0 0 6px"}}>Napa County Winery Licenses</h2>
            <p style={{fontSize:14,color:"#9B8968",margin:0}}>ABC Type-02 active license count <span style={{color:"#6B5B40"}}>|</span> {allNapa.length} data points, live from Supabase</p>
          </div>

          <div style={{display:"flex",gap:12,marginBottom:28,flexWrap:"wrap"}}>
            <StatCard label="Current" value={wStats.current.toLocaleString()} detail={`as of ${fMo(allNapa[allNapa.length-1]?.date || "")}`}/>
            <StatCard label="All-Time Peak" value={wStats.peak.toLocaleString()} detail={fMo(wStats.peakDate)} accent="#C4A050"/>
            <StatCard label="From Peak" value={`${wStats.fromPeak}`} detail={`${((wStats.fromPeak/wStats.peak)*100).toFixed(1)}% below`} accent="#B85C38"/>
            <StatCard label="Since Dec '19" value={`+${wStats.netGrowth}`} detail={`+${wStats.pctGrowth}% growth`} accent="#5B8A5A"/>
          </div>

          <div style={{display:"flex",gap:6,marginBottom:20}}>
            {WINERY_VIEWS.map(v=>(<button key={v.key} onClick={()=>setWineryView(v.key)} style={{padding:"8px 18px",fontSize:12,fontWeight:600,letterSpacing:0.5,background:wineryView===v.key?"linear-gradient(135deg, #8B6914, #C4A050)":"rgba(255,255,255,0.04)",color:wineryView===v.key?"#1C120C":"#9B8968",border:wineryView===v.key?"none":"1px solid rgba(139,105,20,0.25)",borderRadius:6,cursor:"pointer",transition:"all 0.25s ease"}}>{v.label}</button>))}
            <span style={{fontSize:12,color:"#6B5B40",alignSelf:"center",marginLeft:8}}>{WINERY_VIEWS.find(v=>v.key===wineryView)?.desc}</span>
          </div>

          {wineryFiltered.length >= 2 && (
            <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(139,105,20,0.15)",borderRadius:14,padding:"24px 12px 12px 0",marginBottom:24}}>
              <ResponsiveContainer width="100%" height={420}>
                <AreaChart data={wineryFiltered} margin={{top:20,right:20,bottom:20,left:10}}>
                  <defs>
                    <linearGradient id="wG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8B6914" stopOpacity={0.35}/><stop offset="40%" stopColor="#722F37" stopOpacity={0.15}/><stop offset="100%" stopColor="#1C120C" stopOpacity={0}/></linearGradient>
                    <linearGradient id="lG" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#8B6914"/><stop offset="50%" stopColor="#C4A050"/><stop offset="100%" stopColor="#D4B060"/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,105,20,0.08)" vertical={false}/>
                  <XAxis dataKey="date" tick={{fontSize:10,fill:"#6B5B40",fontFamily:"'JetBrains Mono',monospace"}} tickFormatter={v=>{const d=new Date(v+"T12:00:00");return wineryView==="all"?d.getFullYear().toString():fMo(v);}} interval={wineryView==="all"?0:wineryView==="recent"?2:Math.floor(wineryFiltered.length/8)} axisLine={{stroke:"rgba(139,105,20,0.15)"}} tickLine={false}/>
                  <YAxis domain={wYDomain} tick={{fontSize:10,fill:"#6B5B40",fontFamily:"'JetBrains Mono',monospace"}} tickFormatter={v=>v.toLocaleString()} axisLine={false} tickLine={false} width={52}/>
                  <Tooltip content={<Tip/>} cursor={{stroke:"#C4A050",strokeWidth:1,strokeDasharray:"4 4"}}/>
                  {wineryView==="weekly"&&<><ReferenceArea x1="2024-10-10" x2="2024-10-24" fill="#B85C38" fillOpacity={0.06}/><ReferenceArea x1="2025-07-01" x2="2025-07-15" fill="#B85C38" fillOpacity={0.06}/><ReferenceArea x1="2025-10-07" x2="2025-10-21" fill="#B85C38" fillOpacity={0.06}/></>}
                  <Area type="monotone" dataKey="napa" stroke="url(#lG)" strokeWidth={2.5} fill="url(#wG)" dot={wineryView==="all"?{r:5,fill:"#C4A050",stroke:"#1C120C",strokeWidth:2}:false} activeDot={{r:6,fill:"#C4A050",stroke:"#F5E6C8",strokeWidth:2}} name="Napa Type-02"/>
                  {wEvents.map((ev,i)=>(<ReferenceLine key={i} x={ev.date} stroke={ev.type==="peak"?"#5B8A5A":"#B85C38"} strokeDasharray="4 4" strokeOpacity={0.5} label={wineryView!=="recent"?{value:ev.label,position:ev.type==="peak"?"top":"insideBottomLeft",fill:ev.type==="peak"?"#5B8A5A":"#B85C38",fontSize:10,fontWeight:600}:undefined}/>))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          <div style={{background:"linear-gradient(135deg, rgba(139,105,20,0.08) 0%, rgba(114,47,55,0.06) 100%)",border:"1px solid rgba(139,105,20,0.15)",borderRadius:12,padding:"22px 26px",marginBottom:28}}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:2.5,color:"#8B6914",textTransform:"uppercase",marginBottom:10}}>The Story in the Data</div>
            <p style={{fontSize:14,color:"#C4B08A",lineHeight:1.75,margin:"0 0 12px"}}>
              Napa County's winery license count has followed a <span style={{color:"#C4A050",fontWeight:600}}>sawtooth pattern</span> since weekly tracking began in February 2024. Licenses climb steadily for months, then drop sharply — likely due to <span style={{color:"#B85C38",fontWeight:600}}>periodic ABC purges</span> of expired, surrendered, or duplicate records.
            </p>
            <p style={{fontSize:14,color:"#C4B08A",lineHeight:1.75,margin:"0 0 12px"}}>
              Three major drops are visible: <span style={{color:"#B85C38"}}>October 2024</span> ({"\u2212"}41 in one week), <span style={{color:"#B85C38"}}>July 2025</span> ({"\u2212"}30), and the largest, <span style={{color:"#B85C38"}}>October 2025</span> ({"\u2212"}68), which brought the count to its lowest weekly level of 1,827.
            </p>
            <p style={{fontSize:14,color:"#C4B08A",lineHeight:1.75,margin:0}}>
              Despite these corrections, the long-term trend remains positive: from 1,681 in December 2019 to the current {wStats.current.toLocaleString()} (<span style={{color:"#5B8A5A",fontWeight:600}}>+{wStats.pctGrowth}% over six years</span>). The all-time weekly peak of {wStats.peak.toLocaleString()} was reached on {fD(wStats.peakDate)}. The current count sits {wStats.peak - wStats.current} below that high.
            </p>
          </div>

          <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(139,105,20,0.15)",borderRadius:12,padding:"22px 26px",marginBottom:28}}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:2.5,color:"#8B6914",textTransform:"uppercase",marginBottom:14}}>Year-End Snapshots (December)</div>
            <div style={{display:"flex",gap:1,alignItems:"flex-end",height:140}}>
              {[{yr:"2019",v:1681},{yr:"2020",v:1744},{yr:"2021",v:1775},{yr:"2022",v:1856},{yr:"2023",v:1841}].map((y,i,arr)=>{
                const pct=((y.v-1650)/(1870-1650))*100;const d=i>0?y.v-arr[i-1].v:null;
                return(<div key={y.yr} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <span style={{fontSize:12,fontWeight:700,color:"#C4A050",fontFamily:"'JetBrains Mono',monospace"}}>{y.v.toLocaleString()}</span>
                  {d!==null&&<span style={{fontSize:10,color:d>=0?"#5B8A5A":"#B85C38",fontWeight:600}}>{d>=0?"+":""}{d}</span>}
                  <div style={{width:"70%",height:`${Math.max(pct,8)}%`,background:y.yr==="2022"?"linear-gradient(180deg,#C4A050,#8B6914)":"linear-gradient(180deg,rgba(139,105,20,0.5),rgba(139,105,20,0.2))",borderRadius:"4px 4px 0 0",transition:"height 0.5s ease"}}/>
                  <span style={{fontSize:11,color:"#7A6B50",fontWeight:600}}>{y.yr}</span>
                </div>);
              })}
            </div>
          </div>

          <div style={{borderTop:"1px solid rgba(139,105,20,0.12)",padding:"16px 0",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
            <span style={{fontSize:11,color:"#5A4D38"}}>Source: CA Department of Alcoholic Beverage Control (ABC) Ad-Hoc License Reports</span>
            <span style={{fontSize:11,color:"#5A4D38"}}>{allNapa.length} data points | Live from Supabase</span>
          </div>
        </>)}

        {/* ═══ LABOR MARKET ═══ */}
        {section==="labor"&&(<>
          <div style={{marginBottom:20}}><h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:22,fontWeight:700,color:"#F5E6C8",margin:"0 0 4px"}}>Labor Market</h2><p style={{fontSize:13,color:"#7A6B50",margin:0}}>FRED / BLS data for Napa County — Monthly series, updated weekly</p></div>
          <div style={{display:"flex",gap:14,marginBottom:24,flexWrap:"wrap"}}>
            {latestE?.unemp != null && <KPI label="Unemployment Rate" value={latestE.unemp+"%"} icon="📊" color="#C4A050" delta={<Delta c={latestE.unemp} p={priorE?.unemp} s="%" inv/>}/>}
            {latestE?.labor != null && <KPI label="Civilian Labor Force" value={fN(latestE.labor)} icon="👷" delta={<Delta c={latestE.labor} p={priorE?.labor}/>}/>}
            {latestE?.food != null && <KPI label="Food Services & Drinking" value={fN(latestE.food)+" jobs"} icon="🍽️" delta={<Delta c={latestE.food} p={priorE?.food}/>}/>}
          </div>
          {econData.length >= 2 && (
            <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(139,105,20,0.15)",borderRadius:14,padding:"20px 12px 12px 0",marginBottom:24}}>
              <div style={{paddingLeft:20,marginBottom:8}}><span style={{fontSize:11,fontWeight:700,letterSpacing:2,color:"#8B6914",textTransform:"uppercase"}}>Unemployment Rate</span></div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={econData.filter(d=>d.unemp!=null)} margin={{top:8,right:16,bottom:4,left:8}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,105,20,0.08)" vertical={false}/>
                  <XAxis dataKey="date" tick={{fontSize:9,fill:"#6B5B40",fontFamily:"'JetBrains Mono',monospace"}} tickFormatter={fMo} axisLine={false} tickLine={false}/>
                  <YAxis domain={[0,"auto"]} tick={{fontSize:9,fill:"#6B5B40",fontFamily:"'JetBrains Mono',monospace"}} tickFormatter={v=>v+"%"} axisLine={false} tickLine={false} width={40}/>
                  <Tooltip content={<Tip fmt={(v)=>v+"%"}/>}/>
                  <Line type="monotone" dataKey="unemp" stroke="#B85C38" strokeWidth={2.5} dot={{r:4,fill:"#B85C38",stroke:"#1C120C",strokeWidth:2}} name="Unemployment"/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          <div style={{background:"linear-gradient(135deg, rgba(139,105,20,0.08) 0%, rgba(91,138,90,0.06) 100%)",border:"1px solid rgba(139,105,20,0.15)",borderRadius:12,padding:"22px 26px",marginBottom:28}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:2.5,color:"#8B6914",textTransform:"uppercase",marginBottom:10}}>Labor Market Context</div>
            <p style={{fontSize:14,color:"#C4B08A",lineHeight:1.75,margin:"0 0 10px"}}>Napa County's labor market remains stable with unemployment at <span style={{color:"#C4A050",fontWeight:600}}>{latestE?.unemp || "—"}%</span>, compared to California's statewide rate of ~5.1% and the national average of ~4.1%.</p>
            <p style={{fontSize:14,color:"#C4B08A",lineHeight:1.75,margin:0}}>The civilian labor force stands at <span style={{color:"#C4A050",fontWeight:600}}>{latestE?.labor ? fN(latestE.labor) : "—"}</span> with <span style={{color:"#C4A050",fontWeight:600}}>{latestE?.food ? fN(latestE.food) : "—"}</span> jobs in food services & drinking places — a key indicator for Napa's tourism-driven economy.</p>
          </div>
        </>)}

        {/* ═══ HOUSING ═══ */}
        {section==="housing"&&(<>
          <div style={{marginBottom:20}}><h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:22,fontWeight:700,color:"#F5E6C8",margin:"0 0 4px"}}>Housing Market</h2><p style={{fontSize:13,color:"#7A6B50",margin:0}}>Zillow Home Value Index (ZHVI) — All homes, smoothed, county level</p></div>
          <div style={{display:"flex",gap:14,marginBottom:24,flexWrap:"wrap"}}>
            {latestE?.home != null && <KPI label="Avg Home Value" value={f$(latestE.home)} icon="🏠" color="#5B8A5A" delta={<Delta c={latestE.home} p={priorE?.home}/>}/>}
            {(priorE?.pending ?? latestE?.pending) != null && <KPI label="Days to Pending" value={(priorE?.pending ?? latestE?.pending)+" days"} icon="⏱️" color="#B85C38" delta={<span style={{fontSize:11,color:"#7A6B50"}}>median listing</span>}/>}
            {(priorE?.yoy ?? latestE?.yoy) != null && <KPI label="Year-over-Year" value={(priorE?.yoy ?? latestE?.yoy)+"%"} icon="📉" color="#B85C38" delta={<span style={{fontSize:11,color:"#7A6B50"}}>home value change</span>}/>}
          </div>
          {econData.filter(d=>d.home!=null).length >= 2 && (
            <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(139,105,20,0.15)",borderRadius:14,padding:"20px 12px 12px 0",marginBottom:24}}>
              <div style={{paddingLeft:20,marginBottom:8}}><span style={{fontSize:11,fontWeight:700,letterSpacing:2,color:"#8B6914",textTransform:"uppercase"}}>Napa County Home Value (ZHVI)</span></div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={econData.filter(d=>d.home!=null)} margin={{top:8,right:16,bottom:4,left:8}}>
                  <defs><linearGradient id="hG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5B8A5A" stopOpacity={0.3}/><stop offset="100%" stopColor="#1C120C" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,105,20,0.08)" vertical={false}/>
                  <XAxis dataKey="date" tick={{fontSize:9,fill:"#6B5B40",fontFamily:"'JetBrains Mono',monospace"}} tickFormatter={fMo} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:9,fill:"#6B5B40",fontFamily:"'JetBrains Mono',monospace"}} tickFormatter={v=>"$"+(v/1000).toFixed(0)+"k"} axisLine={false} tickLine={false} width={50}/>
                  <Tooltip content={<Tip fmt={(v)=>f$(v)}/>}/>
                  <Area type="monotone" dataKey="home" stroke="#5B8A5A" strokeWidth={2.5} fill="url(#hG)" dot={{r:4,fill:"#5B8A5A",stroke:"#1C120C",strokeWidth:2}} name="ZHVI"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          <div style={{background:"linear-gradient(135deg, rgba(91,138,90,0.08) 0%, rgba(139,105,20,0.06) 100%)",border:"1px solid rgba(139,105,20,0.15)",borderRadius:12,padding:"22px 26px",marginBottom:28}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:2.5,color:"#8B6914",textTransform:"uppercase",marginBottom:10}}>Housing Context</div>
            <p style={{fontSize:14,color:"#C4B08A",lineHeight:1.75,margin:"0 0 10px"}}>The average Napa County home is valued at <span style={{color:"#5B8A5A",fontWeight:600}}>{latestE?.home ? f$(latestE.home) : "—"}</span>.{(priorE?.yoy??latestE?.yoy)!=null&&(priorE?.yoy??latestE?.yoy)<0?` Values are down ${Math.abs(priorE?.yoy??latestE?.yoy)}% year-over-year, reflecting broader softening in California's housing market.`:(priorE?.yoy??latestE?.yoy)!=null?` Values are up ${priorE?.yoy??latestE?.yoy}% year-over-year.`:""}</p>
            <p style={{fontSize:14,color:"#C4B08A",lineHeight:1.75,margin:0}}>Napa's constrained geography — bounded by the Agricultural Preserve and hillside development limits — keeps supply tight even as demand fluctuates with interest rates and wildfire insurance costs.</p>
          </div>
        </>)}

        {/* FOOTER */}
        <div style={{borderTop:"1px solid rgba(139,105,20,0.12)",padding:"16px 0 0",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8,marginTop:20}}>
          <span style={{fontSize:11,color:"#5A4D38"}}>Sources: CA ABC · FRED (BLS) · Zillow Research · CA EDD</span>
          <span style={{fontSize:11,color:"#5A4D38"}}>Pipeline: GitHub Actions → Supabase | {wineryData.length} snapshots | {lastUpdated ? fD(lastUpdated) : ""}</span>
        </div>
      </div>
    </div>
  );
}
