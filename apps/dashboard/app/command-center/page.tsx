"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type PanelId = "signals" | "briefs" | "analytics" | "settings" | "feed" | null;
type Brief = { id: string; type: "alpha" | "content"; conviction: number; window: string; content: string; created_at: string; status: string };

// ─── Icon components ──────────────────────────────────────────────────────────

function Icon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  grid:      "M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z",
  signal:    "M2 12h3m14 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1M12 2v3m0 14v3M5.6 18.4l2.1-2.1m8.6-8.6 2.1-2.1M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  alpha:     "M12 2L2 19h20L12 2zm0 6v6m0 2v2",
  content:   "M4 6h16M4 10h12M4 14h8M4 18h10",
  analytics: "M3 17l4-8 4 4 4-7 4 4",
  settings:  "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 0v2m0-8V7m5.2 1.8 1.4-1.4M5.4 18.6 6.8 17.2M19.2 17.2l-1.4-1.4M6.8 6.8 5.4 5.4M21 12h-2M5 12H3",
  feed:      "M22 12h-4l-3 9L9 3l-3 9H2",
  wallet:    "M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5zm-10 2H3m14-4h2",
  close:     "M18 6 6 18M6 6l12 12",
  minimize:  "M5 12h14",
  maximize:  "M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z",
  chain:     "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  zap:       "M13 2 3 14h9l-1 8 10-12h-9l1-8z",
  eye:       "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zm11-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  send:      "M22 2 11 13M22 2 15 22 11 13 2 9l20-7z",
  plus:      "M12 5v14M5 12h14",
  globe:     "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 0a14.5 14.5 0 0 1 4 10 14.5 14.5 0 0 1-4 10A14.5 14.5 0 0 1 8 12 14.5 14.5 0 0 1 12 2zM2 12h20",
};

// ─── Window Panel ─────────────────────────────────────────────────────────────

