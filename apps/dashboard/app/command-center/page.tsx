"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { useTheme } from "@/components/theme-provider";

// ─── Icon ─────────────────────────────────────────────────────────────────────

function Ico({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const I = {
  zap:     "M13 2 3 14h9l-1 8 10-12h-9l1-8z",
  doc:     "M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z",
  feed:    "M22 12h-4l-3 9L9 3l-3 9H2",
  chart:   "M3 17l4-8 4 4 4-7 4 4",
  cog:     "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.07-2.93a7 7 0 0 0 0-4.14l-1.44-.83a7 7 0 0 0-2.83-2.83l-.83-1.44a7 7 0 0 0-4.14 0l-.83 1.44A7 7 0 0 0 6.17 7.1l-1.44.83a7 7 0 0 0 0 4.14l1.44.83a7 7 0 0 0 2.83 2.83l.83 1.44a7 7 0 0 0 4.14 0l.83-1.44a7 7 0 0 0 2.83-2.83z",
  chain:   "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  eye:     "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zm10-3a3 3 0 1 0 2 0",
  globe:   "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 0c-3 0-5.5 4.5-5.5 10S9 22 12 22s5.5-4.5 5.5-10S15 2 12 2zM2 12h20",
  close:   "M18 6 6 18M6 6l12 12",
  minus:   "M5 12h14",
  chev:    "M9 18l6-6-6-6",
  sun:     "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  moon:    "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  send:    "M22 2 11 13M22 2 15 22 11 13 2 9l20-7z",
  warn:    "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01",
  check:   "M20 6 9 17l-5-5",
  refresh: "M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15",
};

// ─── Types ────────────────────────────────────────────────────────────────────

type WinId = "signal" | "briefs" | "feed" | "analytics" | "settings";

interface Win {
  id: WinId;
  open: boolean;
  z: number;
  x: number;
  y: number;
  minimized: boolean;
}

interface Brief {
  id: string;
  type: "alpha" | "content";
  conviction: number;
  window: string;
  content: string;
  created_at: string;
  status: "pending" | "approved" | "archived";
  signal_summary?: string;
}

interface Settings {
  output_type: "both" | "alpha" | "content";
  focus_area: string;
  min_conviction: number;
  ecosystems: string[];
  creator_voice: string;
}

// ─── CSS-variable aware helpers ───────────────────────────────────────────────

const V = {
  bg:       "var(--carbon)",
  bg2:      "var(--surface)",
  bg3:      "var(--soft)",
  border:   "var(--border)",
  bordMd:   "var(--border-md)",
  white:    "var(--white)",
  body:     "var(--body)",
  muted:    "var(--muted)",
  low:      "var(--low)",
  dim:      "var(--dim)",
  crimson:  "var(--crimson)",
  criDim:   "var(--crimson-dim)",
  criBord:  "var(--crimson-border)",
  cyan:     "var(--cyan-light)",
  cyanDim:  "var(--cyan-dim)",
  cyanBord: "var(--cyan-border)",
  green:    "var(--green)",
  greenDim: "var(--green-dim)",
  greenB:   "var(--green-border)",
  amber:    "var(--amber)",
  amberDim: "var(--amber-dim)",
  amberB:   "var(--amber-border)",
};

function wColor(w: string) {
  return w === "open" ? V.green : w === "closing" ? V.amber : V.muted;
}
function cColor(c: number) {
  return c >= 8 ? V.green : c >= 6 ? V.amber : V.crimson;
}

// ─── Draggable Window Shell ───────────────────────────────────────────────────

function Window({
  id, title, badge, win, onFocus, onClose, onMinimize, children, width = 680, minH = 400,
}: {
  id: WinId; title: string; badge?: React.ReactNode;
  win: Win; onFocus: (id: WinId) => void;
  onClose: (id: WinId) => void; onMinimize: (id: WinId) => void;
  children: React.ReactNode; width?: number; minH?: number;
}) {
  const [pos, setPos] = useState({ x: win.x, y: win.y });
  const dragging = useRef(false);
  const off = useRef({ x: 0, y: 0 });

  const onMD = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button,input,textarea,select")) return;
    dragging.current = true;
    off.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    onFocus(id);
    e.preventDefault();
  };

  useEffect(() => {
    const mv = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPos({ x: Math.max(0, e.clientX - off.current.x), y: Math.max(0, e.clientY - off.current.y) });
    };
    const up = () => { dragging.current = false; };
    window.addEventListener("mousemove", mv);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", mv); window.removeEventListener("mouseup", up); };
  }, []);

  if (!win.open) return null;

  return (
    <div
      onMouseDown={() => onFocus(id)}
      style={{
        position: "absolute", left: pos.x, top: pos.y,
        width: Math.min(width, typeof window !== "undefined" ? window.innerWidth - 80 - pos.x : width),
        zIndex: win.z, display: "flex", flexDirection: "column",
        maxHeight: "calc(100vh - 200px)",
        background: V.bg,
        border: `1px solid ${V.criBord}`,
        boxShadow: `0 0 0 1px ${V.criDim}, 0 24px 64px rgba(0,0,0,0.6)`,
      }}
    >
      {/* Titlebar */}
      <div onMouseDown={onMD} style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "9px 14px", flexShrink: 0, cursor: "grab", userSelect: "none",
        background: V.bg2,
        borderBottom: `1px solid ${V.border}`,
      }}>
        <span style={{ color: V.crimson, fontSize: 9 }}>◆</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", color: V.white, flex: 1 }}>
          {title}
        </span>
        {badge}
        {[
          { icon: I.minus, action: () => onMinimize(id), hover: V.muted },
          { icon: I.close, action: () => onClose(id),    hover: V.crimson },
        ].map((b, i) => (
          <button key={i} type="button" onClick={b.action}
            style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", color: V.dim, transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = b.hover)}
            onMouseLeave={e => (e.currentTarget.style.color = V.dim)}>
            <Ico d={b.icon} size={11} />
          </button>
        ))}
      </div>
      {!win.minimized && (
        <div style={{ flex: 1, overflowY: "auto", minHeight: minH }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Signal Query Window ──────────────────────────────────────────────────────

function SignalWin({ win, wm }: { win: Win; wm: WMActions }) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"both" | "alpha" | "content">("both");
  const [loading, setLoading] = useState(false);
  const [alpha, setAlpha] = useState<any>(null);
  const [content, setContent] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [errDetail, setErrDetail] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function run() {
    if (!query.trim() || loading) return;
    setLoading(true); setErr(null); setErrDetail(null);
    setAlpha(null); setContent(null); setSaved(false);
    const modes = mode === "both" ? ["alpha", "content"] : [mode];
    try {
      const results = await Promise.allSettled(
        modes.map(m => fetch("/api/generate-brief", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, mode: m }),
        }).then(async r => {
          const j = await r.json();
          if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
          return j;
        }))
      );
      let anyErr = false;
      results.forEach((r, i) => {
        if (r.status === "fulfilled") {
          if (r.value.brief) { modes[i] === "alpha" ? setAlpha(r.value.brief) : setContent(r.value.brief); }
          else if (r.value.error) { setErr(r.value.error); if (r.value.raw) setErrDetail(r.value.raw); anyErr = true; }
        } else { setErr(r.reason?.message || "Request failed"); anyErr = true; }
      });
    } catch (e: any) { setErr(e.message); } finally { setLoading(false); }
  }

  async function saveAll() {
    for (const [type, brief] of [[`alpha`, alpha], [`content`, content]] as [string, any][]) {
      if (!brief) continue;
      await fetch("/api/briefs", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type, status: "pending",
          conviction: brief.conviction, window: brief.window,
          content: JSON.stringify(brief),
          signal_summary: brief.signal_summary || brief.narrative_summary,
          chains: brief.chains,
        }),
      });
    }
    setSaved(true);
    wm.refreshBriefs();
  }

  const inp: React.CSSProperties = {
    width: "100%", padding: "10px 12px",
    fontFamily: "var(--font-mono)", fontSize: "0.7rem", lineHeight: 1.7,
    background: V.bg3, border: `1px solid ${V.border}`,
    color: V.white, outline: "none", transition: "border-color 0.15s",
  };

  return (
    <Window id="signal" title="Signal Query" win={win} onFocus={wm.focus} onClose={wm.close} onMinimize={wm.minimize} width={740}>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Context banner — honest framing */}
        <div style={{ padding: "10px 12px", background: V.criDim, border: `1px solid ${V.criBord}`, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <Ico d={I.warn} size={14} />
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", color: V.body, lineHeight: 1.7 }}>
            <strong style={{ color: V.white }}>AI synthesis mode.</strong>{" "}
            On-chain scanner is not yet live. Briefs are synthesized by Claude based on your query — not real-time chain data.
            They are useful for <strong style={{ color: V.white }}>narrative framing, content angle research, and hypothesis building.</strong>{" "}
            Live signal data ships in Phase 2.
          </p>
        </div>

        {/* Mode */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", color: V.dim, textTransform: "uppercase", letterSpacing: "0.12em" }}>Output</span>
          {(["both", "alpha", "content"] as const).map(m => (
            <button key={m} type="button" onClick={() => setMode(m)} style={{
              fontFamily: "var(--font-mono)", fontSize: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em",
              padding: "4px 12px", border: `1px solid ${mode === m ? V.criBord : V.border}`,
              background: mode === m ? V.criDim : "transparent",
              color: mode === m ? V.crimson : V.muted, cursor: "pointer", transition: "all 0.15s",
            }}>
              {m === "both" ? "Alpha + Content" : m}
            </button>
          ))}
        </div>

        {/* Query */}
        <div>
          <textarea value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") run(); }}
            placeholder={"Describe a narrative, token, or ecosystem you want intelligence on...\ne.g. \"EigenLayer restaking — whale accumulation on ETH and ARB, break down the alpha and content angle\""}
            rows={4} style={{ ...inp, resize: "none" }}
            onFocus={e => (e.target.style.borderColor = V.criBord)}
            onBlur={e => (e.target.style.borderColor = V.border)} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", color: V.dim }}>⌘↩ to run</span>
            <button type="button" onClick={run} disabled={loading || !query.trim()} style={{
              fontFamily: "var(--font-mono)", fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.1em",
              padding: "10px 24px", display: "flex", alignItems: "center", gap: 8,
              background: loading || !query.trim() ? V.bg3 : V.crimson,
              color: loading || !query.trim() ? V.dim : "#fff",
              border: "none", cursor: loading || !query.trim() ? "not-allowed" : "pointer", transition: "all 0.15s",
            }}>
              {loading
                ? <><Spin /><span>Generating...</span></>
                : <><Ico d={I.zap} size={13} /><span>Run query</span></>}
            </button>
          </div>
        </div>

        {/* Error */}
        {err && (
          <div style={{ padding: 12, background: V.criDim, border: `1px solid ${V.criBord}` }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <Ico d={I.warn} size={14} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.56rem", color: V.crimson }}>{err}</span>
            </div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.48rem", color: V.muted, lineHeight: 1.7 }}>
              {err.includes("401") || err.toLowerCase().includes("key") || err.toLowerCase().includes("openrouter")
                ? `→ Set OPENROUTER_API_KEY in apps/dashboard/.env.local and redeploy.`
                : err.includes("relation") || err.toLowerCase().includes("supabase")
                ? `→ Run the SQL schema in Settings, then check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.`
                : `→ Check Network tab → /api/generate-brief for the full error response.`}
            </p>
            {errDetail && (
              <pre style={{ marginTop: 8, fontFamily: "var(--font-mono)", fontSize: "0.44rem", color: V.low, overflow: "auto", maxHeight: 80 }}>{errDetail}</pre>
            )}
          </div>
        )}

        {/* Results */}
        {(alpha || content) && (
          <div style={{ display: "grid", gridTemplateColumns: alpha && content ? "1fr 1fr" : "1fr", gap: 12 }}>
            {alpha && <BriefCard title="Alpha Brief" brief={alpha} color={V.crimson} borderColor={V.criBord} dimColor={V.criDim} />}
            {content && <BriefCard title="Content Brief" brief={content} color={V.cyan} borderColor={V.cyanBord} dimColor={V.cyanDim} />}
          </div>
        )}

        {(alpha || content) && (
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12 }}>
            {saved
              ? <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: V.green, display: "flex", alignItems: "center", gap: 6 }}><Ico d={I.check} size={12} /> Saved to Briefs</span>
              : <button type="button" onClick={saveAll} style={{
                  fontFamily: "var(--font-mono)", fontSize: "0.52rem", textTransform: "uppercase", letterSpacing: "0.08em",
                  padding: "8px 20px", display: "flex", alignItems: "center", gap: 8,
                  background: V.cyanDim, color: V.cyan, border: `1px solid ${V.cyanBord}`, cursor: "pointer",
                }}>
                  <Ico d={I.send} size={12} />Save to Briefs
                </button>}
          </div>
        )}
      </div>
    </Window>
  );
}

