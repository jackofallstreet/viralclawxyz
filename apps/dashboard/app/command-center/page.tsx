"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type WinId = "signal" | "briefs" | "feed" | "analytics" | "settings";

interface WindowState {
  id: WinId;
  open: boolean;
  zIndex: number;
  x: number;
  y: number;
  minimized: boolean;
}

type Brief = {
  id: string;
  type: "alpha" | "content";
  conviction: number;
  window: string;
  content: string;
  created_at: string;
  status: string;
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function Ic({ path, size = 16, stroke = 1.5 }: { path: string; size?: number; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

const P = {
  zap:      "M13 2 3 14h9l-1 8 10-12h-9l1-8z",
  briefs:   "M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z",
  feed:     "M22 12h-4l-3 9L9 3l-3 9H2",
  chart:    "M3 17l4-8 4 4 4-7 4 4",
  settings: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
  chain:    "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  eye:      "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zm10-3a3 3 0 1 0 2 0",
  globe:    "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 0a14.5 14.5 0 0 1 4 10 14.5 14.5 0 0 1-4 10A14.5 14.5 0 0 1 8 12 14.5 14.5 0 0 1 12 2zM2 12h20",
  close:    "M18 6 6 18M6 6l12 12",
  minus:    "M5 12h14",
  menu:     "M3 12h18M3 6h18M3 18h18",
  chevronR: "M9 18l6-6-6-6",
  send:     "M22 2 11 13M22 2 15 22 11 13 2 9l20-7z",
  warning:  "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01",
};

// ─── Draggable Window Shell ───────────────────────────────────────────────────

function Window({
  id, title, win, onFocus, onClose, onMinimize, children, width = 680, minH = 400,
}: {
  id: WinId; title: string; win: WindowState;
  onFocus: (id: WinId) => void; onClose: (id: WinId) => void; onMinimize: (id: WinId) => void;
  children: React.ReactNode; width?: number; minH?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const [pos, setPos] = useState({ x: win.x, y: win.y });

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    dragging.current = true;
    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    onFocus(id);
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPos({
        x: Math.max(0, e.clientX - offset.current.x),
        y: Math.max(0, e.clientY - offset.current.y),
      });
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  if (!win.open) return null;

  return (
    <div
      ref={ref}
      onMouseDown={() => onFocus(id)}
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        width: Math.min(width, typeof window !== "undefined" ? window.innerWidth - 80 - pos.x : width),
        zIndex: win.zIndex,
        background: "rgba(11,11,13,0.97)",
        border: "1px solid rgba(224,48,48,0.28)",
        boxShadow: `0 0 0 1px rgba(224,48,48,0.08), 0 32px 80px rgba(0,0,0,0.85)`,
        display: "flex",
        flexDirection: "column",
        maxHeight: "calc(100vh - 200px)",
      }}
    >
      {/* Title bar */}
      <div
        onMouseDown={onMouseDown}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "8px 14px",
          borderBottom: "1px solid rgba(224,48,48,0.15)",
          background: "rgba(224,48,48,0.04)",
          cursor: "grab", userSelect: "none", flexShrink: 0,
        }}
      >
        <span style={{ color: "var(--accent)", fontSize: 10 }}>◆</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-1)", flex: 1 }}>
          {title}
        </span>
        <div style={{ display: "flex", gap: 2 }}>
          {[
            { icon: P.minus, action: () => onMinimize(id), label: "minimize" },
            { icon: P.close, action: () => onClose(id),    label: "close" },
          ].map(btn => (
            <button key={btn.label} type="button" onClick={btn.action}
              style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.25)", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = btn.label === "close" ? "var(--accent)" : "rgba(255,255,255,0.7)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}>
              <Ic path={btn.icon} size={11} />
            </button>
          ))}
        </div>
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

