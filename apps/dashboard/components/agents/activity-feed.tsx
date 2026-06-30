"use client";

export default function ActivityFeed() {
  return (
    <div className="border border-[var(--border)] overflow-hidden h-full">
      <div className="bg-[var(--surface)] px-4 py-2 border-b border-[var(--border)] flex items-center justify-between">
        <span className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--low)]">
          Activity feed
        </span>
        <span className="font-mono text-[0.44rem] tracking-[0.08em] uppercase text-[var(--dim)] border border-[var(--border)] px-2 py-[2px]">
          Coming soon
        </span>
      </div>
      <div className="bg-[var(--carbon)] flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-8 h-8 border border-[var(--border)] flex items-center justify-center mb-4">
          <span className="text-[var(--dim)] text-[0.9rem]">◈</span>
        </div>
        <p className="font-mono text-[0.57rem] tracking-[0.08em] uppercase text-[var(--low)] mb-2">
          No activity yet
        </p>
        <p className="font-mono text-[0.52rem] text-[var(--dim)] leading-[1.65] max-w-[28ch]">
          Agent events will appear here once the system is running.
        </p>
      </div>
    </div>
  );
}