function BriefCard({ title, brief, color, borderColor, dimColor }: { title: string; brief: any; color: string; borderColor: string; dimColor: string }) {
  return (
    <div style={{ border: `1px solid ${borderColor}`, background: dimColor, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", textTransform: "uppercase", color }}>{title}</span>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", color: wColor(brief.window) }}>{brief.window}</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", color: cColor(brief.conviction), fontWeight: 600 }}>{brief.conviction}/10</span>
        </div>
      </div>
      <p style={{ fontSize: "0.76rem", color: V.body, lineHeight: 1.7, marginBottom: 10 }}>
        {brief.signal_summary || brief.narrative_summary}
      </p>
      {brief.chains?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
          {brief.chains.map((c: string) => (
            <span key={c} style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", padding: "2px 8px", border: `1px solid ${V.cyanBord}`, background: V.cyanDim, color: V.cyan }}>{c}</span>
          ))}
        </div>
      )}
      {brief.angles?.slice(0, 2).map((a: string, i: number) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", color: V.cyan, flexShrink: 0 }}>0{i+1}</span>
          <p style={{ fontSize: "0.68rem", color: V.muted, lineHeight: 1.5 }}>{a}</p>
        </div>
      ))}
      {brief.risk_context && (
        <p style={{ fontSize: "0.66rem", color: V.amber, lineHeight: 1.5, borderTop: `1px solid ${V.amberB}`, paddingTop: 8, marginTop: 8 }}>
          ⚠ {brief.risk_context}
        </p>
      )}
    </div>
  );
}

