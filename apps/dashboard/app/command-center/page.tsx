"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────
type WinId = "signal" | "briefs" | "feed" | "analytics" | "settings";
type Brief = {
  id: string; type: "alpha"|"content"; status: string;
  conviction: number; window: string; content: string; created_at: string;
  chains?: string[]; signal_summary?: string;
};
interface WinState { id: WinId; open: boolean; z: number; x: number; y: number; min: boolean; }

// ─── Icon SVG ────────────────────────────────────────────────────────────────
function Ic({ d, size=16, stroke=1.5 }: { d:string; size?:number; stroke?:number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d={d}/>
    </svg>
  );
}
const P = {
  zap:      "M13 2 3 14h9l-1 8 10-12h-9l1-8z",
  doc:      "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  chart:    "M18 20V10 M12 20V4 M6 20v-6",
  cog:      "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  globe:    "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
  search:   "M11 17.25a6.25 6.25 0 1 1 0-12.5 6.25 6.25 0 0 1 0 12.5z M16 16l4.5 4.5",
  plus:     "M12 5v14 M5 12h14",
  cpu:      "M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18",
  box:      "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
  radio:    "M5 12.55a11 11 0 0 1 14.08 0 M1.42 9a16 16 0 0 1 21.16 0 M8.53 16.11a6 6 0 0 1 6.95 0 M12 20h.01",
  logout:   "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  close:    "M18 6 6 18 M6 6l12 12",
  minus:    "M5 12h14",
  maximize: "M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3",
  send:     "M22 2 11 13 M22 2 15 22 11 13 2 9l20-7z",
  refresh:  "M1 4v6h6 M23 20v-6h-6 M20.49 9A9 9 0 0 0 5.64 5.64L1 10 M23 14l-4.64 4.36A9 9 0 0 1 3.51 15",
  check:    "M20 6 9 17l-5-5",
  warn:     "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01",
  moon:     "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  sun:      "M12 2v2 M12 20v2 M4.93 4.93l1.41 1.41 M17.66 17.66l1.41 1.41 M2 12h2 M20 12h2 M6.34 17.66l-1.41 1.41 M19.07 4.93l-1.41 1.41 M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
};

// ─── Draggable Window ─────────────────────────────────────────────────────────
function Window({ id, title, win, onFocus, onClose, onMin, children, w=680 }:
  { id:WinId; title:string; win:WinState; onFocus:(id:WinId)=>void;
    onClose:(id:WinId)=>void; onMin:(id:WinId)=>void;
    children:React.ReactNode; w?:number }) {
  const [pos, setPos] = useState({ x: win.x, y: win.y });
  const drag = useRef(false);
  const off  = useRef({ x:0, y:0 });

  const onMD = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button,input,textarea,select,a")) return;
    drag.current = true;
    off.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    onFocus(id); e.preventDefault();
  };
  useEffect(() => {
    const mv = (e: MouseEvent) => {
      if (!drag.current) return;
      setPos({ x: Math.max(0, e.clientX-off.current.x), y: Math.max(0, e.clientY-off.current.y) });
    };
    const up = () => { drag.current = false; };
    window.addEventListener("mousemove", mv);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", mv); window.removeEventListener("mouseup", up); };
  }, []);

  if (!win.open) return null;
  const maxW = typeof window !== "undefined" ? Math.min(w, window.innerWidth - 80) : w;

  return (
    <div onMouseDown={() => onFocus(id)} className="float-window" style={{
      position:"absolute", left:pos.x, top:pos.y, width:maxW, zIndex:win.z,
      border:"1px solid var(--gold-border)", background:"var(--surface)",
      boxShadow:"0 0 0 1px var(--gold-dim), 0 24px 64px rgba(0,0,0,0.5)",
      display:"flex", flexDirection:"column", maxHeight:"calc(100vh - 180px)",
      animation:"fadeIn 0.18s ease",
    }}>
      {/* Title bar */}
      <div onMouseDown={onMD} style={{
        display:"flex", alignItems:"center", gap:8, padding:"8px 12px",
        background:"var(--surface2)", borderBottom:"1px solid var(--gold-border)",
        cursor:"grab", userSelect:"none", flexShrink:0,
      }}>
        <span style={{ color:"var(--gold)", fontSize:8 }}>◆</span>
        <span style={{ fontFamily:"var(--font-mono)", fontSize:"0.6rem", letterSpacing:"0.18em", textTransform:"uppercase", color:"var(--text1)", flex:1 }}>
          {title}
        </span>
        {[
          { icon:P.minus,    fn:()=>onMin(id),   hover:"var(--text3)" },
          { icon:P.maximize, fn:()=>{},           hover:"var(--text3)" },
          { icon:P.close,    fn:()=>onClose(id),  hover:"var(--red)" },
        ].map((b,i)=>(
          <button key={i} type="button" onClick={b.fn} style={{
            width:20, height:20, display:"flex", alignItems:"center", justifyContent:"center",
            background:"transparent", border:"none", cursor:"pointer",
            color:"var(--text4)", transition:"color 0.12s",
          }}
          onMouseEnter={e=>(e.currentTarget.style.color=b.hover)}
          onMouseLeave={e=>(e.currentTarget.style.color="var(--text4)")}>
            <Ic d={b.icon} size={10}/>
          </button>
        ))}
      </div>
      {!win.min && <div style={{ flex:1, overflowY:"auto" }}>{children}</div>}
    </div>
  );
}