function SignalWindow({ win, wm }: { win: WindowState; wm: WM }) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"both" | "alpha" | "content">("both");
  const [loading, setLoading] = useState(false);
  const [alpha, setAlpha] = useState<any>(null);
  const [content, setContent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [apiLog, setApiLog] = useState<string | null>(null);

  async function run() {
    if (!query.trim() || loading) return;
    setLoading(true); setError(null); setAlpha(null); setContent(null); setSaved(false); setApiLog(null);
    const modes = mode === "both" ? ["alpha", "content"] : [mode];
    try {
      const results = await Promise.allSettled(
        modes.map(m =>
          fetch("/api/generate-brief", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, mode: m }),
          }).then(async r => {
            const json = await r.json();
            if (!r.ok) throw new Error(json.error || `HTTP ${r.status}`);
            return json;
          })
        )
      );
      let hasError = false;
      results.forEach((r, i) => {
        if (r.status === "fulfilled") {
          if (r.value.brief) {
            if (modes[i] === "alpha") setAlpha(r.value.brief);
            else setContent(r.value.brief);
          } else if (r.value.error) {
            setError(r.value.error);
            if (r.value.raw) setApiLog(r.value.raw);
            hasError = true;
          }
        } else {
          setError(r.reason?.message || "Request failed");
          hasError = true;
        }
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveAll() {
    const items = [
      alpha && { type: "alpha", brief: alpha },
      content && { type: "content", brief: content },
    ].filter(Boolean) as { type: string; brief: any }[];
    for (const item of items) {
      await fetch("/api/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: item.type, status: "pending",
          conviction: item.brief.conviction,
          window: item.brief.window,
          content: JSON.stringify(item.brief),
          signal_summary: item.brief.signal_summary || item.brief.narrative_summary,
          chains: item.brief.chains,
        }),
      });
    }
    setSaved(true);
    wm.refreshBriefs();
  }

  const wc = (w: string) => w === "open" ? "var(--green)" : w === "closing" ? "var(--amber)" : "var(--accent)";

  return (
    <Window id="signal" title="Signal Query" win={win} onFocus={wm.focus} onClose={wm.close} onMinimize={wm.minimize} width={720}>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Mode */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Output</span>
          {(["both", "alpha", "content"] as const).map(m => (
            <button key={m} type="button" onClick={() => setMode(m)}
              style={{
                fontFamily: "var(--font-mono)", fontSize: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em",
                padding: "4px 12px", border: `1px solid ${mode === m ? "var(--accent)" : "rgba(255,255,255,0.08)"}`,
                background: mode === m ? "rgba(224,48,48,0.15)" : "transparent",
                color: mode === m ? "var(--accent)" : "rgba(255,255,255,0.3)", cursor: "pointer", transition: "all 0.15s",
              }}>
              {m === "both" ? "Alpha + Content" : m}
            </button>
          ))}
        </div>

        {/* Textarea */}
        <textarea value={query} onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") run(); }}
          placeholder={"Describe a signal, trend, token or on-chain pattern...\ne.g. \"EigenLayer restaking — whale accumulation on ETH and ARB\""}
          rows={4}
          style={{
            width: "100%", padding: "12px", resize: "none", outline: "none",
            fontFamily: "var(--font-mono)", fontSize: "0.7rem", lineHeight: 1.7,
            background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)",
            color: "var(--text-1)", transition: "border-color 0.15s",
          }}
          onFocus={e => (e.target.style.borderColor = "rgba(224,48,48,0.5)")}
          onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", color: "rgba(255,255,255,0.2)" }}>⌘↩ to run</span>
          <button type="button" onClick={run} disabled={loading || !query.trim()}
            style={{
              fontFamily: "var(--font-mono)", fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.1em",
              padding: "10px 24px", display: "flex", alignItems: "center", gap: 8, cursor: loading || !query.trim() ? "not-allowed" : "pointer",
              background: loading || !query.trim() ? "rgba(255,255,255,0.04)" : "var(--accent)",
              color: loading || !query.trim() ? "rgba(255,255,255,0.2)" : "#fff",
              border: "none", transition: "all 0.15s",
            }}>
            {loading
              ? <><span style={{ width: 12, height: 12, border: "1.5px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />Generating...</>
              : <><Ic path={P.zap} size={13} />Run signal query</>}
          </button>
        </div>

        {/* Error with detail */}
        {error && (
          <div style={{ padding: 12, border: "1px solid rgba(224,48,48,0.3)", background: "rgba(224,48,48,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Ic path={P.warning} size={14} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.56rem", color: "var(--accent)" }}>
                {error}
              </span>
            </div>
            {error.includes("OPENROUTER") || error.includes("401") || error.includes("key") ? (
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.48rem", color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>
                → Check that <code style={{ color: "var(--teal)" }}>OPENROUTER_API_KEY</code> is set in <code style={{ color: "var(--teal)" }}>apps/dashboard/.env</code> and your Vercel project env vars.
              </p>
            ) : error.includes("SUPABASE") || error.includes("relation") ? (
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.48rem", color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>
                → Run the SQL schema in Settings → Supabase setup, then check <code style={{ color: "var(--teal)" }}>NEXT_PUBLIC_SUPABASE_URL</code> and <code style={{ color: "var(--teal)" }}>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
              </p>
            ) : (
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.48rem", color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>
                → Open browser devtools → Network → check the <code style={{ color: "var(--teal)" }}>/api/generate-brief</code> response for details.
              </p>
            )}
            {apiLog && (
              <pre style={{ marginTop: 8, fontFamily: "var(--font-mono)", fontSize: "0.44rem", color: "rgba(255,255,255,0.3)", overflow: "auto", maxHeight: 80 }}>{apiLog}</pre>
            )}
          </div>
        )}

        {/* Results */}
        {(alpha || content) && (
          <div style={{ display: "grid", gridTemplateColumns: alpha && content ? "1fr 1fr" : "1fr", gap: 12 }}>
            {alpha && <BriefCard title="Alpha Brief" brief={alpha} color="var(--accent)" wc={wc} />}
            {content && <BriefCard title="Content Brief" brief={content} color="var(--teal)" wc={wc} />}
          </div>
        )}

        {(alpha || content) && (
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12 }}>
            {saved && <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: "var(--green)" }}>✓ Saved to briefs</span>}
            {!saved && (
              <button type="button" onClick={saveAll}
                style={{
                  fontFamily: "var(--font-mono)", fontSize: "0.52rem", textTransform: "uppercase", letterSpacing: "0.1em",
                  padding: "8px 20px", display: "flex", alignItems: "center", gap: 8,
                  background: "rgba(45,212,191,0.1)", color: "var(--teal)",
                  border: "1px solid rgba(45,212,191,0.25)", cursor: "pointer",
                }}>
                <Ic path={P.send} size={12} />Save to Briefs
              </button>
            )}
          </div>
        )}
      </div>
    </Window>
  );
}