function Panel({
  id, title, active, onClose, children, width = 640,
}: {
  id: PanelId; title: string; active: boolean; onClose: () => void; children: React.ReactNode; width?: number;
}) {
  if (!active) return null;
  return (
    <div
      className="absolute top-[80px] left-[120px] z-50 flex flex-col overflow-hidden"
      style={{
        width: Math.min(width, typeof window !== "undefined" ? window.innerWidth - 140 : width),
        maxHeight: "calc(100vh - 160px)",
        background: "rgba(10,10,12,0.97)",
        border: "1px solid rgba(224,48,48,0.35)",
        boxShadow: "0 0 0 1px rgba(224,48,48,0.1), 0 24px 80px rgba(0,0,0,0.8)",
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-3 px-4 py-[10px] border-b shrink-0"
        style={{ borderColor: "rgba(224,48,48,0.2)", background: "rgba(224,48,48,0.04)" }}
      >
        <span className="text-[var(--accent)] text-[0.6rem]">◆</span>
        <span className="font-mono text-[0.62rem] tracking-[0.16em] uppercase text-[var(--text-1)] flex-1">{title}</span>
        <div className="flex items-center gap-1">
          <button type="button" className="w-6 h-6 flex items-center justify-center text-[var(--text-4)] hover:text-[var(--text-2)] transition-colors">
            <Icon d={ICONS.minimize} size={11} />
          </button>
          <button type="button" className="w-6 h-6 flex items-center justify-center text-[var(--text-4)] hover:text-[var(--text-2)] transition-colors">
            <Icon d={ICONS.maximize} size={11} />
          </button>
          <button type="button" onClick={onClose} className="w-6 h-6 flex items-center justify-center text-[var(--text-4)] hover:text-[var(--accent)] transition-colors">
            <Icon d={ICONS.close} size={11} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

// ─── Signal Query Panel ───────────────────────────────────────────────────────

function SignalPanel({ onClose, onBriefGenerated }: { onClose: () => void; onBriefGenerated: (b: any) => void }) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"both" | "alpha" | "content">("both");
  const [loading, setLoading] = useState(false);
  const [alpha, setAlpha] = useState<any>(null);
  const [content, setContent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function run() {
    if (!query.trim() || loading) return;
    setLoading(true); setError(null); setAlpha(null); setContent(null); setSaved(false);
    try {
      const modes = mode === "both" ? ["alpha", "content"] : [mode];
      const results = await Promise.allSettled(
        modes.map(m => fetch("/api/generate-brief", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, mode: m }),
        }).then(r => r.json()))
      );
      results.forEach((r, i) => {
        if (r.status === "fulfilled" && r.value.brief) {
          if (modes[i] === "alpha") setAlpha(r.value.brief);
          else setContent(r.value.brief);
        }
      });
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function saveAll() {
    const toSave = [alpha && { type: "alpha", brief: alpha }, content && { type: "content", brief: content }].filter(Boolean);
    for (const item of toSave as any[]) {
      await fetch("/api/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: item.type, status: "pending",
          conviction: item.brief.conviction, window: item.brief.window,
          content: JSON.stringify(item.brief),
          signal_summary: item.brief.signal_summary || item.brief.narrative_summary,
          chains: item.brief.chains,
        }),
      });
      onBriefGenerated(item.brief);
    }
    setSaved(true);
  }

  const wc = (w: string) => w === "open" ? "var(--green)" : w === "closing" ? "var(--amber)" : "var(--accent)";

  return (
    <Panel id="signals" title="Signal Query" active onClose={onClose} width={720}>
      <div className="p-4 space-y-4">
        {/* Mode selector */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[0.48rem] text-[var(--text-4)] uppercase tracking-[0.12em]">Output:</span>
          {(["both", "alpha", "content"] as const).map(m => (
            <button key={m} type="button" onClick={() => setMode(m)}
              className="font-mono text-[0.5rem] tracking-[0.08em] uppercase px-3 py-[4px] border transition-all"
              style={{
                background: mode === m ? "var(--accent)" : "transparent",
                color: mode === m ? "#fff" : "var(--text-4)",
                borderColor: mode === m ? "var(--accent)" : "rgba(255,255,255,0.08)",
              }}>
              {m === "both" ? "Alpha + Content" : m}
            </button>
          ))}
        </div>

        {/* Query input */}
        <div>
          <textarea
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") run(); }}
            placeholder={`Describe a signal, trend, token or ecosystem...\ne.g. "EigenLayer restaking — whale accumulation on ETH and ARB"`}
            rows={4}
            className="w-full p-3 font-mono text-[0.7rem] leading-[1.7] resize-none outline-none transition-colors"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "var(--text-1)",
            }}
            onFocus={e => (e.target.style.borderColor = "rgba(224,48,48,0.5)")}
            onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="font-mono text-[0.46rem] text-[var(--text-4)]">⌘↩ to run</span>
            <button type="button" onClick={run} disabled={loading || !query.trim()}
              className="font-mono text-[0.55rem] tracking-[0.1em] uppercase px-5 py-2 flex items-center gap-2 transition-all"
              style={{
                background: loading || !query.trim() ? "rgba(255,255,255,0.04)" : "var(--accent)",
                color: loading || !query.trim() ? "var(--text-4)" : "#fff",
              }}>
              {loading ? <><span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />Generating...</> : <><Icon d={ICONS.zap} size={12} />Run signal query</>}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 border border-[var(--accent-border)] bg-[var(--accent-dim)]">
            <p className="font-mono text-[0.55rem] text-[var(--accent)]">{error}</p>
            <p className="font-mono text-[0.48rem] text-[var(--text-4)] mt-1">Check OPENROUTER_API_KEY is set.</p>
          </div>
        )}

        {/* Results */}
        {(alpha || content) && (
          <div className="grid grid-cols-2 gap-3">
            {alpha && (
              <BriefCard title="Alpha Brief" brief={alpha} color="var(--accent)" windowColor={wc(alpha.window)} />
            )}
            {content && (
              <BriefCard title="Content Brief" brief={content} color="var(--teal)" windowColor={wc(content.window)} />
            )}
          </div>
        )}

        {(alpha || content) && !saved && (
          <div className="flex justify-end">
            <button type="button" onClick={saveAll}
              className="font-mono text-[0.55rem] tracking-[0.1em] uppercase px-5 py-2 border border-[var(--teal-border)] bg-[var(--teal-dim)] text-[var(--teal)] hover:bg-[var(--teal)] hover:text-white transition-all flex items-center gap-2">
              <Icon d={ICONS.send} size={12} />Save to Briefs
            </button>
          </div>
        )}
        {saved && (
          <p className="font-mono text-[0.52rem] text-[var(--green)] text-right flex items-center justify-end gap-1">
            <span>✓</span> Saved to briefs
          </p>
        )}
      </div>
    </Panel>
  );
}

