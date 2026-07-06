"use client";

import { usePathname } from "next/navigation";

const LABELS: Record<string, string> = {
  "/command-center":            "Signal Intelligence",
  "/command-center/briefs":     "Briefs",
  "/command-center/analytics":  "Analytics",
  "/command-center/settings":   "Settings",
};

export default function TopBar() {
  const pathname = usePathname();
  const label = LABELS[pathname] || "Command Center";

  return (
    <header className="h-[52px] border-b border-[var(--border)] bg-[var(--carbon)] flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--dim)]">
          command-center
        </span>
        <span className="text-[var(--dim)]">/</span>
        <span className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--low)]">
          {label}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-[6px]">
          <span className="w-[4px] h-[4px] rounded-full bg-[var(--green)] animate-[blinkA_2s_ease_infinite]" />
          <span className="font-mono text-[0.48rem] tracking-[0.1em] uppercase text-[var(--green)]">
            Brief engine live
          </span>
        </div>
        <div className="w-px h-3 bg-[var(--border)]" />
        <div className="flex items-center gap-[6px]">
          <span className="w-[4px] h-[4px] rounded-full bg-[var(--amber)]" />
          <span className="font-mono text-[0.48rem] tracking-[0.1em] uppercase text-[var(--dim)]">
            On-chain — Phase 2
          </span>
        </div>
      </div>
    </header>
  );
}
