"use client";

import { useState, useEffect } from "react";

type Brief = {
  id: string;
  created_at: string;
  type: "alpha" | "content";
  status: "pending" | "approved" | "archived";
  conviction: number;
  window: string;
  content: string;
};

type Stats = {
  total: number;
  alpha: number;
  content: number;
  approved: number;
  avgConviction: number;
  openWindows: number;
  closingWindows: number;
  byDay: { date: string; alpha: number; content: number }[];
  convictionDist: { score: number; count: number }[];
};

function computeStats(briefs: Brief[]): Stats {
  const total = briefs.length;
  const alpha = briefs.filter(b => b.type === "alpha").length;
  const content = briefs.filter(b => b.type === "content").length;
  const approved = briefs.filter(b => b.status === "approved").length;
  const avgConviction = total
    ? Math.round((briefs.reduce((s, b) => s + (b.conviction || 0), 0) / total) * 10) / 10
    : 0;
  const openWindows = briefs.filter(b => b.window === "open").length;
  const closingWindows = briefs.filter(b => b.window === "closing").length;

  // Group by day (last 7 days)
  const days: Record<string, { alpha: number; content: number }> = {};
  const now = Date.now();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    const key = d.toLocaleDateString("en", { month: "short", day: "numeric" });
    days[key] = { alpha: 0, content: 0 };
  }
  briefs.forEach(b => {
    const d = new Date(b.created_at);
    const key = d.toLocaleDateString("en", { month: "short", day: "numeric" });
    if (days[key]) days[key][b.type]++;
  });
  const byDay = Object.entries(days).map(([date, v]) => ({ date, ...v }));

  // Conviction distribution
  const dist: Record<number, number> = {};
  for (let i = 1; i <= 10; i++) dist[i] = 0;
  briefs.forEach(b => { if (b.conviction >= 1 && b.conviction <= 10) dist[b.conviction]++; });
  const convictionDist = Object.entries(dist).map(([score, count]) => ({
    score: Number(score),
    count,
  }));

  return { total, alpha, content, approved, avgConviction, openWindows, closingWindows, byDay, convictionDist };
}