function BriefCard({ title, brief, color, windowColor }: { title: string; brief: any; color: string; windowColor: string }) {
  return (
    <div className="border p-3 space-y-3" style={{ borderColor: color + "33", background: color + "08" }}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[0.52rem] tracking-[0.1em] uppercase" style={{ color }}>{title}</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[0.46rem]" style={{ color: windowColor }}>{brief.window}</span>
          <span className="font-mono text-[0.46rem] text-[var(--text-4)]">{brief.conviction}/10</span>
        </div>
      </div>
      <p className="text-[0.73rem] text-[var(--text-2)] leading-[1.65]">
        {brief.signal_summary || brief.narrative_summary}
      </p>
      {brief.chains?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {brief.chains.map((c: string) => (
            <span key={c} className="font-mono text-[0.46rem] px-2 py-[2px] border border-[var(--teal-border)] bg-[var(--teal-dim)] text-[var(--teal)]">{c}</span>
          ))}
        </div>
      )}
      {brief.angles?.length > 0 && (
        <div className="space-y-1">
          {brief.angles.slice(0, 2).map((a: string, i: number) => (
            <div key={i} className="flex gap-2">
              <span className="font-mono text-[0.44rem] text-[var(--teal)] shrink-0">0{i+1}</span>
              <p className="text-[0.68rem] text-[var(--text-3)] leading-[1.5]">{a}</p>
            </div>
          ))}
        </div>
      )}
      {brief.risk_context && (
        <p className="text-[0.66rem] text-[var(--amber)] leading-[1.5] border-t border-[var(--amber-border)] pt-2 mt-1">
          ⚠ {brief.risk_context}
        </p>
      )}
    </div>
  );
}

// ─── Briefs Panel ─────────────────────────────────────────────────────────────

