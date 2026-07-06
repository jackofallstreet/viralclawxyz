"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const nav = [
  { href: "/command-center",           label: "Overview",   icon: "⌬", exact: true  },
  { href: "/command-center/briefs",    label: "Briefs",     icon: "◻", exact: false },
  { href: "/command-center/analytics", label: "Analytics",  icon: "◇", exact: false },
  { href: "/command-center/settings",  label: "Settings",   icon: "◎", exact: false },
];

const soon = [
  { label: "Cross-chain",   icon: "⛓" },
  { label: "Signal Memory", icon: "◈" },
  { label: "Narratives",    icon: "⊕" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = localStorage.getItem("vc-theme") as "dark" | "light" | null;
    const init = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(init);
    document.documentElement.setAttribute("data-theme", init);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("vc-theme", next);
  }

  return (
    <aside className="w-[200px] shrink-0 bg-[var(--carbon)] border-r border-[var(--border)] flex flex-col h-full">
      {/* Logo */}
      <div className="h-[52px] flex items-center px-4 border-b border-[var(--border)] gap-2">
        <Image
          src="/viralclaw_avi.png"
          alt="ViralClaw"
          width={20}
          height={20}
          className="object-contain shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <span className="font-cond text-[0.82rem] font-bold tracking-[0.16em] uppercase text-[var(--white)]">
          ViralClaw
        </span>
        <span className="ml-auto font-mono text-[0.42rem] tracking-[0.1em] uppercase text-[var(--dim)] border border-[var(--border)] px-[5px] py-[2px]">
          beta
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <ul className="list-none space-y-[1px] px-2">
          {nav.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-[10px] px-3 py-[7px] font-mono text-[0.57rem] tracking-[0.1em] uppercase transition-all duration-100 no-underline ${
                    active
                      ? "text-[var(--white)] bg-[var(--surface)] border-l-2 border-[var(--crimson)]"
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

        {/* System section */}
        <div className="px-4 mt-5 mb-2">
          <div className="h-px bg-[var(--border)]" />
          <p className="font-mono text-[0.42rem] tracking-[0.18em] uppercase text-[var(--dim)] mt-3 px-1">
            Coming soon
          </p>
        </div>
        <ul className="list-none space-y-[1px] px-2">
          {soon.map((item) => (
            <li key={item.label}>
              <div className="flex items-center gap-[10px] px-3 py-[7px] font-mono text-[0.57rem] tracking-[0.1em] uppercase text-[var(--dim)] cursor-not-allowed select-none">
                <span className="text-[0.72rem] w-4 text-center opacity-40">{item.icon}</span>
                {item.label}
                <span className="ml-auto font-mono text-[0.38rem] tracking-[0.08em] px-[5px] py-[2px] border border-[var(--border)] text-[var(--dim)]">
                  soon
                </span>
              </div>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[var(--border)] space-y-3">
        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-2 w-full hover:opacity-80 transition-opacity"
        >
          <span className="font-mono text-[0.52rem]">
            {theme === "dark" ? "☀" : "☾"}
          </span>
          <span className="font-mono text-[0.48rem] tracking-[0.08em] uppercase text-[var(--dim)]">
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </span>
        </button>
        {/* Status */}
        <div className="flex items-center gap-2">
          <span className="w-[5px] h-[5px] rounded-full bg-[var(--green)] animate-[blinkA_2s_ease_infinite] shrink-0" />
          <span className="font-mono text-[0.48rem] tracking-[0.08em] uppercase text-[var(--green)]">
            Engine live
          </span>
        </div>
        <p className="font-mono text-[0.44rem] text-[var(--dim)] leading-[1.5]">
          Brief generation active.<br />On-chain scanner — Phase 2.
        </p>
      </div>
    </aside>
  );
}
