"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/command-center",            label: "Overview",   icon: "⌬", exact: true },
  { href: "/command-center/briefs",     label: "Briefs",     icon: "◻", exact: false },
  { href: "/command-center/analytics",  label: "Analytics",  icon: "◇", exact: false },
  { href: "/command-center/settings",   label: "Settings",   icon: "◎", exact: false },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[200px] shrink-0 bg-[var(--bg-2)] border-r border-[var(--border)] flex flex-col h-full">
      {/* Logo */}
      <div className="h-[52px] flex items-center px-4 border-b border-[var(--border)] gap-2">
        <Image
          src="/viralclaw_avi.png"
          alt="ViralClaw"
          width={20}
          height={20}
          className="object-contain"
          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <span className="font-cond text-[0.82rem] font-bold tracking-[0.16em] uppercase text-[var(--text-1)]">
          ViralClaw
        </span>
        <span className="ml-auto font-mono text-[0.42rem] tracking-[0.1em] uppercase text-[var(--text-4)] border border-[var(--border)] px-[5px] py-[2px]">
          beta
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3">
        <ul className="list-none space-y-[1px] px-2">
          {nav.map(item => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-[10px] px-3 py-[7px] font-mono text-[0.57rem] tracking-[0.1em] uppercase transition-all duration-100 no-underline"
                  style={{
                    color: active ? "var(--text-1)" : "var(--text-3)",
                    background: active ? "var(--bg-3)" : "transparent",
                    borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
                  }}
                >
                  <span className="text-[0.72rem] w-4 text-center opacity-70">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="px-4 mt-5 mb-2">
          <div className="h-px bg-[var(--border)]" />
          <p className="font-mono text-[0.42rem] tracking-[0.18em] uppercase text-[var(--text-4)] mt-3 px-1">
            Coming next
          </p>
        </div>
        <ul className="list-none space-y-[1px] px-2">
          {[
            { icon: "⟳", label: "On-chain RPC" },
            { icon: "◈", label: "Signal Memory" },
          ].map(item => (
            <li key={item.label}>
              <div className="flex items-center gap-[10px] px-3 py-[7px] font-mono text-[0.57rem] tracking-[0.1em] uppercase text-[var(--text-4)] cursor-not-allowed select-none">
                <span className="text-[0.72rem] w-4 text-center opacity-40">{item.icon}</span>
                {item.label}
                <span className="ml-auto font-mono text-[0.38rem] tracking-[0.08em] px-[5px] py-[2px] border border-[var(--border)] text-[var(--text-4)]">
                  soon
                </span>
              </div>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[var(--border)] space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-[5px] h-[5px] rounded-full bg-[var(--green)] animate-[blinkA_2s_ease_infinite] shrink-0" />
          <span className="font-mono text-[0.48rem] tracking-[0.08em] uppercase text-[var(--green)]">
            Claude API live
          </span>
        </div>
        <p className="font-mono text-[0.44rem] text-[var(--text-4)] leading-[1.5]">
          Brief generation active.<br />On-chain scanner building.
        </p>
      </div>
    </aside>
  );
}
