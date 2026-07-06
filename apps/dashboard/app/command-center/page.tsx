"use client";

import { useState, useEffect } from "react";

const pipeline = [
  { id: "ingest",    label: "Ingest",         sub: "On-chain + social feeds",       state: "building", gate: false },
  { id: "score",     label: "Score",           sub: "Velocity + correlation",        state: "building", gate: false },
  { id: "interpret", label: "Interpret",       sub: "Narrative + window est.",       state: "soon",     gate: true  },
  { id: "alpha",     label: "Alpha brief",     sub: "Degen participation",           state: "soon",     gate: true  },
  { id: "content",   label: "Content brief",   sub: "Creator intelligence",          state: "soon",     gate: true  },
  { id: "memory",    label: "Signal Memory",   sub: "Outcome → model update",        state: "planned",  gate: false },
];

const stateColor = {
  building: "var(--cyan-light)",
  soon:     "var(--amber)",
  planned:  "var(--dim)",
} as const;

const stateBadge = {
  building: "text-[var(--cyan-light)] border-[var(--cyan-border)] bg-[var(--cyan-dim)]",
  soon:     "text-[var(--amber)] border-[var(--amber-border)] bg-[var(--amber-dim)]",
  planned:  "text-[var(--dim)] border-[var(--border)]",
} as const;

const modules = [
  { id: "orchestrator", label: "Signal Orchestrator",    role: "Pipeline coordination",           state: "building" as const },
  { id: "onchain",      label: "On-Chain Scanner",       role: "17-chain real-time indexing",     state: "building" as const },
  { id: "social",       label: "Narrative Engine",       role: "Social velocity tracking",        state: "building" as const },
  { id: "scoring",      label: "Trend Scoring Model",    role: "Signal strength + correlation",   state: "soon"     as const },
  { id: "alpha",        label: "Alpha Engine",           role: "Degen participation briefs",      state: "soon"     as const },
  { id: "content",      label: "Content Engine",         role: "Creator brief + angles",          state: "soon"     as const },
  { id: "memory",       label: "Signal Memory",          role: "Outcome tracking → feedback",     state: "planned"  as const },
];

