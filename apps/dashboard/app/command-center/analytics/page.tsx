"use client";

import { useState, useEffect } from "react";

type Brief = { id: string; type: string; status: string; conviction: number; window: string; created_at: string; content: string };

export default function AnalyticsPage() {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/briefs").then(r => r.json()).then(({ briefs: d }) => { setBriefs(d || []); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const total    = briefs.length;
  const alpha    = briefs.filter(b => b.type === "alpha").length;
  const content  = briefs.filter(b => b.type === "content").length;
  const approved = briefs.filter(b => b.status === "approved").length;
  const avgConv  = total ? (briefs.reduce((s, b) => s + (b.conviction || 0), 0) / total).toFixed(1) : "—";
  const openW    = briefs.filter(b => b.window === "open").length;

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div>
        <h1 className="font-cond text-[clamp(1.5rem,4vw,2.2rem)] font-bold uppercase leading-none text-[var(--white)] tracking-[0.02em]">Analytics</h1>
        <p className="text-[0.78rem] text-[var(--low)] mt-2 font-light">Signal output tracking. Populates as briefs are generated and reviewed.</p>
      </div>

      {loading ? (
        <div className="border border-[var(--border)] bg-[var(--carbon)] py-16 flex items-center justify-center gap-3">
          <span className="w-4 h-4 border border-[var(--crimson)] border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-[0.52rem] text-[var(--dim)]">Loading...</span>
        </div>
      ) : total === 0 ? (
        <div className="border border-[var(--border)] bg-[var(--carbon)] py-16 px-6 text-center">
          <div className="flex items-end justify-center gap-[3px] mb-5 opacity-20">
            {[3,5,4,7,6,9,8,10,9,12].map((h, i) => <div key={i} className="w-[6px] bg-[var(--muted)]" style={{ height: h * 5 }} />)}
          </div>
          <p className="font-mono text-[0.57rem] uppercase text-[var(--low)] mb-2">No data yet</p>
          <p className="font-mono text-[0.52rem] text-[var(--dim)] leading-[1.65]">Generate and save briefs to see analytics.</p>
          <a href="/command-center" className="inline-block mt-4 font-mono text-[0.52rem] tracking-[0.1em] uppercase text-[var(--crimson)] border border-[var(--crimson-border)] bg-[var(--crimson-dim)] px-4 py-2 no-underline hover:bg-[var(--crimson)] hover:text-white transition-all">
            Run signal query →
          </a>
        </div>
      ) : (
        <>
          {/* Stat grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-[var(--border)] border border-[var(--border)]">
            {[
              { label: "Total",       value: total,    color: "text-[var(--white)]" },
              { label: "Alpha",       value: alpha,    color: "text-[var(--crimson)]" },
              { label: "Content",     value: content,  color: "text-[var(--cyan-light)]" },
              { label: "Approved",    value: approved, color: "text-[var(--green)]" },
              { label: "Avg score",   value: `${avgConv}/10`, color: "text-[var(--amber)]" },
              { label: "Open windows",value: openW,   color: "text-[var(--green)]" },
            ].map(s => (
              <div key={s.label} className="bg-[var(--carbon)] p-4 text-center">
                <div className={`font-cond font-extrabold leading-none mb-1 ${s.color}`} style={{ fontSize: "clamp(1.6rem,4vw,2.2rem)" }}>{s.value}</div>
                <div className="font-mono text-[0.44rem] uppercase tracking-[0.1em] text-[var(--dim)]">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Split bar */}
          <div className="border border-[var(--border)] overflow-hidden">
            <div className="bg-[var(--surface)] px-4 py-2 border-b border-[var(--border)]">
              <span className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--low)]">Alpha vs content split</span>
            </div>
            <div className="bg-[var(--carbon)] p-4">
              <div className="h-2 bg-[var(--surface)] rounded overflow-hidden flex">
                <div className="transition-all duration-500" style={{ width: `${total ? (alpha / total) * 100 : 50}%`, background: "var(--crimson)", opacity: 0.8 }} />
                <div className="flex-1" style={{ background: "var(--cyan-light)", opacity: 0.8 }} />
              </div>
              <div className="flex justify-between mt-2">
                <span className="font-mono text-[0.46rem] text-[var(--crimson)]">Alpha — {alpha}</span>
                <span className="font-mono text-[0.46rem] text-[var(--cyan-light)]">Content — {content}</span>
              </div>
            </div>
          </div>

          {/* Recent log */}
          <div className="border border-[var(--border)] overflow-hidden">
            <div className="bg-[var(--surface)] px-4 py-2 border-b border-[var(--border)] flex items-center justify-between">
              <span className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--low)]">Recent brief log</span>
              <a href="/command-center/briefs" className="font-mono text-[0.48rem] text-[var(--dim)] hover:text-[var(--muted)] no-underline transition-colors">View all →</a>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {briefs.slice(0, 10).map(b => {
                let p: any = {}; try { p = JSON.parse(b.content); } catch {}
                return (
                  <div key={b.id} className="bg-[var(--carbon)] px-4 py-3 flex items-center gap-4 hover:bg-[var(--surface)] transition-colors">
                    <span className={`font-mono text-[0.44rem] tracking-[0.06em] uppercase px-2 py-[2px] border shrink-0 ${b.type === "alpha" ? "text-[var(--crimson)] border-[var(--crimson-border)] bg-[var(--crimson-dim)]" : "text-[var(--cyan-light)] border-[var(--cyan-border)] bg-[var(--cyan-dim)]"}`}>{b.type}</span>
                    <p className="flex-1 text-[0.73rem] text-[var(--body)] truncate">{p.signal_summary || p.narrative_summary || "Brief"}</p>
                    <span className={`font-mono text-[0.52rem] font-semibold shrink-0 ${b.conviction >= 8 ? "text-[var(--green)]" : b.conviction >= 6 ? "text-[var(--amber)]" : "text-[var(--crimson)]"}`}>{b.conviction}/10</span>
                    <span className={`font-mono text-[0.44rem] tracking-[0.06em] uppercase px-2 py-[2px] border shrink-0 ${b.status === "approved" ? "text-[var(--green)] border-[var(--green-border)]" : b.status === "archived" ? "text-[var(--dim)] border-[var(--border)]" : "text-[var(--amber)] border-[var(--amber-border)]"}`}>{b.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
