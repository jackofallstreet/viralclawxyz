"use client";

const agents = [
  {
    id: "orchestrator",
    label: "Orchestrator",
    role: "Mission decomposition + routing",
    state: "building",
    note: "LangGraph runtime",
  },
  {
    id: "trend",
    label: "Trend & Intelligence",
    role: "YouTube signal detection",
    state: "building",
    note: "YouTube API + niche analysis",
  },
  {
    id: "strategy",
    label: "Strategy",
    role: "Content briefs + calendars",
    state: "soon",
    note: "Depends on Intelligence",
  },
  {
    id: "production",
    label: "Production",
    role: "Scripts, threads, Shorts",
    state: "soon",
    note: "Depends on Strategy",
  },
  {
    id: "distribution",
    label: "Distribution",
    role: "Schedule + publish",
    state: "soon",
    note: "Approval gate required",
  },
  {
    id: "analytics",
    label: "Analytics",
    role: "Performance cycles",
    state: "soon",
    note: "Post-distribution",
  },
  {
    id: "revenue",
    label: "Revenue",
    role: "Sponsorship + monetization",
    state: "planned",
    note: "Phase 2",
  },
];

const stateConfig = {
  building: {
    label: "Building",
    dot: "bg-[var(--cyan-light)] animate-[blinkA_1.4s_ease_infinite]",
    badge: "text-[var(--cyan-light)] border-[var(--cyan-border)] bg-[var(--cyan-dim)]",
  },
  soon: {
    label: "Coming soon",
    dot: "bg-[var(--amber)]",
    badge: "text-[var(--amber)] border-[var(--amber-border)] bg-[var(--amber-dim)]",
  },
  planned: {
    label: "Planned",
    dot: "bg-[var(--dim)]",
    badge: "text-[var(--dim)] border-[var(--border-md)]",
  },
};

export default function AgentStatusGrid() {
  return (
    <div className="border border-[var(--border)] overflow-hidden">
      <div className="bg-[var(--surface)] px-4 py-2 border-b border-[var(--border)] flex items-center justify-between">
        <span className="font-mono text-[0.52rem] tracking-[0.12em] uppercase text-[var(--low)]">
          Agent swarm — build status
        </span>
        <span className="font-mono text-[0.48rem] tracking-[0.1em] uppercase text-[var(--dim)]">
          {agents.filter(a => a.state === "building").length} in progress · {agents.filter(a => a.state === "soon").length} queued
        </span>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {agents.map((agent) => {
          const cfg = stateConfig[agent.state as keyof typeof stateConfig];
          return (
            <div
              key={agent.id}
              className="bg-[var(--carbon)] px-4 py-3 flex items-center gap-4 hover:bg-[var(--surface)] transition-colors duration-150"
            >
              <span className={`w-[5px] h-[5px] rounded-full shrink-0 ${cfg.dot}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="font-cond text-[0.82rem] font-semibold uppercase tracking-[0.04em] text-[var(--white)]">
                    {agent.label}
                  </span>
                  <span className="font-mono text-[0.48rem] text-[var(--dim)]">·</span>
                  <span className="font-mono text-[0.52rem] text-[var(--low)] truncate">{agent.role}</span>
                </div>
              </div>
              <span className="font-mono text-[0.44rem] tracking-[0.08em] uppercase text-[var(--dim)] hidden sm:block">
                {agent.note}
              </span>
              <span className={`font-mono text-[0.44rem] tracking-[0.08em] uppercase px-2 py-[3px] border shrink-0 ${cfg.badge}`}>
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
