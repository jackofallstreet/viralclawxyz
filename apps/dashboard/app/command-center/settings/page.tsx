"use client";

import { useState, useEffect } from "react";

type Settings = {
  output_type: "both" | "alpha" | "content";
  focus_area: string;
  min_conviction: number;
  ecosystems: string[];
  creator_voice: string;
};

const DEFAULT: Settings = { output_type: "both", focus_area: "", min_conviction: 7, ecosystems: ["ETH","SOL","BASE","ARB"], creator_voice: "" };

export default function SettingsPage() {
  const [s, setS] = useState<Settings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newEco, setNewEco] = useState("");

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(({ settings }) => { if (settings) setS(p => ({ ...p, ...settings })); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true); setSaved(false); setError(null);
    try {
      const r = await fetch("/api/settings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      });
      const j = await r.json();
      if (!r.ok || j.error) throw new Error(j.error || "Save failed");
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  }

  const set = (k: keyof Settings, v: any) => { setS(p => ({ ...p, [k]: v })); setSaved(false); };
  const addEco = () => { const v = newEco.trim().toUpperCase(); if (v && !s.ecosystems.includes(v)) set("ecosystems", [...s.ecosystems, v]); setNewEco(""); };

  const inp = "w-full bg-[var(--black)] border border-[var(--border)] px-3 py-2 font-mono text-[0.68rem] text-[var(--white)] placeholder:text-[var(--dim)] outline-none focus:border-[var(--crimson-border)] transition-colors";

  return (
    <div className="max-w-[860px] mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-cond text-[clamp(1.5rem,4vw,2.2rem)] font-bold uppercase leading-none text-[var(--white)] tracking-[0.02em]">Settings</h1>
          <p className="text-[0.78rem] text-[var(--low)] mt-2 font-light">Signal preferences injected into every brief generation call.</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="font-mono text-[0.52rem] text-[var(--green)] flex items-center gap-1">✓ Saved</span>}
          {error && <span className="font-mono text-[0.52rem] text-[var(--crimson)]">{error}</span>}
          <button type="button" onClick={save} disabled={saving}
            className={`font-mono text-[0.57rem] tracking-[0.12em] uppercase px-4 py-2 transition-all ${saving ? "bg-[var(--surface)] text-[var(--dim)] cursor-not-allowed" : "bg-[var(--crimson)] text-white hover:bg-[var(--crimson-hover)] cursor-pointer"}`}>
            {saving ? "Saving..." : "Save settings"}
          </button>
        </div>
      </div>

      {/* Signal preferences */}
      <section className="border border-[var(--border)] overflow-hidden">
        <div className="bg-[var(--surface)] px-4 py-2 border-b border-[var(--border)]">
          <span className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--low)]">Signal preferences</span>
        </div>
        <div className="bg-[var(--carbon)] p-5 space-y-5">

          {/* Output type */}
          <div>
            <label className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--low)] block mb-1">Output type</label>
            <p className="font-mono text-[0.44rem] text-[var(--dim)] mb-3">What kind of briefs to generate</p>
            <div className="flex gap-2 flex-wrap">
              {(["both", "alpha", "content"] as const).map(m => (
                <button key={m} type="button" onClick={() => set("output_type", m)}
                  className={`font-mono text-[0.55rem] tracking-[0.08em] uppercase px-4 py-2 border transition-all ${
                    s.output_type === m
                      ? "text-[var(--crimson)] border-[var(--crimson-border)] bg-[var(--crimson-dim)]"
                      : "text-[var(--muted)] border-[var(--border)] hover:border-[var(--border-md)]"
                  }`}>
                  {m === "both" ? "Alpha + Content" : m === "alpha" ? "Alpha only" : "Content only"}
                </button>
              ))}
            </div>
          </div>

          {/* Focus area */}
          <div>
            <label className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--low)] block mb-1">Focus area</label>
            <p className="font-mono text-[0.44rem] text-[var(--dim)] mb-2">Shapes which signals score higher</p>
            <input type="text" value={s.focus_area} onChange={e => set("focus_area", e.target.value)} placeholder="e.g. DeFi, restaking, memecoins, L2s" className={inp} />
          </div>

          {/* Min conviction */}
          <div>
            <label className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--low)] block mb-1">
              Minimum conviction: <span className="text-[var(--crimson)]">{s.min_conviction}/10</span>
            </label>
            <p className="font-mono text-[0.44rem] text-[var(--dim)] mb-3">Signals below this are filtered</p>
            <input type="range" min={1} max={10} step={1} value={s.min_conviction}
              onChange={e => set("min_conviction", Number(e.target.value))}
              className="w-full" style={{ accentColor: "var(--crimson)" }} />
            <div className="flex justify-between mt-1">
              <span className="font-mono text-[0.42rem] text-[var(--dim)]">1 — any signal</span>
              <span className="font-mono text-[0.42rem] text-[var(--dim)]">10 — highest only</span>
            </div>
          </div>

          {/* Ecosystems */}
          <div>
            <label className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--low)] block mb-1">Ecosystem watchlist</label>
            <p className="font-mono text-[0.44rem] text-[var(--dim)] mb-3">Scanner prioritises these chains</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {s.ecosystems.map(e => (
                <div key={e} className="flex items-center gap-1 font-mono text-[0.52rem] tracking-[0.06em] px-2 py-[4px] border border-[var(--cyan-border)] bg-[var(--cyan-dim)] text-[var(--cyan-light)]">
                  {e}
                  <button type="button" onClick={() => set("ecosystems", s.ecosystems.filter(x => x !== e))}
                    className="text-[var(--dim)] hover:text-[var(--crimson)] ml-1 transition-colors">×</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={newEco} onChange={e => setNewEco(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addEco(); } }}
                placeholder="Add chain — press Enter (e.g. SUI, APT)" className={`${inp} flex-1`} />
              <button type="button" onClick={addEco}
                className="font-mono text-[0.52rem] tracking-[0.08em] uppercase px-3 py-2 border border-[var(--border)] text-[var(--muted)] hover:border-[var(--crimson-border)] hover:text-[var(--crimson)] transition-all">
                Add
              </button>
            </div>
          </div>

          {/* Creator voice */}
          <div>
            <label className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--low)] block mb-1">Creator voice</label>
            <p className="font-mono text-[0.44rem] text-[var(--dim)] mb-2">Shapes angle variants and framing in content briefs</p>
            <textarea value={s.creator_voice} onChange={e => set("creator_voice", e.target.value)}
              placeholder="Describe your tone, audience, what to emphasise..." rows={3}
              className={`${inp} resize-none leading-[1.7]`} />
          </div>
        </div>
      </section>

      {/* Supabase SQL */}
      <section className="border border-[var(--border)] overflow-hidden">
        <div className="bg-[var(--surface)] px-4 py-2 border-b border-[var(--border)]">
          <span className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--low)]">Supabase setup — run once in SQL Editor</span>
        </div>
        <div className="bg-[var(--carbon)] p-4">
          <p className="font-mono text-[0.48rem] text-[var(--dim)] leading-[1.6] mb-3">
            Run this SQL in your Supabase dashboard → SQL Editor to create the required tables:
          </p>
          <pre className="bg-[var(--black)] border border-[var(--border)] p-4 text-[0.62rem] text-[var(--muted)] overflow-x-auto leading-[1.8] font-mono select-all rounded-none">
{`create table if not exists signals (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  chain text, type text, summary text,
  conviction int, signal_window text,
  chains text[], social_lag_hours int,
  status text default 'new'
);

create table if not exists briefs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  signal_id uuid, type text not null,
  status text default 'pending',
  conviction int, signal_window text,
  content text, signal_summary text, chains text[]
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
        </div>
      </section>

      {/* Env vars */}
      <section className="border border-[var(--border)] overflow-hidden">
        <div className="bg-[var(--surface)] px-4 py-2 border-b border-[var(--border)]">
          <span className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--low)]">Required environment variables</span>
        </div>
        <div className="bg-[var(--carbon)] divide-y divide-[var(--border)]">
          {[
            { key: "OPENROUTER_API_KEY",            req: true,  note: "Brief generation via OpenRouter" },
            { key: "NEXT_PUBLIC_SUPABASE_URL",       req: true,  note: "Database connection" },
            { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",  req: true,  note: "Database auth" },
            { key: "BIRDEYE_KEY",                    req: false, note: "Solana live token data (trending, gainers)" },
            { key: "COINGECKO_KEY",                  req: false, note: "Global trending + category market data" },
            { key: "BRIAN_KEY",                      req: false, note: "On-chain protocol context (DeFi queries)" },
            { key: "OPENROUTER_MODEL",               req: false, note: "Override model — default: anthropic/claude-sonnet-4-5" },
          ].map(v => (
            <div key={v.key} className="px-4 py-3 flex items-center gap-4">
              <span className={`font-mono text-[0.44rem] tracking-[0.06em] uppercase px-2 py-[2px] border shrink-0 ${v.req ? "text-[var(--crimson)] border-[var(--crimson-border)] bg-[var(--crimson-dim)]" : "text-[var(--dim)] border-[var(--border)]"}`}>
                {v.req ? "required" : "optional"}
              </span>
              <code className="font-mono text-[0.6rem] text-[var(--cyan-light)] flex-1">{v.key}</code>
              <span className="font-mono text-[0.5rem] text-[var(--dim)] hidden sm:block">{v.note}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
