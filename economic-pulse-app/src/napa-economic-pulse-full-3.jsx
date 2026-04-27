import { useState, useEffect, useMemo } from "react";
import Footer from "./Footer";
import NavBar from "./NavBar";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from "recharts";
import PollSearch from "./components/PollSearch";

const SUPABASE_URL = "https://csenpchwxxepdvjebsrt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_r-Ntp7zKRrH3JIVAjTKYmA_0szFdYGJ";

async function fetchSnapshots() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/economic_pulse_snapshots?select=*&order=run_date.asc`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  if (!res.ok) throw new Error(`Supabase fetch failed: ${res.status}`);
  return res.json();
}

function transformData(rows) {
  const wineryData = [], econData = [];
  for (const r of rows) {
    if (r.napa_type02_count != null)
      wineryData.push({ date: r.run_date, napa: Number(r.napa_type02_count), ca: r.ca_type02_count != null ? Number(r.ca_type02_count) : undefined });
    if (r.unemployment_rate != null || r.home_value != null)
      econData.push({
        date: r.run_date,
        unemp:  r.unemployment_rate        != null ? Number(r.unemployment_rate)        : undefined,
        labor:  r.labor_force              != null ? Number(r.labor_force)              : undefined,
        food:   r.food_services_employment != null ? Number(r.food_services_employment) : undefined,
        home:   r.home_value               != null ? Number(r.home_value)               : undefined,
        pending:r.days_pending             != null ? Number(r.days_pending)             : undefined,
        yoy:    r.home_value_yoy           != null ? Number(r.home_value_yoy)           : undefined,
        summary:r.summary,
      });
  }
  return { wineryData, econData };
}

const WINERY_EVENTS = [
  { date: "2024-07-04", label: "Peak: 1,910",        type: "peak" },
  { date: "2024-10-17", label: "Oct drop: \u221241", type: "drop" },
  { date: "2025-06-10", label: "All-time: 1,934",    type: "peak" },
  { date: "2025-07-08", label: "Jul drop: \u221230", type: "drop" },
  { date: "2025-10-14", label: "Oct drop: \u221268", type: "drop" },
];
const WINERY_VIEWS = [
  { key: "all",    label: "Full History",  desc: "Dec 2019 \u2013 Present" },
  { key: "weekly", label: "Weekly Detail", desc: "Feb 2024 \u2013 Present" },
  { key: "recent", label: "Last 6 Months", desc: "Recent Trend" },
];
const SECTIONS = [
  { key: "overview", label: "Overview" },
  { key: "snapshot", label: "Snapshot" },
  { key: "winery",   label: "Winery Licenses" },
  { key: "labor",    label: "Labor Market" },
  { key: "housing",  label: "Housing" },
  { key: "pulse",    label: "Reader Pulse" },
];

const T = {
  bg:"#F5F0E8", bg2:"#EDE8DE", ink2:"#2C1810",
  accent:"#8B5E3C", gold:"#C4A050", muted:"#7A6A50", dim:"#8B7355",
  rule:"rgba(44,24,16,0.12)", live:"#4A7A5A", neg:"#8A3A2A", pos:"#3A6A4A",
};

const fD    = d => new Date(d+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
const fMo   = d => new Date(d+"T12:00:00").toLocaleDateString("en-US",{month:"short",year:"2-digit"});
const fFull = d => new Date(d+"T12:00:00").toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});
const f$    = v => "$"+Number(v).toLocaleString("en-US",{maximumFractionDigits:0});
const fN    = v => Number(v).toLocaleString("en-US");

function findPriorDifferent(arr, key, currentIdx) {
  const cv = arr[currentIdx]?.[key];
  if (cv == null) return undefined;
  for (let i = currentIdx - 1; i >= 0; i--) {
    const v = arr[i]?.[key];
    if (v != null && v !== cv) return v;
  }
  return undefined;
}

function Delta({c,p,s="",inv=false}){
  if(c==null||p==null)return<span style={{color:T.dim,fontSize:12}}>—</span>;
  const d=c-p; if(Math.abs(d)<0.001)return<span className="delta-unchanged" style={{color:T.dim,fontSize:12}}>Unchanged</span>;
  let good=d>0; if(inv)good=!good;
  const val=Math.abs(d)>=1000?fN(Math.round(d)):Math.abs(d)>=100?Math.round(d):Number(d.toFixed(1));
  return<span style={{color:good?T.pos:T.neg,fontSize:12,fontWeight:600,fontFamily:"monospace"}}>{d>0?"▲":"▼"} {d>0?"+":""}{val}{s}</span>;
}

function KPI({label,value,delta}){
  return(
    <div className="kpi-card-pulse" style={{background:T.bg2,border:`1px solid ${T.rule}`,padding:"16px 18px",flex:1,minWidth:140,minHeight:120,display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
      <div style={{fontSize:11,fontWeight:700,letterSpacing:2,color:T.dim,textTransform:"uppercase",marginBottom:8,fontFamily:"'Source Sans 3',sans-serif"}}>{label}</div>
      <div className="kpi-value" style={{fontSize:28,fontWeight:700,color:T.ink2,fontFamily:"'Libre Baskerville',Georgia,serif",lineHeight:1,marginBottom:6}}>{value}</div>
      <div>{delta}</div>
    </div>
  );
}

function StatCard({label,value,detail,accent}){
  return(
    <div style={{background:T.bg2,border:`1px solid ${T.rule}`,padding:"16px 18px",flex:1,minWidth:130,minHeight:120,display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
      <div style={{fontSize:11,fontWeight:700,letterSpacing:2,color:T.dim,textTransform:"uppercase",marginBottom:6,fontFamily:"'Source Sans 3',sans-serif"}}>{label}</div>
      <div style={{fontSize:26,fontWeight:700,color:accent||T.ink2,fontFamily:"'Libre Baskerville',Georgia,serif",lineHeight:1}}>{value}</div>
      {detail&&<div style={{fontSize:14,color:T.muted,marginTop:4,fontFamily:"'Source Sans 3',sans-serif"}}>{detail}</div>}
    </div>
  );
}

function Tip({active,payload,fmt}){
  if(!active||!payload?.[0])return null;
  const d=payload[0].payload;
  return(
    <div style={{background:T.bg,border:`1px solid ${T.rule}`,padding:"10px 14px",boxShadow:"0 4px 16px rgba(44,24,16,0.1)"}}>
      <div style={{fontSize:10,color:T.accent,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4,fontFamily:"'Source Sans 3',sans-serif"}}>{fFull(d.date)}</div>
      {payload.filter(p=>p.value!=null).map((p,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginTop:2}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:p.color||p.stroke}}/>
          <span style={{fontSize:15,color:T.ink2,fontWeight:700,fontFamily:"'Libre Baskerville',Georgia,serif"}}>{fmt?fmt(p.value):fN(p.value)}</span>
          <span style={{fontSize:10,color:T.muted}}>{p.name}</span>
        </div>
      ))}
    </div>
  );
}

export default function EconomicPulseDashboard(){
  const [section,    setSection]    = useState(() => { const p = new URLSearchParams(window.location.search).get("tab"); const valid = ["overview","snapshot","winery","labor","housing","pulse"]; return valid.includes(p) ? p : "overview"; });

  // Sync ?tab= URL param when section changes (deep-link support).
  useEffect(() => {
    const url = new URL(window.location.href);
    if (section === "overview") {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", section);
    }
    window.history.replaceState({}, "", url.toString());
  }, [section]);
  const [wineryView, setWineryView] = useState("weekly");
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [wineryData, setWineryData] = useState([]);
  const [econData,   setEconData]   = useState([]);
  const [lastUpdated,setLastUpdated]= useState(null);

  useEffect(()=>{
    let cancelled=false;
    (async()=>{
      try{
        const rows=await fetchSnapshots();
        if(cancelled)return;
        const{wineryData:w,econData:e}=transformData(rows);
        setWineryData(w); setEconData(e);
        setLastUpdated(rows.length>0?rows[rows.length-1].run_date:null);
      }catch(err){ if(!cancelled)setError(err.message); }
      finally{ if(!cancelled)setLoading(false); }
    })();
    return()=>{cancelled=true;};
  },[]);

  const [macroData, setMacroData] = useState([]);
  const [macroLoading, setMacroLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("https://misty-bush-fc93.tfcarl.workers.dev/api/fred");
        if (!res.ok) throw new Error("FRED fetch failed");
        const data = await res.json();
        if (!cancelled) setMacroData(data.results || []);
      } catch (e) {
        console.error("Macro fetch failed:", e);
      } finally {
        if (!cancelled) setMacroLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Reader Pulse: poll data ──
  const [pollData, setPollData] = useState([]);
  const [pollLoading, setPollLoading] = useState(true);
  const [openTheme, setOpenTheme] = useState(null);
  const [openPoll, setOpenPoll] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/nvf_polls?select=poll_id,post_id,post_title,question,options_json,total_votes,published_at,theme,substack_url&order=published_at.desc`,
          { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
        );
        if (!res.ok) throw new Error("Poll fetch failed");
        const data = await res.json();
        console.log("Poll data sample (first 3):", data.slice(0, 3).map(p => ({ poll_id: p.poll_id, post_title: p.post_title, substack_url: p.substack_url, theme: p.theme })));
        if (!cancelled) setPollData(data);
      } catch (e) { console.error("Poll fetch failed:", e); }
      finally { if (!cancelled) setPollLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const pollThemes = useMemo(() => {
    const grouped = {};
    for (const poll of pollData) {
      const t = poll.theme || "General";
      if (!grouped[t]) grouped[t] = [];
      grouped[t].push(poll);
    }
    return Object.entries(grouped)
      .map(([theme, polls]) => ({
        theme,
        polls,
        count: polls.length,
        totalVotes: polls.reduce((s, p) => s + (p.total_votes || 0), 0),
      }))
      .sort((a, b) => b.totalVotes - a.totalVotes);
  }, [pollData]);

  const pollTotals = useMemo(() => ({
    count: pollData.length,
    votes: pollData.reduce((s, p) => s + (p.total_votes || 0), 0),
  }), [pollData]);

  const EXCLUDED_THEMES = new Set(["Reader Demographics", "Words, Puzzles & Trivia"]);
  const topCivicPolls = useMemo(() =>
    pollData
      .filter(p => !EXCLUDED_THEMES.has(p.theme) && p.total_votes > 0)
      .sort((a, b) => b.total_votes - a.total_votes)
      .slice(0, 3)
  , [pollData]);

  const allNapa=useMemo(()=>wineryData.filter(d=>d.napa!=null),[wineryData]);

  const wineryFiltered=useMemo(()=>{
    if(wineryView==="all")return allNapa;
    if(wineryView==="weekly")return allNapa.filter(d=>d.date>="2024-02-01");
    return allNapa.filter(d=>d.date>="2025-09-01");
  },[wineryView,allNapa]);

  const wStats=useMemo(()=>{
    if(!allNapa.length)return{peak:0,peakDate:"",current:0,fromPeak:0,netGrowth:0,pctGrowth:"0"};
    const peak=Math.max(...allNapa.map(d=>d.napa));
    const peakDate=allNapa.find(d=>d.napa===peak)?.date||"";
    const current=allNapa[allNapa.length-1].napa;
    const dec2019=allNapa[0].napa;
    const netGrowth=current-dec2019;
    return{peak,peakDate,current,fromPeak:current-peak,netGrowth,pctGrowth:((netGrowth/dec2019)*100).toFixed(1)};
  },[allNapa]);

  const wYDomain=useMemo(()=>{
    if(!wineryFiltered.length)return[1800,1950];
    const vals=wineryFiltered.map(d=>d.napa);
    const mn=Math.min(...vals),mx=Math.max(...vals);
    const pad=Math.max(10,Math.round((mx-mn)*0.08));
    return[Math.floor((mn-pad)/10)*10,Math.ceil((mx+pad)/10)*10];
  },[wineryFiltered]);

  const wEvents=useMemo(()=>{
    if(!wineryFiltered.length)return[];
    const s=wineryFiltered[0]?.date,e=wineryFiltered[wineryFiltered.length-1]?.date;
    return WINERY_EVENTS.filter(ev=>ev.date>=s&&ev.date<=e);
  },[wineryFiltered]);

  const overviewWinery=useMemo(()=>allNapa.filter(d=>d.date>="2024-02-01"),[allNapa]);
  const oMin=overviewWinery.length?Math.min(...overviewWinery.map(d=>d.napa)):1800;
  const oMax=overviewWinery.length?Math.max(...overviewWinery.map(d=>d.napa)):1950;
  const oPad=Math.round((oMax-oMin)*0.08);

  const overviewCA=useMemo(()=>overviewWinery.filter(d=>d.ca!=null),[overviewWinery]);
  const caMin=overviewCA.length?Math.min(...overviewCA.map(d=>d.ca)):5000;
  const caMax=overviewCA.length?Math.max(...overviewCA.map(d=>d.ca)):6000;
  const caPad=Math.round((caMax-caMin)*0.08);

  const latestW=allNapa.length?allNapa[allNapa.length-1]:null;
  const latestE=econData.length?econData[econData.length-1]:null;
  const priorE=econData.length>1?econData[econData.length-2]:null;

  if(loading)return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Source Sans 3',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet"/>
      <div style={{textAlign:"center"}}>
        <div style={{width:36,height:36,border:`2px solid ${T.rule}`,borderTopColor:T.accent,borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto 16px"}}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}} .dash-tabs::-webkit-scrollbar{display:none} .dash-tabs{scrollbar-width:none;-ms-overflow-style:none;} .delta-unchanged+span{display:none!important;} @media(max-width:768px){.kpi-grid-overview,.kpi-grid-macro,.kpi-grid-housing{display:grid!important;grid-template-columns:repeat(2,1fr)!important;gap:8px!important;overflow:hidden!important;align-items:flex-start!important;flex-wrap:unset!important;}.kpi-grid-labor{display:grid!important;grid-template-columns:repeat(2,1fr)!important;gap:8px!important;overflow:hidden!important;align-items:flex-start!important;}.kpi-labor-card{min-width:0!important;}.kpi-grid-labor>*:last-child:nth-child(odd){grid-column:1/-1;}.kpi-card-pulse{min-height:160px!important;box-sizing:border-box!important;}.kpi-card-pulse .kpi-value{font-size:clamp(1.4rem,4vw,2rem)!important;}}`}</style>
        <p style={{fontFamily:"'Libre Baskerville',Georgia,serif",color:T.muted,fontSize:16}}>Loading Community Pulse...</p>
      </div>
    </div>
  );

  if(error)return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Source Sans 3',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet"/>
      <div style={{textAlign:"center",maxWidth:480,padding:"0 24px"}}>
        <h2 style={{fontFamily:"'Libre Baskerville',Georgia,serif",color:T.ink2,fontSize:22,margin:"0 0 8px"}}>Connection Error</h2>
        <p style={{color:T.neg,fontSize:13,fontFamily:"monospace"}}>{error}</p>
      </div>
    </div>
  );

  const ctx={background:T.bg2,border:`1px solid ${T.rule}`,borderLeft:`3px solid ${T.accent}`,padding:"18px 22px",marginBottom:24};
  const lbl={fontSize:11,fontWeight:700,letterSpacing:2,color:T.dim,textTransform:"uppercase",marginBottom:8,fontFamily:"'Source Sans 3',sans-serif"};
  const chrt={background:T.bg2,border:`1px solid ${T.rule}`,padding:"20px 12px 12px 0",marginBottom:24};
  const ctitle={paddingLeft:20,marginBottom:8,fontSize:11,fontWeight:700,letterSpacing:2,color:T.dim,textTransform:"uppercase",fontFamily:"'Source Sans 3',sans-serif"};

  return(
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'Source Sans 3',sans-serif",color:T.ink2}}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet"/>
      <NavBar/>

      <div id="main-content" style={{maxWidth:1100,margin:"0 auto",padding:"36px 24px 0"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
          <div style={{width:5,height:5,background:T.live,borderRadius:"50%"}}/>
          <span style={{fontSize:10,fontWeight:700,letterSpacing:3,color:T.dim,textTransform:"uppercase"}}>NapaServe</span>
          <span style={{fontSize:10,color:T.dim}}>· Napa County</span>
        </div>
        <h1 style={{fontFamily:"'Libre Baskerville',Georgia,serif",fontSize:"clamp(28px,4vw,42px)",fontWeight:700,color:T.ink2,margin:"0 0 4px"}}>Community Pulse</h1>
        <p style={{fontSize:17,color:T.dim,margin:"0 0 24px"}}>
          Weekly snapshot — {lastUpdated?fD(lastUpdated):"Loading..."} <span style={{color:T.rule}}>|</span> Live from Supabase
          <span style={{color:T.live,fontSize:11,marginLeft:8,fontWeight:600}}>● Connected</span>
        </p>
        <div className="dash-tabs" style={{display:"flex",borderBottom:`1px solid ${T.rule}`,overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
          {SECTIONS.map(s=>(
            <button key={s.key} onClick={()=>setSection(s.key)} style={{padding:"10px 20px",fontSize:13,fontWeight:600,background:"none",color:section===s.key?T.ink2:T.dim,border:"none",borderBottom:section===s.key?`2px solid ${T.accent}`:"2px solid transparent",cursor:"pointer",marginBottom:-1,fontFamily:"'Source Sans 3',sans-serif",whiteSpace:"nowrap",flexShrink:0}}>{s.label}</button>
          ))}
        </div>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"28px 24px 24px"}}>

        {section==="overview"&&<>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:".16em",textTransform:"uppercase",color:T.gold,marginBottom:8,fontFamily:"'Source Sans 3',sans-serif"}}>Napa County</div>
          <div className="kpi-grid-overview kpi-grid" style={{display:"grid",gap:10,marginBottom:24,alignItems:"stretch"}}>
            {latestW&&<a href="https://www.abc.ca.gov/licensing/licensing-reports/" target="_blank" rel="noopener noreferrer" aria-label="ABC Licensing, opens in new tab" style={{display:"block",textDecoration:"none",color:"inherit"}}><KPI label="Winery Licenses" value={fN(latestW.napa)} delta={<><Delta c={latestW.napa} p={findPriorDifferent(allNapa,"napa",allNapa.length-1)}/><span style={{fontSize:10,color:T.dim,marginLeft:4}}>WoW</span></>}/></a>}
            {latestE?.unemp!=null&&<a href="https://fred.stlouisfed.org/series/CANAPA0URN" target="_blank" rel="noopener noreferrer" aria-label="Unemployment Rate data, opens in new tab" style={{display:"block",textDecoration:"none",color:"inherit"}}><KPI label="Unemployment" value={latestE.unemp+"%"} delta={<><Delta c={latestE.unemp} p={findPriorDifferent(econData,"unemp",econData.length-1)} s="%" inv/><span style={{fontSize:10,color:T.dim,marginLeft:4}}>MoM</span></>}/></a>}
            {latestE?.labor!=null&&<a href="https://fred.stlouisfed.org/series/NAPA906LFN" target="_blank" rel="noopener noreferrer" aria-label="Labor Force data, opens in new tab" style={{display:"block",textDecoration:"none",color:"inherit"}}><KPI label="Labor Force" value={fN(latestE.labor)} delta={<><Delta c={latestE.labor} p={findPriorDifferent(econData,"labor",econData.length-1)}/><span style={{fontSize:10,color:T.dim,marginLeft:4}}>MoM</span></>}/></a>}
            {latestE?.home!=null&&<a href="https://www.zillow.com/research/data/" target="_blank" rel="noopener noreferrer" aria-label="Zillow Research data, opens in new tab" style={{display:"block",textDecoration:"none",color:"inherit"}}><KPI label="Avg Home Value" value={f$(latestE.home)} delta={<><Delta c={latestE.home} p={findPriorDifferent(econData,"home",econData.length-1)}/><span style={{fontSize:10,color:T.dim,marginLeft:4}}>MoM</span></>}/></a>}
          </div>
          {latestE?.summary&&<div style={ctx}><div style={lbl}>Weekly Summary</div><p style={{fontSize:14,color:T.muted,lineHeight:1.75,margin:0}}>{latestE.summary}</p></div>}
          {overviewWinery.length>=2&&(
            <div style={chrt}>
              <div style={ctitle}>Napa Winery Licenses — Weekly Trend</div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={overviewWinery} margin={{top:8,right:16,bottom:4,left:8}}>
                  <defs><linearGradient id="oG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.gold} stopOpacity={0.25}/><stop offset="100%" stopColor={T.gold} stopOpacity={0.02}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.rule} vertical={false}/>
                  <XAxis dataKey="date" tick={{fontSize:9,fill:T.dim}} tickFormatter={fMo} interval={Math.floor(overviewWinery.length/6)} axisLine={false} tickLine={false}/>
                  <YAxis domain={[oMin-oPad,oMax+oPad]} tick={{fontSize:9,fill:T.dim}} axisLine={false} tickLine={false} width={48} tickFormatter={v=>v.toLocaleString()}/>
                  <Tooltip content={<Tip/>} cursor={{stroke:T.accent,strokeWidth:1,strokeDasharray:"4 4"}}/>
                  <Area type="monotone" dataKey="napa" stroke={T.gold} strokeWidth={2} fill="url(#oG)" dot={false} name="Napa Type-02"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {overviewCA.length>=2&&(
            <div style={chrt}>
              <div style={ctitle}>California Type-02 Winery Licenses — Weekly Trend</div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={overviewCA} margin={{top:8,right:16,bottom:4,left:8}}>
                  <defs><linearGradient id="caG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.accent} stopOpacity={0.25}/><stop offset="100%" stopColor={T.accent} stopOpacity={0.02}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.rule} vertical={false}/>
                  <XAxis dataKey="date" tick={{fontSize:9,fill:T.dim}} tickFormatter={fMo} interval={Math.floor(overviewCA.length/6)} axisLine={false} tickLine={false}/>
                  <YAxis domain={[caMin-caPad,caMax+caPad]} tick={{fontSize:9,fill:T.dim}} axisLine={false} tickLine={false} width={48} tickFormatter={v=>v.toLocaleString()}/>
                  <Tooltip content={<Tip/>} cursor={{stroke:T.accent,strokeWidth:1,strokeDasharray:"4 4"}}/>
                  <Area type="monotone" dataKey="ca" stroke={T.accent} strokeWidth={2} fill="url(#caG)" dot={false} name="CA Type-02"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── MACRO INDICATORS ── */}
          <div style={{marginTop:32,paddingTop:24,borderTop:`1px solid ${T.rule}`}}>
            <div style={{display:"flex",alignItems:"baseline",gap:12,marginBottom:4}}>
              <h2 style={{fontFamily:"'Libre Baskerville',Georgia,serif",fontSize:20,fontWeight:700,color:T.ink2,margin:0}}>US &amp; California Indicators</h2>
            </div>
            <p style={{fontSize:12,color:T.dim,margin:"0 0 6px",fontFamily:"'Source Sans 3',sans-serif"}}>Federal Reserve / BLS / Freddie Mac — live via FRED API</p>
            {lastUpdated&&<p style={{fontSize:11,color:T.dim,margin:"0 0 16px",fontFamily:"'Source Sans 3',sans-serif"}}>Data as of latest available · Fetched live</p>}
            {macroLoading ? (
              <div style={{fontSize:13,color:T.dim,padding:"16px 0"}}>Loading indicators...</div>
            ) : (()=>{
              const INVERT = new Set(["UNRATE","CAUR","CPIAUCSL","PPIACO","MORTGAGE30US"]);
              const INDEX = new Set(["CPIAUCSL","PPIACO","CASTHPI","INDPRO"]);
              const BILLIONS = new Set(["RSAFS"]);
              const THOUSANDS = new Set(["HOUST","CANA"]);
              const rows = [
                {label:"Labor",ids:["UNRATE","CAUR","CANA","JTSJOR"]},
                {label:"Inflation & Housing",ids:["CPIAUCSL","PPIACO","MORTGAGE30US","CASTHPI"]},
                {label:"Growth & Financial",ids:["RSAFS","INDPRO","HOUST","T10Y2Y"]},
              ];
              const byId = {};
              macroData.forEach(m=>{byId[m.id]=m;});
              return rows.map((row,ri)=>(
                <div key={ri} style={{marginBottom:ri<2?16:0}}>
                  <div style={{fontSize:11,fontWeight:700,letterSpacing:".16em",textTransform:"uppercase",color:T.dim,marginBottom:6,fontFamily:"'Source Sans 3',sans-serif"}}>{row.label}</div>
                  <div className="kpi-grid-macro" style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(160px,1fr))",gap:8,overflowX:"auto"}}>
                    {row.ids.map(id=>{
                      const m = byId[id];
                      if(!m) return <div key={id} style={{background:T.bg2,border:`1px solid ${T.rule}`,padding:"14px 16px",height:90}} />;
                      const val = m.value ? parseFloat(m.value) : null;
                      const prior = m.prior ? parseFloat(m.prior) : null;
                      const isIndex = INDEX.has(id);
                      const displayVal = val===null?"—":BILLIONS.has(id)?"$"+(val/1000).toFixed(0)+"B":THOUSANDS.has(id)?fN(Math.round(val))+"K":isIndex?val.toFixed(1):val>=1000?fN(Math.round(val)):val%1===0?val.toFixed(0):val.toFixed(1);
                      const unit = isIndex?"":m.unit;
                      let delta=null,deltaPos=null;
                      if(val!==null&&prior!==null){
                        const diff=val-prior;
                        if(Math.abs(diff)>0.001){
                          deltaPos=INVERT.has(id)?diff<0:diff>0;
                          delta=`${diff>0?"▲":"▼"} ${Math.abs(diff)<1?Math.abs(diff).toFixed(2):Math.abs(diff).toFixed(1)}`;
                        }
                      }
                      return(
                        <a key={id} href={`https://fred.stlouisfed.org/series/${id}`} target="_blank" rel="noopener noreferrer" aria-label={`${m.label} data, opens in new tab`} style={{textDecoration:"none",color:"inherit"}}>
                        <div style={{background:T.bg2,border:`1px solid ${T.rule}`,padding:"14px 16px",height:90,boxSizing:"border-box",overflow:"hidden"}}>
                          <div style={{fontSize:11,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:T.dim,marginBottom:6,fontFamily:"'Source Sans 3',sans-serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.label}</div>
                          <div style={{fontSize:22,fontWeight:700,color:T.ink2,fontFamily:"'Libre Baskerville',Georgia,serif",lineHeight:1}}>{displayVal}{unit}</div>
                          <div style={{marginTop:4,display:"flex",alignItems:"center",gap:6}}>
                            {delta&&<span style={{fontSize:10,fontWeight:600,color:deltaPos?T.pos:T.neg,fontFamily:"monospace"}}>{delta}</span>}
                            <span style={{fontSize:10,color:T.dim,fontFamily:"'Source Sans 3',sans-serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{isIndex?"Index · "+m.source:m.source}</span>
                          </div>
                        </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              ));
            })()}
          </div>

          <div style={{background:T.bg2,border:`1px solid ${T.rule}`,padding:"12px 18px",marginTop:24}}>
            <span style={{...lbl,display:"inline"}}>Data Sources </span>
            <span style={{fontSize:14,color:T.muted}}>ABC Licensing · FRED (BLS) · Zillow Research · CA EDD · Freddie Mac · U Michigan · {wineryData.length} snapshots</span>
          </div>

          {/* ── COMMUNITY SENTIMENT ── */}
          {!pollLoading && topCivicPolls.length > 0 && (
            <div style={{marginTop:32,paddingTop:24,borderTop:`1px solid ${T.rule}`}}>
              <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:16}}>
                <div>
                  <h2 style={{fontFamily:"'Libre Baskerville',Georgia,serif",fontSize:20,fontWeight:700,color:T.ink2,margin:"0 0 4px"}}>Community Sentiment</h2>
                  <p style={{fontSize:14,color:T.dim,margin:0,fontFamily:"'Source Sans 3',sans-serif"}}>{fN(pollTotals.count)} polls · {fN(pollTotals.votes)} total votes from NVF readers</p>
                </div>
                <button onClick={()=>setSection("pulse")} style={{fontSize:10,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:T.accent,background:"none",border:"none",cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif",whiteSpace:"nowrap"}}>View all →</button>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {topCivicPolls.map(poll => {
                  const rawOpts = typeof poll.options_json === "string" ? (() => { try { return JSON.parse(poll.options_json); } catch { return []; } })() : (poll.options_json || []);
                  const options = Array.isArray(rawOpts) ? rawOpts : [];
                  const opts = options.filter(o => o && (o.label || o.text));
                  const winner = opts.length > 0 ? opts.reduce((a, b) => (Number(b.votes) || 0) > (Number(a.votes) || 0) ? b : a, opts[0]) : null;
                  const winPct = winner && poll.total_votes > 0 ? Math.round(((Number(winner.votes) || 0) / poll.total_votes) * 100) : 0;
                  const isOpen = openPoll === poll.poll_id;
                  const maxVotes = Math.max(...opts.map(o => Number(o.votes) || 0), 1);
                  return (
                    <div key={poll.poll_id} style={{background:T.bg2,border:`1px solid ${T.rule}`,overflow:"hidden"}}>
                      <div onClick={() => setOpenPoll(isOpen ? null : poll.poll_id)} style={{padding:"14px 18px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontFamily:"'Libre Baskerville',Georgia,serif",fontSize:14,fontWeight:700,color:T.ink2,lineHeight:1.4,marginBottom:4}}>{poll.question}</div>
                          {!isOpen && winner && (
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                              <div style={{flex:1,height:6,background:T.rule,borderRadius:3,overflow:"hidden"}}>
                                <div style={{height:"100%",width:`${winPct}%`,background:T.accent,borderRadius:3}} />
                              </div>
                              <span style={{fontSize:12,fontWeight:600,color:T.accent,whiteSpace:"nowrap",fontFamily:"'Source Sans 3',sans-serif"}}>{winPct}%</span>
                              <span style={{fontSize:14,color:T.muted,fontFamily:"'Source Sans 3',sans-serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:200}}>{winner.label || winner.text}</span>
                            </div>
                          )}
                          {(()=>{const url=poll.substack_url&&poll.substack_url.trim();return(
                          <div style={{fontSize:14,color:T.dim,marginTop:4,fontFamily:"'Source Sans 3',sans-serif",lineHeight:1.5}}>{fN(poll.total_votes)} votes{poll.theme ? ` · ${poll.theme}` : ""}{poll.post_title && <>{" · from "}{url ? <a href={url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} aria-label={`${poll.post_title}, opens in new tab`} style={{color:T.gold,textDecoration:"none",fontWeight:600}}>{poll.post_title} ↗</a> : <span style={{fontStyle:"italic",color:T.muted}}>{poll.post_title}</span>}</>}{poll.published_at && ` · ${new Date(poll.published_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}`}</div>
                          );})()}
                        </div>
                        <span style={{fontSize:16,color:T.dim,marginLeft:12,transform:isOpen?"rotate(180deg)":"",transition:"transform .2s"}}>▾</span>
                      </div>
                      {isOpen && (
                        <div style={{padding:"0 18px 16px",borderTop:`1px solid ${T.rule}`}}>
                          {opts.map((opt, oi) => {
                            const votes = Number(opt.votes) || 0;
                            const pct = poll.total_votes > 0 ? ((votes / poll.total_votes) * 100) : 0;
                            const isWinner = votes === maxVotes && votes > 0;
                            return (
                              <div key={oi} style={{marginTop:oi===0?14:10}}>
                                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                                  <span style={{fontSize:13,fontWeight:isWinner?700:400,color:isWinner?T.ink2:T.muted,fontFamily:"'Source Sans 3',sans-serif"}}>{opt.text || opt.label}</span>
                                  <span style={{fontSize:12,fontWeight:600,color:isWinner?T.gold:T.dim,fontFamily:"monospace",whiteSpace:"nowrap",marginLeft:8}}>{pct.toFixed(1)}% ({votes})</span>
                                </div>
                                <div style={{height:18,background:T.bg,border:`1px solid ${T.rule}`,overflow:"hidden"}}>
                                  <div style={{height:"100%",width:`${pct}%`,background:isWinner?T.gold:T.dim,opacity:isWinner?0.7:0.3,transition:"width .3s ease"}}/>
                                </div>
                              </div>
                            );
                          })}
                          {poll.published_at && (
                            <div style={{fontSize:10,color:T.dim,marginTop:10,textAlign:"right"}}>
                              Published {fD(poll.published_at.split("T")[0])}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>}


        {section==="snapshot"&&<>
          <div style={{padding:"40px 24px",background:"#EDE8DE",borderRadius:8,textAlign:"center",border:"1px solid #D4CDB8",marginTop:24}}>
            <div style={{fontFamily:"'Source Sans 3',sans-serif",fontSize:13,letterSpacing:"0.08em",textTransform:"uppercase",color:"#8B7355",marginBottom:12}}>WEEKLY SNAPSHOT</div>
            <h2 style={{fontFamily:"'Libre Baskerville',serif",fontSize:28,fontWeight:700,color:"#2C1810",margin:"0 0 12px 0"}}>Coming Soon</h2>
            <p style={{fontFamily:"'Source Sans 3',sans-serif",fontSize:16,color:"#8B7355",maxWidth:540,margin:"0 auto",lineHeight:1.5}}>A six-signal at-a-glance synthesis of Napa County's economy, refreshed weekly. Designed to support Under the Hood writing and serve as a Substack-ready screenshot.</p>
          </div>
        </>}

        {section==="winery"&&<>
          <div style={{marginBottom:20}}>
            <h2 style={{fontFamily:"'Libre Baskerville',Georgia,serif",fontSize:"clamp(22px,4vw,32px)",fontWeight:700,color:T.ink2,margin:"0 0 6px"}}>Napa County Winery Licenses</h2>
            <p style={{fontSize:17,color:T.muted,margin:0}}>ABC Type-02 active license count · {allNapa.length} data points, live from Supabase</p>
          </div>
          <div className="kpi-grid" style={{display:"flex",gap:10,marginBottom:24,flexWrap:"wrap",alignItems:"stretch"}}>
            <StatCard label="Current" value={wStats.current.toLocaleString()} detail={`as of ${fMo(allNapa[allNapa.length-1]?.date||"")}`}/>
            <StatCard label="All-Time Peak" value={wStats.peak.toLocaleString()} detail={fMo(wStats.peakDate)} accent={T.gold}/>
            <StatCard label="From Peak" value={`${wStats.fromPeak}`} detail={`${((wStats.fromPeak/wStats.peak)*100).toFixed(1)}% below`} accent={T.neg}/>
            <StatCard label="Since Dec '19" value={`+${wStats.netGrowth}`} detail={`+${wStats.pctGrowth}% growth`} accent={T.pos}/>
          </div>
          <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
            {WINERY_VIEWS.map(v=>(
              <button key={v.key} onClick={()=>setWineryView(v.key)} style={{padding:"8px 18px",fontSize:12,fontWeight:600,background:wineryView===v.key?T.ink2:"transparent",color:wineryView===v.key?"#F5F0E8":T.muted,border:`1px solid ${wineryView===v.key?T.ink2:T.rule}`,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif"}}>{v.label}</button>
            ))}
            <span style={{fontSize:12,color:T.dim,alignSelf:"center",marginLeft:8}}>{WINERY_VIEWS.find(v=>v.key===wineryView)?.desc}</span>
          </div>
          {wineryFiltered.length>=2&&(
            <div style={chrt}>
              <ResponsiveContainer width="100%" height={420}>
                <AreaChart data={wineryFiltered} margin={{top:20,right:20,bottom:20,left:10}}>
                  <defs><linearGradient id="wG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.gold} stopOpacity={0.2}/><stop offset="100%" stopColor={T.gold} stopOpacity={0.02}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.rule} vertical={false}/>
                  <XAxis dataKey="date" tick={{fontSize:10,fill:T.dim}} tickFormatter={v=>wineryView==="all"?new Date(v+"T12:00:00").getFullYear().toString():fMo(v)} interval={wineryView==="all"?0:wineryView==="recent"?2:Math.floor(wineryFiltered.length/8)} axisLine={{stroke:T.rule}} tickLine={false}/>
                  <YAxis domain={wYDomain} tick={{fontSize:10,fill:T.dim}} tickFormatter={v=>v.toLocaleString()} axisLine={false} tickLine={false} width={52}/>
                  <Tooltip content={<Tip/>} cursor={{stroke:T.accent,strokeWidth:1,strokeDasharray:"4 4"}}/>
                  {wineryView==="weekly"&&<><ReferenceArea x1="2024-10-10" x2="2024-10-24" fill={T.neg} fillOpacity={0.06}/><ReferenceArea x1="2025-07-01" x2="2025-07-15" fill={T.neg} fillOpacity={0.06}/><ReferenceArea x1="2025-10-07" x2="2025-10-21" fill={T.neg} fillOpacity={0.06}/></>}
                  <Area type="monotone" dataKey="napa" stroke={T.gold} strokeWidth={2.5} fill="url(#wG)" dot={wineryView==="all"?{r:4,fill:T.gold,stroke:"#F5F0E8",strokeWidth:2}:false} activeDot={{r:5,fill:T.gold,stroke:"#F5F0E8",strokeWidth:2}} name="Napa Type-02"/>
                  {wEvents.map((ev,i)=>(
                    <ReferenceLine key={i} x={ev.date} stroke={ev.type==="peak"?T.pos:T.neg} strokeDasharray="4 4" strokeOpacity={0.6}
                      label={wineryView!=="recent"?{value:ev.label,position:ev.type==="peak"?"top":"insideBottomLeft",fill:ev.type==="peak"?T.pos:T.neg,fontSize:10,fontWeight:600}:undefined}/>
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          <div style={{textAlign:"right",marginTop:4}}><a href="https://www.abc.ca.gov/licensing/licensing-reports/" target="_blank" rel="noopener noreferrer" aria-label="ABC Licensing, opens in new tab" style={{fontSize:10,color:T.dim,textDecoration:"none"}}>ABC Licensing ↗</a></div>
          <div style={ctx}>
            <div style={lbl}>The Story in the Data</div>
            <p style={{fontSize:14,color:T.muted,lineHeight:1.75,margin:"0 0 10px"}}>Napa County's winery license count has followed a <span style={{color:T.accent,fontWeight:600}}>sawtooth pattern</span> since weekly tracking began in February 2024. Three major drops: <span style={{color:T.neg}}>October 2024</span> (−41), <span style={{color:T.neg}}>July 2025</span> (−30) and <span style={{color:T.neg}}>October 2025</span> (−68).</p>
            <p style={{fontSize:14,color:T.muted,lineHeight:1.75,margin:0}}>Despite these corrections, the long-term trend remains positive: from 1,681 in December 2019 to the current {wStats.current.toLocaleString()} (<span style={{color:T.pos,fontWeight:600}}>+{wStats.pctGrowth}% over six years</span>). The all-time weekly peak of {wStats.peak.toLocaleString()} was reached on {fD(wStats.peakDate)}.</p>
          </div>
        </>}

        {section==="labor"&&<>
          <div style={{marginBottom:20}}>
            <h2 style={{fontFamily:"'Libre Baskerville',Georgia,serif",fontSize:24,fontWeight:700,color:T.ink2,margin:"0 0 4px"}}>Labor Market</h2>
            <p style={{fontSize:17,color:T.muted,margin:0}}>FRED / BLS data for Napa County — Monthly series, updated weekly</p>
          </div>
          <div className="kpi-grid-labor kpi-grid" style={{display:"flex",flexWrap:"wrap",gap:12,marginBottom:24,alignItems:"stretch"}}>
            {latestE?.unemp!=null&&<a className="kpi-labor-card" href="https://fred.stlouisfed.org/series/CANAPA0URN" target="_blank" rel="noopener noreferrer" aria-label="Unemployment Rate data, opens in new tab" style={{display:"block",textDecoration:"none",color:"inherit",flex:1,minWidth:140}}><KPI label="Unemployment Rate" value={latestE.unemp+"%"} delta={<><Delta c={latestE.unemp} p={priorE?.unemp} s="%" inv/><span style={{fontSize:10,color:T.dim,marginLeft:4}}>MoM</span></>}/></a>}
            {latestE?.labor!=null&&<a className="kpi-labor-card" href="https://fred.stlouisfed.org/series/NAPA906LFN" target="_blank" rel="noopener noreferrer" aria-label="Labor Force data, opens in new tab" style={{display:"block",textDecoration:"none",color:"inherit",flex:1,minWidth:140}}><KPI label="Civilian Labor Force" value={fN(latestE.labor)} delta={<><Delta c={latestE.labor} p={priorE?.labor}/><span style={{fontSize:10,color:T.dim,marginLeft:4}}>MoM</span></>}/></a>}
            {latestE?.food!=null&&<a className="kpi-labor-card" href="https://fred.stlouisfed.org/series/SMU06349007072200001SA" target="_blank" rel="noopener noreferrer" aria-label="Food Services data, opens in new tab" style={{display:"block",textDecoration:"none",color:"inherit",flex:1,minWidth:140}}><KPI label="Food Services" value={fN(latestE.food)+" jobs"} delta={<><Delta c={latestE.food} p={priorE?.food}/><span style={{fontSize:10,color:T.dim,marginLeft:4}}>MoM</span></>}/></a>}
          </div>
          {(()=>{const ud=econData.filter(d=>d.unemp!=null&&d.date>="2022-01");return ud.length>=2&&(
            <div style={chrt}>
              <div style={ctitle}>Unemployment Rate — Napa County</div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={ud} margin={{top:8,right:16,bottom:4,left:8}}>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.rule} vertical={false}/>
                  <XAxis dataKey="date" tick={{fontSize:9,fill:T.dim}} tickFormatter={fMo} axisLine={false} tickLine={false}/>
                  <YAxis domain={[2,6]} tick={{fontSize:9,fill:T.dim}} tickFormatter={v=>v+"%"} axisLine={false} tickLine={false} width={40}/>
                  <Tooltip content={<Tip fmt={v=>v+"%"}/>} cursor={{stroke:T.accent,strokeWidth:1,strokeDasharray:"4 4"}}/>
                  <Line type="monotone" dataKey="unemp" stroke={T.neg} strokeWidth={2.5} dot={{r:4,fill:T.neg,stroke:"#F5F0E8",strokeWidth:2}} name="Unemployment"/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          );})()}
          <div style={{textAlign:"right",marginTop:4}}><a href="https://www.bls.gov/regions/west/california.htm" target="_blank" rel="noopener noreferrer" aria-label="BLS Data, opens in new tab" style={{fontSize:10,color:T.dim,textDecoration:"none"}}>BLS Data ↗</a></div>
          <div style={ctx}>
            <div style={lbl}>Labor Market Context</div>
            <p style={{fontSize:14,color:T.muted,lineHeight:1.75,margin:"0 0 10px"}}>Napa County's labor market remains stable with unemployment at <span style={{color:T.accent,fontWeight:600}}>{latestE?.unemp||"—"}%</span>, compared to California's statewide rate of ~5.1% and the national average of ~4.1%.</p>
            <p style={{fontSize:14,color:T.muted,lineHeight:1.75,margin:0}}>The civilian labor force stands at <span style={{color:T.accent,fontWeight:600}}>{latestE?.labor?fN(latestE.labor):"—"}</span> with <span style={{color:T.accent,fontWeight:600}}>{latestE?.food?fN(latestE.food):"—"}</span> jobs in food services &amp; drinking places.</p>
          </div>
        </>}

        {section==="housing"&&<>
          <div style={{marginBottom:20}}>
            <h2 style={{fontFamily:"'Libre Baskerville',Georgia,serif",fontSize:24,fontWeight:700,color:T.ink2,margin:"0 0 4px"}}>Housing Market</h2>
            <p style={{fontSize:17,color:T.muted,margin:0}}>Zillow Home Value Index (ZHVI) — All homes, smoothed, county level</p>
          </div>
          <div className="kpi-grid-housing kpi-grid" style={{display:"grid",gap:10,marginBottom:24,alignItems:"stretch"}}>
            {latestE?.home!=null&&(()=>{const homes=econData.filter(d=>d.home!=null);const ci=homes.length-1;const mom=ci>=4?homes[ci-4]:null;const yoy=ci>=52?homes[ci-52]:null;return<a href="https://www.zillow.com/research/data/" target="_blank" rel="noopener noreferrer" aria-label="Zillow Research data, opens in new tab" style={{display:"block",textDecoration:"none",color:"inherit",flex:1,minWidth:140}}><KPI label="Avg Home Value" value={f$(latestE.home)} delta={<><Delta c={latestE.home} p={mom?.home}/><span style={{fontSize:10,color:T.dim,marginLeft:4}}>MoM</span>{yoy&&<><span style={{margin:"0 6px",color:T.rule}}>·</span><Delta c={latestE.home} p={yoy.home}/><span style={{fontSize:10,color:T.dim,marginLeft:4}}>YoY</span></>}</>}/></a>;})()}
            {latestE?.home!=null&&(()=>{const homes=econData.filter(d=>d.home!=null);const peak=Math.max(...homes.map(d=>d.home));const diff=latestE.home-peak;return diff!==0?<a href="https://www.zillow.com/research/data/" target="_blank" rel="noopener noreferrer" aria-label="Zillow Research data, opens in new tab" style={{display:"block",textDecoration:"none",color:"inherit",flex:1,minWidth:120}}><StatCard label="From Peak" value={f$(diff)} detail={`peak ${f$(peak)}`} accent={diff<0?T.neg:T.pos}/></a>:null;})()}
            {latestE?.home!=null&&(()=>{const homes=econData.filter(d=>d.home!=null);const idx=homes.findIndex(d=>d===latestE);const ago=homes[idx-12]||homes[0];if(!ago||ago===latestE)return null;const diff=latestE.home-ago.home;const pct=((diff/ago.home)*100).toFixed(1);return<a href="https://www.zillow.com/research/data/" target="_blank" rel="noopener noreferrer" aria-label="Zillow Research data, opens in new tab" style={{display:"block",textDecoration:"none",color:"inherit",flex:1,minWidth:120}}><StatCard label="YoY Change" value={f$(diff)} detail={`${diff>=0?"+":""}${pct}% from ${fMo(ago.date)}`} accent={diff>=0?T.pos:T.neg}/></a>;})()}
            {(priorE?.yoy??latestE?.yoy)!=null&&<KPI label="Year-over-Year" value={(priorE?.yoy??latestE?.yoy)+"%"} delta={<span style={{fontSize:11,color:T.dim}}>home value change</span>}/>}
            {(priorE?.pending??latestE?.pending)!=null&&<KPI label="Days to Pending" value={(priorE?.pending??latestE?.pending)+" days"} delta={<span style={{fontSize:11,color:T.dim}}>median listing</span>}/>}
          </div>
          {econData.filter(d=>d.home!=null).length>=2&&(()=>{const cutoff=new Date();cutoff.setMonth(cutoff.getMonth()-18);const homeData=econData.filter(d=>d.home!=null&&new Date(d.date)>=cutoff);return homeData.length>=2&&(
            <div style={chrt}>
              <div style={ctitle}>Napa County Home Value (ZHVI)</div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={homeData} margin={{top:8,right:16,bottom:4,left:8}}>
                  <defs><linearGradient id="hG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.pos} stopOpacity={0.25}/><stop offset="100%" stopColor={T.pos} stopOpacity={0.02}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.rule} vertical={false}/>
                  <XAxis dataKey="date" tick={{fontSize:9,fill:T.dim}} tickFormatter={fMo} axisLine={false} tickLine={false}/>
                  <YAxis domain={[750000,1000000]} tick={{fontSize:9,fill:T.dim}} tickFormatter={v=>"$"+(v/1000).toFixed(0)+"k"} axisLine={false} tickLine={false} width={50}/>
                  <Tooltip content={<Tip fmt={v=>f$(v)}/>} cursor={{stroke:T.accent,strokeWidth:1,strokeDasharray:"4 4"}}/>
                  <Area type="monotone" dataKey="home" stroke={T.pos} strokeWidth={2.5} fill="url(#hG)" dot={{r:4,fill:T.pos,stroke:"#F5F0E8",strokeWidth:2}} name="ZHVI"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          );})()}
          <div style={{textAlign:"right",marginTop:4}}><a href="https://www.zillow.com/research/data/" target="_blank" rel="noopener noreferrer" aria-label="Zillow Research data, opens in new tab" style={{fontSize:10,color:T.dim,textDecoration:"none"}}>Zillow Research ↗</a></div>
          <div style={ctx}>
            <div style={lbl}>Housing Context</div>
            <p style={{fontSize:14,color:T.muted,lineHeight:1.75,margin:"0 0 10px"}}>The average Napa County home is valued at <span style={{color:T.accent,fontWeight:600}}>{latestE?.home?f$(latestE.home):"—"}</span>.</p>
            <p style={{fontSize:14,color:T.muted,lineHeight:1.75,margin:0}}>Napa's constrained geography — bounded by the Agricultural Preserve and hillside development limits — keeps supply tight even as demand fluctuates with interest rates and wildfire insurance costs.</p>
          </div>
        </>}

        {section==="pulse"&&<>
          <div style={{marginBottom:20}}>
            <h2 style={{fontFamily:"'Libre Baskerville',Georgia,serif",fontSize:"clamp(22px,4vw,32px)",fontWeight:700,color:T.ink2,margin:"0 0 6px"}}>Reader Pulse</h2>
            <p style={{fontSize:17,color:T.muted,margin:0}}>Community intelligence — what Napa Valley readers said across three years of local journalism</p>
          </div>

          <div style={{marginBottom:32}}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:".16em",textTransform:"uppercase",color:T.dim,marginBottom:12,fontFamily:"'Source Sans 3',sans-serif"}}>Search Polls</div>
            <PollSearch />
          </div>

          {pollLoading ? (
            <div style={{fontSize:13,color:T.dim,padding:"16px 0"}}>Loading polls...</div>
          ) : pollData.length === 0 ? (
            <div style={{fontSize:13,color:T.dim,padding:"16px 0"}}>No poll data available.</div>
          ) : (<>
            {/* Engagement header */}
            <div style={{display:"flex",gap:10,marginBottom:24,flexWrap:"wrap"}}>
              <StatCard label="Total Polls" value={pollTotals.count} detail="from NVF articles" accent={T.gold}/>
              <StatCard label="Total Votes" value={fN(pollTotals.votes)} detail={`avg ${Math.round(pollTotals.votes / pollTotals.count)} per poll`}/>
              <StatCard label="Themes" value={pollThemes.length} detail="from database"/>
            </div>

            {/* Theme cards or expanded poll view */}
            {openTheme === null ? (
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
                {pollThemes.map(g => (
                  <div key={g.theme} onClick={() => { setOpenTheme(g.theme); setOpenPoll(null); }}
                    style={{background:T.bg2,border:`1px solid ${T.rule}`,padding:"20px 22px",cursor:"pointer",transition:"box-shadow .15s",boxShadow:"0 1px 3px rgba(44,24,16,0.04)"}}>
                    <div style={{fontSize:11,fontWeight:700,letterSpacing:2,color:T.dim,textTransform:"uppercase",marginBottom:8,fontFamily:"'Source Sans 3',sans-serif"}}>{g.count} poll{g.count!==1?"s":""} · {fN(g.totalVotes)} votes</div>
                    <div style={{fontFamily:"'Libre Baskerville',Georgia,serif",fontSize:18,fontWeight:700,color:T.ink2,marginBottom:8}}>{g.theme}</div>
                    <div style={{fontSize:12,color:T.muted,lineHeight:1.5}}>
                      {g.polls.filter(p => p.question && p.question.trim()).slice(0,2).map((p,i) => (
                        <div key={i} style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>• {p.question}</div>
                      ))}
                      {g.count > 2 && <div style={{color:T.gold,fontWeight:600,marginTop:4}}>+ {g.count - 2} more →</div>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <button onClick={() => { setOpenTheme(null); setOpenPoll(null); }}
                  style={{background:"none",border:`1px solid ${T.rule}`,padding:"8px 18px",fontSize:12,fontWeight:600,color:T.muted,cursor:"pointer",marginBottom:16,fontFamily:"'Source Sans 3',sans-serif"}}>
                  ← All Themes
                </button>
                <h3 style={{fontFamily:"'Libre Baskerville',Georgia,serif",fontSize:22,fontWeight:700,color:T.ink2,margin:"0 0 4px"}}>{openTheme}</h3>
                <p style={{fontSize:12,color:T.dim,margin:"0 0 16px"}}>
                  {pollThemes.find(g=>g.theme===openTheme)?.count || 0} polls · {fN(pollThemes.find(g=>g.theme===openTheme)?.totalVotes || 0)} total votes
                </p>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {(pollThemes.find(g=>g.theme===openTheme)?.polls || []).map(poll => {
                    const isOpen = openPoll === poll.poll_id;
                    const rawOpts = typeof poll.options_json === "string" ? (() => { try { return JSON.parse(poll.options_json); } catch { return []; } })() : poll.options_json;
                    const options = Array.isArray(rawOpts) ? rawOpts : [];
                    const opts = options.filter(o => o && (o.label || o.text));
                    const winner = opts.length > 0 ? opts.reduce((a, b) => (Number(b.votes) || 0) > (Number(a.votes) || 0) ? b : a, opts[0]) : null;
                    const winPct = winner && poll.total_votes > 0 ? Math.round(((Number(winner.votes) || 0) / poll.total_votes) * 100) : 0;
                    const maxVotes = Math.max(...opts.map(o => Number(o.votes) || 0), 1);
                    return (
                      <div key={poll.poll_id} style={{background:T.bg2,border:`1px solid ${T.rule}`,overflow:"hidden"}}>
                        <div onClick={() => setOpenPoll(isOpen ? null : poll.poll_id)}
                          style={{padding:"14px 18px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontFamily:"'Libre Baskerville',Georgia,serif",fontSize:14,fontWeight:700,color:T.ink2,lineHeight:1.4,marginBottom:4}}>{poll.question}</div>
                            {!isOpen && winner && (
                              <div style={{display:"flex",alignItems:"center",gap:8}}>
                                <div style={{flex:1,height:6,background:T.rule,borderRadius:3,overflow:"hidden"}}>
                                  <div style={{height:"100%",width:`${winPct}%`,background:T.accent,borderRadius:3}} />
                                </div>
                                <span style={{fontSize:12,fontWeight:600,color:T.accent,whiteSpace:"nowrap",fontFamily:"'Source Sans 3',sans-serif"}}>{winPct}%</span>
                                <span style={{fontSize:14,color:T.muted,fontFamily:"'Source Sans 3',sans-serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:200}}>{winner.label || winner.text}</span>
                              </div>
                            )}
                            {(()=>{const url=poll.substack_url&&poll.substack_url.trim();return(
                            <div style={{fontSize:14,color:T.dim,marginTop:4,fontFamily:"'Source Sans 3',sans-serif",lineHeight:1.5}}>{fN(poll.total_votes)} votes{poll.theme ? ` · ${poll.theme}` : ""}{poll.post_title && <>{" · from "}{url ? <a href={url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} aria-label={`${poll.post_title}, opens in new tab`} style={{color:T.gold,textDecoration:"none",fontWeight:600}}>{poll.post_title} ↗</a> : <span style={{fontStyle:"italic",color:T.muted}}>{poll.post_title}</span>}</>}{poll.published_at && ` · ${new Date(poll.published_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}`}</div>
                            );})()}
                          </div>
                          <span style={{fontSize:16,color:T.dim,marginLeft:12,transform:isOpen?"rotate(180deg)":"",transition:"transform .2s"}}>▾</span>
                        </div>
                        {isOpen && (
                          <div style={{padding:"0 18px 16px",borderTop:`1px solid ${T.rule}`}}>
                            {opts.map((opt, oi) => {
                              const votes = Number(opt.votes) || 0;
                              const pct = poll.total_votes > 0 ? ((votes / poll.total_votes) * 100) : 0;
                              const isWinner = votes === maxVotes && votes > 0;
                              return (
                                <div key={oi} style={{marginTop:oi===0?14:10}}>
                                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                                    <span style={{fontSize:13,fontWeight:isWinner?700:400,color:isWinner?T.ink2:T.muted,fontFamily:"'Source Sans 3',sans-serif"}}>{opt.text || opt.label}</span>
                                    <span style={{fontSize:12,fontWeight:600,color:isWinner?T.gold:T.dim,fontFamily:"monospace",whiteSpace:"nowrap",marginLeft:8}}>{pct.toFixed(1)}% ({votes})</span>
                                  </div>
                                  <div style={{height:18,background:T.bg,border:`1px solid ${T.rule}`,overflow:"hidden"}}>
                                    <div style={{height:"100%",width:`${pct}%`,background:isWinner?T.gold:T.dim,opacity:isWinner?0.7:0.3,transition:"width .3s ease"}}/>
                                  </div>
                                </div>
                              );
                            })}
                            {poll.published_at && (
                              <div style={{fontSize:10,color:T.dim,marginTop:10,textAlign:"right"}}>
                                Published {fD(poll.published_at.split("T")[0])}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{background:T.bg2,border:`1px solid ${T.rule}`,padding:"12px 18px",marginTop:24}}>
              <span style={{...lbl,display:"inline"}}>Data Source </span>
              <span style={{fontSize:14,color:T.muted}}>Napa Valley Features reader polls · {pollTotals.count} polls · {fN(pollTotals.votes)} total votes</span>
            </div>
          </>)}
        </>}

        <div style={{borderTop:`1px solid ${T.rule}`,paddingTop:16,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8,marginTop:20}}>
          <span style={{fontSize:14,color:T.dim}}>Sources: CA ABC · FRED (BLS) · Zillow Research · CA EDD</span>
          <span style={{fontSize:14,color:T.dim}}>Pipeline: GitHub Actions → Supabase | {wineryData.length} snapshots | {lastUpdated?fD(lastUpdated):""}</span>
        </div>
      </div>
      <Footer />
    </div>
  );
}