// ─── Briefs Window ────────────────────────────────────────────────────────────

function BriefsWin({ win, wm, briefs, loading, loadErr }: { win: Win; wm: WMActions; briefs: Brief[]; loading: boolean; loadErr: string | null }) {
  const [selected, setSelected] = useState<Brief | null>(null);
  const [tab, setTab] = useState<"all" | "pending" | "approved">("all");
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = tab === "all" ? briefs : briefs.filter(b => b.status === tab);
  const pending = briefs.filter(b => b.status === "pending").length;

  async function updateStatus(id: string, status: "approved" | "archived") {
    setUpdating(id);
    try {
      const r = await fetch("/api/briefs", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (r.ok) { wm.refreshBriefs(); if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null); }
    } finally { setUpdating(null); }
  }

  const badge = pending > 0 ? (
    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", padding: "2px 7px", background: V.criDim, border: `1px solid ${V.criBord}`, color: V.crimson, marginRight: 4 }}>
      {pending} pending
    </span>
  ) : undefined;

  return (
    <Window id="briefs" title="Briefs" badge={badge} win={win} onFocus={wm.focus} onClose={wm.close} onMinimize={wm.minimize} width={820} minH={500}>
      <div style={{ display: "flex", height: "100%", minHeight: 500 }}>
        {/* List panel */}
        <div style={{ width: "52%", borderRight: `1px solid ${V.border}`, display: "flex", flexDirection: "column" }}>
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: `1px solid ${V.border}`, flexShrink: 0 }}>
            {(["all", "pending", "approved"] as const).map(t => (
              <button key={t} type="button" onClick={() => setTab(t)} style={{
                fontFamily: "var(--font-mono)", fontSize: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em",
                padding: "9px 16px", background: "transparent", border: "none",
                borderBottom: `2px solid ${tab === t ? V.crimson : "transparent"}`,
                color: tab === t ? V.white : V.muted, cursor: "pointer", transition: "all 0.15s",
              }}>{t}</button>
            ))}
            <div style={{ flex: 1 }} />
            <button type="button" onClick={wm.refreshBriefs} title="Refresh" style={{
              background: "transparent", border: "none", cursor: "pointer", color: V.dim, padding: "9px 12px",
              display: "flex", alignItems: "center",
            }} onMouseEnter={e => (e.currentTarget.style.color = V.muted)}
               onMouseLeave={e => (e.currentTarget.style.color = V.dim)}>
              <Ico d={I.refresh} size={12} />
            </button>
          </div>

          {/* Error */}
          {loadErr && (
            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${V.criBord}`, background: V.criDim }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: V.crimson }}>{loadErr}</p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", color: V.muted, marginTop: 3 }}>
                Check NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY are set.
              </p>
            </div>
          )}

          {/* List */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: "center" }}><Spin /></div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: "48px 16px", textAlign: "center" }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", color: V.dim }}>No briefs{tab !== "all" ? ` with status "${tab}"` : " yet"}.</p>
                {tab === "all" && <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", color: V.dim, marginTop: 4 }}>Run a signal query and save to generate briefs.</p>}
              </div>
            ) : (
              filtered.map(b => {
                let p: any = {}; try { p = JSON.parse(b.content); } catch {}
                const sel = selected?.id === b.id;
                return (
                  <div key={b.id} onClick={() => setSelected(sel ? null : b)}
                    style={{
                      padding: "10px 14px", display: "flex", alignItems: "flex-start", gap: 10,
                      cursor: "pointer", borderBottom: `1px solid ${V.border}`,
                      background: sel ? V.criDim : "transparent", transition: "background 0.12s",
                    }}
                    onMouseEnter={e => { if (!sel) e.currentTarget.style.background = V.bg2; }}
                    onMouseLeave={e => { if (!sel) e.currentTarget.style.background = "transparent"; }}>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: "0.44rem", textTransform: "uppercase",
                      padding: "2px 7px", flexShrink: 0, marginTop: 1,
                      border: `1px solid ${b.type === "alpha" ? V.criBord : V.cyanBord}`,
                      background: b.type === "alpha" ? V.criDim : V.cyanDim,
                      color: b.type === "alpha" ? V.crimson : V.cyan,
                    }}>{b.type}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "0.73rem", color: V.white, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.signal_summary || p.narrative_summary || b.signal_summary || "Brief"}
                      </p>
                      <div style={{ display: "flex", gap: 8, marginTop: 3 }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", color: wColor(b.window) }}>{b.window}</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", color: V.dim }}>·</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", color: cColor(b.conviction) }}>{b.conviction}/10</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", color: V.dim }}>·</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", color: b.status === "approved" ? V.green : b.status === "pending" ? V.amber : V.dim }}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Detail panel */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {selected ? (() => {
            let p: any = {}; try { p = JSON.parse(selected.content); } catch {}
            const rows = [
              { label: "Signal", val: p.signal_summary },
              { label: "Narrative", val: p.narrative_summary },
              { label: "Cross-chain", val: p.cross_chain_map },
              { label: "Reasoning", val: p.conviction_reasoning },
              { label: "Audience framing", val: p.audience_framing },
              { label: "Evidence sources", val: p.evidence_links_description, color: V.cyan },
              { label: "Risk context", val: p.risk_context, color: V.amber },
            ].filter(r => r.val);
            return (
              <>
                <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                  {/* Conviction bar */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", textTransform: "uppercase", color: V.dim }}>Conviction</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.56rem", fontWeight: 600, color: cColor(selected.conviction) }}>{selected.conviction}/10</span>
                    </div>
                    <div style={{ height: 3, background: V.bg3, borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${selected.conviction * 10}%`, background: cColor(selected.conviction), transition: "width 0.4s ease" }} />
                    </div>
                  </div>

                  {/* Date */}
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", color: V.dim }}>
                    Generated {new Date(selected.created_at).toLocaleString()}
                  </p>

                  {rows.map(row => (
                    <div key={row.label}>
                      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", textTransform: "uppercase", color: row.color || V.dim, marginBottom: 4 }}>{row.label}</p>
                      <p style={{ fontSize: "0.75rem", color: V.body, lineHeight: 1.72 }}>{row.val}</p>
                    </div>
                  ))}

                  {p.chains?.length > 0 && (
                    <div>
                      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", textTransform: "uppercase", color: V.dim, marginBottom: 6 }}>Chains</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {p.chains.map((c: string) => (
                          <span key={c} style={{ fontFamily: "var(--font-mono)", fontSize: "0.48rem", padding: "2px 8px", border: `1px solid ${V.cyanBord}`, background: V.cyanDim, color: V.cyan }}>{c}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {p.angles?.length > 0 && (
                    <div>
                      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", textTransform: "uppercase", color: V.dim, marginBottom: 8 }}>Content angles</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {p.angles.map((a: string, i: number) => (
                          <div key={i} style={{ display: "flex", gap: 8, padding: "8px 10px", border: `1px solid ${V.border}`, background: V.bg2 }}>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", color: V.cyan, flexShrink: 0 }}>0{i+1}</span>
                            <p style={{ fontSize: "0.72rem", color: V.body, lineHeight: 1.6 }}>{a}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {p.social_lag_hours !== undefined && (
                    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: `1px solid ${V.border}` }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", color: V.dim }}>Est. social lag</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.54rem", color: V.green }}>{p.social_lag_hours}h ahead</span>
                    </div>
                  )}
                </div>

                {selected.status === "pending" && (
                  <div style={{ padding: "10px 14px", borderTop: `1px solid ${V.border}`, display: "flex", gap: 8, flexShrink: 0, background: V.bg2 }}>
                    <button type="button" onClick={() => updateStatus(selected.id, "approved")} disabled={!!updating}
                      style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: "0.52rem", textTransform: "uppercase", padding: 9, background: V.greenDim, color: V.green, border: `1px solid ${V.greenB}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <Ico d={I.check} size={12} />{updating === selected.id ? "Saving..." : "Approve"}
                    </button>
                    <button type="button" onClick={() => updateStatus(selected.id, "archived")} disabled={!!updating}
                      style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", textTransform: "uppercase", padding: "9px 16px", background: "transparent", color: V.muted, border: `1px solid ${V.border}`, cursor: "pointer" }}>
                      Archive
                    </button>
                  </div>
                )}
                {selected.status === "approved" && (
                  <div style={{ padding: "10px 14px", borderTop: `1px solid ${V.border}`, background: V.greenDim }}>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: V.green, display: "flex", alignItems: "center", gap: 6 }}>
                      <Ico d={I.check} size={12} /> Approved
                    </p>
                  </div>
                )}
              </>
            );
          })() : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: V.dim }}>Select a brief to review</p>
            </div>
          )}
        </div>
      </div>
    </Window>
  );
}

// ─── Feed Window ──────────────────────────────────────────────────────────────

function FeedWin({ win, wm, briefs }: { win: Win; wm: WMActions; briefs: Brief[] }) {
  return (
    <Window id="feed" title="Signal Feed" win={win} onFocus={wm.focus} onClose={wm.close} onMinimize={wm.minimize} width={460} minH={280}>
      <div style={{ padding: 16 }}>
        {briefs.length === 0 ? (
          <div style={{ padding: "48px 0", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: V.crimson, animation: "blinkA 1.5s ease infinite", display: "inline-block" }} />
            </div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", color: V.muted }}>No briefs yet</p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", color: V.dim, marginTop: 4 }}>Run a query and save to populate the feed.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {briefs.slice(0, 10).map((b) => {
              let p: any = {}; try { p = JSON.parse(b.content); } catch {}
              return (
                <div key={b.id} style={{ display: "flex", gap: 12, padding: "10px 12px", border: `1px solid ${V.border}`, background: V.bg2 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", flexShrink: 0, marginTop: 5, background: b.type === "alpha" ? V.crimson : V.cyan, animation: "blinkA 2s ease infinite", display: "inline-block" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 4, alignItems: "center" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", textTransform: "uppercase", color: b.type === "alpha" ? V.crimson : V.cyan }}>{b.type}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", color: wColor(b.window) }}>{b.window}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", color: cColor(b.conviction), marginLeft: "auto" }}>{b.conviction}/10</span>
                    </div>
                    <p style={{ fontSize: "0.72rem", color: V.body, lineHeight: 1.55, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {p.signal_summary || p.narrative_summary || b.signal_summary}
                    </p>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.42rem", color: V.dim, marginTop: 4 }}>
                      {new Date(b.created_at).toLocaleString()}
                    </p>
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

// ─── Analytics Window ─────────────────────────────────────────────────────────

function AnalyticsWin({ win, wm, briefs, loading }: { win: Win; wm: WMActions; briefs: Brief[]; loading: boolean }) {
  const total = briefs.length;
  const alpha = briefs.filter(b => b.type === "alpha").length;
  const content = briefs.filter(b => b.type === "content").length;
  const approved = briefs.filter(b => b.status === "approved").length;
  const avgConv = total ? (briefs.reduce((s, b) => s + (b.conviction || 0), 0) / total).toFixed(1) : "—";
  const openW = briefs.filter(b => b.window === "open").length;

  return (
    <Window id="analytics" title="Analytics" win={win} onFocus={wm.focus} onClose={wm.close} onMinimize={wm.minimize} width={520} minH={300}>
      <div style={{ padding: 16 }}>
        {loading ? <div style={{ padding: 40, textAlign: "center" }}><Spin /></div>
        : total === 0 ? (
          <div style={{ padding: "48px 0", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", color: V.dim }}>No data yet. Generate and save briefs to see stats.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {[
                { label: "Total briefs", value: total,    color: V.white },
                { label: "Alpha",        value: alpha,    color: V.crimson },
                { label: "Content",      value: content,  color: V.cyan },
                { label: "Approved",     value: approved, color: V.green },
                { label: "Avg conviction",value: `${avgConv}/10`, color: V.amber },
                { label: "Open windows", value: openW,   color: V.green },
              ].map(s => (
                <div key={s.label} style={{ padding: "14px 12px", border: `1px solid ${V.border}`, background: V.bg2, textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "1.6rem", fontWeight: 700, lineHeight: 1, marginBottom: 4, color: s.color }}>{s.value}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", textTransform: "uppercase", color: V.dim }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: 14, border: `1px solid ${V.border}`, background: V.bg2 }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", textTransform: "uppercase", color: V.dim, marginBottom: 10 }}>Alpha vs content split</p>
              <div style={{ height: 6, background: V.bg3, borderRadius: 2, overflow: "hidden", display: "flex" }}>
                <div style={{ width: `${total ? (alpha / total) * 100 : 50}%`, background: V.crimson, opacity: 0.8 }} />
                <div style={{ flex: 1, background: V.cyan, opacity: 0.8 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", color: V.crimson }}>Alpha {alpha}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", color: V.cyan }}>Content {content}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Window>
  );
}

// ─── Settings Window ──────────────────────────────────────────────────────────

function SettingsWin({ win, wm }: { win: Win; wm: WMActions }) {
  const [s, setS] = useState<Settings>({ output_type: "both", focus_area: "", min_conviction: 7, ecosystems: ["ETH","SOL","BASE","ARB"], creator_voice: "" });
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [newEco, setNewEco] = useState("");

  useEffect(() => {
    if (!win.open || loaded) return;
    setLoaded(true);
    (async () => {
      try {
        const r = await fetch("/api/settings");
        const { settings } = await r.json();
        if (settings) setS(prev => ({ ...prev, ...settings }));
      } catch {}
    })();
  }, [win.open, loaded]);

  // Persist settings to wm so signal window can read them
  useEffect(() => { wm.setSettings(s); }, [s]);

  async function save() {
    setSaving(true); setSaved(false); setSaveErr(null);
    try {
      const r = await fetch("/api/settings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      });
      const j = await r.json();
      if (!r.ok || j.error) throw new Error(j.error || "Save failed");
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (e: any) { setSaveErr(e.message); } finally { setSaving(false); }
  }

  const inp: React.CSSProperties = {
    padding: "9px 12px", fontFamily: "var(--font-mono)", fontSize: "0.68rem",
    background: V.bg3, border: `1px solid ${V.border}`,
    color: V.white, outline: "none", transition: "border-color 0.15s", width: "100%",
  };
  const onF = (e: React.FocusEvent<any>) => (e.target.style.borderColor = V.criBord);
  const onB = (e: React.FocusEvent<any>) => (e.target.style.borderColor = V.border);

  return (
    <Window id="settings" title="Settings" win={win} onFocus={wm.focus} onClose={wm.close} onMinimize={wm.minimize} width={540} minH={400}>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 18 }}>

        {/* Output type */}
        <SettingRow label="Output type" hint="What kind of briefs to generate">
          <div style={{ display: "flex", gap: 6 }}>
            {(["both", "alpha", "content"] as const).map(m => (
              <button key={m} type="button" onClick={() => setS(p => ({ ...p, output_type: m }))} style={{
                fontFamily: "var(--font-mono)", fontSize: "0.5rem", textTransform: "uppercase", letterSpacing: "0.06em",
                padding: "6px 14px", border: `1px solid ${s.output_type === m ? V.criBord : V.border}`,
                background: s.output_type === m ? V.criDim : "transparent",
                color: s.output_type === m ? V.crimson : V.muted, cursor: "pointer",
              }}>{m === "both" ? "Alpha + Content" : m === "alpha" ? "Alpha only" : "Content only"}</button>
            ))}
          </div>
        </SettingRow>

        <SettingRow label="Focus area" hint="Shapes which signals score higher — e.g. DeFi, restaking, memecoins">
          <input type="text" value={s.focus_area} onChange={e => setS(p => ({ ...p, focus_area: e.target.value }))}
            placeholder="e.g. DeFi, restaking, L2s" style={inp} onFocus={onF} onBlur={onB} />
        </SettingRow>

        <SettingRow label={`Min conviction: ${s.min_conviction}/10`} hint="Signals scored below this are filtered before brief generation">
          <input type="range" min={1} max={10} step={1} value={s.min_conviction}
            onChange={e => setS(p => ({ ...p, min_conviction: Number(e.target.value) }))}
            style={{ width: "100%", accentColor: V.crimson }} />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.42rem", color: V.dim }}>1 — any signal</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.42rem", color: V.dim }}>10 — highest only</span>
          </div>
        </SettingRow>

        <SettingRow label="Ecosystem watchlist" hint="Scanner prioritises these chains for cross-chain correlation">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
            {s.ecosystems.map(e => (
              <span key={e} style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-mono)", fontSize: "0.48rem", padding: "3px 8px", border: `1px solid ${V.cyanBord}`, background: V.cyanDim, color: V.cyan }}>
                {e}
                <button type="button" onClick={() => setS(p => ({ ...p, ecosystems: p.ecosystems.filter(x => x !== e) }))}
                  style={{ background: "none", border: "none", cursor: "pointer", color: V.dim, fontSize: "0.8rem", lineHeight: 1, padding: 0 }}>×</button>
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <input type="text" value={newEco} onChange={e => setNewEco(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && newEco.trim()) { setS(p => ({ ...p, ecosystems: [...p.ecosystems, newEco.trim().toUpperCase()] })); setNewEco(""); } }}
              placeholder="Add chain — Enter (e.g. SUI)" style={{ ...inp, width: "auto", flex: 1 }} onFocus={onF} onBlur={onB} />
          </div>
        </SettingRow>

        <SettingRow label="Creator voice" hint="Shapes content brief angles and audience framing">
          <textarea value={s.creator_voice} onChange={e => setS(p => ({ ...p, creator_voice: e.target.value }))}
            placeholder="Describe your tone, audience, and what to emphasise..." rows={3}
            style={{ ...inp, resize: "none", lineHeight: 1.6 }} onFocus={onF} onBlur={onB} />
        </SettingRow>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            {saved && <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: V.green, display: "flex", alignItems: "center", gap: 6 }}><Ico d={I.check} size={12} />Saved & applied to next query</span>}
            {saveErr && <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: V.crimson }}>{saveErr}</span>}
          </div>
          <button type="button" onClick={save} disabled={saving} style={{
            fontFamily: "var(--font-mono)", fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.1em",
            padding: "10px 24px", background: saving ? V.bg3 : V.crimson, color: saving ? V.dim : "#fff",
            border: "none", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1,
          }}>{saving ? "Saving..." : "Save settings"}</button>
        </div>

        {/* SQL schema */}
        <details style={{ border: `1px solid ${V.border}` }}>
          <summary style={{ padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: "0.5rem", textTransform: "uppercase", color: V.muted, cursor: "pointer" }}>
            Supabase setup SQL — run once
          </summary>
          <pre style={{ padding: 12, fontFamily: "var(--font-mono)", fontSize: "0.54rem", color: V.muted, lineHeight: 1.7, overflow: "auto", background: V.bg3, userSelect: "all" }}>
{`create table if not exists signals (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  chain text, type text, summary text,
  conviction int, window text, chains text[],
  social_lag_hours int, status text default 'new'
);
create table if not exists briefs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  signal_id uuid, type text not null,
  status text default 'pending',
  conviction int, window text, content text,
  signal_summary text, chains text[]
);
create table if not exists settings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  output_type text default 'both',
  focus_area text, min_conviction int default 7,
  ecosystems text[] default array['ETH','SOL','BASE','ARB'],
  creator_voice text
);
alter table signals disable row level security;
alter table briefs disable row level security;
alter table settings disable row level security;`}
          </pre>
        </details>

        {/* Env checklist */}
        <div style={{ border: `1px solid ${V.border}`, padding: 12 }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", textTransform: "uppercase", color: V.dim, marginBottom: 10 }}>Required env vars</p>
          {[
            { key: "OPENROUTER_API_KEY",            note: "Brief generation via OpenRouter" },
            { key: "NEXT_PUBLIC_SUPABASE_URL",       note: "Database connection" },
            { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",  note: "Database auth" },
          ].map(v => (
            <div key={v.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: `1px solid ${V.border}` }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", textTransform: "uppercase", padding: "2px 6px", border: `1px solid ${V.criBord}`, color: V.crimson }}>req</span>
              <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: V.cyan, flex: 1 }}>{v.key}</code>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", color: V.dim }}>{v.note}</span>
            </div>
          ))}
        </div>
      </div>
    </Window>
  );
}

function SettingRow({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", textTransform: "uppercase", letterSpacing: "0.1em", color: V.muted, marginBottom: 3 }}>{label}</p>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", color: V.dim, marginBottom: 8 }}>{hint}</p>
      {children}
    </div>
  );
}

// ─── Shared micro components ──────────────────────────────────────────────────

function Spin() {
  return (
    <span style={{ width: 13, height: 13, border: `1.5px solid ${V.crimson}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block", flexShrink: 0 }} />
  );
}

