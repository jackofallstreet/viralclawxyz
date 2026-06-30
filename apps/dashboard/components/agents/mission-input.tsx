"use client";

import { useState } from "react";

export default function MissionInput() {
  const [value, setValue] = useState("");

  return (
    <div className="border border-[var(--border)] overflow-hidden">
      <div className="bg-[var(--surface)] px-4 py-2 border-b border-[var(--border)] flex items-center justify-between">
        <span className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--low)]">
          Mission input
        </span>
        <span className="font-mono text-[0.44rem] tracking-[0.08em] uppercase text-[var(--amber)] border border-[var(--amber-border)] bg-[var(--amber-dim)] px-2 py-[2px]">
          Orchestrator not wired
        </span>
      </div>
      <div className="bg-[var(--carbon)] p-4">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Describe what you want to achieve — the Orchestrator will break it down into agent tasks when live."
          rows={3}
          className="w-full bg-[var(--black)] border border-[var(--border-md)] p-3 font-mono text-[0.68rem] text-[var(--white)] placeholder:text-[var(--dim)] resize-none outline-none focus:border-[var(--crimson)] transition-colors leading-[1.7]"
        />
        <div className="flex items-center justify-between mt-3">
          <p className="font-mono text-[0.48rem] text-[var(--dim)] leading-[1.5] max-w-[50ch]">
            Will route to: Trend → Strategy → Production → Distribution → Analytics
          </p>
          <button
            type="button"
            disabled
            className="font-mono text-[0.57rem] tracking-[0.12em] uppercase text-[var(--dim)] bg-[var(--surface)] border border-[var(--border)] px-4 py-2 cursor-not-allowed"
          >
            Launch mission →
          </button>
        </div>
      </div>
    </div>
  );
}