// ─── Signal Query Window ──────────────────────────────────────────────────────
function SignalWin({ win, wm }: { win:WinState; wm:WMActions }) {
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<"both"|"alpha"|"content">("both");
  const [loading, setLoading] = useState(false);
  const [alpha, setAlpha] = useState<any>(null);
  const [cont, setCont] = useState<any>(null);
  const [err, setErr] = useState<string|null>(null);
  const [saved, setSaved] = useState(false);

  async function run() {
    if (!q.trim()||loading) return;
    setLoading(true); setErr(null); setAlpha(null); setCont(null); setSaved(false);
    const modes = mode==="both" ? ["alpha","content"] : [mode];
    try {
      const res = await Promise.allSettled(modes.map(m=>
        fetch("/api/generate-brief",{method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({query:q,mode:m})}).then(async r=>{
            const j=await r.json(); if(!r.ok) throw new Error(j.error||`HTTP ${r.status}`); return j;
          })
      ));
      res.forEach((r,i)=>{
        if (r.status==="fulfilled"&&r.value.brief) { modes[i]==="alpha"?setAlpha(r.value.brief):setCont(r.value.brief); }
        else if (r.status==="rejected") setErr(r.reason?.message||"Failed");
      });
    } catch(e:any) { setErr(e.message); } finally { setLoading(false); }
  }

  async function save() {
    for (const [type,brief] of [["alpha",alpha],["content",cont]] as [string,any][]) {
      if (!brief) continue;
      await fetch("/api/briefs",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({type,status:"pending",conviction:brief.conviction,
          window:brief.window,content:JSON.stringify(brief),
          signal_summary:brief.signal_summary||brief.narrative_summary,chains:brief.chains})
      }).catch(()=>{});
    }
    setSaved(true); wm.refresh();
  }

  const wc=(w:string)=>w==="open"?"var(--green)":w==="closing"?"var(--amber)":"var(--text4)";
  const cc=(c:number)=>c>=8?"var(--green)":c>=6?"var(--amber)":"var(--gold)";

  return (
    <Window id="signal" title="Signal Query" win={win} onFocus={wm.focus} onClose={wm.close} onMin={wm.min} w={740}>
      <div style={{padding:16,display:"flex",flexDirection:"column",gap:12}}>

        {/* Mode tabs */}
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <span style={{fontSize:"0.44rem",color:"var(--text4)",letterSpacing:"0.12em",textTransform:"uppercase"}}>Output</span>
          {(["both","alpha","content"] as const).map(m=>(
            <button key={m} type="button" onClick={()=>setMode(m)} style={{
              fontSize:"0.48rem",letterSpacing:"0.08em",textTransform:"uppercase",
              padding:"3px 10px",border:`1px solid ${mode===m?"var(--gold-border)":"var(--border)"}`,
              background:mode===m?"var(--gold-dim)":"transparent",
              color:mode===m?"var(--gold)":"var(--text4)",cursor:"pointer",transition:"all 0.12s",
            }}>
              {m==="both"?"Alpha + Content":m}
            </button>
          ))}
        </div>

        {/* Textarea */}
        <textarea value={q} onChange={e=>setQ(e.target.value)}
          onKeyDown={e=>{if((e.metaKey||e.ctrlKey)&&e.key==="Enter")run();}}
          placeholder={"What do you want intelligence on?\ne.g. \"hottest memecoins on Solana right now\" or \"EigenLayer restaking narrative\""}
          rows={4} style={{
            width:"100%",padding:"10px 12px",resize:"none",outline:"none",
            fontFamily:"var(--font-mono)",fontSize:"0.68rem",lineHeight:1.7,
            background:"rgba(255,255,255,0.02)",border:"1px solid var(--border)",
            color:"var(--text1)",transition:"border-color 0.12s",
          }}
          onFocus={e=>(e.target.style.borderColor="var(--gold-border)")}
          onBlur={e=>(e.target.style.borderColor="var(--border)")}/>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:"0.42rem",color:"var(--text4)"}}>⌘↩ · Live data: Birdeye · CoinGecko · DexScreener</span>
          <button type="button" onClick={run} disabled={loading||!q.trim()} style={{
            fontSize:"0.52rem",letterSpacing:"0.1em",textTransform:"uppercase",
            padding:"8px 20px",display:"flex",alignItems:"center",gap:8,
            background:loading||!q.trim()?"var(--surface2)":"var(--gold)",
            color:loading||!q.trim()?"var(--text4)":"#000",
            border:"none",cursor:loading||!q.trim()?"not-allowed":"pointer",transition:"all 0.12s",fontWeight:600,
          }}>
            {loading?<><Spin/>Generating...</>:<><Ic d={P.zap} size={13}/>Run query</>}
          </button>
        </div>

        {err&&(
          <div style={{padding:"10px 12px",border:"1px solid rgba(239,68,68,0.3)",background:"var(--red-dim)"}}>
            <div style={{display:"flex",gap:8,marginBottom:4}}><Ic d={P.warn} size={13}/><span style={{fontSize:"0.54rem",color:"var(--red)"}}>{err}</span></div>
            <p style={{fontSize:"0.46rem",color:"var(--text4)",lineHeight:1.65}}>
              {err.includes("401")||err.toLowerCase().includes("key")
                ?"→ Check OPENROUTER_API_KEY in your Vercel environment variables."
                :err.includes("table")||err.includes("relation")
                ?"→ Run the SQL schema in Settings → Supabase setup."
                :"→ Check Network tab → /api/generate-brief for full error."}
            </p>
          </div>
        )}

        {(alpha||cont)&&(
          <div style={{display:"grid",gridTemplateColumns:alpha&&cont?"1fr 1fr":"1fr",gap:12}}>
            {alpha&&<BC brief={alpha} type="alpha" wc={wc} cc={cc}/>}
            {cont&&<BC brief={cont} type="content" wc={wc} cc={cc}/>}
          </div>
        )}

        {(alpha||cont)&&(
          <div style={{display:"flex",justifyContent:"flex-end",alignItems:"center",gap:12}}>
            {saved
              ?<span style={{fontSize:"0.5rem",color:"var(--green)",display:"flex",alignItems:"center",gap:6}}><Ic d={P.check} size={12}/>Saved to Briefs</span>
              :<button type="button" onClick={save} style={{
                  fontSize:"0.5rem",letterSpacing:"0.1em",textTransform:"uppercase",
                  padding:"7px 18px",display:"flex",alignItems:"center",gap:8,
                  background:"var(--gold-dim)",color:"var(--gold)",
                  border:"1px solid var(--gold-border)",cursor:"pointer",
                }}>
                <Ic d={P.send} size={12}/>Save to Briefs
              </button>}
          </div>
        )}
      </div>
    </Window>
  );
}

function BC({ brief, type, wc, cc }: { brief:any; type:string; wc:(w:string)=>string; cc:(c:number)=>string }) {
  const isA = type==="alpha";
  const sources:string[] = brief._sources||[];
  return (
    <div style={{border:`1px solid ${isA?"var(--gold-border)":"rgba(34,211,238,0.25)"}`,
      background:isA?"var(--gold-dim)":"var(--cyan-dim)",padding:14}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:10,gap:8,alignItems:"flex-start"}}>
        <span style={{fontSize:"0.5rem",letterSpacing:"0.1em",textTransform:"uppercase",color:isA?"var(--gold)":"var(--cyan)",fontWeight:600}}>
          {isA?"Alpha Brief":"Content Brief"}
        </span>
        <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
          {sources.map(s=>(
            <span key={s} style={{fontSize:"0.4rem",letterSpacing:"0.06em",textTransform:"uppercase",
              padding:"1px 5px",border:"1px solid rgba(52,211,153,0.3)",background:"var(--green-dim)",color:"var(--green)"}}>
              ⚡{s}
            </span>
          ))}
          <span style={{fontSize:"0.44rem",color:wc(brief.window)}}>{brief.window}</span>
          <span style={{fontSize:"0.46rem",fontWeight:700,color:cc(brief.conviction)}}>{brief.conviction}/10</span>
        </div>
      </div>
      <p style={{fontSize:"0.74rem",color:"var(--text2)",lineHeight:1.72,marginBottom:10}}>
        {brief.signal_summary||brief.narrative_summary}
      </p>
      {brief.chains?.length>0&&(
        <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>
          {brief.chains.map((c:string)=>(
            <span key={c} style={{fontSize:"0.44rem",padding:"2px 7px",border:"1px solid rgba(34,211,238,0.25)",background:"var(--cyan-dim)",color:"var(--cyan)"}}>
              {c}
            </span>
          ))}
        </div>
      )}
      {brief.angles?.slice(0,2).map((a:string,i:number)=>(
        <div key={i} style={{display:"flex",gap:8,marginBottom:4}}>
          <span style={{fontSize:"0.42rem",color:"var(--cyan)",flexShrink:0}}>0{i+1}</span>
          <p style={{fontSize:"0.66rem",color:"var(--text3)",lineHeight:1.55}}>{a}</p>
        </div>
      ))}
      {brief.risk_context&&(
        <p style={{fontSize:"0.64rem",color:"var(--amber)",lineHeight:1.5,borderTop:"1px solid rgba(251,191,36,0.15)",paddingTop:8,marginTop:8}}>
          ⚠ {brief.risk_context}
        </p>
      )}
    </div>
  );
}