function BriefCard({ title, brief, color, wc }: { title: string; brief: any; color: string; wc: (w: string) => string }) {
  return (
    <div style={{ border: `1px solid ${color}22`, background: `${color}06`, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", textTransform: "uppercase", letterSpacing: "0.1em", color }}>{title}</span>
        <div style={{ display: "flex", gap: 10 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", color: wc(brief.window) }}>{brief.window}</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", color: "rgba(255,255,255,0.3)" }}>{brief.conviction}/10</span>
        </div>
      </div>
      <p style={{ fontSize: "0.73rem", color: "var(--text-2)", lineHeight: 1.65, marginBottom: 10 }}>
        {brief.signal_summary || brief.narrative_summary}
      </p>
      {brief.chains?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
          {brief.chains.map((c: string) => (
            <span key={c} style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", padding: "2px 8px", border: "1px solid rgba(45,212,191,0.25)", background: "rgba(45,212,191,0.06)", color: "var(--teal)" }}>{c}</span>
          ))}
        </div>
      )}
      {brief.angles?.slice(0, 2).map((a: string, i: number) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", color: "var(--teal)", flexShrink: 0 }}>0{i+1}</span>
          <p style={{ fontSize: "0.67rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{a}</p>
        </div>
      ))}
      {brief.risk_context && (
        <p style={{ fontSize: "0.65rem", color: "var(--amber)", lineHeight: 1.5, borderTop: "1px solid rgba(251,191,36,0.15)", paddingTop: 8, marginTop: 8 }}>
          ⚠ {brief.risk_context}
        </p>
      )}
    </div>
  );
}

// ─── Briefs Window ────────────────────────────────────────────────────────────

function BriefsWindow({ win, wm, briefs, loading }: { win: WindowState; wm: WM; briefs: Brief[]; loading: boolean }) {
  const [selected, setSelected] = useState<Brief | null>(null);
  const [tab, setTab] = useState<"all" | "pending" | "approved">("all");
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = tab === "all" ? briefs : briefs.filter(b => b.status === tab);
  const wc = (w: string) => w === "open" ? "var(--green)" : w === "closing" ? "var(--amber)" : "rgba(255,255,255,0.2)";

  async function updateStatus(id: string, status: "approved" | "archived") {
    setUpdating(id);
    try {
      await fetch("/api/briefs", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      wm.refreshBriefs();
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
    } finally { setUpdating(null); }
  }

  const pending = briefs.filter(b => b.status === "pending").length;

  return (
    <Window id="briefs" title={`Briefs${pending > 0 ? ` · ${pending} pending` : ""}`} win={win} onFocus={wm.focus} onClose={wm.close} onMinimize={wm.minimize} width={800} minH={480}>
      <div style={{ display: "flex", height: "100%", minHeight: 480 }}>
        {/* List */}
        <div style={{ width: "55%", borderRight: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column" }}>
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
            {(["all", "pending", "approved"] as const).map(t => (
              <button key={t} type="button" onClick={() => setTab(t)}
                style={{
                  fontFamily: "var(--font-mono)", fontSize: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em",
                  padding: "8px 16px", background: "transparent", border: "none", cursor: "pointer",
                  borderBottom: `2px solid ${tab === t ? "var(--accent)" : "transparent"}`,
                  color: tab === t ? "var(--text-1)" : "rgba(255,255,255,0.25)", transition: "all 0.15s",
                }}>
                {t}
              </button>
            ))}
          </div>
          {/* List items */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: "center" }}>
                <span style={{ display: "inline-block", width: 14, height: 14, border: "1.5px solid var(--accent)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: "40px 16px", textAlign: "center" }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", color: "rgba(255,255,255,0.2)" }}>No briefs yet.</p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", color: "rgba(255,255,255,0.12)", marginTop: 4 }}>Run a signal query to generate briefs.</p>
              </div>
            ) : (
              filtered.map(b => {
                let p: any = {}; try { p = JSON.parse(b.content); } catch {}
                const isSel = selected?.id === b.id;
                return (
                  <div key={b.id} onClick={() => setSelected(isSel ? null : b)}
                    style={{
                      padding: "10px 14px", display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      background: isSel ? "rgba(224,48,48,0.06)" : "transparent", transition: "background 0.15s",
                    }}
                    onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                    onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = "transparent"; }}>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: "0.44rem", textTransform: "uppercase", letterSpacing: "0.06em",
                      padding: "2px 7px", flexShrink: 0, marginTop: 1,
                      border: `1px solid ${b.type === "alpha" ? "rgba(224,48,48,0.3)" : "rgba(45,212,191,0.3)"}`,
                      background: b.type === "alpha" ? "rgba(224,48,48,0.08)" : "rgba(45,212,191,0.08)",
                      color: b.type === "alpha" ? "var(--accent)" : "var(--teal)",
                    }}>{b.type}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "0.72rem", color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.signal_summary || p.narrative_summary || "Brief"}
                      </p>
                      <div style={{ display: "flex", gap: 8, marginTop: 3 }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", color: wc(b.window) }}>{b.window}</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", color: "rgba(255,255,255,0.2)" }}>·</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", color: "rgba(255,255,255,0.2)" }}>{b.conviction}/10</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", color: "rgba(255,255,255,0.2)" }}>·</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", color: b.status === "approved" ? "var(--green)" : b.status === "pending" ? "var(--amber)" : "rgba(255,255,255,0.2)" }}>
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

        {/* Detail */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {selected ? (() => {
            let p: any = {}; try { p = JSON.parse(selected.content); } catch {}
            return (
              <>
                <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                  {/* Conviction bar */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>Conviction</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.54rem", fontWeight: 600, color: selected.conviction >= 8 ? "var(--green)" : selected.conviction >= 6 ? "var(--amber)" : "var(--accent)" }}>
                        {selected.conviction}/10
                      </span>
                    </div>
                    <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${selected.conviction * 10}%`, background: selected.conviction >= 8 ? "var(--green)" : selected.conviction >= 6 ? "var(--amber)" : "var(--accent)", transition: "width 0.5s ease" }} />
                    </div>
                  </div>
                  {[
                    { label: "Signal", val: p.signal_summary },
                    { label: "Narrative", val: p.narrative_summary },
                    { label: "Cross-chain", val: p.cross_chain_map },
                    { label: "Reasoning", val: p.conviction_reasoning },
                  ].filter(r => r.val).map(row => (
                    <div key={row.label}>
                      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 4 }}>{row.label}</p>
                      <p style={{ fontSize: "0.72rem", color: "var(--text-2)", lineHeight: 1.65 }}>{row.val}</p>
                    </div>
                  ))}
                  {p.risk_context && (
                    <div>
                      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", textTransform: "uppercase", color: "var(--amber)", marginBottom: 4 }}>Risk</p>
                      <p style={{ fontSize: "0.72rem", color: "rgba(251,191,36,0.7)", lineHeight: 1.65 }}>{p.risk_context}</p>
                    </div>
                  )}
                  {p.chains?.length > 0 && (
                    <div>
                      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 6 }}>Chains</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {p.chains.map((c: string) => (
                          <span key={c} style={{ fontFamily: "var(--font-mono)", fontSize: "0.48rem", padding: "2px 8px", border: "1px solid rgba(45,212,191,0.25)", background: "rgba(45,212,191,0.06)", color: "var(--teal)" }}>{c}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {p.angles?.length > 0 && (
                    <div>
                      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 6 }}>Angles</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {p.angles.map((a: string, i: number) => (
                          <div key={i} style={{ display: "flex", gap: 8, padding: 8, border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", color: "var(--teal)", flexShrink: 0 }}>0{i+1}</span>
                            <p style={{ fontSize: "0.7rem", color: "var(--text-2)", lineHeight: 1.5 }}>{a}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {p.audience_framing && (
                    <div>
                      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 4 }}>Audience</p>
                      <p style={{ fontSize: "0.72rem", color: "var(--text-2)", lineHeight: 1.65 }}>{p.audience_framing}</p>
                    </div>
                  )}
                  {p.social_lag_hours !== undefined && (
                    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", color: "rgba(255,255,255,0.25)" }}>Social lag</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", color: "var(--green)" }}>{p.social_lag_hours}h ahead</span>
                    </div>
                  )}
                </div>
                {selected.status === "pending" && (
                  <div style={{ padding: "10px 14px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 8, flexShrink: 0 }}>
                    <button type="button" onClick={() => updateStatus(selected.id, "approved")} disabled={!!updating}
                      style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: "0.52rem", textTransform: "uppercase", padding: "8px", background: "rgba(74,222,128,0.12)", color: "var(--green)", border: "1px solid rgba(74,222,128,0.25)", cursor: "pointer" }}>
                      ✓ Approve
                    </button>
                    <button type="button" onClick={() => updateStatus(selected.id, "archived")} disabled={!!updating}
                      style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", textTransform: "uppercase", padding: "8px 16px", background: "transparent", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer" }}>
                      Archive
                    </button>
                  </div>
                )}
              </>
            );
          })() : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.48rem", color: "rgba(255,255,255,0.15)" }}>Select a brief</p>
            </div>
          )}
        </div>
      </div>
    </Window>
  );
}

// ─── Feed Window ──────────────────────────────────────────────────────────────

function FeedWindow({ win, wm, briefs }: { win: WindowState; wm: WM; briefs: Brief[] }) {
  const recent = briefs.slice(0, 8);
  return (
    <Window id="feed" title="Signal Feed" win={win} onFocus={wm.focus} onClose={wm.close} onMinimize={wm.minimize} width={460} minH={300}>
      <div style={{ padding: 16 }}>
        {recent.length === 0 ? (
          <div style={{ padding: "48px 0", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", animation: "blinkA 1.5s ease infinite", display: "inline-block" }} />
            </div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", color: "rgba(255,255,255,0.25)" }}>Monitoring signals</p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", color: "rgba(255,255,255,0.15)", marginTop: 4 }}>Run a query to start generating intelligence.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recent.map((b, i) => {
              let p: any = {}; try { p = JSON.parse(b.content); } catch {}
              return (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: 12, border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", flexShrink: 0, marginTop: 4, background: b.type === "alpha" ? "var(--accent)" : "var(--teal)", animation: "blinkA 2s ease infinite", display: "inline-block" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", textTransform: "uppercase", color: b.type === "alpha" ? "var(--accent)" : "var(--teal)" }}>{b.type}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", color: b.window === "open" ? "var(--green)" : b.window === "closing" ? "var(--amber)" : "rgba(255,255,255,0.2)" }}>{b.window}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", color: "rgba(255,255,255,0.2)", marginLeft: "auto" }}>{b.conviction}/10</span>
                    </div>
                    <p style={{ fontSize: "0.71rem", color: "var(--text-2)", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {p.signal_summary || p.narrative_summary}
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

function AnalyticsWindow({ win, wm, briefs, loading }: { win: WindowState; wm: WM; briefs: Brief[]; loading: boolean }) {
  const total = briefs.length;
  const alpha = briefs.filter(b => b.type === "alpha").length;
  const content = briefs.filter(b => b.type === "content").length;
  const approved = briefs.filter(b => b.status === "approved").length;
  const avgConv = total ? (briefs.reduce((s, b) => s + (b.conviction || 0), 0) / total).toFixed(1) : "—";
  const openW = briefs.filter(b => b.window === "open").length;

  return (
    <Window id="analytics" title="Analytics" win={win} onFocus={wm.focus} onClose={wm.close} onMinimize={wm.minimize} width={520} minH={300}>
      <div style={{ padding: 16 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            <span style={{ display: "inline-block", width: 14, height: 14, border: "1.5px solid var(--accent)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          </div>
        ) : total === 0 ? (
          <div style={{ padding: "48px 0", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", color: "rgba(255,255,255,0.2)" }}>No data yet</p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", color: "rgba(255,255,255,0.12)", marginTop: 4 }}>Generate briefs to see analytics.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {[
                { label: "Total", value: total, color: "var(--text-1)" },
                { label: "Alpha", value: alpha, color: "var(--accent)" },
                { label: "Content", value: content, color: "var(--teal)" },
                { label: "Approved", value: approved, color: "var(--green)" },
                { label: "Avg conviction", value: `${avgConv}/10`, color: "var(--amber)" },
                { label: "Open windows", value: openW, color: "var(--green)" },
              ].map(s => (
                <div key={s.label} style={{ padding: "14px 12px", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)", textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "1.6rem", fontWeight: 700, lineHeight: 1, marginBottom: 4, color: s.color }}>{s.value}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>{s.label}</div>
                </div>
              ))}
            </div>
            {total > 0 && (
              <div style={{ padding: 14, border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 10 }}>Type split</p>
                <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden", display: "flex" }}>
                  <div style={{ width: `${total ? (alpha / total) * 100 : 50}%`, background: "var(--accent)", opacity: 0.8 }} />
                  <div style={{ flex: 1, background: "var(--teal)", opacity: 0.8 }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", color: "var(--accent)" }}>Alpha {alpha}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", color: "var(--teal)" }}>Content {content}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Window>
  );
}

// ─── Settings Window ──────────────────────────────────────────────────────────

function SettingsWindow({ win, wm }: { win: WindowState; wm: WM }) {
  const [focus, setFocus] = useState("");
  const [minConv, setMinConv] = useState(7);
  const [ecosystems, setEcosystems] = useState(["ETH", "SOL", "BASE", "ARB"]);
  const [voice, setVoice] = useState("");
  const [newEco, setNewEco] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [inited, setInited] = useState(false);

  useEffect(() => {
    if (!win.open || inited) return;
    setInited(true);
    (async () => {
      try {
        const r = await fetch("/api/settings");
        const { settings } = await r.json();
        if (settings) {
          setFocus(settings.focus_area || "");
          setMinConv(settings.min_conviction || 7);
          setEcosystems(settings.ecosystems || ["ETH", "SOL", "BASE", "ARB"]);
          setVoice(settings.creator_voice || "");
        }
      } catch {}
    })();
  }, [win.open, inited]);

  async function save() {
    setSaving(true); setSaved(false);
    try {
      await fetch("/api/settings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ focus_area: focus, min_conviction: minConv, ecosystems, creator_voice: voice, output_type: "both" }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally { setSaving(false); }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: "0.67rem",
    background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)",
    color: "var(--text-1)", outline: "none", transition: "border-color 0.15s",
  };

  return (
    <Window id="settings" title="Settings" win={win} onFocus={wm.focus} onClose={wm.close} onMinimize={wm.minimize} width={520} minH={400}>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>

        <SF label="Focus area" hint="Shapes which signals score higher">
          <input type="text" value={focus} onChange={e => setFocus(e.target.value)} placeholder="e.g. DeFi, restaking, memecoins"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = "rgba(224,48,48,0.5)")}
            onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")} />
        </SF>

        <SF label={`Min conviction: ${minConv}/10`} hint="Signals below this are filtered">
          <input type="range" min={1} max={10} step={1} value={minConv} onChange={e => setMinConv(Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--accent)" }} />
        </SF>

        <SF label="Ecosystem watchlist" hint="Scanner prioritises these chains">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
            {ecosystems.map(e => (
              <span key={e} style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-mono)", fontSize: "0.48rem", padding: "3px 8px", border: "1px solid rgba(45,212,191,0.25)", background: "rgba(45,212,191,0.06)", color: "var(--teal)" }}>
                {e}
                <button type="button" onClick={() => setEcosystems(p => p.filter(x => x !== e))}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", lineHeight: 1, padding: 0 }}>×</button>
              </span>
            ))}
          </div>
          <input type="text" value={newEco} onChange={e => setNewEco(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && newEco.trim()) { setEcosystems(p => [...p, newEco.trim().toUpperCase()]); setNewEco(""); } }}
            placeholder="Add chain — press Enter" style={{ ...inputStyle, width: "auto", minWidth: 200 }}
            onFocus={e => (e.target.style.borderColor = "rgba(224,48,48,0.5)")}
            onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")} />
        </SF>

        <SF label="Creator voice" hint="Shapes content brief angles">
          <textarea value={voice} onChange={e => setVoice(e.target.value)} rows={3}
            placeholder="Describe your tone and audience..."
            style={{ ...inputStyle, resize: "none", lineHeight: 1.6 }}
            onFocus={e => (e.target.style.borderColor = "rgba(224,48,48,0.5)")}
            onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")} />
        </SF>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {saved && <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: "var(--green)" }}>✓ Saved</span>}
          <div style={{ marginLeft: "auto" }}>
            <button type="button" onClick={save} disabled={saving}
              style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.1em", padding: "10px 24px", background: "var(--accent)", color: "#fff", border: "none", cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
              {saving ? "Saving..." : "Save settings"}
            </button>
          </div>
        </div>

        {/* SQL schema */}
        <details style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
          <summary style={{ padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: "0.5rem", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", cursor: "pointer" }}>
            Supabase setup SQL — run once
          </summary>
          <pre style={{ padding: 12, fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "rgba(255,255,255,0.35)", lineHeight: 1.7, overflow: "auto", userSelect: "all", background: "rgba(255,255,255,0.02)" }}>
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

        {/* Env vars */}
        <div style={{ border: "1px solid rgba(255,255,255,0.06)", padding: 12 }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 10 }}>Required env vars</p>
          {[
            { key: "OPENROUTER_API_KEY", required: true, note: "Brief generation" },
            { key: "NEXT_PUBLIC_SUPABASE_URL", required: true, note: "Database" },
            { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", required: true, note: "Database auth" },
          ].map(v => (
            <div key={v.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", textTransform: "uppercase", padding: "2px 6px", border: `1px solid ${v.required ? "rgba(224,48,48,0.3)" : "rgba(255,255,255,0.08)"}`, color: v.required ? "var(--accent)" : "rgba(255,255,255,0.2)" }}>
                {v.required ? "req" : "opt"}
              </span>
              <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--teal)" }}>{v.key}</code>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", color: "rgba(255,255,255,0.2)" }}>{v.note}</span>
            </div>
          ))}
        </div>
      </div>
    </Window>
  );
}

function SF({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>{label}</p>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", color: "rgba(255,255,255,0.18)", marginBottom: 8 }}>{hint}</p>
      {children}
    </div>
  );
}

// ─── Window Manager ───────────────────────────────────────────────────────────

type WM = {
  focus: (id: WinId) => void;
  close: (id: WinId) => void;
  minimize: (id: WinId) => void;
  refreshBriefs: () => void;
};

// ─── Clock ────────────────────────────────────────────────────────────────────

function Clock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () => setT(new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", hour12: false }));
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ textAlign: "center", padding: "0 0 8px" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>{t}</div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.38rem", color: "rgba(255,255,255,0.18)", marginTop: 1 }}>UTC</div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const SIDEBAR_NAV = [
  { id: "signal" as WinId,    icon: P.zap,      label: "Signal Query",  active: true },
  { id: "briefs" as WinId,    icon: P.briefs,   label: "Briefs",        active: true },
  { id: "feed" as WinId,      icon: P.feed,     label: "Signal Feed",   active: true },
  { id: "analytics" as WinId, icon: P.chart,    label: "Analytics",     active: true },
  { id: "chain" as WinId,     icon: P.chain,    label: "Cross-chain",   active: false },
  { id: "settings" as WinId,  icon: P.eye,      label: "Signal Memory", active: false },
  { id: "settings" as WinId,  icon: P.globe,    label: "Narratives",    active: false },
] as const;

const TOOLBAR = [
  { id: "signal" as WinId,    icon: P.zap,      label: "Signal" },
  { id: "briefs" as WinId,    icon: P.briefs,   label: "Briefs" },
  { id: "feed" as WinId,      icon: P.feed,     label: "Feed" },
  { id: "analytics" as WinId, icon: P.chart,    label: "Stats" },
  { id: "settings" as WinId,  icon: P.settings, label: "Settings" },
];

const INIT_POSITIONS: Record<WinId, { x: number; y: number }> = {
  signal:    { x: 100, y: 60 },
  briefs:    { x: 130, y: 80 },
  feed:      { x: 160, y: 70 },
  analytics: { x: 150, y: 90 },
  settings:  { x: 120, y: 75 },
};

export default function CommandCenter() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [zTop, setZTop] = useState(100);
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [briefsLoading, setBriefsLoading] = useState(false);

  const [windows, setWindows] = useState<Record<WinId, WindowState>>(() => {
    const ids: WinId[] = ["signal", "briefs", "feed", "analytics", "settings"];
    return Object.fromEntries(ids.map((id, i) => [id, {
      id, open: false, zIndex: 100 + i,
      x: INIT_POSITIONS[id].x, y: INIT_POSITIONS[id].y,
      minimized: false,
    }])) as Record<WinId, WindowState>;
  });

  const refreshBriefs = useCallback(async () => {
    setBriefsLoading(true);
    try {
      const r = await fetch("/api/briefs");
      const { briefs: data } = await r.json();
      setBriefs(data || []);
    } catch { } finally { setBriefsLoading(false); }
  }, []);

  useEffect(() => { refreshBriefs(); }, [refreshBriefs]);

  const focus = useCallback((id: WinId) => {
    setZTop(z => {
      const next = z + 1;
      setWindows(prev => ({ ...prev, [id]: { ...prev[id], zIndex: next } }));
      return next;
    });
  }, []);

  const open = useCallback((id: WinId) => {
    setZTop(z => {
      const next = z + 1;
      setWindows(prev => ({
        ...prev,
        [id]: { ...prev[id], open: true, minimized: false, zIndex: next },
      }));
      return next;
    });
  }, []);

  const close = useCallback((id: WinId) => {
    setWindows(prev => ({ ...prev, [id]: { ...prev[id], open: false } }));
  }, []);

  const minimize = useCallback((id: WinId) => {
    setWindows(prev => ({ ...prev, [id]: { ...prev[id], minimized: !prev[id].minimized } }));
  }, []);

  const toggle = useCallback((id: WinId) => {
    setWindows(prev => {
      if (prev[id].open) {
        return { ...prev, [id]: { ...prev[id], open: false } };
      }
      return prev;
    });
    if (!windows[id].open) open(id);
    else close(id);
  }, [windows, open, close]);

  const wm: WM = { focus, close, minimize, refreshBriefs };
  const pendingCount = briefs.filter(b => b.status === "pending").length;
  const openWinCount = Object.values(windows).filter(w => w.open).length;

  return (
    <div style={{
      width: "100vw", height: "100vh", overflow: "hidden", display: "flex",
      background: "#080809", position: "relative",
    }}>
      {/* Grid canvas */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "linear-gradient(rgba(224,48,48,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(224,48,48,0.025) 1px, transparent 1px)",
        backgroundSize: "44px 44px",
      }} />
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 55% 40% at 50% 50%, rgba(224,48,48,0.035) 0%, transparent 70%)",
      }} />

      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? 200 : 64, flexShrink: 0,
        background: "rgba(8,8,9,0.97)",
        borderRight: "1px solid rgba(224,48,48,0.12)",
        display: "flex", flexDirection: "column", alignItems: sidebarOpen ? "flex-start" : "center",
        zIndex: 200, transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden",
      }}>
        {/* Logo + toggle */}
        <div style={{
          width: "100%", height: 56, flexShrink: 0,
          display: "flex", alignItems: "center",
          padding: sidebarOpen ? "0 16px" : "0",
          justifyContent: sidebarOpen ? "space-between" : "center",
          borderBottom: "1px solid rgba(224,48,48,0.1)",
        }}>
          {sidebarOpen && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, border: "1px solid rgba(224,48,48,0.35)", background: "rgba(224,48,48,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: "var(--accent)", fontSize: "0.9rem" }}>⌬</span>
              </div>
              <span style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-1)", whiteSpace: "nowrap" }}>ViralClaw</span>
            </div>
          )}
          {!sidebarOpen && (
            <div style={{ width: 30, height: 30, border: "1px solid rgba(224,48,48,0.3)", background: "rgba(224,48,48,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "var(--accent)", fontSize: "0.85rem" }}>⌬</span>
            </div>
          )}
          <button type="button" onClick={() => setSidebarOpen(o => !o)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex", padding: 4, flexShrink: 0, transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}>
            <div style={{ transform: sidebarOpen ? "rotate(180deg)" : "none", transition: "transform 0.22s" }}>
              <Ic path={P.chevronR} size={14} />
            </div>
          </button>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: "12px 0", width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Divider label */}
          {sidebarOpen && (
            <div style={{ padding: "4px 16px 6px", fontFamily: "var(--font-mono)", fontSize: "0.42rem", textTransform: "uppercase", letterSpacing: "0.16em", color: "rgba(255,255,255,0.18)" }}>
              Intelligence
            </div>
          )}
          {[
            { id: "signal" as WinId,    icon: P.zap,      label: "Signal Query",  disabled: false, badge: null },
            { id: "briefs" as WinId,    icon: P.briefs,   label: "Briefs",        disabled: false, badge: pendingCount > 0 ? pendingCount : null },
            { id: "feed" as WinId,      icon: P.feed,     label: "Signal Feed",   disabled: false, badge: briefs.length > 0 ? briefs.length : null },
            { id: "analytics" as WinId, icon: P.chart,    label: "Analytics",     disabled: false, badge: null },
          ].map(item => {
            const isOpen = windows[item.id].open;
            return (
              <button key={`${item.id}-${item.label}`} type="button"
                onClick={() => { item.disabled ? null : (isOpen ? close(item.id) : open(item.id)); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center",
                  gap: sidebarOpen ? 10 : 0, justifyContent: sidebarOpen ? "flex-start" : "center",
                  padding: sidebarOpen ? "8px 16px" : "10px 0",
                  background: isOpen ? "rgba(224,48,48,0.1)" : "transparent",
                  borderLeft: `2px solid ${isOpen ? "var(--accent)" : "transparent"}`,
                  border: "none", borderLeftStyle: "solid",
                  borderLeftWidth: 2, borderLeftColor: isOpen ? "var(--accent)" : "transparent",
                  cursor: item.disabled ? "not-allowed" : "pointer",
                  color: isOpen ? "var(--accent)" : item.disabled ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.4)",
                  transition: "all 0.15s", position: "relative",
                }}
                onMouseEnter={e => { if (!item.disabled && !isOpen) e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                onMouseLeave={e => { if (!isOpen) e.currentTarget.style.color = item.disabled ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.4)"; }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <Ic path={item.icon} size={16} />
                  {item.badge !== null && !sidebarOpen && (
                    <span style={{ position: "absolute", top: -4, right: -4, width: 14, height: 14, borderRadius: "50%", background: "var(--accent)", color: "#fff", fontFamily: "var(--font-mono)", fontSize: "0.38rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {item.badge}
                    </span>
                  )}
                </div>
                {sidebarOpen && (
                  <>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.57rem", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap", flex: 1, textAlign: "left" }}>{item.label}</span>
                    {item.badge !== null && (
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.44rem", padding: "1px 6px", borderRadius: 10, background: "var(--accent)", color: "#fff", fontWeight: 700 }}>{item.badge}</span>
                    )}
                  </>
                )}
              </button>
            );
          })}

          {/* Coming soon section */}
          {sidebarOpen && (
            <div style={{ padding: "12px 16px 6px", fontFamily: "var(--font-mono)", fontSize: "0.42rem", textTransform: "uppercase", letterSpacing: "0.16em", color: "rgba(255,255,255,0.15)", marginTop: 8, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              Coming soon
            </div>
          )}
          {!sidebarOpen && <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "8px 12px" }} />}

          {[
            { icon: P.chain, label: "Cross-chain" },
            { icon: P.eye,   label: "Signal Memory" },
            { icon: P.globe, label: "Narratives" },
          ].map(item => (
            <div key={item.label} title={item.label}
              style={{
                width: "100%", display: "flex", alignItems: "center",
                gap: sidebarOpen ? 10 : 0, justifyContent: sidebarOpen ? "flex-start" : "center",
                padding: sidebarOpen ? "8px 16px" : "10px 0",
                color: "rgba(255,255,255,0.1)", cursor: "not-allowed",
              }}>
              <Ic path={item.icon} size={16} />
              {sidebarOpen && (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.57rem", textTransform: "uppercase", letterSpacing: "0.08em", flex: 1, whiteSpace: "nowrap" }}>{item.label}</span>
              )}
              {sidebarOpen && (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.4rem", padding: "1px 5px", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.15)" }}>soon</span>
              )}
            </div>
          ))}

          {/* Settings at bottom */}
          <div style={{ flex: 1 }} />
          <button type="button" onClick={() => windows["settings"].open ? close("settings") : open("settings")}
            style={{
              width: "100%", display: "flex", alignItems: "center",
              gap: sidebarOpen ? 10 : 0, justifyContent: sidebarOpen ? "flex-start" : "center",
              padding: sidebarOpen ? "8px 16px" : "10px 0",
              background: windows["settings"].open ? "rgba(224,48,48,0.1)" : "transparent",
              borderLeft: `2px solid ${windows["settings"].open ? "var(--accent)" : "transparent"}`,
              border: "none", borderLeftStyle: "solid", borderLeftWidth: 2, borderLeftColor: windows["settings"].open ? "var(--accent)" : "transparent",
              color: windows["settings"].open ? "var(--accent)" : "rgba(255,255,255,0.3)",
              cursor: "pointer", transition: "all 0.15s",
            }}>
            <Ic path={P.settings} size={16} />
            {sidebarOpen && <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.57rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Settings</span>}
          </button>
        </nav>

        {/* Clock */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", width: "100%", paddingTop: 12, display: "flex", justifyContent: "center" }}>
          <Clock />
        </div>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>

        {/* Top bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 48, zIndex: 150,
          background: "rgba(8,8,9,0.92)", borderBottom: "1px solid rgba(224,48,48,0.1)",
          display: "flex", alignItems: "center", padding: "0 20px", gap: 16,
          backdropFilter: "blur(10px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(255,255,255,0.2)" }}>command-center</span>
            <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)" }}>Signal Intelligence</span>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80", animation: "blinkA 2s ease infinite", display: "inline-block" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.48rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#4ade80" }}>Brief engine live</span>
          </div>
          <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.08)" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.48rem", color: "rgba(255,255,255,0.25)" }}>{briefs.length} briefs · {openWinCount} windows</span>
          <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.08)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(224,48,48,0.5)", display: "inline-block" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", color: "rgba(255,255,255,0.2)" }}>On-chain scanner — building</span>
          </div>
        </div>

        {/* Window canvas area */}
        <div style={{ position: "absolute", inset: 0, top: 48, bottom: 72 }}>
          {/* Empty state */}
          {openWinCount === 0 && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <div style={{ textAlign: "center", opacity: 0.4 }}>
                <div style={{ width: 40, height: 40, border: "1px solid rgba(224,48,48,0.3)", background: "rgba(224,48,48,0.05)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <span style={{ color: "var(--accent)", fontSize: "1.2rem" }}>⌬</span>
                </div>
                <p style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "1.4rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.35)" }}>ViralClaw</p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(255,255,255,0.15)", marginTop: 6 }}>Synchronization intelligence layer</p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.46rem", color: "rgba(255,255,255,0.1)", marginTop: 16 }}>Select a module from the sidebar or toolbar</p>
              </div>
            </div>
          )}

          {/* Windows */}
          <SignalWindow win={windows.signal} wm={wm} />
          <BriefsWindow win={windows.briefs} wm={wm} briefs={briefs} loading={briefsLoading} />
          <FeedWindow win={windows.feed} wm={wm} briefs={briefs} />
          <AnalyticsWindow win={windows.analytics} wm={wm} briefs={briefs} loading={briefsLoading} />
          <SettingsWindow win={windows.settings} wm={wm} />
        </div>

        {/* Bottom toolbar */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 72, zIndex: 150,
          background: "rgba(8,8,9,0.95)", borderTop: "1px solid rgba(224,48,48,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        }}>
          {TOOLBAR.map(item => {
            const isOpen = windows[item.id].open;
            return (
              <button key={item.id} type="button"
                onClick={() => isOpen ? close(item.id) : open(item.id)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                  padding: "10px 20px", minWidth: 72,
                  background: isOpen ? "rgba(224,48,48,0.12)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${isOpen ? "rgba(224,48,48,0.3)" : "rgba(255,255,255,0.06)"}`,
                  borderRadius: 8, cursor: "pointer",
                  color: isOpen ? "var(--accent)" : "rgba(255,255,255,0.3)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!isOpen) { e.currentTarget.style.color = "rgba(255,255,255,0.65)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"; } }}
                onMouseLeave={e => { if (!isOpen) { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; } }}>
                <Ic path={item.icon} size={18} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.42rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>{item.label}</span>
                {isOpen && <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--accent)", display: "inline-block", position: "absolute", bottom: 8 }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* CSS keyframes */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blinkA { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
      `}</style>
    </div>
  );
}
