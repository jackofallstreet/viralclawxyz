"use client";

import { useState, useEffect, useRef } from "react";

type GeneratedBrief = {
  signal_summary?: string;
  narrative_summary?: string;
  conviction: number;
  window: "open" | "closing" | "closed";
  window_hours?: number;
  chains?: string[];
  cross_chain_map?: string;
  risk_context?: string;
  social_lag_hours?: number;
  angles?: string[];
  evidence_links_description?: string;
  audience_framing?: string;
  publish_urgency?: string;
  pattern_match?: string;
  conviction_reasoning?: string;
};

type SavedBrief = {
  id: string;
  created_at: string;
  type: "alpha" | "content";
  status: "pending" | "approved" | "archived";
  conviction: number;
  window: string;
  content: string;
};

const WINDOW_COLOR = {
  open:    "var(--green)",
  closing: "var(--amber)",
  closed:  "var(--accent)",
};

const WINDOW_LABEL = {
  open:    "Window open",
  closing: "Closing",
  closed:  "Closed",
};

export default function CommandCenterPage() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"alpha" | "content" | "both">("both");
  const [loading, setLoading] = useState(false);
  const [alphaBrief, setAlphaBrief] = useState<GeneratedBrief | null>(null);
  const [contentBrief, setContentBrief] = useState<GeneratedBrief | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedBriefs, setSavedBriefs] = useState<SavedBrief[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchRecentBriefs();
  }, []);

  async function fetchRecentBriefs() {
    try {
      const res = await fetch("/api/briefs?status=all");
      const { briefs } = await res.json();
      setSavedBriefs((briefs || []).slice(0, 5));
    } catch { /* silent */ }
  }

  async function runQuery() {
    if (!query.trim() || loading) return;
    setLoading(true);
    setError(null);
    setAlphaBrief(null);
    setContentBrief(null);

    try {
      const modes = mode === "both" ? ["alpha", "content"] : [mode];
      const results = await Promise.allSettled(
        modes.map(m =>
          fetch("/api/generate-brief", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, mode: m }),
          }).then(r => r.json())
        )
      );

      results.forEach((result, i) => {
        if (result.status === "fulfilled" && result.value.brief) {
          if (modes[i] === "alpha") setAlphaBrief(result.value.brief);
          else setContentBrief(result.value.brief);
        }
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveBrief(type: "alpha" | "content", brief: GeneratedBrief) {
    const key = `${type}-save`;
    setSavingId(key);
    try {
      const res = await fetch("/api/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          status: "pending",
          conviction: brief.conviction,
          window: brief.window,
          content: JSON.stringify(brief),
          signal_summary: brief.signal_summary || brief.narrative_summary,
          chains: brief.chains,
        }),
      });
      const { brief: saved } = await res.json();
      if (saved?.id) {
        setSaved(prev => ({ ...prev, [key]: true }));
        fetchRecentBriefs();
      }
    } catch { /* silent */ } finally {
      setSavingId(null);
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") runQuery();
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-[5px] h-[5px] rounded-full bg-[var(--accent)] animate-[blinkA_1.5s_ease_infinite]" />
            <span className="font-mono text-[0.5rem] tracking-[0.16em] uppercase text-[var(--accent)]">
              Intelligence layer — live
            </span>
          </div>
          <h1 className="font-cond text-[clamp(1.5rem,4vw,2.2rem)] font-bold uppercase leading-none text-[var(--text-1)] tracking-[0.02em]">
            Signal Intelligence
          </h1>
          <p className="text-[0.78rem] text-[var(--text-3)] mt-2 font-light">
            Submit a signal query — the intelligence layer scores it and returns alpha and content briefs simultaneously.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 font-mono text-[0.48rem] tracking-[0.1em] uppercase text-[var(--text-4)] border border-[var(--border)] px-3 py-2">
          <span className="w-[4px] h-[4px] rounded-full bg-[var(--green)]" />
          <span>Claude Sonnet 4.6</span>
        </div>
      </div>

      {/* Signal Query */}
      <div className="border border-[var(--border)] overflow-hidden">
        <div className="bg-[var(--bg-3)] px-4 py-2 border-b border-[var(--border)] flex items-center justify-between">
          <span className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--text-3)]">
            Signal query
          </span>
          <div className="flex items-center gap-2">
            {(["alpha", "content", "both"] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className="font-mono text-[0.48rem] tracking-[0.08em] uppercase px-2 py-[3px] border transition-all"
                style={{
                  color: mode === m ? "#fff" : "var(--text-4)",
                  background: mode === m ? "var(--accent)" : "transparent",
                  borderColor: mode === m ? "var(--accent)" : "var(--border)",
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-[var(--bg-2)] p-4">
          <textarea
            ref={textareaRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Describe a trend, token, ecosystem, or on-chain pattern you want intelligence on&#10;e.g. &quot;EigenLayer restaking — whale accumulation on ETH and ARB, what's the alpha and content angle?&quot;"
            rows={4}
            className="w-full bg-[var(--bg)] border border-[var(--border-2)] p-3 font-mono text-[0.7rem] text-[var(--text-1)] placeholder:text-[var(--text-4)] resize-none outline-none leading-[1.7] transition-colors"
            style={{ borderColor: query ? "var(--border-2)" : "var(--border)" }}
            onFocus={e => (e.target.style.borderColor = "var(--accent)")}
            onBlur={e => (e.target.style.borderColor = query ? "var(--border-2)" : "var(--border)")}
          />
          <div className="flex items-center justify-between mt-3">
            <span className="font-mono text-[0.48rem] text-[var(--text-4)]">
              ⌘ + Enter to run · Generates {mode === "both" ? "alpha + content briefs" : `${mode} brief`} simultaneously
            </span>
            <button
              type="button"
              onClick={runQuery}
              disabled={loading || !query.trim()}
              className="font-mono text-[0.6rem] tracking-[0.12em] uppercase px-5 py-2 transition-all"
              style={{
                background: loading || !query.trim() ? "var(--bg-4)" : "var(--accent)",
                color: loading || !query.trim() ? "var(--text-4)" : "#fff",
                cursor: loading || !query.trim() ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                  Generating...
                </span>
              ) : "Run signal query →"}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="border border-[var(--accent-border)] bg-[var(--accent-dim)] p-4">
          <p className="font-mono text-[0.58rem] text-[var(--accent)]">Error: {error}</p>
          <p className="font-mono text-[0.52rem] text-[var(--text-4)] mt-1">
            Check that ANTHROPIC_API_KEY is set in your environment.
          </p>
        </div>
      )}

      {/* Generated Briefs */}
      {(alphaBrief || contentBrief) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Alpha Brief */}
          {alphaBrief && (
            <div className="border border-[var(--border)] overflow-hidden">
              <div className="bg-[var(--bg-3)] px-4 py-2 border-b border-[var(--border)] flex items-center justify-between">
                <span className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--accent)]">
                  Alpha Brief
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className="font-mono text-[0.46rem] tracking-[0.08em] uppercase px-2 py-[2px] border"
                    style={{
                      color: WINDOW_COLOR[alphaBrief.window] || "var(--text-3)",
                      borderColor: (WINDOW_COLOR[alphaBrief.window] || "var(--border)") + "44",
                      background: (WINDOW_COLOR[alphaBrief.window] || "var(--border)") + "11",
                    }}
                  >
                    {WINDOW_LABEL[alphaBrief.window]}
                  </span>
                  <span className="font-mono text-[0.46rem] text-[var(--text-4)]">
                    Score: <span style={{ color: alphaBrief.conviction >= 8 ? "var(--green)" : alphaBrief.conviction >= 6 ? "var(--amber)" : "var(--accent)" }}>{alphaBrief.conviction}/10</span>
                  </span>
                </div>
              </div>
              <div className="bg-[var(--bg-2)] p-4 space-y-4">
                {alphaBrief.signal_summary && (
                  <BriefSection label="Signal" value={alphaBrief.signal_summary} />
                )}
                {alphaBrief.chains && alphaBrief.chains.length > 0 && (
                  <div>
                    <p className="font-mono text-[0.48rem] tracking-[0.12em] uppercase text-[var(--text-4)] mb-2">Chains</p>
                    <div className="flex flex-wrap gap-1">
                      {alphaBrief.chains.map(c => (
                        <span key={c} className="font-mono text-[0.52rem] px-2 py-[2px] border border-[var(--teal-border)] bg-[var(--teal-dim)] text-[var(--teal)]">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
                {alphaBrief.cross_chain_map && (
                  <BriefSection label="Cross-chain" value={alphaBrief.cross_chain_map} />
                )}
                {alphaBrief.social_lag_hours !== undefined && (
                  <div className="flex items-center gap-3">
                    <p className="font-mono text-[0.48rem] tracking-[0.12em] uppercase text-[var(--text-4)]">Social lag</p>
                    <span className="font-mono text-[0.6rem] text-[var(--green)]">{alphaBrief.social_lag_hours}h ahead of narrative peak</span>
                  </div>
                )}
                {alphaBrief.window_hours !== undefined && (
                  <div className="flex items-center gap-3">
                    <p className="font-mono text-[0.48rem] tracking-[0.12em] uppercase text-[var(--text-4)]">Window</p>
                    <span className="font-mono text-[0.6rem]" style={{ color: WINDOW_COLOR[alphaBrief.window] }}>
                      ~{alphaBrief.window_hours}h remaining
                    </span>
                  </div>
                )}
                {alphaBrief.conviction_reasoning && (
                  <BriefSection label="Conviction reasoning" value={alphaBrief.conviction_reasoning} />
                )}
                {alphaBrief.risk_context && (
                  <BriefSection label="Risk context" value={alphaBrief.risk_context} accent="amber" />
                )}
                {alphaBrief.pattern_match && alphaBrief.pattern_match !== "null" && (
                  <BriefSection label="Pattern match" value={alphaBrief.pattern_match} />
                )}
              </div>
              <div className="bg-[var(--bg-3)] px-4 py-3 border-t border-[var(--border)] flex justify-end">
                <button
                  type="button"
                  onClick={() => saveBrief("alpha", alphaBrief)}
                  disabled={savingId === "alpha-save" || saved["alpha-save"]}
                  className="font-mono text-[0.52rem] tracking-[0.1em] uppercase px-4 py-2 border transition-all"
                  style={{
                    color: saved["alpha-save"] ? "var(--green)" : "var(--text-2)",
                    borderColor: saved["alpha-save"] ? "var(--green-border)" : "var(--border-2)",
                    background: saved["alpha-save"] ? "var(--green-dim)" : "transparent",
                  }}
                >
                  {saved["alpha-save"] ? "✓ Saved to briefs" : savingId === "alpha-save" ? "Saving..." : "Save brief →"}
                </button>
              </div>
            </div>
          )}

          {/* Content Brief */}
          {contentBrief && (
            <div className="border border-[var(--border)] overflow-hidden">
              <div className="bg-[var(--bg-3)] px-4 py-2 border-b border-[var(--border)] flex items-center justify-between">
                <span className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--teal)]">
                  Content Brief
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className="font-mono text-[0.46rem] tracking-[0.08em] uppercase px-2 py-[2px] border"
                    style={{
                      color: WINDOW_COLOR[contentBrief.window] || "var(--text-3)",
                      borderColor: (WINDOW_COLOR[contentBrief.window] || "var(--border)") + "44",
                      background: (WINDOW_COLOR[contentBrief.window] || "var(--border)") + "11",
                    }}
                  >
                    {contentBrief.publish_urgency || WINDOW_LABEL[contentBrief.window]}
                  </span>
                  <span className="font-mono text-[0.46rem] text-[var(--text-4)]">
                    Score: <span style={{ color: contentBrief.conviction >= 8 ? "var(--green)" : contentBrief.conviction >= 6 ? "var(--amber)" : "var(--accent)" }}>{contentBrief.conviction}/10</span>
                  </span>
                </div>
              </div>
              <div className="bg-[var(--bg-2)] p-4 space-y-4">
                {contentBrief.narrative_summary && (
                  <BriefSection label="Narrative" value={contentBrief.narrative_summary} />
                )}
                {contentBrief.social_lag_hours !== undefined && (
                  <div className="flex items-center gap-3">
                    <p className="font-mono text-[0.48rem] tracking-[0.12em] uppercase text-[var(--text-4)]">Content window</p>
                    <span className="font-mono text-[0.6rem] text-[var(--green)]">{contentBrief.social_lag_hours}h ahead of social peak</span>
                  </div>
                )}
                {contentBrief.angles && contentBrief.angles.length > 0 && (
                  <div>
                    <p className="font-mono text-[0.48rem] tracking-[0.12em] uppercase text-[var(--text-4)] mb-3">Content angles</p>
                    <div className="space-y-2">
                      {contentBrief.angles.map((angle, i) => (
                        <div key={i} className="flex gap-3 p-3 bg-[var(--bg)] border border-[var(--border)]">
                          <span className="font-mono text-[0.48rem] text-[var(--teal)] shrink-0 mt-[1px]">0{i + 1}</span>
                          <p className="text-[0.78rem] text-[var(--text-2)] leading-[1.6]">{angle}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {contentBrief.audience_framing && (
                  <BriefSection label="Audience framing" value={contentBrief.audience_framing} />
                )}
                {contentBrief.evidence_links_description && (
                  <BriefSection label="On-chain evidence" value={contentBrief.evidence_links_description} accent="teal" />
                )}
              </div>
              <div className="bg-[var(--bg-3)] px-4 py-3 border-t border-[var(--border)] flex justify-end">
                <button
                  type="button"
                  onClick={() => saveBrief("content", contentBrief)}
                  disabled={savingId === "content-save" || saved["content-save"]}
                  className="font-mono text-[0.52rem] tracking-[0.1em] uppercase px-4 py-2 border transition-all"
                  style={{
                    color: saved["content-save"] ? "var(--green)" : "var(--text-2)",
                    borderColor: saved["content-save"] ? "var(--green-border)" : "var(--border-2)",
                    background: saved["content-save"] ? "var(--green-dim)" : "transparent",
                  }}
                >
                  {saved["content-save"] ? "✓ Saved to briefs" : savingId === "content-save" ? "Saving..." : "Save brief →"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Briefs */}
      <div className="border border-[var(--border)] overflow-hidden">
        <div className="bg-[var(--bg-3)] px-4 py-2 border-b border-[var(--border)] flex items-center justify-between">
          <span className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--text-3)]">
            Recent briefs
          </span>
          <a href="/command-center/briefs" className="font-mono text-[0.48rem] tracking-[0.08em] uppercase text-[var(--text-4)] hover:text-[var(--text-2)] transition-colors no-underline">
            View all →
          </a>
        </div>
        {savedBriefs.length === 0 ? (
          <div className="bg-[var(--bg-2)] px-4 py-10 text-center">
            <p className="font-mono text-[0.52rem] text-[var(--text-4)]">
              No briefs yet — run your first signal query above.
            </p>
          </div>
        ) : (
          <div className="bg-[var(--bg-2)] divide-y divide-[var(--border)]">
            {savedBriefs.map(brief => {
              let parsed: any = {};
              try { parsed = JSON.parse(brief.content); } catch {}
              return (
                <div key={brief.id} className="px-4 py-3 flex items-center gap-4 hover:bg-[var(--bg-3)] transition-colors">
                  <span
                    className="font-mono text-[0.44rem] tracking-[0.08em] uppercase px-2 py-[2px] border shrink-0"
                    style={{
                      color: brief.type === "alpha" ? "var(--accent)" : "var(--teal)",
                      borderColor: brief.type === "alpha" ? "var(--accent-border)" : "var(--teal-border)",
                      background: brief.type === "alpha" ? "var(--accent-dim)" : "var(--teal-dim)",
                    }}
                  >
                    {brief.type}
                  </span>
                  <p className="flex-1 text-[0.75rem] text-[var(--text-2)] truncate">
                    {parsed.signal_summary || parsed.narrative_summary || "Brief"}
                  </p>
                  <span className="font-mono text-[0.44rem] text-[var(--text-4)] shrink-0">
                    {brief.conviction}/10
                  </span>
                  <span
                    className="font-mono text-[0.44rem] tracking-[0.06em] uppercase px-2 py-[2px] border shrink-0"
                    style={{
                      color: brief.status === "approved" ? "var(--green)" : "var(--text-4)",
                      borderColor: brief.status === "approved" ? "var(--green-border)" : "var(--border)",
                      background: brief.status === "approved" ? "var(--green-dim)" : "transparent",
                    }}
                  >
                    {brief.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Module status strip */}
      <div className="border border-[var(--border)] overflow-hidden">
        <div className="bg-[var(--bg-3)] px-4 py-2 border-b border-[var(--border)]">
          <span className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--text-3)]">
            Intelligence pipeline — build status
          </span>
        </div>
        <div className="bg-[var(--bg-2)] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-[var(--border)]">
          {[
            { label: "Signal Query",    state: "live",     note: "Claude API" },
            { label: "Brief Gen",       state: "live",     note: "Alpha + Content" },
            { label: "On-chain RPC",    state: "building", note: "ETH, SOL, BASE" },
            { label: "Social Velocity", state: "building", note: "CT, Farcaster" },
            { label: "Scoring Model",   state: "soon",     note: "Depends on RPC" },
            { label: "Signal Memory",   state: "planned",  note: "Phase 2" },
          ].map(m => (
            <div key={m.label} className="p-3 text-center">
              <div
                className="w-[5px] h-[5px] rounded-full mx-auto mb-2"
                style={{
                  background: m.state === "live" ? "var(--green)" : m.state === "building" ? "var(--teal)" : m.state === "soon" ? "var(--amber)" : "var(--text-4)",
                  animation: m.state === "live" ? "blinkA 1.5s ease infinite" : "none",
                }}
              />
              <p className="font-cond text-[0.65rem] font-semibold uppercase text-[var(--text-1)] leading-tight mb-1">{m.label}</p>
              <p className="font-mono text-[0.44rem] text-[var(--text-4)]">{m.note}</p>
              <p className="font-mono text-[0.42rem] uppercase mt-1" style={{
                color: m.state === "live" ? "var(--green)" : m.state === "building" ? "var(--teal)" : m.state === "soon" ? "var(--amber)" : "var(--text-4)"
              }}>{m.state}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

function BriefSection({ label, value, accent }: { label: string; value: string; accent?: "amber" | "teal" }) {
  const color = accent === "amber" ? "var(--amber)" : accent === "teal" ? "var(--teal)" : "var(--text-4)";
  return (
    <div>
      <p className="font-mono text-[0.48rem] tracking-[0.12em] uppercase mb-1" style={{ color }}>{label}</p>
      <p className="text-[0.8rem] text-[var(--text-2)] leading-[1.7]">{value}</p>
    </div>
  );
}