// ─── Briefs Window ────────────────────────────────────────────────────────────
function BriefsWin({ win, wm, briefs, loading, err }: {
  win:WinState; wm:WMActions; briefs:Brief[]; loading:boolean; err:string|null;
}) {
  const [sel, setSel] = useState<Brief|null>(null);
  const [tab, setTab] = useState<"all"|"pending"|"approved">("all");
  const [upd, setUpd] = useState<string|null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest"|"oldest"|"conviction_hi"|"conviction_lo">("newest");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<string|null>(null);
  const PER_PAGE = 10;

  const wc=(w:string)=>w==="open"?"var(--green)":w==="closing"?"var(--amber)":"var(--text4)";
  const cc=(c:number)=>c>=8?"var(--green)":c>=6?"var(--amber)":"var(--gold)";

  // Filter by tab + search
  let filtered = tab==="all" ? briefs : briefs.filter(b=>b.status===tab);
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(b => {
      let p:any={}; try{p=JSON.parse(b.content);}catch{}
      const text = `${p.signal_summary||""} ${p.narrative_summary||""} ${b.type} ${b.status} ${b.window} ${(b.chains||[]).join(" ")}`.toLowerCase();
      return text.includes(q);
    });
  }
  // Sort
  filtered = [...filtered].sort((a,b) => {
    if (sort==="oldest") return new Date(a.created_at).getTime()-new Date(b.created_at).getTime();
    if (sort==="conviction_hi") return (b.conviction||0)-(a.conviction||0);
    if (sort==="conviction_lo") return (a.conviction||0)-(b.conviction||0);
    return new Date(b.created_at).getTime()-new Date(a.created_at).getTime();
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);
  const pending = briefs.filter(b=>b.status==="pending").length;

  // Reset page when filter/search changes
  const resetPage = () => setPage(1);

  async function upd_(id:string, status:string) {
    setUpd(id);
    await fetch("/api/briefs",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status})}).catch(()=>{});
    wm.refresh(); setSel(prev=>prev?.id===id?{...prev,status}:prev); setUpd(null);
  }

  async function deleteBrief(id:string) {
    setDeleting(id);
    await fetch("/api/briefs",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})}).catch(()=>{});
    if (sel?.id===id) setSel(null);
    wm.refresh(); setDeleting(null);
  }

  return (
    <Window id="briefs" title={pending>0?`Briefs · ${pending} pending`:"Briefs"}
      win={win} onFocus={wm.focus} onClose={wm.close} onMin={wm.min} w={860}>
      <div style={{display:"flex",height:"100%",minHeight:480}}>
        {/* List */}
        <div style={{width:"54%",borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column"}}>

          {/* Tabs + refresh */}
          <div style={{display:"flex",borderBottom:"1px solid var(--border)",flexShrink:0}}>
            {(["all","pending","approved"] as const).map(t=>(
              <button key={t} type="button" onClick={()=>{setTab(t);resetPage();}} style={{
                fontSize:"0.46rem",letterSpacing:"0.08em",textTransform:"uppercase",
                padding:"7px 12px",background:"transparent",border:"none",cursor:"pointer",
                borderBottom:`2px solid ${tab===t?"var(--gold)":"transparent"}`,
                color:tab===t?"var(--text1)":"var(--text4)",transition:"all 0.12s",
              }}>{t}</button>
            ))}
            <div style={{flex:1}}/>
            <button type="button" onClick={wm.refresh} title="Refresh" style={{
              background:"transparent",border:"none",cursor:"pointer",
              color:"var(--text4)",padding:"7px 10px",display:"flex",alignItems:"center",
            }} onMouseEnter={e=>(e.currentTarget.style.color="var(--gold)")}
               onMouseLeave={e=>(e.currentTarget.style.color="var(--text4)")}>
              <Ic d={P.refresh} size={12}/>
            </button>
          </div>

          {/* Search + sort bar */}
          <div style={{display:"flex",gap:6,padding:"8px 10px",borderBottom:"1px solid var(--border)",flexShrink:0,background:"var(--surface)"}}>
            <div style={{flex:1,display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.03)",border:"1px solid var(--border)",padding:"5px 8px"}}>
              <Ic d={P.search} size={11}/>
              <input
                type="text" value={search}
                onChange={e=>{setSearch(e.target.value);resetPage();}}
                placeholder="Search briefs..."
                style={{background:"transparent",border:"none",outline:"none",fontSize:"0.58rem",
                  color:"var(--text1)",width:"100%",fontFamily:"var(--font-mono)"}}/>
              {search&&<button type="button" onClick={()=>{setSearch("");resetPage();}}
                style={{background:"none",border:"none",cursor:"pointer",color:"var(--text4)",fontSize:"0.7rem",lineHeight:1,padding:0}}>×</button>}
            </div>
            <select value={sort} onChange={e=>{setSort(e.target.value as typeof sort);resetPage();}}
              style={{background:"var(--surface2)",border:"1px solid var(--border)",color:"var(--text3)",
                fontSize:"0.48rem",padding:"4px 6px",outline:"none",cursor:"pointer",fontFamily:"var(--font-mono)"}}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="conviction_hi">Score ↓</option>
              <option value="conviction_lo">Score ↑</option>
            </select>
          </div>

          {/* Error */}
          {err&&(
            <div style={{padding:"7px 12px",borderBottom:"1px solid rgba(239,68,68,0.2)",background:"var(--red-dim)",flexShrink:0}}>
              <p style={{fontSize:"0.46rem",color:"var(--red)"}}>{err}</p>
              <p style={{fontSize:"0.4rem",color:"var(--text4)",marginTop:2}}>Run SQL schema in Settings. Check env vars.</p>
            </div>
          )}

          {/* List */}
          <div style={{flex:1,overflowY:"auto"}}>
            {loading ? (
              <div style={{padding:40,textAlign:"center"}}><Spin/></div>
            ) : paginated.length===0 ? (
              <div style={{padding:"40px 16px",textAlign:"center"}}>
                <p style={{fontSize:"0.5rem",color:"var(--text4)"}}>
                  {search ? `No briefs matching "${search}"` : tab!=="all" ? `No ${tab} briefs` : "No briefs yet"}
                </p>
                {!search&&tab==="all"&&<p style={{fontSize:"0.44rem",color:"var(--text4)",marginTop:4}}>Run a signal query and save to generate briefs.</p>}
              </div>
            ) : (
              paginated.map(b=>{
                let p:any={}; try{p=JSON.parse(b.content);}catch{}
                const isSel=sel?.id===b.id;
                return (
                  <div key={b.id}
                    style={{padding:"8px 12px",display:"flex",alignItems:"flex-start",gap:8,
                      borderBottom:"1px solid var(--border)",
                      background:isSel?"var(--gold-dim)":"transparent",transition:"background 0.12s",
                      cursor:"pointer"}}
                    onClick={()=>setSel(isSel?null:b)}
                    onMouseEnter={e=>{if(!isSel)e.currentTarget.style.background="rgba(255,255,255,0.02)";}}
                    onMouseLeave={e=>{if(!isSel)e.currentTarget.style.background="transparent";}}>
                    <span style={{
                      fontSize:"0.4rem",letterSpacing:"0.06em",textTransform:"uppercase",
                      padding:"2px 5px",flexShrink:0,marginTop:2,fontWeight:600,
                      border:`1px solid ${b.type==="alpha"?"var(--gold-border)":"rgba(34,211,238,0.25)"}`,
                      background:b.type==="alpha"?"var(--gold-dim)":"var(--cyan-dim)",
                      color:b.type==="alpha"?"var(--gold)":"var(--cyan)",
                    }}>{b.type}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:"0.69rem",color:"var(--text1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {p.signal_summary||p.narrative_summary||"Brief"}
                      </p>
                      <div style={{display:"flex",gap:6,marginTop:2,flexWrap:"wrap"}}>
                        <span style={{fontSize:"0.4rem",color:wc(b.window)}}>{b.window}</span>
                        <span style={{fontSize:"0.4rem",color:"var(--text4)"}}>·</span>
                        <span style={{fontSize:"0.4rem",color:cc(b.conviction),fontWeight:600}}>{b.conviction}/10</span>
                        <span style={{fontSize:"0.4rem",color:"var(--text4)"}}>·</span>
                        <span style={{fontSize:"0.4rem",color:b.status==="approved"?"var(--green)":b.status==="pending"?"var(--amber)":"var(--text4)"}}>
                          {b.status}
                        </span>
                        <span style={{fontSize:"0.4rem",color:"var(--text4)"}}>·</span>
                        <span style={{fontSize:"0.4rem",color:"var(--text4)"}}>{new Date(b.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {/* Delete button */}
                    <button type="button"
                      onClick={e=>{e.stopPropagation();deleteBrief(b.id);}}
                      disabled={deleting===b.id}
                      title="Delete brief"
                      style={{background:"transparent",border:"none",cursor:"pointer",
                        color:"var(--text4)",padding:"2px 4px",flexShrink:0,opacity:deleting===b.id?0.4:1,
                        transition:"color 0.12s"}}
                      onMouseEnter={e=>(e.currentTarget.style.color="var(--red)")}
                      onMouseLeave={e=>(e.currentTarget.style.color="var(--text4)")}>
                      <Ic d={P.close} size={10}/>
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
              padding:"8px 12px",borderTop:"1px solid var(--border)",background:"var(--surface)",flexShrink:0}}>
              <button type="button" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
                style={{fontSize:"0.46rem",letterSpacing:"0.06em",textTransform:"uppercase",
                  padding:"4px 10px",background:"transparent",border:"1px solid var(--border)",
                  color:page===1?"var(--text4)":"var(--text2)",cursor:page===1?"not-allowed":"pointer"}}>
                ← Prev
              </button>
              <span style={{fontSize:"0.44rem",color:"var(--text4)"}}>
                Page {page} of {totalPages} · {filtered.length} brief{filtered.length!==1?"s":""}
              </span>
              <button type="button" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
                style={{fontSize:"0.46rem",letterSpacing:"0.06em",textTransform:"uppercase",
                  padding:"4px 10px",background:"transparent",border:"1px solid var(--border)",
                  color:page===totalPages?"var(--text4)":"var(--text2)",cursor:page===totalPages?"not-allowed":"pointer"}}>
                Next →
              </button>
            </div>
          )}
        </div>
        {/* Detail */}
        <div style={{flex:1,display:"flex",flexDirection:"column"}}>
          {sel ? (()=>{
            let p:any={}; try{p=JSON.parse(sel.content);}catch{}
            const sources:string[]=p._sources||[];
            return (<>
              <div style={{flex:1,overflowY:"auto",padding:14,display:"flex",flexDirection:"column",gap:12}}>
                {sources.length>0&&(
                  <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                    {sources.map(s=>(
                      <span key={s} style={{fontSize:"0.4rem",letterSpacing:"0.06em",textTransform:"uppercase",
                        padding:"1px 5px",border:"1px solid rgba(52,211,153,0.3)",background:"var(--green-dim)",color:"var(--green)"}}>
                        ⚡{s} live
                      </span>
                    ))}
                  </div>
                )}
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{fontSize:"0.44rem",textTransform:"uppercase",letterSpacing:"0.12em",color:"var(--text4)"}}>Conviction</span>
                    <span style={{fontSize:"0.54rem",fontWeight:700,color:sel.conviction>=8?"var(--green)":sel.conviction>=6?"var(--amber)":"var(--gold)"}}>{sel.conviction}/10</span>
                  </div>
                  <div style={{height:2,background:"var(--surface3)",borderRadius:2,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${sel.conviction*10}%`,transition:"width 0.4s ease",
                      background:sel.conviction>=8?"var(--green)":sel.conviction>=6?"var(--amber)":"var(--gold)"}}/>
                  </div>
                </div>
                {[
                  {l:"Signal",v:p.signal_summary},{l:"Narrative",v:p.narrative_summary},
                  {l:"Cross-chain",v:p.cross_chain_map},{l:"Reasoning",v:p.conviction_reasoning},
                  {l:"Audience",v:p.audience_framing},
                ].filter(r=>r.v).map(row=>(
                  <div key={row.l}>
                    <p style={{fontSize:"0.44rem",textTransform:"uppercase",letterSpacing:"0.1em",color:"var(--text4)",marginBottom:4}}>{row.l}</p>
                    <p style={{fontSize:"0.72rem",color:"var(--text2)",lineHeight:1.72}}>{row.v}</p>
                  </div>
                ))}
                {p.risk_context&&(
                  <div style={{borderTop:"1px solid var(--border)",paddingTop:10}}>
                    <p style={{fontSize:"0.44rem",textTransform:"uppercase",letterSpacing:"0.1em",color:"var(--amber)",marginBottom:4}}>⚠ Risk</p>
                    <p style={{fontSize:"0.72rem",color:"var(--amber)",lineHeight:1.72,opacity:0.85}}>{p.risk_context}</p>
                  </div>
                )}
                {p.chains?.length>0&&(
                  <div>
                    <p style={{fontSize:"0.44rem",textTransform:"uppercase",color:"var(--text4)",marginBottom:6}}>Chains</p>
                    <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                      {p.chains.map((c:string)=>(
                        <span key={c} style={{fontSize:"0.46rem",padding:"2px 7px",border:"1px solid rgba(34,211,238,0.25)",background:"var(--cyan-dim)",color:"var(--cyan)"}}>{c}</span>
                      ))}
                    </div>
                  </div>
                )}
                {p.angles?.length>0&&(
                  <div>
                    <p style={{fontSize:"0.44rem",textTransform:"uppercase",color:"var(--text4)",marginBottom:6}}>Angles</p>
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {p.angles.map((a:string,i:number)=>(
                        <div key={i} style={{display:"flex",gap:8,padding:"8px 10px",border:"1px solid var(--border)",background:"rgba(255,255,255,0.02)"}}>
                          <span style={{fontSize:"0.42rem",color:"var(--cyan)",flexShrink:0}}>0{i+1}</span>
                          <p style={{fontSize:"0.7rem",color:"var(--text2)",lineHeight:1.6}}>{a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {p.social_lag_hours!=null&&(
                  <div style={{display:"flex",justifyContent:"space-between",paddingTop:10,borderTop:"1px solid var(--border)"}}>
                    <span style={{fontSize:"0.44rem",color:"var(--text4)"}}>Social lag</span>
                    <span style={{fontSize:"0.52rem",color:"var(--green)",fontWeight:700}}>{p.social_lag_hours}h ahead</span>
                  </div>
                )}
              </div>
              {sel.status==="pending"&&(
                <div style={{padding:"10px 14px",borderTop:"1px solid var(--border)",display:"flex",gap:8,flexShrink:0,background:"var(--surface)"}}>
                  <button type="button" onClick={()=>upd_(sel.id,"approved")} disabled={!!upd} style={{
                    flex:1,fontSize:"0.5rem",letterSpacing:"0.08em",textTransform:"uppercase",
                    padding:9,background:"var(--green-dim)",color:"var(--green)",
                    border:"1px solid rgba(52,211,153,0.25)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,
                  }}><Ic d={P.check} size={12}/>{upd===sel.id?"Saving...":"Approve"}</button>
                  <button type="button" onClick={()=>upd_(sel.id,"archived")} disabled={!!upd} style={{
                    fontSize:"0.5rem",letterSpacing:"0.08em",textTransform:"uppercase",
                    padding:"9px 14px",background:"transparent",color:"var(--text4)",
                    border:"1px solid var(--border)",cursor:"pointer",
                  }}>Archive</button>
                </div>
              )}
              {sel.status==="approved"&&(
                <div style={{padding:"10px 14px",borderTop:"1px solid var(--border)",background:"var(--green-dim)"}}>
                  <p style={{fontSize:"0.48rem",color:"var(--green)",display:"flex",alignItems:"center",gap:6}}>
                    <Ic d={P.check} size={12}/>Approved
                  </p>
                </div>
              )}
            </>);
          })() : (
            <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <p style={{fontSize:"0.48rem",color:"var(--text4)"}}>Select a brief to review</p>
            </div>
          )}
        </div>
      </div>
    </Window>
  );
}

// ─── Analytics Window ─────────────────────────────────────────────────────────
function AnalyticsWin({ win, wm, briefs, loading }: { win:WinState; wm:WMActions; briefs:Brief[]; loading:boolean }) {
  const total=briefs.length, alpha=briefs.filter(b=>b.type==="alpha").length,
    content=briefs.filter(b=>b.type==="content").length,
    approved=briefs.filter(b=>b.status==="approved").length,
    avgConv=total?(briefs.reduce((s,b)=>s+(b.conviction||0),0)/total).toFixed(1):"—",
    openW=briefs.filter(b=>b.window==="open").length;
  return (
    <Window id="analytics" title="Analytics" win={win} onFocus={wm.focus} onClose={wm.close} onMin={wm.min} w={520}>
      <div style={{padding:16}}>
        {loading?<div style={{padding:40,textAlign:"center"}}><Spin/></div>:total===0?(
          <div style={{padding:"48px 0",textAlign:"center"}}>
            <p style={{fontSize:"0.5rem",color:"var(--text4)"}}>No data yet.</p>
            <p style={{fontSize:"0.44rem",color:"var(--text4)",marginTop:4}}>Generate and save briefs to see analytics.</p>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {[
                {l:"Total",v:total,c:"var(--text1)"},{l:"Alpha",v:alpha,c:"var(--gold)"},
                {l:"Content",v:content,c:"var(--cyan)"},{l:"Approved",v:approved,c:"var(--green)"},
                {l:"Avg score",v:`${avgConv}/10`,c:"var(--amber)"},{l:"Open windows",v:openW,c:"var(--green)"},
              ].map(s=>(
                <div key={s.l} style={{padding:"14px 12px",border:"1px solid var(--border)",background:"var(--surface)",textAlign:"center"}}>
                  <div style={{fontSize:"1.6rem",fontWeight:700,lineHeight:1,marginBottom:4,color:s.c}}>{s.v}</div>
                  <div style={{fontSize:"0.42rem",textTransform:"uppercase",letterSpacing:"0.1em",color:"var(--text4)"}}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{padding:14,border:"1px solid var(--border)",background:"var(--surface)"}}>
              <p style={{fontSize:"0.44rem",textTransform:"uppercase",color:"var(--text4)",marginBottom:10}}>Alpha vs content</p>
              <div style={{height:6,background:"var(--surface3)",borderRadius:2,overflow:"hidden",display:"flex"}}>
                <div style={{width:`${total?(alpha/total)*100:50}%`,background:"var(--gold)",opacity:0.8}}/>
                <div style={{flex:1,background:"var(--cyan)",opacity:0.8}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
                <span style={{fontSize:"0.44rem",color:"var(--gold)"}}>Alpha {alpha}</span>
                <span style={{fontSize:"0.44rem",color:"var(--cyan)"}}>Content {content}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Window>
  );
}

// ─── Settings Window ──────────────────────────────────────────────────────────
function SettingsWin({ win, wm }: { win:WinState; wm:WMActions }) {
  const [focus,setFocus]=useState("");const [minC,setMinC]=useState(7);
  const [ecos,setEcos]=useState(["ETH","SOL","BASE","ARB"]);const [voice,setVoice]=useState("");
  const [newE,setNewE]=useState(""); const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false); const [inited,setInited]=useState(false);
  useEffect(()=>{
    if(!win.open||inited) return; setInited(true);
    fetch("/api/settings").then(r=>r.json()).then(({settings:s})=>{
      if(s){setFocus(s.focus_area||"");setMinC(s.min_conviction||7);
        setEcos(s.ecosystems||["ETH","SOL","BASE","ARB"]);setVoice(s.creator_voice||"");}
    }).catch(()=>{});
  },[win.open,inited]);
  async function save(){
    setSaving(true);setSaved(false);
    await fetch("/api/settings",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({focus_area:focus,min_conviction:minC,ecosystems:ecos,creator_voice:voice,output_type:"both"})
    }).catch(()=>{});
    setSaving(false);setSaved(true);setTimeout(()=>setSaved(false),3000);
  }
  const inp:React.CSSProperties={width:"100%",padding:"8px 10px",fontFamily:"var(--font-mono)",fontSize:"0.66rem",
    background:"rgba(255,255,255,0.02)",border:"1px solid var(--border)",color:"var(--text1)",outline:"none",transition:"border-color 0.12s"};
  const onF=(e:React.FocusEvent<any>)=>(e.target.style.borderColor="var(--gold-border)");
  const onB=(e:React.FocusEvent<any>)=>(e.target.style.borderColor="var(--border)");
  return (
    <Window id="settings" title="Settings" win={win} onFocus={wm.focus} onClose={wm.close} onMin={wm.min} w={540}>
      <div style={{padding:16,display:"flex",flexDirection:"column",gap:16}}>
        <SF label="Focus area" hint="Shapes which signals score higher">
          <input type="text" value={focus} onChange={e=>setFocus(e.target.value)} placeholder="e.g. DeFi, restaking, memecoins" style={inp} onFocus={onF} onBlur={onB}/>
        </SF>
        <SF label={`Min conviction: ${minC}/10`} hint="Signals below this are filtered">
          <input type="range" min={1} max={10} step={1} value={minC} onChange={e=>setMinC(Number(e.target.value))} style={{width:"100%",accentColor:"var(--gold)"}}/>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
            <span style={{fontSize:"0.4rem",color:"var(--text4)"}}>1 — any</span>
            <span style={{fontSize:"0.4rem",color:"var(--text4)"}}>10 — highest only</span>
          </div>
        </SF>
        <SF label="Ecosystem watchlist" hint="Scanner prioritises these chains">
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
            {ecos.map(e=>(
              <span key={e} style={{display:"flex",alignItems:"center",gap:4,fontSize:"0.46rem",padding:"3px 7px",
                border:"1px solid var(--gold-border)",background:"var(--gold-dim)",color:"var(--gold)"}}>
                {e}<button type="button" onClick={()=>setEcos(p=>p.filter(x=>x!==e))}
                  style={{background:"none",border:"none",cursor:"pointer",color:"var(--text4)",fontSize:"0.7rem",padding:0,lineHeight:1}}>×</button>
              </span>
            ))}
          </div>
          <div style={{display:"flex",gap:6}}>
            <input type="text" value={newE} onChange={e=>setNewE(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&newE.trim()){setEcos(p=>[...p,newE.trim().toUpperCase()]);setNewE("");}}}
              placeholder="Add chain — Enter" style={{...inp,flex:1}} onFocus={onF} onBlur={onB}/>
          </div>
        </SF>
        <SF label="Creator voice" hint="Shapes content brief angles and framing">
          <textarea value={voice} onChange={e=>setVoice(e.target.value)} rows={3}
            placeholder="Describe your tone, audience..." style={{...inp,resize:"none",lineHeight:1.6}} onFocus={onF} onBlur={onB}/>
        </SF>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          {saved&&<span style={{fontSize:"0.48rem",color:"var(--green)",display:"flex",alignItems:"center",gap:6}}><Ic d={P.check} size={11}/>Saved</span>}
          <div style={{marginLeft:"auto"}}>
            <button type="button" onClick={save} disabled={saving} style={{
              fontSize:"0.52rem",letterSpacing:"0.1em",textTransform:"uppercase",
              padding:"9px 22px",background:saving?"var(--surface2)":"var(--gold)",
              color:saving?"var(--text4)":"#000",border:"none",cursor:saving?"not-allowed":"pointer",fontWeight:700,
            }}>{saving?"Saving...":"Save settings"}</button>
          </div>
        </div>
        <details style={{border:"1px solid var(--border)"}}>
          <summary style={{padding:"8px 12px",fontSize:"0.48rem",textTransform:"uppercase",color:"var(--text4)",cursor:"pointer"}}>
            Supabase setup SQL
          </summary>
          <pre style={{padding:12,fontSize:"0.52rem",color:"var(--text3)",lineHeight:1.7,overflow:"auto",userSelect:"all",background:"rgba(255,255,255,0.01)"}}>
{`create table if not exists briefs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  type text not null, status text default 'pending',
  conviction int, signal_window text,
  content text, signal_summary text, chains text[]
);
create table if not exists settings (
  id uuid default gen_random_uuid() primary key,
  output_type text default 'both', focus_area text,
  min_conviction int default 7,
  ecosystems text[] default array['ETH','SOL','BASE','ARB'],
  creator_voice text
);
alter table briefs disable row level security;
alter table settings disable row level security;`}
          </pre>
        </details>
      </div>
    </Window>
  );
}

function SF({label,hint,children}:{label:string;hint:string;children:React.ReactNode}) {
  return (
    <div>
      <p style={{fontSize:"0.48rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--text3)",marginBottom:3}}>{label}</p>
      <p style={{fontSize:"0.42rem",color:"var(--text4)",marginBottom:8}}>{hint}</p>
      {children}
    </div>
  );
}

// ─── Feed Window ──────────────────────────────────────────────────────────────
function FeedWin({ win, wm, briefs }: { win:WinState; wm:WMActions; briefs:Brief[] }) {
  return (
    <Window id="feed" title="Signal Feed" win={win} onFocus={wm.focus} onClose={wm.close} onMin={wm.min} w={460}>
      <div style={{padding:14}}>
        {briefs.length===0?(
          <div style={{padding:"48px 0",textAlign:"center"}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:"var(--gold)",animation:"blink 1.5s ease infinite",display:"inline-block",marginBottom:12}}/>
            <p style={{fontSize:"0.5rem",color:"var(--text4)"}}>No briefs yet</p>
            <p style={{fontSize:"0.44rem",color:"var(--text4)",marginTop:4}}>Run a query and save to populate the feed.</p>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {briefs.slice(0,10).map(b=>{
              let p:any={}; try{p=JSON.parse(b.content);}catch{}
              return (
                <div key={b.id} style={{display:"flex",gap:10,padding:"10px 12px",border:"1px solid var(--border)",background:"var(--surface)"}}>
                  <span style={{width:5,height:5,borderRadius:"50%",flexShrink:0,marginTop:5,
                    background:b.type==="alpha"?"var(--gold)":"var(--cyan)",animation:"blink 2s ease infinite",display:"inline-block"}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",gap:8,marginBottom:3,alignItems:"center"}}>
                      <span style={{fontSize:"0.44rem",textTransform:"uppercase",color:b.type==="alpha"?"var(--gold)":"var(--cyan)",fontWeight:600}}>{b.type}</span>
                      <span style={{fontSize:"0.42rem",color:b.window==="open"?"var(--green)":b.window==="closing"?"var(--amber)":"var(--text4)"}}>{b.window}</span>
                      <span style={{fontSize:"0.42rem",color:"var(--text4)",marginLeft:"auto"}}>{b.conviction}/10</span>
                    </div>
                    <p style={{fontSize:"0.7rem",color:"var(--text2)",lineHeight:1.55,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>
                      {p.signal_summary||p.narrative_summary}
                    </p>
                    <p style={{fontSize:"0.4rem",color:"var(--text4)",marginTop:4}}>{new Date(b.created_at).toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Window>
  );
}

// ─── Micro ────────────────────────────────────────────────────────────────────
function Spin() {
  return <span style={{width:12,height:12,border:"1.5px solid currentColor",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"inline-block",flexShrink:0}}/>;
}
function Clock() {
  const [t,setT]=useState("");
  useEffect(()=>{
    const tick=()=>setT(new Date().toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit",hour12:false}));
    tick(); const id=setInterval(tick,10000); return()=>clearInterval(id);
  },[]);
  return (
    <div>
      <div style={{fontSize:"0.9rem",fontWeight:700,color:"var(--text2)",letterSpacing:"0.04em"}}>{t}</div>
      <div style={{fontSize:"0.38rem",color:"var(--text4)",letterSpacing:"0.08em"}}>
        {new Date().toLocaleDateString("en",{month:"2-digit",day:"2-digit",year:"numeric"})}
      </div>
    </div>
  );
}

// ─── WM ───────────────────────────────────────────────────────────────────────
interface WMActions { focus:(id:WinId)=>void; close:(id:WinId)=>void; min:(id:WinId)=>void; refresh:()=>void; }

// ─── Sidebar nav ─────────────────────────────────────────────────────────────
const SIDE_TOP = [
  { id:"signal"    as WinId, icon:P.zap,      label:"Signal Query"  },
  { id:"briefs"    as WinId, icon:P.doc,      label:"Briefs"        },
  { id:"feed"      as WinId, icon:P.activity, label:"Signal Feed"   },
  { id:"analytics" as WinId, icon:P.chart,    label:"Analytics"     },
];
const SIDE_BOTTOM = [
  { icon:P.globe,  label:"Narratives"    },
  { icon:P.cpu,    label:"Cross-chain"   },
  { icon:P.box,    label:"Signal Memory" },
  { icon:P.radio,  label:"On-chain RPC"  },
  { icon:P.cog,    label:"Settings",     id:"settings" as WinId },
];
const TOOLBAR = [
  { id:"signal"    as WinId, icon:P.zap,      label:"Signal"   },
  { id:"briefs"    as WinId, icon:P.doc,      label:"Briefs"   },
  { id:"feed"      as WinId, icon:P.activity, label:"Feed"     },
  { id:"analytics" as WinId, icon:P.chart,    label:"Analytics"},
  { id:"settings"  as WinId, icon:P.cog,      label:"Settings" },
];

const INIT:Record<WinId,{x:number;y:number}> = {
  signal:{x:110,y:60}, briefs:{x:130,y:72}, feed:{x:150,y:66},
  analytics:{x:140,y:78}, settings:{x:120,y:70},
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CommandCenter() {
  const [sideExpanded, setSideExpanded] = useState(false);
  const [theme, setTheme] = useState<"dark"|"light">("dark");
  const [zTop, setZTop] = useState(100);
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [briefsLoading, setBriefsLoading] = useState(true);
  const [briefsErr, setBriefsErr] = useState<string|null>(null);
  const [wins, setWins] = useState<Record<WinId,WinState>>(()=>{
    const ids:WinId[]=["signal","briefs","feed","analytics","settings"];
    return Object.fromEntries(ids.map((id,i)=>[id,{id,open:false,z:100+i,...INIT[id],min:false}])) as Record<WinId,WinState>;
  });

  const refresh = useCallback(async()=>{
    setBriefsLoading(true); setBriefsErr(null);
    try {
      const r=await fetch("/api/briefs"); if(!r.ok) throw new Error(`HTTP ${r.status}`);
      const {briefs:d,error:e}=await r.json(); if(e) throw new Error(e);
      setBriefs(d||[]);
    } catch(e:any){setBriefsErr(e.message);setBriefs([]);}
    finally{setBriefsLoading(false);}
  },[]);

  useEffect(()=>{refresh();},[refresh]);



  const focus=useCallback((id:WinId)=>{
    setZTop(z=>{const n=z+1;setWins(p=>({...p,[id]:{...p[id],z:n}}));return n;});
  },[]);
  const open=useCallback((id:WinId)=>{
    setZTop(z=>{const n=z+1;setWins(p=>({...p,[id]:{...p[id],open:true,min:false,z:n}}));return n;});
  },[]);
  const close=useCallback((id:WinId)=>{setWins(p=>({...p,[id]:{...p[id],open:false}}));},[]);
  const min=useCallback((id:WinId)=>{setWins(p=>({...p,[id]:{...p[id],min:!p[id].min}}));},[]);
  const toggle=useCallback((id:WinId)=>{wins[id].open?close(id):open(id);},[wins,open,close]);

  // ⌘K — open briefs window
  useEffect(()=>{
    const handler=(e:KeyboardEvent)=>{
      if((e.metaKey||e.ctrlKey)&&e.key==="k"){e.preventDefault();open("briefs");}
    };
    window.addEventListener("keydown",handler);
    return()=>window.removeEventListener("keydown",handler);
  },[open]);

  const wm:WMActions={focus,close,min,refresh};

  const openCount=Object.values(wins).filter(w=>w.open).length;
  const pendingCount=briefs.filter(b=>b.status==="pending").length;

  function toggleTheme(){
    const n=theme==="dark"?"light":"dark";
    setTheme(n);
    document.documentElement.setAttribute("data-theme", n);
    localStorage.setItem("vc-theme", n);
  }

  // Sidebar button
  const SBtn=({id,icon,label,disabled=false,badge=null}:{id:WinId;icon:string;label:string;disabled?:boolean;badge?:number|null})=>{
    const isOpen=wins[id].open;
    return (
      <button type="button" title={label} disabled={disabled} onClick={()=>!disabled&&toggle(id)} style={{
        width:"100%",display:"flex",alignItems:"center",
        gap:sideExpanded?10:0,justifyContent:sideExpanded?"flex-start":"center",
        padding:sideExpanded?"9px 16px":"11px 0",
        background:isOpen?"var(--gold-dim)":"transparent",
        border:"none",borderLeft:`2px solid ${isOpen?"var(--gold)":"transparent"}`,
        cursor:disabled?"not-allowed":"pointer",
        color:isOpen?"var(--gold)":disabled?"var(--text4)":"var(--text4)",
        transition:"all 0.15s",position:"relative",
      }}
      onMouseEnter={e=>{if(!disabled&&!isOpen)e.currentTarget.style.color="var(--text2)";}}
      onMouseLeave={e=>{if(!isOpen)e.currentTarget.style.color=disabled?"var(--text4)":"var(--text4)";}}>
        <div style={{position:"relative",flexShrink:0}}>
          <Ic d={icon} size={16}/>
          {badge!=null&&badge>0&&!sideExpanded&&(
            <span style={{position:"absolute",top:-4,right:-4,width:14,height:14,borderRadius:"50%",
              background:"var(--gold)",color:"#000",fontSize:"0.38rem",fontWeight:700,
              display:"flex",alignItems:"center",justifyContent:"center"}}>{badge}</span>
          )}
        </div>
        {sideExpanded&&<span style={{fontSize:"0.56rem",letterSpacing:"0.08em",textTransform:"uppercase",flex:1,whiteSpace:"nowrap",textAlign:"left"}}>{label}</span>}
        {sideExpanded&&badge!=null&&badge>0&&(
          <span style={{fontSize:"0.44rem",padding:"1px 6px",borderRadius:10,background:"var(--gold)",color:"#000",fontWeight:700}}>{badge}</span>
        )}
        {sideExpanded&&disabled&&<span style={{fontSize:"0.38rem",padding:"1px 5px",border:"1px solid var(--border)",color:"var(--text4)"}}>soon</span>}
      </button>
    );
  };

  return (
    <div style={{width:"100vw",height:"100vh",overflow:"hidden",display:"flex",background:"var(--bg)",position:"relative"}}
      className="dashboard-root">

      {/* Grid background */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,
        backgroundImage:"linear-gradient(var(--gold-dim) 1px,transparent 1px),linear-gradient(90deg,var(--gold-dim) 1px,transparent 1px)",
        backgroundSize:"48px 48px",opacity:0.5}}/>

      {/* ── Sidebar ── (hidden on mobile, shown md+) */}
      <div style={{
        width:sideExpanded?280:64,flexShrink:0,zIndex:300,
        background:"var(--surface)",borderRight:"1px solid var(--gold-border)",
        display:"flex",flexDirection:"column",
        transition:"width 0.22s cubic-bezier(0.4,0,0.2,1)",overflow:"hidden",
      }}
      className="sidebar-desktop">
        {/* Top: hamburger + collapse label */}
        <div style={{height:52,flexShrink:0,display:"flex",alignItems:"center",
          padding:sideExpanded?"0 16px":"0",justifyContent:sideExpanded?"space-between":"center",
          borderBottom:"1px solid var(--gold-border)"}}>
          <button type="button" onClick={()=>setSideExpanded(o=>!o)} style={{
            background:"transparent",border:"none",cursor:"pointer",
            color:"var(--text3)",display:"flex",alignItems:"center",gap:8,padding:"4px 8px",
            transition:"color 0.12s",
          }}
          onMouseEnter={e=>(e.currentTarget.style.color="var(--gold)")}
          onMouseLeave={e=>(e.currentTarget.style.color="var(--text3)")}>
            <Ic d="M3 12h18M3 6h18M3 18h18" size={16}/>
            {sideExpanded&&<span style={{fontSize:"0.52rem",letterSpacing:"0.16em",textTransform:"uppercase",color:"var(--text3)"}}>COLLAPSE</span>}
          </button>
        </div>

        {/* Nav items */}
        <nav style={{flex:1,overflowY:"auto",padding:"12px 0"}}>
          {sideExpanded&&<div style={{padding:"4px 16px 6px",fontSize:"0.4rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--text4)"}}>Intelligence</div>}
          {SIDE_TOP.map(n=>(
            <SBtn key={n.id} id={n.id} icon={n.icon} label={n.label}
              badge={n.id==="briefs"?pendingCount:n.id==="feed"?briefs.length:null}/>
          ))}
          {sideExpanded&&<div style={{height:1,background:"var(--border)",margin:"10px 0"}}/>}
          {sideExpanded&&<div style={{padding:"0 16px 6px",fontSize:"0.4rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--text4)"}}>Coming soon</div>}
          {!sideExpanded&&<div style={{height:1,background:"var(--border)",margin:"8px 12px"}}/>}
          {SIDE_BOTTOM.map((n,i)=>(
            n.id
              ?<SBtn key={n.label} id={n.id as WinId} icon={n.icon} label={n.label}/>
              :<SBtn key={n.label} id={"signal"} icon={n.icon} label={n.label} disabled/>
          ))}
        </nav>

        {/* Bottom: clock + theme */}
        <div style={{padding:"12px 0 10px",borderTop:"1px solid var(--gold-border)",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:sideExpanded?12:0,justifyContent:sideExpanded?"flex-start":"center",padding:sideExpanded?"0 16px":"0"}}>
            <Clock/>
            {sideExpanded&&(
              <button type="button" onClick={toggleTheme} style={{
                display:"flex",alignItems:"center",gap:6,background:"var(--surface2)",
                border:"1px solid var(--border)",padding:"5px 10px",cursor:"pointer",
                color:"var(--text3)",fontSize:"0.48rem",letterSpacing:"0.08em",textTransform:"uppercase",
                transition:"all 0.12s",
              }}
              onMouseEnter={e=>(e.currentTarget.style.borderColor="var(--gold-border)")}
              onMouseLeave={e=>(e.currentTarget.style.borderColor="var(--border)")}>
                <Ic d={theme==="dark"?P.sun:P.moon} size={12}/>
                {theme==="dark"?"LIGHT MODE":"DARK MODE"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Main canvas ── */}
      <div style={{flex:1,position:"relative",overflow:"hidden",display:"flex",flexDirection:"column"}}>

        {/* Top bar */}
        <div style={{height:52,flexShrink:0,background:"var(--surface)",borderBottom:"1px solid var(--gold-border)",
          display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",gap:16,zIndex:200}}>
          {/* Left */}
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <Image src="/viralclaw_avi.png" alt="ViralClaw" width={20} height={20}
              style={{objectFit:"contain"}} onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
            <span style={{fontSize:"0.5rem",letterSpacing:"0.14em",textTransform:"uppercase",color:"var(--text3)"}}>ViralClaw</span>
            <span style={{color:"var(--text4)",fontSize:"0.4rem"}}>·</span>
            <span style={{fontSize:"0.5rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--text4)"}}>Command Center</span>
          </div>
          {/* Center — Search pill */}
          <div className="topbar-center" style={{display:"flex",alignItems:"center",gap:8,background:"var(--surface2)",
            border:"1px solid var(--border)",padding:"6px 16px",cursor:"pointer",
            transition:"border-color 0.12s",minWidth:220}}
          onClick={()=>{ open("briefs"); }}
          onMouseEnter={e=>(e.currentTarget.style.borderColor="var(--gold-border)")}
          onMouseLeave={e=>(e.currentTarget.style.borderColor="var(--border)")}>
            <Ic d={P.search} size={13}/>
            <span style={{fontSize:"0.5rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--text4)",flex:1}}>Search saved briefs</span>
            <span style={{fontSize:"0.44rem",letterSpacing:"0.08em",color:"var(--text4)",border:"1px solid var(--border)",padding:"1px 5px"}}>⌘K</span>
          </div>
          {/* Right */}
          <div className="topbar-right-full" style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{width:5,height:5,borderRadius:"50%",background:"var(--green)",animation:"blink 2s ease infinite",display:"inline-block"}}/>
              <span style={{fontSize:"0.46rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--green)"}}>Live</span>
            </div>
            <div style={{fontSize:"0.46rem",color:"var(--text4)",border:"1px solid var(--border)",padding:"4px 10px"}}>
              {briefs.length} briefs · {openCount} windows
            </div>
            <div style={{width:28,height:28,borderRadius:"50%",background:"var(--gold-dim)",
              border:"1px solid var(--gold-border)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Ic d={P.logout} size={13}/>
            </div>
          </div>
        </div>

        {/* Canvas area */}
        <div className="canvas-area" style={{flex:1,position:"relative",overflowY:"auto",overflowX:"hidden"}}>
          {/* Empty state */}
          {openCount===0&&(
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
              <div style={{textAlign:"center",opacity:0.3}}>
                <Image src="/viralclaw_avi.png" alt="ViralClaw" width={36} height={36}
                  style={{objectFit:"contain",margin:"0 auto 14px"}} onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
                <p style={{fontSize:"1.4rem",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:"var(--text2)",lineHeight:1.1}}>ViralClaw</p>
                <p style={{fontSize:"0.5rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--text4)",marginTop:6}}>Synchronization intelligence layer</p>
                <p style={{fontSize:"0.44rem",color:"var(--text4)",marginTop:16}}>Open a module from the sidebar or toolbar</p>
              </div>
            </div>
          )}

          {/* Windows */}
          <SignalWin   win={wins.signal}    wm={wm}/>
          <BriefsWin   win={wins.briefs}    wm={wm} briefs={briefs} loading={briefsLoading} err={briefsErr}/>
          <FeedWin     win={wins.feed}      wm={wm} briefs={briefs}/>
          <AnalyticsWin win={wins.analytics} wm={wm} briefs={briefs} loading={briefsLoading}/>
          <SettingsWin  win={wins.settings}  wm={wm}/>
        </div>

        {/* Logo watermark - centered above toolbar */}
        <div style={{position:"absolute",bottom:84,left:"50%",transform:"translateX(-50%)",zIndex:0,pointerEvents:"none"}}>
          <div style={{position:"relative",width:180,height:180,display:"flex",alignItems:"center",justifyContent:"center"}}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/viralclaw_avi.png" alt="" aria-hidden="true"
              style={{width:140,height:140,objectFit:"contain",
                opacity:0.04,filter:"blur(2px) grayscale(1)",
                userSelect:"none",pointerEvents:"none"}}/>
          </div>
        </div>

        {/* Bottom toolbar */}
        <div style={{height:72,flexShrink:0,background:"var(--surface)",borderTop:"1px solid var(--gold-border)",
          display:"flex",alignItems:"center",justifyContent:"center",gap:10,zIndex:200}}>
          {TOOLBAR.map(item=>{
            const isOpen=wins[item.id].open;
            return (
              <button key={item.id} type="button" onClick={()=>toggle(item.id)} className="toolbar-btn" style={{
                display:"flex",flexDirection:"column",alignItems:"center",gap:5,
                padding:"10px 18px",minWidth:68,borderRadius:10,
                border:`1px solid ${isOpen?"var(--gold-border)":"var(--border)"}`,
                background:isOpen?"var(--gold-dim)":"rgba(255,255,255,0.02)",
                cursor:"pointer",color:isOpen?"var(--gold)":"var(--text4)",
                transition:"all 0.15s",position:"relative",
              }}
              onMouseEnter={e=>{if(!isOpen){e.currentTarget.style.color="var(--text2)";e.currentTarget.style.borderColor="var(--border2)";}}}
              onMouseLeave={e=>{if(!isOpen){e.currentTarget.style.color="var(--text4)";e.currentTarget.style.borderColor="var(--border)";}}}
              >
                <Ic d={item.icon} size={18}/>
                <span style={{fontSize:"0.4rem",letterSpacing:"0.08em",textTransform:"uppercase"}}>{item.label}</span>
                {isOpen&&<span style={{position:"absolute",bottom:6,width:4,height:4,borderRadius:"50%",background:"var(--gold)",display:"inline-block"}}/>}
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}

        /* Mobile — hide desktop sidebar, make toolbar scroll-friendly */
        @media (max-width: 767px) {
          .sidebar-desktop { display: none !important; }
          .dashboard-root { flex-direction: column; }
        }

        /* Mobile toolbar - smaller padding */
        @media (max-width: 480px) {
          .toolbar-btn { padding: 8px 10px !important; min-width: 52px !important; }
          .toolbar-btn span:last-child { display: none; }
        }

        /* Canvas on mobile - full width */
        @media (max-width: 767px) {
          .canvas-area { width: 100vw; }
        }

        /* Floating windows on mobile - full width, top-aligned */
        @media (max-width: 767px) {
          .float-window {
            position: relative !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            max-height: none !important;
            margin-bottom: 12px;
            box-shadow: none !important;
          }
        }

        /* Mobile topbar compact */
        @media (max-width: 767px) {
          .topbar-center { display: none !important; }
          .topbar-right-full { display: none !important; }
        }

        /* Theme transitions */
        *, *::before, *::after {
          transition: background-color 0.2s ease, border-color 0.2s ease, color 0.15s ease;
        }
        .no-transition, .no-transition * {
          transition: none !important;
        }
      `}</style>
    </div>
  );
}
