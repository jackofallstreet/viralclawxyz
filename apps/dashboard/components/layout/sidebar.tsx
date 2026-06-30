"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/command-center",            label: "Overview",   icon: "⌬",  exact: true },
  { href: "/command-center/agents",     label: "Agents",     icon: "◈",  exact: false },
  { href: "/command-center/content",    label: "Content",    icon: "◻",  exact: false },
  { href: "/command-center/analytics",  label: "Analytics",  icon: "◇",  exact: false },
  { href: "/command-center/settings",   label: "Settings",   icon: "◎",  exact: false },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[200px] shrink-0 bg-[var(--carbon)] border-r border-[var(--border)] flex flex-col h-full">
      {/* Logo */}
      <div className="h-[52px] flex items-center px-4 border-b border-[var(--border)] gap-2">
        <span className="text-[var(--crimson)] text-[1rem] leading-none">⌬</span>
        <span className="font-cond text-[0.82rem] font-bold tracking-[0.16em] uppercase text-[var(--white)]">
          ViralClaw
        </span>
        <span className="ml-auto font-mono text-[0.42rem] tracking-[0.1em] uppercase text-[var(--dim)] border border-[var(--border)] px-[5px] py-[2px]">
          beta
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3">
        <ul className="list-none space-y-[1px] px-2">
          {nav.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href) && !item.exact
                ? pathname === item.href || pathname.startsWith(item.href + "/")
                : false;
            const isExactActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-[10px] px-3 py-[7px] font-mono text-[0.57rem] tracking-[0.1em] uppercase transition-all duration-100 no-underline ${
                    isExactActive
                      ? "text-[var(--white)] bg-[var(--surface)] border-l border-[var(--crimson)]"
                      : "text-[var(--low)] hover:text-[var(--body)] hover:bg-[var(--surface)]"
                  }`}
                >
                  <span className="text-[0.72rem] w-4 text-center opacity-70">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Section divider */}
        <div className="px-4 mt-5 mb-2">
          <div className="h-px bg-[var(--border)]" />
          <p className="font-mono text-[0.42rem] tracking-[0.18em] uppercase text-[var(--dim)] mt-3 px-1">System</p>
        </div>
        <ul className="list-none space-y-[1px] px-2">
          <li>
            <div className="flex items-center gap-[10px] px-3 py-[7px] font-mono text-[0.57rem] tracking-[0.1em] uppercase text-[var(--dim)] cursor-not-allowed select-none">
              <span className="text-[0.72rem] w-4 text-center opacity-40">⟳</span>
              Logs
              <span className="ml-auto font-mono text-[0.38rem] tracking-[0.08em] px-[5px] py-[2px] border border-[var(--dim)] text-[var(--dim)]">soon</span>
            </div>
          </li>
          <li>
            <div className="flex items-center gap-[10px] px-3 py-[7px] font-mono text-[0.57rem] tracking-[0.1em] uppercase text-[var(--dim)] cursor-not-allowed select-none">
              <span className="text-[0.72rem] w-4 text-center opacity-40">⊞</span>
              Missions
              <span className="ml-auto font-mono text-[0.38rem] tracking-[0.08em] px-[5px] py-[2px] border border-[var(--dim)] text-[var(--dim)]">soon</span>
            </div>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[var(--border)] space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-[5px] h-[5px] rounded-full bg-[var(--amber)] animate-[blinkA_2s_ease_infinite] shrink-0" />
          <span className="font-mono text-[0.48rem] tracking-[0.08em] uppercase text-[var(--amber)]">Building</span>
        </div>
        <p className="font-mono text-[0.44rem] text-[var(--dim)] leading-[1.5]">
          Agents not live yet.<br />Infrastructure in progress.
        </p>
      </div>
    </aside>
  );
}