function Clock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () => setT(new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", hour12: false }));
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ textAlign: "center", paddingBottom: 8 }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", fontWeight: 600, color: V.muted }}>{t}</div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.38rem", color: V.dim, marginTop: 1 }}>UTC</div>
    </div>
  );
}

// ─── Window manager actions type ──────────────────────────────────────────────

interface WMActions {
  focus: (id: WinId) => void;
  close: (id: WinId) => void;
  minimize: (id: WinId) => void;
  refreshBriefs: () => void;
  setSettings: (s: Settings) => void;
}

// ─── Sidebar nav + toolbar config ────────────────────────────────────────────

const SIDE_NAV = [
  { id: "signal"    as WinId, icon: I.zap,  label: "Signal Query",  disabled: false },
  { id: "briefs"    as WinId, icon: I.doc,  label: "Briefs",        disabled: false },
  { id: "feed"      as WinId, icon: I.feed, label: "Signal Feed",   disabled: false },
  { id: "analytics" as WinId, icon: I.chart,label: "Analytics",     disabled: false },
];
const SIDE_SOON = [
  { icon: I.chain, label: "Cross-chain" },
  { icon: I.eye,   label: "Signal Memory" },
  { icon: I.globe, label: "Narratives" },
];
const TOOLBAR = [
  { id: "signal"    as WinId, icon: I.zap,  label: "Signal"   },
  { id: "briefs"    as WinId, icon: I.doc,  label: "Briefs"   },
  { id: "feed"      as WinId, icon: I.feed, label: "Feed"     },
  { id: "analytics" as WinId, icon: I.chart,label: "Stats"    },
  { id: "settings"  as WinId, icon: I.cog,  label: "Settings" },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

const INIT: Record<WinId, { x: number; y: number }> = {
  signal: { x: 100, y: 56 }, briefs: { x: 130, y: 72 },
  feed:   { x: 160, y: 64 }, analytics: { x: 150, y: 80 },
  settings: { x: 120, y: 70 },
};

export default function Dashboard() {
  const { theme, toggle } = useTheme();
  const [sideOpen, setSideOpen] = useState(false);
  const [zTop, setZTop] = useState(100);
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [briefsLoading, setBriefsLoading] = useState(true);
  const [briefsErr, setBriefsErr] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>({ output_type: "both", focus_area: "", min_conviction: 7, ecosystems: ["ETH","SOL","BASE","ARB"], creator_voice: "" });

  const [wins, setWins] = useState<Record<WinId, Win>>(() => {
    const ids: WinId[] = ["signal", "briefs", "feed", "analytics", "settings"];
    return Object.fromEntries(ids.map((id, i) => [id, { id, open: false, z: 100 + i, ...INIT[id], minimized: false }])) as Record<WinId, Win>;
  });

  const refreshBriefs = useCallback(async () => {
    setBriefsLoading(true); setBriefsErr(null);
    try {
      const r = await fetch("/api/briefs");
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const { briefs: data, error } = await r.json();
      if (error) throw new Error(error);
      setBriefs(data || []);
    } catch (e: any) {
      setBriefsErr(e.message);
      setBriefs([]);
    } finally { setBriefsLoading(false); }
  }, []);

  useEffect(() => { refreshBriefs(); }, [refreshBriefs]);

  const focus = useCallback((id: WinId) => {
    setZTop(z => { const n = z + 1; setWins(prev => ({ ...prev, [id]: { ...prev[id], z: n } })); return n; });
  }, []);

  const openWin = useCallback((id: WinId) => {
    setZTop(z => { const n = z + 1; setWins(prev => ({ ...prev, [id]: { ...prev[id], open: true, minimized: false, z: n } })); return n; });
  }, []);

  const closeWin = useCallback((id: WinId) => {
    setWins(prev => ({ ...prev, [id]: { ...prev[id], open: false } }));
  }, []);

  const minimizeWin = useCallback((id: WinId) => {
    setWins(prev => ({ ...prev, [id]: { ...prev[id], minimized: !prev[id].minimized } }));
  }, []);

  const toggleWin = useCallback((id: WinId) => {
    setWins(prev => {
      if (prev[id].open) return { ...prev, [id]: { ...prev[id], open: false } };
      return prev;
    });
    if (!wins[id].open) openWin(id);
  }, [wins, openWin]);

  const wm: WMActions = { focus, close: closeWin, minimize: minimizeWin, refreshBriefs, setSettings };

  const pending = briefs.filter(b => b.status === "pending").length;
  const openCount = Object.values(wins).filter(w => w.open).length;

  // Sidebar button helper
  const SideBtn = ({ id, icon, label, badge, disabled }: { id: WinId; icon: string; label: string; badge?: number | null; disabled?: boolean }) => {
    const isOpen = wins[id].open;
    return (
      <button type="button" title={label} disabled={disabled}
        onClick={() => !disabled && toggleWin(id)}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          gap: sideOpen ? 10 : 0, justifyContent: sideOpen ? "flex-start" : "center",
          padding: sideOpen ? "9px 16px" : "11px 0",
          background: isOpen ? V.criDim : "transparent",
          borderLeft: `2px solid ${isOpen ? V.crimson : "transparent"}`,
          border: "none", borderLeftStyle: "solid", borderLeftWidth: 2, borderLeftColor: isOpen ? V.crimson : "transparent",
          color: isOpen ? V.crimson : disabled ? V.dim : V.low,
          cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.15s", position: "relative",
        }}
        onMouseEnter={e => { if (!disabled && !isOpen) e.currentTarget.style.color = V.body; }}
        onMouseLeave={e => { if (!isOpen) e.currentTarget.style.color = disabled ? V.dim : V.low; }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <Ico d={icon} size={16} />
          {badge != null && badge > 0 && !sideOpen && (
            <span style={{ position: "absolute", top: -4, right: -4, width: 14, height: 14, borderRadius: "50%", background: V.crimson, color: "#fff", fontFamily: "var(--font-mono)", fontSize: "0.38rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{badge}</span>
          )}
        </div>
        {sideOpen && <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.56rem", textTransform: "uppercase", letterSpacing: "0.08em", flex: 1, whiteSpace: "nowrap" }}>{label}</span>}
        {sideOpen && badge != null && badge > 0 && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", padding: "1px 6px", borderRadius: 10, background: V.crimson, color: "#fff" }}>{badge}</span>
        )}
      </button>
    );
  };

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", display: "flex", background: "var(--black)" }}>
      {/* Grid */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: `linear-gradient(${V.criDim} 1px, transparent 1px), linear-gradient(90deg, ${V.criDim} 1px, transparent 1px)`, backgroundSize: "44px 44px", opacity: 0.4 }} />
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: `radial-gradient(ellipse 50% 35% at 50% 50%, ${V.criDim} 0%, transparent 70%)` }} />

      {/* Sidebar */}
      <div style={{
        width: sideOpen ? 200 : 64, flexShrink: 0,
        background: "var(--carbon)",
        borderRight: `1px solid ${V.border}`,
        display: "flex", flexDirection: "column",
        alignItems: sideOpen ? "flex-start" : "center",
        zIndex: 200, transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden", position: "relative",
      }}>
        {/* Logo row */}
        <div style={{
          width: "100%", height: 52, display: "flex", alignItems: "center",
          padding: sideOpen ? "0 14px" : "0",
          justifyContent: sideOpen ? "space-between" : "center",
          borderBottom: `1px solid ${V.border}`, flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Image src="/viralclaw_avi.png" alt="ViralClaw" width={24} height={24} style={{ objectFit: "contain" }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            {sideOpen && <span style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "0.88rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: V.white, whiteSpace: "nowrap" }}>ViralClaw</span>}
          </div>
          {sideOpen && (
            <button type="button" onClick={() => setSideOpen(false)}
              style={{ background: "none", border: "none", cursor: "pointer", color: V.dim, display: "flex", padding: 4, flexShrink: 0, transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = V.muted)}
              onMouseLeave={e => (e.currentTarget.style.color = V.dim)}>
              <div style={{ transform: "rotate(180deg)" }}><Ico d={I.chev} size={14} /></div>
            </button>
          )}
          {!sideOpen && (
            <button type="button" onClick={() => setSideOpen(true)} style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "100%", background: "transparent", border: "none", cursor: "pointer" }} />
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "10px 0", width: "100%", display: "flex", flexDirection: "column", gap: 1, overflowY: "auto" }}>
          {sideOpen && <div style={{ padding: "4px 16px 6px", fontFamily: "var(--font-mono)", fontSize: "0.42rem", textTransform: "uppercase", letterSpacing: "0.16em", color: V.dim }}>Intelligence</div>}
          {SIDE_NAV.map(n => (
            <SideBtn key={n.id} id={n.id} icon={n.icon} label={n.label}
              badge={n.id === "briefs" ? pending : n.id === "feed" ? briefs.length : null}
              disabled={n.disabled} />
          ))}
          {sideOpen
            ? <div style={{ height: 1, background: V.border, margin: "10px 0" }} />
            : <div style={{ height: 1, background: V.border, margin: "8px 12px" }} />}
          {sideOpen && <div style={{ padding: "0 16px 6px", fontFamily: "var(--font-mono)", fontSize: "0.42rem", textTransform: "uppercase", letterSpacing: "0.16em", color: V.dim }}>Coming soon</div>}
          {SIDE_SOON.map(n => (
            <div key={n.label} title={n.label} style={{
              width: "100%", display: "flex", alignItems: "center", gap: sideOpen ? 10 : 0, justifyContent: sideOpen ? "flex-start" : "center",
              padding: sideOpen ? "9px 16px" : "11px 0", color: V.dim, cursor: "not-allowed",
            }}>
              <Ico d={n.icon} size={16} />
              {sideOpen && <><span style={{ fontFamily: "var(--font-mono)", fontSize: "0.56rem", textTransform: "uppercase", letterSpacing: "0.08em", flex: 1, whiteSpace: "nowrap" }}>{n.label}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.4rem", padding: "1px 5px", border: `1px solid ${V.border}`, color: V.dim }}>soon</span></>}
            </div>
          ))}
          <div style={{ flex: 1 }} />
          {/* Settings */}
          <SideBtn id="settings" icon={I.cog} label="Settings" />
          {/* Theme toggle */}
          <div style={{ padding: sideOpen ? "8px 16px" : "8px 0", display: "flex", justifyContent: sideOpen ? "flex-start" : "center" }}>
            <button type="button" onClick={toggle} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              style={{ display: "flex", alignItems: "center", gap: sideOpen ? 10 : 0, background: "transparent", border: "none", cursor: "pointer", color: V.low, transition: "color 0.15s", padding: 0 }}
              onMouseEnter={e => (e.currentTarget.style.color = V.body)}
              onMouseLeave={e => (e.currentTarget.style.color = V.low)}>
              <Ico d={theme === "dark" ? I.sun : I.moon} size={16} />
              {sideOpen && <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.56rem", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{theme === "dark" ? "Light mode" : "Dark mode"}</span>}
            </button>
          </div>
        </nav>

        {/* Clock */}
        <div style={{ borderTop: `1px solid ${V.border}`, width: "100%", paddingTop: 10, display: "flex", justifyContent: "center", flexShrink: 0 }}>
          <Clock />
        </div>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {/* Topbar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 48, zIndex: 150,
          background: "var(--carbon)", borderBottom: `1px solid ${V.border}`,
          display: "flex", alignItems: "center", padding: "0 20px", gap: 16,
        }}>
          {!sideOpen && (
            <button type="button" onClick={() => setSideOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", color: V.dim, display: "flex", padding: "0 4px", marginRight: 4 }}>
              <Ico d={I.chev} size={14} />
            </button>
          )}
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", textTransform: "uppercase", letterSpacing: "0.14em", color: V.dim }}>command-center</span>
          <span style={{ color: V.border }}>·</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", textTransform: "uppercase", letterSpacing: "0.1em", color: V.low }}>Signal Intelligence</span>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: V.green, animation: "blinkA 2s ease infinite", display: "inline-block" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.48rem", textTransform: "uppercase", color: V.green }}>Brief engine live</span>
          </div>
          <div style={{ width: 1, height: 14, background: V.border }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.48rem", color: V.dim }}>{briefs.length} briefs</span>
          <div style={{ width: 1, height: 14, background: V.border }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.48rem", color: V.dim }}>{openCount} windows open</span>
          <div style={{ width: 1, height: 14, background: V.border }} />
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: V.amber, display: "inline-block" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", color: V.dim }}>On-chain scanner — Phase 2</span>
          </div>
        </div>

        {/* Window canvas */}
        <div style={{ position: "absolute", inset: 0, top: 48, bottom: 72 }}>
          {openCount === 0 && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <div style={{ textAlign: "center", opacity: 0.35 }}>
                <Image src="/viralclaw_avi.png" alt="ViralClaw" width={40} height={40} style={{ objectFit: "contain", marginBottom: 16 }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <p style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "1.4rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: V.muted }}>ViralClaw</p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", textTransform: "uppercase", letterSpacing: "0.18em", color: V.dim, marginTop: 6 }}>Synchronization intelligence layer</p>
                {briefsErr && <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.48rem", color: V.crimson, marginTop: 12 }}>Briefs load error: {briefsErr}</p>}
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", color: V.dim, marginTop: 16 }}>Select a module from the sidebar or toolbar below</p>
              </div>
            </div>
          )}
          <SignalWin  win={wins.signal}    wm={{ ...wm, setSettings }} />
          <BriefsWin  win={wins.briefs}    wm={wm} briefs={briefs} loading={briefsLoading} loadErr={briefsErr} />
          <FeedWin    win={wins.feed}      wm={wm} briefs={briefs} />
          <AnalyticsWin win={wins.analytics} wm={wm} briefs={briefs} loading={briefsLoading} />
          <SettingsWin  win={wins.settings}  wm={wm} />
        </div>

        {/* Bottom toolbar */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 72, zIndex: 150,
          background: "var(--carbon)", borderTop: `1px solid ${V.border}`,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        }}>
          {TOOLBAR.map(item => {
            const isOpen = wins[item.id].open;
            return (
              <button key={item.id} type="button" onClick={() => isOpen ? closeWin(item.id) : openWin(item.id)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                  padding: "10px 20px", minWidth: 72, borderRadius: 8, border: `1px solid ${isOpen ? V.criBord : V.border}`,
                  background: isOpen ? V.criDim : V.bg2, cursor: "pointer",
                  color: isOpen ? V.crimson : V.low, transition: "all 0.15s", position: "relative",
                }}
                onMouseEnter={e => { if (!isOpen) { e.currentTarget.style.color = V.body; e.currentTarget.style.borderColor = V.bordMd; } }}
                onMouseLeave={e => { if (!isOpen) { e.currentTarget.style.color = V.low; e.currentTarget.style.borderColor = V.border; } }}>
                <Ico d={item.icon} size={18} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.42rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>{item.label}</span>
                {isOpen && <span style={{ position: "absolute", bottom: 6, width: 4, height: 4, borderRadius: "50%", background: V.crimson }} />}
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blinkA { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
      `}</style>
    </div>
  );
}
