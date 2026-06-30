"use client";

import Link from "next/link";

export default function TopBar() {
  return (
    <header className="h-[52px] border-b border-[var(--border)] bg-[var(--carbon)] flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--dim)]">
          command-center
        </span>
        <span className="text-[var(--dim)]">/</span>
        <span className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--low)]">
          v0.1 — pre-launch
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-[6px]">
          <span className="w-[4px] h-[4px] rounded-full bg-[var(--amber)] animate-[blinkA_2s_ease_infinite]" />
          <span className="font-mono text-[0.48rem] tracking-[0.1em] uppercase text-[var(--amber)]">
            In development
          </span>
        </div>
        <div className="w-px h-3 bg-[var(--border)]" />
        <Link
          href="/command-center/settings"
          className="font-mono text-[0.52rem] tracking-[0.1em] uppercase text-[var(--low)] hover:text-[var(--body)] transition-colors no-underline"
        >
          Settings
        </Link>
      </div>
    </header>
  );
}