export default function CommandCenterPage() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"both" | "alpha" | "content">("both");
  const [loading, setLoading] = useState(false);
  const [alpha, setAlpha] = useState<any>(null);
  const [content, setContent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [briefCount, setBriefCount] = useState(0);

  useEffect(() => {
    fetch("/api/briefs").then(r => r.json()).then(({ briefs }) => {
      if (briefs) setBriefCount(briefs.length);
    }).catch(() => {});
  }, []);

  async function run() {
    if (!query.trim() || loading) return;
    setLoading(true); setError(null); setAlpha(null); setContent(null); setSaved(false);
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
      results.forEach((r, i) => {
        if (r.status === "fulfilled" && r.value.brief) {
          modes[i] === "alpha" ? setAlpha(r.value.brief) : setContent(r.value.brief);
        } else if (r.status === "rejected") {
          setError(r.reason?.message || "Request failed");
        }
      });
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function saveAll() {
    if (saving || saved) return;
    setSaving(true);
    for (const [type, brief] of [["alpha", alpha], ["content", content]] as [string, any][]) {
      if (!brief) continue;
      await fetch("/api/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type, status: "pending",
          conviction: brief.conviction, window: brief.window,
          content: JSON.stringify(brief),
          signal_summary: brief.signal_summary || brief.narrative_summary,
          chains: brief.chains,
        }),
      }).catch(() => {});
    }
    setSaving(false); setSaved(true);
    setBriefCount(c => c + (alpha ? 1 : 0) + (content ? 1 : 0));
  }

  const wc = (w: string) => w === "open" ? "text-[var(--green)]" : w === "closing" ? "text-[var(--amber)]" : "text-[var(--muted)]";
  const cc = (c: number) => c >= 8 ? "text-[var(--green)]" : c >= 6 ? "text-[var(--amber)]" : "text-[var(--crimson)]";

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-[4px] h-[4px] rounded-full bg-[var(--green)] animate-[blinkA_1.5s_ease_infinite]" />
            <span className="font-mono text-[0.5rem] tracking-[0.16em] uppercase text-[var(--green)]">
              Intelligence engine active
            </span>
          </div>
          <h1 className="font-cond text-[clamp(1.5rem,4vw,2.2rem)] font-bold uppercase leading-none text-[var(--white)] tracking-[0.02em]">
            Signal Intelligence
          </h1>
          <p className="text-[0.78rem] text-[var(--low)] mt-2 font-light">
            Run a query — the intelligence layer generates alpha and content briefs using live market data.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <div className="font-mono text-[0.48rem] tracking-[0.1em] uppercase text-[var(--dim)] border border-[var(--border)] px-3 py-2">
            {briefCount} briefs saved
          </div>
        </div>
      </div>

      {/* Signal Query */}
      <div className="border border-[var(--border)] overflow-hidden">
        <div className="bg-[var(--surface)] px-4 py-2 border-b border-[var(--border)] flex items-center justify-between">
          <span className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--low)]">
            Signal query
          </span>
          <div className="flex items-center gap-2">
            {(["both", "alpha", "content"] as const).map(m => (
              <button key={m} type="button" onClick={() => setMode(m)}
                className={`font-mono text-[0.48rem] tracking-[0.08em] uppercase px-2 py-[3px] border transition-all ${
                  mode === m
                    ? "text-[var(--crimson)] border-[var(--crimson-border)] bg-[var(--crimson-dim)]"
                    : "text-[var(--dim)] border-[var(--border)] hover:text-[var(--muted)]"
                }`}>
                {m === "both" ? "Alpha + Content" : m}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-[var(--carbon)] p-4 space-y-3">
          <textarea
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") run(); }}
            placeholder={"What signal, trend, token or ecosystem do you want intelligence on?\ne.g. \"hottest memecoins on Solana right now\" or \"EigenLayer restaking narrative — alpha and content angles\""}
            rows={4}
            className="w-full bg-[var(--black)] border border-[var(--border)] p-3 font-mono text-[0.7rem] text-[var(--white)] placeholder:text-[var(--dim)] resize-none outline-none focus:border-[var(--crimson-border)] transition-colors leading-[1.7]"
          />
          <div className="flex items-center justify-between">
            <span className="font-mono text-[0.44rem] text-[var(--dim)]">⌘↩ to run · Pulls live data from Birdeye, CoinGecko, DexScreener</span>
            <button type="button" onClick={run} disabled={loading || !query.trim()}
              className={`font-mono text-[0.57rem] tracking-[0.12em] uppercase px-5 py-2 flex items-center gap-2 transition-all ${
                loading || !query.trim()
                  ? "bg-[var(--surface)] text-[var(--dim)] cursor-not-allowed"
                  : "bg-[var(--crimson)] text-white hover:bg-[var(--crimson-hover)] cursor-pointer"
              }`}>
              {loading ? (
                <><span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin inline-block" />Generating...</>
              ) : "Run query →"}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="border border-[var(--crimson-border)] bg-[var(--crimson-dim)] px-4 py-3">
          <p className="font-mono text-[0.55rem] text-[var(--crimson)]">{error}</p>
          <p className="font-mono text-[0.48rem] text-[var(--muted)] mt-1">
            {error.includes("401") || error.toLowerCase().includes("key")
              ? "→ Check OPENROUTER_API_KEY in your environment variables."
              : error.includes("table") || error.includes("relation")
              ? "→ Run the SQL schema in Settings. Tables don't exist yet."
              : "→ Check Network tab → /api/generate-brief for details."}
          </p>
        </div>
      )}

      {/* Results */}
      {(alpha || content) && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {alpha && <BriefResult type="alpha" brief={alpha} wc={wc} cc={cc} />}
            {content && <BriefResult type="content" brief={content} wc={wc} cc={cc} />}
          </div>
          <div className="flex justify-end">
            {saved ? (
              <span className="font-mono text-[0.52rem] text-[var(--green)] flex items-center gap-2">✓ Saved to Briefs</span>
            ) : (
              <button type="button" onClick={saveAll} disabled={saving}
                className="font-mono text-[0.55rem] tracking-[0.1em] uppercase px-5 py-2 border border-[var(--cyan-border)] bg-[var(--cyan-dim)] text-[var(--cyan-light)] hover:bg-[var(--cyan-light)] hover:text-[var(--black)] transition-all cursor-pointer">
                {saving ? "Saving..." : "Save briefs →"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Signal pipeline */}
      <div className="border border-[var(--border)] overflow-hidden">
        <div className="bg-[var(--surface)] px-4 py-2 border-b border-[var(--border)]">
          <span className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--low)]">
            Signal pipeline — build progress
          </span>
        </div>
        <div className="bg-[var(--carbon)] p-5">
          {/* Desktop */}
          <div className="hidden lg:flex items-center gap-0">
            {pipeline.map((step, i) => (
              <div key={step.id} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center flex-1 min-w-0 relative">
                  {step.gate && (
                    <div className="absolute -top-1 right-[calc(50%-8px)] font-mono text-[0.38rem] tracking-[0.06em] uppercase text-[var(--amber)] flex items-center gap-[3px]">
                      <span>⊕</span><span>gate</span>
                    </div>
                  )}
                  <div className="w-[5px] h-[5px] rounded-full mb-3 mt-4"
                    style={{ background: stateColor[step.state as keyof typeof stateColor] }} />
                  <div className="text-center px-1">
                    <div className="font-cond text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-[var(--white)] mb-1 leading-tight">{step.label}</div>
                    <div className="font-mono text-[0.44rem] text-[var(--dim)] leading-[1.5]">{step.sub}</div>
                    <div className={`font-mono text-[0.38rem] tracking-[0.06em] uppercase px-[5px] py-[2px] border mt-2 inline-block ${stateBadge[step.state as keyof typeof stateBadge]}`}>
                      {step.state === "building" ? "Building" : step.state === "soon" ? "Soon" : "Planned"}
                    </div>
                  </div>
                </div>
                {i < pipeline.length - 1 && (
                  <div className="flex items-center gap-0 shrink-0 mx-1 mt-[-16px]">
                    <div className="w-8 h-px bg-[var(--border)]" />
                    <span className="text-[var(--dim)] text-[0.5rem]">›</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Mobile */}
          <div className="lg:hidden space-y-0">
            {pipeline.map((step, i) => (
              <div key={step.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-[5px] h-[5px] rounded-full shrink-0 mt-[10px]"
                    style={{ background: stateColor[step.state as keyof typeof stateColor] }} />
                  {i < pipeline.length - 1 && <div className="w-px flex-1 bg-[var(--border)] mt-1" style={{ minHeight: 24 }} />}
                </div>
                <div className="pb-4 flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-cond text-[0.78rem] font-semibold uppercase tracking-[0.04em] text-[var(--white)]">{step.label}</span>
                    {step.gate && <span className="font-mono text-[0.4rem] tracking-[0.06em] uppercase text-[var(--amber)] border border-[var(--amber-border)] px-[5px] py-[2px]">gate</span>}
                    <span className={`font-mono text-[0.4rem] tracking-[0.06em] uppercase px-[5px] py-[2px] border ${stateBadge[step.state as keyof typeof stateBadge]}`}>
                      {step.state === "building" ? "Building" : step.state === "soon" ? "Soon" : "Planned"}
                    </span>
                  </div>
                  <p className="font-mono text-[0.52rem] text-[var(--dim)] mt-1">{step.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Module status */}
      <div className="border border-[var(--border)] overflow-hidden">
        <div className="bg-[var(--surface)] px-4 py-2 border-b border-[var(--border)] flex items-center justify-between">
          <span className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--low)]">
            Intelligence modules
          </span>
          <span className="font-mono text-[0.48rem] tracking-[0.1em] uppercase text-[var(--dim)]">
            {modules.filter(m => m.state === "building").length} building · {modules.filter(m => m.state === "soon").length} queued
          </span>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {modules.map(mod => (
            <div key={mod.id} className="bg-[var(--carbon)] px-4 py-3 flex items-center gap-4 hover:bg-[var(--surface)] transition-colors">
              <span className={`w-[5px] h-[5px] rounded-full shrink-0 ${
                mod.state === "building" ? "bg-[var(--cyan-light)] animate-[blinkA_1.4s_ease_infinite]"
                : mod.state === "soon"   ? "bg-[var(--amber)]"
                :                          "bg-[var(--dim)]"
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="font-cond text-[0.82rem] font-semibold uppercase tracking-[0.04em] text-[var(--white)]">{mod.label}</span>
                  <span className="font-mono text-[0.48rem] text-[var(--dim)] hidden sm:block">{mod.role}</span>
                </div>
              </div>
              <span className={`font-mono text-[0.44rem] tracking-[0.08em] uppercase px-2 py-[3px] border shrink-0 ${stateBadge[mod.state as keyof typeof stateBadge]}`}>
                {mod.state === "building" ? "Building" : mod.state === "soon" ? "Soon" : "Planned"}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

function BriefResult({ type, brief, wc, cc }: { type: "alpha" | "content"; brief: any; wc: (w: string) => string; cc: (c: number) => string }) {
  const isAlpha = type === "alpha";
  const sources: string[] = brief._sources || [];

  return (
    <div className="border border-[var(--border)] overflow-hidden">
      <div className={`bg-[var(--surface)] px-4 py-2 border-b border-[var(--border)] flex items-center justify-between`}>
        <span className={`font-mono text-[0.52rem] tracking-[0.12em] uppercase ${isAlpha ? "text-[var(--crimson)]" : "text-[var(--cyan-light)]"}`}>
          {isAlpha ? "Alpha Brief" : "Content Brief"}
        </span>
        <div className="flex items-center gap-3">
          {sources.map(s => (
            <span key={s} className="font-mono text-[0.42rem] uppercase tracking-[0.06em] px-[5px] py-[2px] border border-[var(--green-border)] bg-[var(--green-dim)] text-[var(--green)]">
              ⚡ {s}
            </span>
          ))}
          <span className={`font-mono text-[0.46rem] ${wc(brief.window)}`}>{brief.window}</span>
          <span className={`font-mono text-[0.46rem] font-semibold ${cc(brief.conviction)}`}>{brief.conviction}/10</span>
        </div>
      </div>
      <div className="bg-[var(--carbon)] p-4 space-y-4">
        <p className="text-[0.78rem] text-[var(--body)] leading-[1.72]">
          {brief.signal_summary || brief.narrative_summary}
        </p>
        {brief.chains?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {brief.chains.map((c: string) => (
              <span key={c} className="font-mono text-[0.46rem] px-2 py-[2px] border border-[var(--cyan-border)] bg-[var(--cyan-dim)] text-[var(--cyan-light)]">{c}</span>
            ))}
          </div>
        )}
        {brief.angles?.slice(0, 3).map((a: string, i: number) => (
          <div key={i} className="flex gap-3">
            <span className="font-mono text-[0.44rem] text-[var(--cyan-light)] shrink-0 mt-[2px]">0{i+1}</span>
            <p className="text-[0.72rem] text-[var(--muted)] leading-[1.6]">{a}</p>
          </div>
        ))}
        {brief.cross_chain_map && (
          <div>
            <p className="font-mono text-[0.46rem] uppercase tracking-[0.12em] text-[var(--dim)] mb-1">Cross-chain</p>
            <p className="text-[0.72rem] text-[var(--muted)] leading-[1.6]">{brief.cross_chain_map}</p>
          </div>
        )}
        {brief.conviction_reasoning && (
          <div>
            <p className="font-mono text-[0.46rem] uppercase tracking-[0.12em] text-[var(--dim)] mb-1">Conviction reasoning</p>
            <p className="text-[0.72rem] text-[var(--muted)] leading-[1.6]">{brief.conviction_reasoning}</p>
          </div>
        )}
        {brief.risk_context && (
          <div className="border-t border-[var(--border)] pt-3">
            <p className="font-mono text-[0.46rem] uppercase tracking-[0.12em] text-[var(--amber)] mb-1">⚠ Risk</p>
            <p className="text-[0.72rem] text-[var(--amber)] leading-[1.6] opacity-80">{brief.risk_context}</p>
          </div>
        )}
        {brief.social_lag_hours != null && (
          <div className="flex items-center gap-3 border-t border-[var(--border)] pt-3">
            <span className="font-mono text-[0.46rem] uppercase tracking-[0.1em] text-[var(--dim)]">Est. social lag</span>
            <span className="font-mono text-[0.54rem] text-[var(--green)] font-semibold">{brief.social_lag_hours}h ahead</span>
            {brief.window_hours != null && (
              <><span className="text-[var(--border-md)]">·</span>
              <span className="font-mono text-[0.46rem] text-[var(--dim)]">~{brief.window_hours}h window</span></>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
