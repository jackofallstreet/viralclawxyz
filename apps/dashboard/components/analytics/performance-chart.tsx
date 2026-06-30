"use client";

export default function PerformanceChart() {
  return (
    <div className="border border-[var(--border)] overflow-hidden">
      <div className="bg-[var(--surface)] px-4 py-2 border-b border-[var(--border)] flex items-center justify-between">
        <span className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--low)]">
          Performance overview
        </span>
        <span className="font-mono text-[0.44rem] tracking-[0.08em] uppercase text-[var(--dim)] border border-[var(--border)] px-2 py-[2px]">
          Coming soon
        </span>
      </div>
      <div className="bg-[var(--carbon)] flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="flex items-end gap-[3px] mb-5">
          {[3,5,4,7,6,9,8,10,9,12].map((h, i) => (
            <div
              key={i}
              className="w-[6px] bg-[var(--dim)] opacity-40"
              style={{ height: h * 5 }}
            />
          ))}
        </div>
        <p className="font-mono text-[0.57rem] tracking-[0.08em] uppercase text-[var(--low)] mb-2">
          No data yet
        </p>
        <p className="font-mono text-[0.52rem] text-[var(--dim)] leading-[1.65] max-w-[36ch]">
          Once the Analytics Agent is running, performance data will populate here.
        </p>
      </div>
    </div>
  );
}
