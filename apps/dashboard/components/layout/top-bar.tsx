"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ROUTE_LABELS: Record<string, string> = {
  "/command-center":            "Signal Intelligence",
  "/command-center/briefs":     "Briefs",
  "/command-center/analytics":  "Analytics",
  "/command-center/settings":   "Settings",
};

export default function TopBar() {
  const pathname = usePathname();
  const label = ROUTE_LABELS[pathname] || "Command Center";

  return (
    <header className="h-[52px] border-b border-[var(--border)] bg-[var(--bg-2)] flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--text-4)]">
          command-center
        </span>
        <span className="text-[var(--border-2)]">/</span>
        <span className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--text-2)]">
          {label}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Live indicator */}
        <div className="flex items-center gap-[6px]">
          <span className="w-[4px] h-[4px] rounded-full bg-[var(--green)] animate-[blinkA_2s_ease_infinite]" />
          <span className="font-mono text-[0.48rem] tracking-[0.1em] uppercase text-[var(--green)]">
            Brief engine live
          </span>
        </div>
        <div className="w-px h-3 bg-[var(--border)]" />
        <Link
          href="/command-center/settings"
          className="font-mono text-[0.52rem] tracking-[0.1em] uppercase text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors no-underline"
        >
          Settings
        </Link>
      </div>
    </header>
  );
}
