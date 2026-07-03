"use client";

import { useState, useEffect } from "react";

type Settings = {
  output_type: "alpha" | "content" | "both";
  focus_area: string;
  min_conviction: number;
  ecosystems: string[];
  creator_voice: string;
};

const DEFAULT: Settings = {
  output_type: "both",
  focus_area: "",
  min_conviction: 7,
  ecosystems: ["ETH", "SOL", "BASE", "ARB"],
  creator_voice: "",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newEco, setNewEco] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/settings");
        const { settings: data } = await res.json();
        if (data) setSettings(prev => ({ ...prev, ...data }));
      } catch { } finally { setLoading(false); }
    })();
  }, []);

  async function save() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const { error: err } = await res.json();
      if (err) throw new Error(err);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const set = (key: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const addEco = () => {
    const val = newEco.trim().toUpperCase();
    if (val && !settings.ecosystems.includes(val)) {
      set("ecosystems", [...settings.ecosystems, val]);
    }
    setNewEco("");
  };

  const removeEco = (eco: string) => {
    set("ecosystems", settings.ecosystems.filter(e => e !== eco));
  };

  if (loading) {
    return (
      <div className="max-w-[860px] mx-auto py-20 text-center">
        <div className="inline-block w-4 h-4 border border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="font-mono text-[0.52rem] text-[var(--text-4)]">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[860px] mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-cond text-[clamp(1.5rem,4vw,2.2rem)] font-bold uppercase leading-none text-[var(--text-1)] tracking-[0.02em]">
            Settings
          </h1>
          <p className="text-[0.78rem] text-[var(--text-3)] mt-2 font-light">
            Signal preferences, ecosystem focus, and creator voice. Loaded by the intelligence layer on every brief generation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="font-mono text-[0.52rem] text-[var(--green)] flex items-center gap-1">
              <span>✓</span> Saved
            </span>
          )}
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="font-mono text-[0.57rem] tracking-[0.12em] uppercase px-4 py-2 transition-all"
            style={{
              background: saving ? "var(--bg-4)" : "var(--accent)",
              color: saving ? "var(--text-4)" : "#fff",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Save settings"}
          </button>
        </div>
      </div>

      {error && (
        <div className="border border-[var(--accent-border)] bg-[var(--accent-dim)] p-4">
          <p className="font-mono text-[0.55rem] text-[var(--accent)]">
            Save failed: {error}
            {error.includes("does not exist") && " — run the Supabase schema below first."}
          </p>
        </div>
      )}

      {/* Signal preferences */}
      <section className="border border-[var(--border)] overflow-hidden">
        <div className="bg-[var(--bg-3)] px-4 py-2 border-b border-[var(--border)] flex items-center justify-between">
          <span className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--text-3)]">
            Signal preferences
          </span>
          <span className="font-mono text-[0.44rem] text-[var(--text-4)]">
            Injected into every brief generation prompt
          </span>
        </div>
        <div className="bg-[var(--bg-2)] p-5 space-y-5">

          {/* Output type */}
          <div>
            <label className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--text-3)] block mb-3">
              Output type
            </label>
            <div className="flex gap-2">
              {(["alpha", "content", "both"] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set("output_type", t)}
                  className="font-mono text-[0.55rem] tracking-[0.08em] uppercase px-4 py-2 border transition-all"
                  style={{
                    background: settings.output_type === t ? "var(--accent)" : "var(--bg)",
                    color: settings.output_type === t ? "#fff" : "var(--text-3)",
                    borderColor: settings.output_type === t ? "var(--accent)" : "var(--border)",
                  }}
                >
                  {t === "both" ? "Alpha + Content" : t === "alpha" ? "Alpha only" : "Content only"}
                </button>
              ))}
            </div>
          </div>

          {/* Focus area */}
          <div>
            <label className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--text-3)] block mb-2">
              Focus area
            </label>
            <p className="font-mono text-[0.44rem] text-[var(--text-4)] mb-2">Shapes which signals score higher</p>
            <input
              type="text"
              value={settings.focus_area}
              onChange={e => set("focus_area", e.target.value)}
              placeholder="e.g. DeFi, restaking, memecoins, L2s"
              className="w-full bg-[var(--bg)] border border-[var(--border-2)] px-3 py-2 font-mono text-[0.68rem] text-[var(--text-1)] placeholder:text-[var(--text-4)] outline-none transition-colors"
              onFocus={e => (e.target.style.borderColor = "var(--accent)")}
              onBlur={e => (e.target.style.borderColor = "var(--border-2)")}
            />
          </div>

          {/* Min conviction */}
          <div>
            <label className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--text-3)] block mb-2">
              Minimum conviction threshold: <span style={{ color: "var(--accent)" }}>{settings.min_conviction}/10</span>
            </label>
            <p className="font-mono text-[0.44rem] text-[var(--text-4)] mb-3">Signals below this score are filtered before brief generation</p>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={settings.min_conviction}
              onChange={e => set("min_conviction", Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
              style={{ accentColor: "var(--accent)" }}
            />
            <div className="flex justify-between font-mono text-[0.42rem] text-[var(--text-4)] mt-1">
              <span>1 — any signal</span>
              <span>10 — highest only</span>
            </div>
          </div>

          {/* Ecosystems */}
          <div>
            <label className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--text-3)] block mb-2">
              Ecosystem watchlist
            </label>
            <p className="font-mono text-[0.44rem] text-[var(--text-4)] mb-3">Scanner prioritises these chains for cross-chain correlation</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {settings.ecosystems.map(eco => (
                <div
                  key={eco}
                  className="flex items-center gap-1 font-mono text-[0.52rem] tracking-[0.06em] px-2 py-[4px] border border-[var(--teal-border)] bg-[var(--teal-dim)] text-[var(--teal)]"
                >
                  {eco}
                  <button
                    type="button"
                    onClick={() => removeEco(eco)}
                    className="text-[var(--text-4)] hover:text-[var(--accent)] ml-1 transition-colors text-[0.7rem] leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newEco}
                onChange={e => setNewEco(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addEco(); } }}
                placeholder="Add chain — press Enter (e.g. SUI, APT)"
                className="flex-1 bg-[var(--bg)] border border-[var(--border-2)] px-3 py-2 font-mono text-[0.65rem] text-[var(--text-1)] placeholder:text-[var(--text-4)] outline-none transition-colors"
                onFocus={e => (e.target.style.borderColor = "var(--accent)")}
                onBlur={e => (e.target.style.borderColor = "var(--border-2)")}
              />
              <button
                type="button"
                onClick={addEco}
                className="font-mono text-[0.55rem] tracking-[0.08em] uppercase px-3 py-2 border border-[var(--border-2)] text-[var(--text-3)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
              >
                Add
              </button>
            </div>
          </div>

          {/* Creator voice */}
          <div>
            <label className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--text-3)] block mb-2">
              Creator voice
            </label>
            <p className="font-mono text-[0.44rem] text-[var(--text-4)] mb-2">Shapes angle variants and framing in content briefs</p>
            <textarea
              value={settings.creator_voice}
              onChange={e => set("creator_voice", e.target.value)}
              placeholder="Describe your tone, audience, and what to emphasise. e.g. &quot;Analytical, first-principles, for crypto-native audience aged 25-35 who trade actively&quot;"
              rows={4}
              className="w-full bg-[var(--bg)] border border-[var(--border-2)] p-3 font-mono text-[0.68rem] text-[var(--text-1)] placeholder:text-[var(--text-4)] resize-none outline-none transition-colors leading-[1.7]"
              onFocus={e => (e.target.style.borderColor = "var(--accent)")}
              onBlur={e => (e.target.style.borderColor = "var(--border-2)")}
            />
          </div>

        </div>
      </section>

      {/* Supabase schema helper */}
      <section className="border border-[var(--border)] overflow-hidden">
        <div className="bg-[var(--bg-3)] px-4 py-2 border-b border-[var(--border)]">
          <span className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--text-3)]">
            Supabase setup — run once
          </span>
        </div>
        <div className="bg-[var(--bg-2)] p-5">
          <p className="font-mono text-[0.52rem] text-[var(--text-4)] mb-3 leading-[1.6]">
            Run this SQL in your Supabase dashboard → SQL Editor to create the required tables:
          </p>
          <pre className="bg-[var(--bg)] border border-[var(--border)] p-4 text-[0.62rem] text-[var(--text-2)] overflow-x-auto leading-[1.8] font-mono select-all">
{`-- Signals table
create table if not exists signals (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  chain text,
  type text,
  summary text,
  conviction int,
  window text,
  chains text[],
  social_lag_hours int,
  status text default 'new'
);

-- Briefs table
create table if not exists briefs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  signal_id uuid references signals(id) on delete set null,
  type text not null,
  status text default 'pending',
  conviction int,
  window text,
  content text,
  signal_summary text,
  chains text[]
);

-- Settings table
create table if not exists settings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  output_type text default 'both',
  focus_area text,
  min_conviction int default 7,
  ecosystems text[] default array['ETH','SOL','BASE','ARB'],
  creator_voice text
);

-- Disable RLS for now (enable + add policies when you add auth)
alter table signals disable row level security;
alter table briefs disable row level security;
alter table settings disable row level security;`}
          </pre>
        </div>
      </section>

      {/* Env vars reminder */}
      <section className="border border-[var(--border)] overflow-hidden">
        <div className="bg-[var(--bg-3)] px-4 py-2 border-b border-[var(--border)]">
          <span className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--text-3)]">
            Required environment variables
          </span>
        </div>
        <div className="bg-[var(--bg-2)] divide-y divide-[var(--border)]">
          {[
            { key: "ANTHROPIC_API_KEY",           note: "Brief generation — Claude Sonnet 4.6",   required: true },
            { key: "NEXT_PUBLIC_SUPABASE_URL",     note: "Database — signals, briefs, settings",   required: true },
            { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",note: "Database — public client key",           required: true },
            { key: "SUPABASE_SERVICE_ROLE_KEY",    note: "Database — server-side writes (optional, falls back to anon key)", required: false },
          ].map(v => (
            <div key={v.key} className="px-4 py-3 flex items-center gap-4">
              <span
                className="font-mono text-[0.44rem] tracking-[0.06em] uppercase px-2 py-[2px] border shrink-0"
                style={{
                  color: v.required ? "var(--accent)" : "var(--text-4)",
                  borderColor: v.required ? "var(--accent-border)" : "var(--border)",
                  background: v.required ? "var(--accent-dim)" : "transparent",
                }}
              >
                {v.required ? "required" : "optional"}
              </span>
              <code className="font-mono text-[0.6rem] text-[var(--teal)]">{v.key}</code>
              <span className="font-mono text-[0.5rem] text-[var(--text-4)] truncate">{v.note}</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