function BriefsPanel({ onClose }: { onClose: () => void }) {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Brief | null>(null);
  const [tab, setTab] = useState<"all" | "pending" | "approved">("all");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const params = tab !== "all" ? `?status=${tab}` : "";
        const r = await fetch(`/api/briefs${params}`);
        const { briefs: data } = await r.json();
        setBriefs(data || []);
      } catch { } finally { setLoading(false); }
    })();
  }, [tab]);

  async function updateStatus(id: string, status: "approved" | "archived") {
    setUpdating(id);
    try {
      await fetch("/api/briefs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      setBriefs(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
    } catch { } finally { setUpdating(null); }
  }

  const wc = (w: string) => w === "open" ? "var(--green)" : w === "closing" ? "var(--amber)" : "var(--text-4)";
  const pending = briefs.filter(b => b.status === "pending").length;

  return (
    <Panel id="briefs" title={`Briefs${pending > 0 ? ` — ${pending} pending` : ""}`} active onClose={onClose} width={760}>
      <div className="flex h-full" style={{ minHeight: 400 }}>
        {/* List */}
        <div className="w-[55%] border-r flex flex-col" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex border-b px-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            {(["all", "pending", "approved"] as const).map(t => (
              <button key={t} type="button" onClick={() => setTab(t)}
                className="font-mono text-[0.5rem] tracking-[0.08em] uppercase px-3 py-2 border-b-2 transition-colors"
                style={{ borderColor: tab === t ? "var(--accent)" : "transparent", color: tab === t ? "var(--text-1)" : "var(--text-4)" }}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="py-12 text-center">
                <div className="inline-block w-3 h-3 border border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : briefs.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <p className="font-mono text-[0.52rem] text-[var(--text-4)]">No briefs yet.</p>
                <p className="font-mono text-[0.46rem] text-[var(--text-4)] mt-1">Run a signal query to generate briefs.</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                {briefs.map(b => {
                  let p: any = {}; try { p = JSON.parse(b.content); } catch {}
                  const isSelected = selected?.id === b.id;
                  return (
                    <div key={b.id} onClick={() => setSelected(isSelected ? null : b)}
                      className="px-3 py-3 flex items-start gap-2 cursor-pointer transition-colors"
                      style={{ background: isSelected ? "rgba(224,48,48,0.06)" : "transparent" }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}>
                      <span className="font-mono text-[0.44rem] tracking-[0.06em] uppercase px-[6px] py-[2px] border shrink-0 mt-[1px]"
                        style={{
                          color: b.type === "alpha" ? "var(--accent)" : "var(--teal)",
                          borderColor: b.type === "alpha" ? "rgba(224,48,48,0.3)" : "rgba(45,212,191,0.3)",
                          background: b.type === "alpha" ? "rgba(224,48,48,0.06)" : "rgba(45,212,191,0.06)",
                        }}>
                        {b.type}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.72rem] text-[var(--text-1)] truncate">{p.signal_summary || p.narrative_summary || "Brief"}</p>
                        <div className="flex items-center gap-2 mt-[3px]">
                          <span className="font-mono text-[0.44rem]" style={{ color: wc(b.window) }}>{b.window}</span>
                          <span className="font-mono text-[0.44rem] text-[var(--text-4)]">·</span>
                          <span className="font-mono text-[0.44rem] text-[var(--text-4)]">{b.conviction}/10</span>
                          <span className="font-mono text-[0.44rem] text-[var(--text-4)]">·</span>
                          <span className="font-mono text-[0.44rem]"
                            style={{ color: b.status === "approved" ? "var(--green)" : b.status === "archived" ? "var(--text-4)" : "var(--amber)" }}>
                            {b.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Detail */}
        <div className="w-[45%] flex flex-col">
          {selected ? (() => {
            let p: any = {}; try { p = JSON.parse(selected.content); } catch {}
            return (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Conviction bar */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-mono text-[0.46rem] uppercase text-[var(--text-4)]">Conviction</span>
                      <span className="font-mono text-[0.54rem] font-semibold" style={{ color: selected.conviction >= 8 ? "var(--green)" : selected.conviction >= 6 ? "var(--amber)" : "var(--accent)" }}>
                        {selected.conviction}/10
                      </span>
                    </div>
                    <div className="h-[2px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div className="h-full rounded-full" style={{ width: `${selected.conviction * 10}%`, background: selected.conviction >= 8 ? "var(--green)" : selected.conviction >= 6 ? "var(--amber)" : "var(--accent)", transition: "width 0.5s ease" }} />
                    </div>
                  </div>
                  {p.signal_summary && <DR label="Signal" value={p.signal_summary} />}
                  {p.narrative_summary && <DR label="Narrative" value={p.narrative_summary} />}
                  {p.chains?.length > 0 && (
                    <div>
                      <span className="font-mono text-[0.44rem] uppercase text-[var(--text-4)] block mb-2">Chains</span>
                      <div className="flex flex-wrap gap-1">
                        {p.chains.map((c: string) => (
                          <span key={c} className="font-mono text-[0.48rem] px-2 py-[2px] border border-[var(--teal-border)] bg-[var(--teal-dim)] text-[var(--teal)]">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {p.cross_chain_map && <DR label="Cross-chain" value={p.cross_chain_map} />}
                  {p.conviction_reasoning && <DR label="Reasoning" value={p.conviction_reasoning} />}
                  {p.risk_context && <DR label="Risk" value={p.risk_context} color="var(--amber)" />}
                  {p.angles?.length > 0 && (
                    <div>
                      <span className="font-mono text-[0.44rem] uppercase text-[var(--text-4)] block mb-2">Angles</span>
                      <div className="space-y-2">
                        {p.angles.map((a: string, i: number) => (
                          <div key={i} className="flex gap-2 p-2 border" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                            <span className="font-mono text-[0.44rem] text-[var(--teal)] shrink-0">0{i+1}</span>
                            <p className="text-[0.7rem] text-[var(--text-2)] leading-[1.5]">{a}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {p.audience_framing && <DR label="Audience" value={p.audience_framing} />}
                  {p.evidence_links_description && <DR label="Evidence" value={p.evidence_links_description} color="var(--teal)" />}
                  {p.social_lag_hours !== undefined && (
                    <div className="flex justify-between py-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                      <span className="font-mono text-[0.44rem] text-[var(--text-4)]">Social lag</span>
                      <span className="font-mono text-[0.52rem] text-[var(--green)]">{p.social_lag_hours}h ahead</span>
                    </div>
                  )}
                </div>
                {selected.status === "pending" && (
                  <div className="p-3 border-t flex gap-2 shrink-0" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <button type="button" onClick={() => updateStatus(selected.id, "approved")} disabled={!!updating}
                      className="flex-1 font-mono text-[0.52rem] tracking-[0.08em] uppercase py-2 transition-all flex items-center justify-center gap-2"
                      style={{ background: "rgba(74,222,128,0.15)", color: "var(--green)", border: "1px solid rgba(74,222,128,0.25)" }}>
                      ✓ Approve
                    </button>
                    <button type="button" onClick={() => updateStatus(selected.id, "archived")} disabled={!!updating}
                      className="font-mono text-[0.52rem] tracking-[0.08em] uppercase px-4 py-2 border transition-all"
                      style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--text-3)" }}>
                      Archive
                    </button>
                  </div>
                )}
                {selected.status === "approved" && (
                  <div className="p-3 border-t shrink-0" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <p className="font-mono text-[0.48rem] text-[var(--green)] flex items-center gap-2">✓ Approved</p>
                  </div>
                )}
              </>
            );
          })() : (
            <div className="flex-1 flex items-center justify-center">
              <p className="font-mono text-[0.48rem] text-[var(--text-4)]">Select a brief</p>
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}

function DR({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <p className="font-mono text-[0.44rem] uppercase mb-1" style={{ color: color || "var(--text-4)" }}>{label}</p>
      <p className="text-[0.72rem] text-[var(--text-2)] leading-[1.65]">{value}</p>
    </div>
  );
}

// ─── Analytics Panel ──────────────────────────────────────────────────────────

function AnalyticsPanel({ onClose }: { onClose: () => void }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/briefs");
        const { briefs = [] } = await r.json();
        const total = briefs.length;
        const alpha = briefs.filter((b: any) => b.type === "alpha").length;
        const content = briefs.filter((b: any) => b.type === "content").length;
        const approved = briefs.filter((b: any) => b.status === "approved").length;
        const avgConv = total ? (briefs.reduce((s: number, b: any) => s + (b.conviction || 0), 0) / total).toFixed(1) : "—";
        const openW = briefs.filter((b: any) => b.window === "open").length;
        setStats({ total, alpha, content, approved, avgConv, openW });
      } catch { } finally { setLoading(false); }
    })();
  }, []);

  return (
    <Panel id="analytics" title="Analytics" active onClose={onClose} width={560}>
      <div className="p-4">
        {loading ? (
          <div className="py-12 text-center"><div className="inline-block w-3 h-3 border border-[var(--accent)] border-t-transparent rounded-full animate-spin" /></div>
        ) : !stats || stats.total === 0 ? (
          <div className="py-16 text-center space-y-2">
            <p className="font-mono text-[0.52rem] text-[var(--text-3)]">No data yet</p>
            <p className="font-mono text-[0.46rem] text-[var(--text-4)]">Generate briefs to see analytics.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Total briefs", value: stats.total, color: "var(--text-1)" },
                { label: "Alpha", value: stats.alpha, color: "var(--accent)" },
                { label: "Content", value: stats.content, color: "var(--teal)" },
                { label: "Approved", value: stats.approved, color: "var(--green)" },
                { label: "Avg conviction", value: `${stats.avgConv}/10`, color: "var(--amber)" },
                { label: "Open windows", value: stats.openW, color: "var(--green)" },
              ].map(s => (
                <div key={s.label} className="p-3 border text-center" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                  <div className="font-cond font-bold text-[1.5rem] leading-none mb-1" style={{ color: s.color }}>{s.value}</div>
                  <div className="font-mono text-[0.44rem] uppercase text-[var(--text-4)]">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="border p-3" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
              <p className="font-mono text-[0.46rem] uppercase text-[var(--text-4)] mb-3">Type split</p>
              <div className="h-[8px] rounded overflow-hidden flex">
                <div style={{ width: `${stats.total ? (stats.alpha / stats.total) * 100 : 50}%`, background: "var(--accent)", opacity: 0.8 }} />
                <div style={{ flex: 1, background: "var(--teal)", opacity: 0.8 }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="font-mono text-[0.44rem] text-[var(--accent)]">Alpha {stats.alpha}</span>
                <span className="font-mono text-[0.44rem] text-[var(--teal)]">Content {stats.content}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}

// ─── Settings Panel ───────────────────────────────────────────────────────────

function SettingsPanel({ onClose }: { onClose: () => void }) {
  const [focus, setFocus] = useState("");
  const [minConv, setMinConv] = useState(7);
  const [ecosystems, setEcosystems] = useState(["ETH", "SOL", "BASE", "ARB"]);
  const [voice, setVoice] = useState("");
  const [newEco, setNewEco] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      } catch { } finally { setLoading(false); }
    })();
  }, []);

  async function save() {
    setSaving(true); setSaved(false);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ focus_area: focus, min_conviction: minConv, ecosystems, creator_voice: voice, output_type: "both" }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { } finally { setSaving(false); }
  }

  return (
    <Panel id="settings" title="Settings" active onClose={onClose} width={520}>
      <div className="p-4 space-y-5">
        {loading ? (
          <div className="py-12 text-center"><div className="inline-block w-3 h-3 border border-[var(--accent)] border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <>
            <SField label="Focus area" hint="Shapes which signals score higher">
              <input type="text" value={focus} onChange={e => setFocus(e.target.value)}
                placeholder="e.g. DeFi, restaking, memecoins"
                className="w-full px-3 py-2 font-mono text-[0.67rem] outline-none transition-colors"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-1)" }}
                onFocus={e => (e.target.style.borderColor = "rgba(224,48,48,0.5)")}
                onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")} />
            </SField>

            <SField label={`Min conviction: ${minConv}/10`} hint="Signals below this are filtered before brief generation">
              <input type="range" min={1} max={10} step={1} value={minConv} onChange={e => setMinConv(Number(e.target.value))}
                className="w-full" style={{ accentColor: "var(--accent)" }} />
            </SField>

            <SField label="Ecosystem watchlist" hint="Scanner prioritises these chains">
              <div className="flex flex-wrap gap-1 mb-2">
                {ecosystems.map(e => (
                  <span key={e} className="flex items-center gap-1 font-mono text-[0.48rem] px-2 py-[3px] border border-[var(--teal-border)] bg-[var(--teal-dim)] text-[var(--teal)]">
                    {e}
                    <button type="button" onClick={() => setEcosystems(prev => prev.filter(x => x !== e))} className="text-[var(--text-4)] hover:text-[var(--accent)] ml-1">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={newEco} onChange={e => setNewEco(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && newEco.trim()) { setEcosystems(p => [...p, newEco.trim().toUpperCase()]); setNewEco(""); } }}
                  placeholder="Add chain (Enter)"
                  className="flex-1 px-3 py-2 font-mono text-[0.67rem] outline-none"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-1)" }}
                  onFocus={e => (e.target.style.borderColor = "rgba(224,48,48,0.5)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")} />
              </div>
            </SField>

            <SField label="Creator voice" hint="Shapes content brief angles and framing">
              <textarea value={voice} onChange={e => setVoice(e.target.value)}
                placeholder="Describe your tone and audience..."
                rows={3} className="w-full px-3 py-2 font-mono text-[0.67rem] outline-none resize-none leading-[1.6]"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-1)" }}
                onFocus={e => (e.target.style.borderColor = "rgba(224,48,48,0.5)")}
                onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")} />
            </SField>

            <div className="flex items-center justify-between">
              {saved && <span className="font-mono text-[0.5rem] text-[var(--green)] flex items-center gap-1">✓ Saved</span>}
              <div className="ml-auto">
                <button type="button" onClick={save} disabled={saving}
                  className="font-mono text-[0.55rem] tracking-[0.1em] uppercase px-5 py-2 transition-all"
                  style={{ background: "var(--accent)", color: "#fff", opacity: saving ? 0.6 : 1 }}>
                  {saving ? "Saving..." : "Save settings"}
                </button>
              </div>
            </div>

            {/* Supabase SQL */}
            <details className="border" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <summary className="px-3 py-2 font-mono text-[0.5rem] uppercase text-[var(--text-4)] cursor-pointer">
                Supabase setup SQL
              </summary>
              <pre className="p-3 text-[0.55rem] font-mono text-[var(--text-3)] overflow-x-auto leading-[1.7] select-all" style={{ background: "rgba(255,255,255,0.02)" }}>
{`create table if not exists signals (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  chain text, type text, summary text,
  conviction int, window text,
  chains text[], social_lag_hours int,
  status text default 'new'
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
          </>
        )}
      </div>
    </Panel>
  );
}

function SField({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[0.5rem] tracking-[0.12em] uppercase text-[var(--text-3)] mb-1">{label}</p>
      <p className="font-mono text-[0.44rem] text-[var(--text-4)] mb-2">{hint}</p>
      {children}
    </div>
  );
}

// ─── Live Feed Panel ──────────────────────────────────────────────────────────

function FeedPanel({ onClose, recentBriefs }: { onClose: () => void; recentBriefs: any[] }) {
  return (
    <Panel id="feed" title="Signal Feed" active onClose={onClose} width={480}>
      <div className="p-4">
        {recentBriefs.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="flex justify-center">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-[blinkA_1.5s_ease_infinite]" />
            </div>
            <p className="font-mono text-[0.52rem] text-[var(--text-3)]">Monitoring signals</p>
            <p className="font-mono text-[0.46rem] text-[var(--text-4)]">Run a query to start generating intelligence.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentBriefs.map((b, i) => (
              <div key={i} className="flex items-start gap-3 p-3 border" style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
                <span className="w-[5px] h-[5px] rounded-full shrink-0 mt-[5px]"
                  style={{ background: b.type === "alpha" ? "var(--accent)" : "var(--teal)", animation: "blinkA 2s ease infinite" }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[0.46rem] uppercase" style={{ color: b.type === "alpha" ? "var(--accent)" : "var(--teal)" }}>{b.type}</span>
                    <span className="font-mono text-[0.44rem] text-[var(--text-4)]">·</span>
                    <span className="font-mono text-[0.44rem]" style={{ color: b.window === "open" ? "var(--green)" : b.window === "closing" ? "var(--amber)" : "var(--text-4)" }}>{b.window}</span>
                    <span className="font-mono text-[0.44rem] text-[var(--text-4)] ml-auto">{b.conviction}/10</span>
                  </div>
                  <p className="text-[0.71rem] text-[var(--text-2)] leading-[1.5] line-clamp-2">
                    {b.signal_summary || b.narrative_summary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Panel>
  );
}

// ─── Main Canvas Dashboard ────────────────────────────────────────────────────

export default function CommandCenterPage() {
  const [activePanel, setActivePanel] = useState<PanelId>(null);
  const [briefCount, setBriefCount] = useState(0);
  const [recentBriefs, setRecentBriefs] = useState<any[]>([]);

  // Load brief count on mount
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/briefs");
        const { briefs = [] } = await r.json();
        setBriefCount(briefs.length);
        setRecentBriefs(briefs.slice(0, 6).map((b: any) => {
          let p: any = {}; try { p = JSON.parse(b.content); } catch {}
          return { ...b, signal_summary: p.signal_summary, narrative_summary: p.narrative_summary };
        }));
      } catch {}
    })();
  }, []);

  const toggle = (id: PanelId) => setActivePanel(prev => prev === id ? null : id);

  const onBriefGenerated = (b: any) => {
    setBriefCount(c => c + 1);
    setRecentBriefs(prev => [b, ...prev].slice(0, 6));
  };

  // Sidebar items
  const sideItems = [
    { id: "signals",   icon: ICONS.zap,       label: "Signal Query",   badge: null },
    { id: "feed",      icon: ICONS.feed,       label: "Live Feed",      badge: recentBriefs.length > 0 ? recentBriefs.length : null },
    { id: "briefs",    icon: ICONS.alpha,      label: "Briefs",         badge: briefCount > 0 ? briefCount : null },
    { id: "analytics", icon: ICONS.analytics,  label: "Analytics",      badge: null },
    { id: "chain",     icon: ICONS.chain,      label: "Cross-chain",    badge: null, disabled: true },
    { id: "eye",       icon: ICONS.eye,        label: "Signal Memory",  badge: null, disabled: true },
    { id: "globe",     icon: ICONS.globe,      label: "Narratives",     badge: null, disabled: true },
    { id: "settings",  icon: ICONS.settings,   label: "Settings",       badge: null },
  ] as const;

  // Bottom toolbar items
  const toolItems = [
    { id: "signals",   icon: ICONS.zap,      label: "Signal" },
    { id: "briefs",    icon: ICONS.alpha,    label: "Briefs" },
    { id: "feed",      icon: ICONS.feed,     label: "Feed" },
    { id: "analytics", icon: ICONS.analytics,label: "Stats" },
    { id: "settings",  icon: ICONS.settings, label: "Settings" },
  ] as const;

  return (
    <div
      className="relative flex overflow-hidden select-none"
      style={{
        width: "100%",
        height: "100%",
        background: "var(--bg)",
      }}
    >
      {/* ── Grid canvas background ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: [
            "linear-gradient(rgba(224,48,48,0.03) 1px, transparent 1px)",
            "linear-gradient(90deg, rgba(224,48,48,0.03) 1px, transparent 1px)",
          ].join(", "),
          backgroundSize: "48px 48px",
          zIndex: 0,
        }}
      />

      {/* ── Ambient glow ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(224,48,48,0.04) 0%, transparent 70%)",
          zIndex: 0,
        }}
      />

      {/* ── Icon sidebar ── */}
      <div
        className="relative flex flex-col items-center py-4 gap-1 shrink-0"
        style={{
          width: 64,
          background: "rgba(13,13,15,0.95)",
          borderRight: "1px solid rgba(224,48,48,0.15)",
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div className="w-10 h-10 flex items-center justify-center mb-4 border"
          style={{ borderColor: "rgba(224,48,48,0.3)", background: "rgba(224,48,48,0.08)" }}>
          <span style={{ color: "var(--accent)", fontSize: "1.1rem" }}>⌬</span>
        </div>

        {sideItems.map(item => {
          const isActive = activePanel === item.id;
          const isDisabled = "disabled" in item && item.disabled;
          return (
            <button
              key={item.id}
              type="button"
              title={item.label}
              disabled={isDisabled}
              onClick={() => !isDisabled && toggle(item.id as PanelId)}
              className="relative w-10 h-10 flex items-center justify-center transition-all"
              style={{
                color: isActive ? "var(--accent)" : isDisabled ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.35)",
                background: isActive ? "rgba(224,48,48,0.12)" : "transparent",
                borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                cursor: isDisabled ? "not-allowed" : "pointer",
              }}
            >
              <Icon d={item.icon} size={16} />
              {item.badge !== null && item.badge !== undefined && (
                <span
                  className="absolute top-[6px] right-[6px] w-[14px] h-[14px] rounded-full flex items-center justify-center font-mono text-[0.38rem] font-bold"
                  style={{ background: "var(--accent)", color: "#fff" }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Clock at bottom */}
        <div className="mt-auto text-center">
          <Clock />
        </div>
      </div>

      {/* ── Main canvas area ── */}
      <div className="relative flex-1 min-w-0" style={{ zIndex: 1 }}>

        {/* ── Top bar ── */}
        <div
          className="flex items-center justify-between px-5 shrink-0"
          style={{
            height: 52,
            background: "rgba(13,13,15,0.9)",
            borderBottom: "1px solid rgba(224,48,48,0.12)",
          }}
        >
          <div className="flex items-center gap-3">
            <span className="font-mono text-[0.5rem] tracking-[0.16em] uppercase text-[var(--text-4)]">
              command-center
            </span>
            <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
            <span className="font-mono text-[0.5rem] tracking-[0.12em] uppercase text-[var(--text-3)]">
              Signal Intelligence
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-[6px]">
              <span className="w-[5px] h-[5px] rounded-full bg-[var(--green)] animate-[blinkA_2s_ease_infinite]" />
              <span className="font-mono text-[0.48rem] uppercase tracking-[0.1em] text-[var(--green)]">
                Brief engine live
              </span>
            </div>
            <div className="w-px h-3" style={{ background: "rgba(255,255,255,0.08)" }} />
            <div className="font-mono text-[0.5rem] text-[var(--text-4)] flex items-center gap-2">
              <Icon d={ICONS.alpha} size={11} />
              <span>{briefCount} briefs</span>
            </div>
            <div className="w-px h-3" style={{ background: "rgba(255,255,255,0.08)" }} />
            <div className="font-mono text-[0.5rem] text-[var(--text-4)] flex items-center gap-2">
              <span className="w-[4px] h-[4px] rounded-full" style={{ background: "rgba(224,48,48,0.6)" }} />
              <span>On-chain scanner — building</span>
            </div>
          </div>
        </div>

        {/* ── Canvas ── */}
        <div className="relative" style={{ height: "calc(100% - 52px - 72px)" }}>
          {/* Empty state canvas */}
          {!activePanel && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-12 h-12 border flex items-center justify-center"
                    style={{ borderColor: "rgba(224,48,48,0.3)", background: "rgba(224,48,48,0.05)" }}>
                    <span style={{ color: "var(--accent)", fontSize: "1.4rem" }}>⌬</span>
                  </div>
                </div>
                <p className="font-cond text-[1.6rem] font-bold uppercase tracking-[0.08em] text-[var(--text-1)]">
                  ViralClaw
                </p>
                <p className="font-mono text-[0.54rem] tracking-[0.2em] uppercase text-[var(--text-4)]">
                  Synchronization intelligence layer
                </p>
                <div className="flex items-center justify-center gap-6 mt-8">
                  {[
                    { label: "Signal query", hint: "Run intelligence" },
                    { label: "Briefs", hint: `${briefCount} generated` },
                    { label: "On-chain scanner", hint: "Building" },
                  ].map(item => (
                    <div key={item.label} className="text-center">
                      <p className="font-mono text-[0.52rem] uppercase text-[var(--text-3)]">{item.label}</p>
                      <p className="font-mono text-[0.44rem] text-[var(--text-4)] mt-[2px]">{item.hint}</p>
                    </div>
                  ))}
                </div>
                <p className="font-mono text-[0.46rem] text-[var(--text-4)] mt-6">
                  Select a module from the sidebar or toolbar below
                </p>
              </div>
            </div>
          )}

          {/* Panels */}
          {activePanel === "signals" && (
            <SignalPanel onClose={() => setActivePanel(null)} onBriefGenerated={onBriefGenerated} />
          )}
          {activePanel === "briefs" && (
            <BriefsPanel onClose={() => setActivePanel(null)} />
          )}
          {activePanel === "analytics" && (
            <AnalyticsPanel onClose={() => setActivePanel(null)} />
          )}
          {activePanel === "settings" && (
            <SettingsPanel onClose={() => setActivePanel(null)} />
          )}
          {activePanel === "feed" && (
            <FeedPanel onClose={() => setActivePanel(null)} recentBriefs={recentBriefs} />
          )}
        </div>

        {/* ── Bottom toolbar ── */}
        <div
          className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 px-4"
          style={{
            height: 72,
            background: "rgba(13,13,15,0.95)",
            borderTop: "1px solid rgba(224,48,48,0.12)",
            zIndex: 10,
          }}
        >
          {toolItems.map(item => {
            const isActive = activePanel === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(item.id as PanelId)}
                className="flex flex-col items-center gap-1 px-5 py-2 transition-all"
                style={{
                  color: isActive ? "var(--accent)" : "rgba(255,255,255,0.3)",
                  background: isActive ? "rgba(224,48,48,0.1)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${isActive ? "rgba(224,48,48,0.35)" : "rgba(255,255,255,0.06)"}`,
                  borderRadius: 8,
                  minWidth: 72,
                }}
              >
                <Icon d={item.icon} size={18} />
                <span className="font-mono text-[0.42rem] tracking-[0.08em] uppercase">{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}

function Clock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", hour12: false }));
    tick();
    const t = setInterval(tick, 10000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="text-center pb-2">
      <div className="font-mono text-[0.55rem] font-bold text-[var(--text-3)]">{time}</div>
      <div className="font-mono text-[0.38rem] text-[var(--text-4)] mt-[1px]">UTC</div>
    </div>
  );
}