export default function AnalyticsPage() {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/briefs");
        const { briefs: data } = await res.json();
        const all = data || [];
        setBriefs(all);
        setStats(computeStats(all));
      } catch { } finally { setLoading(false); }
    })();
  }, []);

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto py-20 text-center">
        <div className="inline-block w-4 h-4 border border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="font-mono text-[0.52rem] text-[var(--text-4)]">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div>
        <h1 className="font-cond text-[clamp(1.5rem,4vw,2.2rem)] font-bold uppercase leading-none text-[var(--text-1)] tracking-[0.02em]">
          Analytics
        </h1>
        <p className="text-[0.78rem] text-[var(--text-3)] mt-2 font-light">
          Signal output tracking. Updates as briefs are generated and reviewed.
        </p>
      </div>

      {!stats || stats.total === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-[var(--border)] border border-[var(--border)]">
            <StatCard label="Total briefs"     value={stats.total}           />
            <StatCard label="Alpha briefs"     value={stats.alpha}           color="var(--accent)" />
            <StatCard label="Content briefs"   value={stats.content}         color="var(--teal)" />
            <StatCard label="Approved"         value={stats.approved}        color="var(--green)" />
            <StatCard label="Avg conviction"   value={`${stats.avgConviction}/10`} color={stats.avgConviction >= 8 ? "var(--green)" : stats.avgConviction >= 6 ? "var(--amber)" : "var(--accent)"} />
            <StatCard label="Open windows"     value={stats.openWindows}     color="var(--green)" />
          </div>

          {/* Brief volume — last 7 days */}
          <div className="border border-[var(--border)] overflow-hidden">
            <div className="bg-[var(--bg-3)] px-4 py-2 border-b border-[var(--border)] flex items-center justify-between">
              <span className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--text-3)]">
                Brief volume — last 7 days
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-mono text-[0.44rem] text-[var(--accent)]">
                  <span className="w-2 h-2 inline-block" style={{ background: "var(--accent)" }} />Alpha
                </span>
                <span className="flex items-center gap-1 font-mono text-[0.44rem] text-[var(--teal)]">
                  <span className="w-2 h-2 inline-block" style={{ background: "var(--teal)" }} />Content
                </span>
              </div>
            </div>
            <div className="bg-[var(--bg-2)] p-5">
              <BarChart data={stats.byDay} />
            </div>
          </div>

          {/* Conviction distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="border border-[var(--border)] overflow-hidden">
              <div className="bg-[var(--bg-3)] px-4 py-2 border-b border-[var(--border)]">
                <span className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--text-3)]">
                  Conviction score distribution
                </span>
              </div>
              <div className="bg-[var(--bg-2)] p-5">
                <ConvictionChart data={stats.convictionDist} />
              </div>
            </div>

            {/* Window status */}
            <div className="border border-[var(--border)] overflow-hidden">
              <div className="bg-[var(--bg-3)] px-4 py-2 border-b border-[var(--border)]">
                <span className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--text-3)]">
                  Window status breakdown
                </span>
              </div>
              <div className="bg-[var(--bg-2)] p-5 space-y-3">
                {[
                  { label: "Open",    count: stats.openWindows,                                   color: "var(--green)" },
                  { label: "Closing", count: stats.closingWindows,                                color: "var(--amber)" },
                  { label: "Closed",  count: stats.total - stats.openWindows - stats.closingWindows, color: "var(--accent)" },
                ].map(row => (
                  <WindowBar key={row.label} {...row} total={stats.total} />
                ))}
              </div>
            </div>
          </div>

          {/* Recent brief table */}
          <div className="border border-[var(--border)] overflow-hidden">
            <div className="bg-[var(--bg-3)] px-4 py-2 border-b border-[var(--border)] flex items-center justify-between">
              <span className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--text-3)]">
                Recent brief log
              </span>
              <a href="/command-center/briefs" className="font-mono text-[0.48rem] text-[var(--text-4)] hover:text-[var(--text-2)] no-underline transition-colors">
                View all →
              </a>
            </div>
            <div className="bg-[var(--bg-2)]">
              <div className="grid grid-cols-[1fr_80px_80px_80px_100px] gap-0 border-b border-[var(--border)] px-4 py-2">
                {["Summary", "Type", "Score", "Window", "Status"].map(h => (
                  <span key={h} className="font-mono text-[0.44rem] tracking-[0.1em] uppercase text-[var(--text-4)]">{h}</span>
                ))}
              </div>
              <div className="divide-y divide-[var(--border)]">
                {briefs.slice(0, 10).map(brief => {
                  let parsed: any = {};
                  try { parsed = JSON.parse(brief.content); } catch {}
                  return (
                    <div key={brief.id} className="grid grid-cols-[1fr_80px_80px_80px_100px] gap-0 px-4 py-3 items-center hover:bg-[var(--bg-3)] transition-colors">
                      <p className="text-[0.73rem] text-[var(--text-2)] truncate pr-4">
                        {parsed.signal_summary || parsed.narrative_summary || "—"}
                      </p>
                      <span
                        className="font-mono text-[0.44rem] tracking-[0.06em] uppercase px-2 py-[2px] border w-fit"
                        style={{
                          color: brief.type === "alpha" ? "var(--accent)" : "var(--teal)",
                          borderColor: brief.type === "alpha" ? "var(--accent-border)" : "var(--teal-border)",
                          background: brief.type === "alpha" ? "var(--accent-dim)" : "var(--teal-dim)",
                        }}
                      >
                        {brief.type}
                      </span>
                      <span
                        className="font-mono text-[0.56rem] font-semibold"
                        style={{ color: brief.conviction >= 8 ? "var(--green)" : brief.conviction >= 6 ? "var(--amber)" : "var(--accent)" }}
                      >
                        {brief.conviction}/10
                      </span>
                      <span
                        className="font-mono text-[0.44rem] uppercase"
                        style={{ color: brief.window === "open" ? "var(--green)" : brief.window === "closing" ? "var(--amber)" : "var(--text-4)" }}
                      >
                        {brief.window || "—"}
                      </span>
                      <span
                        className="font-mono text-[0.44rem] tracking-[0.06em] uppercase px-2 py-[2px] border w-fit"
                        style={{
                          color: brief.status === "approved" ? "var(--green)" : brief.status === "archived" ? "var(--text-4)" : "var(--amber)",
                          borderColor: brief.status === "approved" ? "var(--green-border)" : brief.status === "archived" ? "var(--border)" : "var(--amber-border)",
                          background: brief.status === "approved" ? "var(--green-dim)" : brief.status === "archived" ? "transparent" : "var(--amber-dim)",
                        }}
                      >
                        {brief.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number | string; color?: string }) {
  return (
    <div className="bg-[var(--bg-2)] p-4 text-center">
      <div
        className="font-cond font-extrabold leading-none mb-1"
        style={{ fontSize: "clamp(1.6rem,4vw,2.2rem)", color: color || "var(--text-1)" }}
      >
        {value}
      </div>
      <div className="font-mono text-[0.46rem] tracking-[0.1em] uppercase text-[var(--text-4)]">{label}</div>
    </div>
  );
}

function BarChart({ data }: { data: { date: string; alpha: number; content: number }[] }) {
  const max = Math.max(...data.map(d => d.alpha + d.content), 1);
  return (
    <div className="flex items-end gap-2 h-[120px]">
      {data.map(d => {
        const total = d.alpha + d.content;
        const heightPct = (total / max) * 100;
        const alphaRatio = total > 0 ? d.alpha / total : 0;
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group">
            <div
              className="w-full relative overflow-hidden transition-all duration-300"
              style={{ height: `${Math.max(heightPct, 4)}%`, minHeight: total > 0 ? 4 : 0 }}
            >
              {/* Content portion */}
              <div
                className="absolute bottom-0 left-0 right-0 transition-all"
                style={{ height: `${(1 - alphaRatio) * 100}%`, background: "var(--teal)", opacity: 0.7 }}
              />
              {/* Alpha portion */}
              <div
                className="absolute top-0 left-0 right-0 transition-all"
                style={{ height: `${alphaRatio * 100}%`, background: "var(--accent)", opacity: 0.8 }}
              />
            </div>
            <span className="font-mono text-[0.4rem] text-[var(--text-4)] whitespace-nowrap">{d.date}</span>
          </div>
        );
      })}
    </div>
  );
}

function ConvictionChart({ data }: { data: { score: number; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-1 h-[100px]">
      {data.map(d => {
        const heightPct = (d.count / max) * 100;
        const color = d.score >= 8 ? "var(--green)" : d.score >= 6 ? "var(--amber)" : "var(--accent)";
        return (
          <div key={d.score} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full transition-all duration-300"
              style={{ height: `${Math.max(heightPct, d.count > 0 ? 6 : 0)}%`, background: color, opacity: 0.75 }}
            />
            <span className="font-mono text-[0.4rem] text-[var(--text-4)]">{d.score}</span>
          </div>
        );
      })}
    </div>
  );
}

function WindowBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-[0.52rem] text-[var(--text-3)]">{label}</span>
        <span className="font-mono text-[0.52rem]" style={{ color }}>{count} ({pct}%)</span>
      </div>
      <div className="h-[3px] bg-[var(--bg)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border border-[var(--border)] overflow-hidden">
      <div className="bg-[var(--bg-2)] flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="flex items-end gap-[3px] mb-5">
          {[3, 5, 4, 7, 6, 9, 8, 10, 9, 12].map((h, i) => (
            <div key={i} className="w-[6px] bg-[var(--text-4)] opacity-20" style={{ height: h * 5 }} />
          ))}
        </div>
        <p className="font-mono text-[0.57rem] tracking-[0.08em] uppercase text-[var(--text-3)] mb-2">
          No data yet
        </p>
        <p className="font-mono text-[0.52rem] text-[var(--text-4)] leading-[1.65] max-w-[42ch]">
          Analytics populate as you generate and review briefs. Run your first signal query from the overview page.
        </p>
        <a
          href="/command-center"
          className="mt-5 font-mono text-[0.55rem] tracking-[0.1em] uppercase text-[var(--accent)] border border-[var(--accent-border)] bg-[var(--accent-dim)] px-4 py-2 no-underline hover:bg-[var(--accent)] hover:text-white transition-all"
        >
          Run signal query →
        </a>
      </div>
    </div>
  );
}
