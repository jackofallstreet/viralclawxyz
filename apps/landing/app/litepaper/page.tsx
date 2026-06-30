"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { useEffect, useRef, useState } from "react";

const SECTIONS = [
  { id: "thesis",         label: "The thesis" },
  { id: "definition",     label: "Defining synchronization" },
  { id: "economy",        label: "The synchronization economy" },
  { id: "problem",        label: "The problem" },
  { id: "solution",       label: "What ViralClaw is" },
  { id: "what-we-measure",label: "What we measure" },
  { id: "architecture",   label: "Signal architecture" },
  { id: "intelligence",   label: "Intelligence engine" },
  { id: "outputs",        label: "Dual outputs" },
  { id: "users",          label: "Who it's for" },
  { id: "moat",           label: "The moat" },
  { id: "monetization",   label: "Monetization" },
  { id: "vision",         label: "Long-term vision" },
];

function Anchor({ id }: { id: string }) {
  return <div id={id} className="scroll-mt-[80px]" />;
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 no-underline" aria-label="ViralClaw home">
      <Image
        src="/viralclaw_avi.png"
        alt="ViralClaw"
        width={22}
        height={22}
        className="object-contain"
        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
      <span className="font-cond text-[0.88rem] font-bold tracking-[0.14em] uppercase" style={{ color: "var(--text-1)" }}>
        ViralClaw
      </span>
    </Link>
  );
}

function H1({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-cond font-extrabold uppercase tracking-tight mb-6"
      style={{ fontSize: "clamp(2.4rem,6vw,3.8rem)", color: "var(--text-1)", lineHeight: 0.9 }}
    >
      {children}
    </h2>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-cond text-[1.3rem] font-bold uppercase tracking-[0.04em] mt-12 mb-4 flex items-center gap-3" style={{ color: "var(--text-1)" }}>
      <span className="w-[3px] h-5 inline-block shrink-0" style={{ background: "var(--accent)" }} />
      {children}
    </h3>
  );
}

function P({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <p
      className="leading-[1.92] mb-5"
      style={{ fontSize: "0.91rem", color: "var(--text-2)", maxWidth: wide ? "none" : "62ch" }}
    >
      {children}
    </p>
  );
}

function S({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold" style={{ color: "var(--text-1)" }}>{children}</strong>;
}

function A({ children }: { children: React.ReactNode }) {
  return <span style={{ color: "var(--accent)" }}>{children}</span>;
}

function T({ children }: { children: React.ReactNode }) {
  return <span style={{ color: "var(--teal)" }}>{children}</span>;
}

function HR() {
  return <div className="my-12" style={{ height: 1, background: "var(--border)" }} />;
}

function Pull({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-10 pl-7 py-1" style={{ borderLeft: "2px solid var(--accent)" }}>
      <p
        className="font-cond font-semibold uppercase leading-[1.22]"
        style={{ fontSize: "clamp(1.2rem,3vw,1.75rem)", color: "var(--text-1)" }}
      >
        {children}
      </p>
    </blockquote>
  );
}

function Divider({ n }: { n: string }) {
  return (
    <div className="flex items-center gap-4 mb-10 mt-2">
      <span className="font-mono text-[0.48rem] tracking-[0.22em]" style={{ color: "var(--text-4)" }}>{n}</span>
      <div className="h-px flex-1" style={{ background: "var(--border)" }} />
    </div>
  );
}

function Grid({ children, cols = 2 }: { children: React.ReactNode; cols?: 2 | 3 }) {
  return (
    <div
      className={`grid gap-px my-7 border`}
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`,
        background: "var(--border)",
        borderColor: "var(--border)",
      }}
    >
      {children}
    </div>
  );
}

function Cell({
  label,
  children,
  accent = false,
  labelColor,
}: {
  label: string;
  children: React.ReactNode;
  accent?: boolean;
  labelColor?: string;
}) {
  return (
    <div
      className="p-5 transition-colors"
      style={{ background: accent ? "var(--bg-3)" : "var(--bg-2)" }}
      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-3)")}
      onMouseLeave={e => (e.currentTarget.style.background = accent ? "var(--bg-3)" : "var(--bg-2)")}
    >
      <p className="font-mono text-[0.52rem] tracking-[0.14em] uppercase mb-3" style={{ color: labelColor || (accent ? "var(--accent)" : "var(--text-3)") }}>
        {label}
      </p>
      <div className="text-[0.85rem] leading-[1.78]" style={{ color: "var(--text-2)" }}>
        {children}
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center p-6 border" style={{ background: "var(--bg-2)", borderColor: "var(--border)" }}>
      <div
        className="font-cond font-extrabold uppercase leading-none mb-2"
        style={{ fontSize: "clamp(2rem,5vw,3rem)", color: "var(--accent)" }}
      >
        {value}
      </div>
      <div className="font-mono text-[0.54rem] tracking-[0.12em] uppercase" style={{ color: "var(--text-3)" }}>
        {label}
      </div>
    </div>
  );
}

function List({ items, color = "crimson" }: { items: string[]; color?: "crimson" | "green" | "cyan" }) {
  const dot = {
    crimson: "var(--accent)",
    green: "var(--green)",
    cyan: "var(--teal)",
  }[color];
  return (
    <ul className="space-y-[10px] my-5">
      {items.map(item => (
        <li key={item} className="flex items-start gap-3 text-[0.85rem]" style={{ color: "var(--text-2)" }}>
          <span className="shrink-0 mt-[3px] text-[0.5rem]" style={{ color: dot }}>▸</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function Note({ children, type = "info" }: { children: React.ReactNode; type?: "info" | "warn" | "tip" }) {
  const t = {
    info: { c: "var(--teal)",  b: "var(--teal-border)",  bg: "var(--teal-dim)",  l: "Note" },
    warn: { c: "var(--amber)", b: "var(--amber-border)", bg: "var(--amber-dim)", l: "Important" },
    tip:  { c: "var(--green)", b: "var(--green-border)", bg: "var(--green-dim)", l: "Key insight" },
  }[type];
  return (
    <div className="my-7 p-5 border" style={{ borderColor: t.b, background: t.bg }}>
      <p className="font-mono text-[0.5rem] tracking-[0.18em] uppercase mb-2" style={{ color: t.c }}>{t.l}</p>
      <div className="text-[0.87rem] leading-[1.87]" style={{ color: "var(--text-2)" }}>{children}</div>
    </div>
  );
}

export default function LitepaperPage() {
  const [active, setActive] = useState("thesis");
  const [tocOpen, setTocOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
      },
      { rootMargin: "-15% 0px -70% 0px" }
    );
    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTocOpen(false);
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>

      {/* Header */}
      <header
        className="sticky top-0 z-50 h-[54px] border-b flex items-center justify-between px-[clamp(1rem,4vw,2rem)]"
        style={{
          background: "color-mix(in srgb, var(--bg) 94%, transparent)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-center gap-3">
          <Logo />
          <span className="hidden sm:block" style={{ color: "var(--text-4)" }}>/</span>
          <span className="hidden sm:block font-mono text-[0.5rem] tracking-[0.1em] uppercase" style={{ color: "var(--text-4)" }}>
            litepaper v0.3
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/#access"
            className="font-mono text-[0.57rem] tracking-[0.12em] uppercase no-underline px-3 py-[6px] transition-colors"
            style={{ background: "var(--accent)", color: "#fff" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--accent-hover)")}
            onMouseLeave={e => (e.currentTarget.style.background = "var(--accent)")}
          >
            Get early access →
          </Link>
          <button
            type="button"
            onClick={() => setTocOpen(o => !o)}
            className="xl:hidden font-mono text-[0.55rem] uppercase border px-3 py-[6px]"
            style={{ color: "var(--text-2)", borderColor: "var(--border-2)" }}
          >
            {tocOpen ? "✕" : "Contents"}
          </button>
        </div>
      </header>

      {/* Mobile TOC */}
      {tocOpen && (
        <div
          className="xl:hidden fixed top-[54px] inset-x-0 z-40 border-b max-h-[65vh] overflow-y-auto"
          style={{ background: "var(--bg-2)", borderColor: "var(--border)" }}
        >
          {SECTIONS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => jump(s.id)}
              className="w-full text-left flex items-center gap-4 px-5 py-3 border-b last:border-0 transition-colors"
              style={{
                borderColor: "var(--border)",
                background: active === s.id ? "var(--bg-3)" : "transparent",
                color: active === s.id ? "var(--text-1)" : "var(--text-3)",
              }}
            >
              <span className="font-mono text-[0.46rem] shrink-0" style={{ color: "var(--text-4)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-mono text-[0.63rem] tracking-[0.03em]">{s.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="max-w-[1400px] mx-auto flex">

        {/* Sidebar TOC */}
        <aside className="hidden xl:block w-[220px] shrink-0" style={{ borderRight: "1px solid var(--border)" }}>
          <div className="sticky top-[54px] py-10 pl-6 pr-5 max-h-[calc(100vh-54px)] overflow-y-auto">
            <p className="font-mono text-[0.44rem] tracking-[0.22em] uppercase mb-5" style={{ color: "var(--text-4)" }}>
              Contents
            </p>
            {SECTIONS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => jump(s.id)}
                className="w-full text-left flex items-center gap-3 py-[7px] mb-[1px] pl-3 border-l-2 transition-all duration-150"
                style={{
                  borderColor: active === s.id ? "var(--accent)" : "transparent",
                  color: active === s.id ? "var(--text-1)" : "var(--text-4)",
                }}
                onMouseEnter={e => { if (active !== s.id) e.currentTarget.style.color = "var(--text-3)"; }}
                onMouseLeave={e => { if (active !== s.id) e.currentTarget.style.color = "var(--text-4)"; }}
              >
                <span className="font-mono text-[0.42rem] shrink-0" style={{ color: "var(--text-4)" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-mono text-[0.56rem] tracking-[0.02em]">{s.label}</span>
              </button>
            ))}
            <div className="mt-10 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
              <p className="font-mono text-[0.46rem] tracking-[0.1em] uppercase" style={{ color: "var(--text-4)" }}>ViralClaw</p>
              <p className="font-mono text-[0.44rem] mt-1" style={{ color: "var(--text-4)" }}>Litepaper v0.3 — 2025</p>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 px-[clamp(1.5rem,5vw,4rem)] py-[clamp(3rem,7vw,6rem)]">
          <div style={{ maxWidth: 700 }}>

            {/* ── Cover ── */}
            <div className="mb-16 pb-16" style={{ borderBottom: "1px solid var(--border)" }}>
              <p className="font-mono text-[0.54rem] tracking-[0.22em] uppercase flex items-center gap-2 mb-10" style={{ color: "var(--accent)" }}>
                <span className="w-4 h-px inline-block" style={{ background: "var(--accent)" }} />
                Litepaper — v0.3 — 2025
              </p>

              <div className="flex items-start gap-4 mb-6">
                <Image
                  src="/viralclaw_avi.png"
                  alt="ViralClaw"
                  width={52}
                  height={52}
                  className="object-contain mt-1 shrink-0"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <h1
                  className="font-cond font-extrabold uppercase tracking-tight"
                  style={{ fontSize: "clamp(4rem,11vw,7.5rem)", color: "var(--text-1)", lineHeight: 0.88 }}
                >
                  Viral<br /><span style={{ color: "var(--accent)" }}>Claw</span>
                </h1>
              </div>

              <p
                className="font-cond font-light uppercase tracking-[0.05em] mb-3"
                style={{ fontSize: "clamp(1rem,2.5vw,1.35rem)", color: "var(--text-3)" }}
              >
                The Synchronization Intelligence Layer
              </p>
              <p className="text-[0.88rem] leading-[1.8] mb-10" style={{ color: "var(--text-3)", maxWidth: "52ch" }}>
                Markets don't reward attention. They reward synchronized conviction.
                ViralClaw is built to detect the moment independent networks begin
                agreeing with one another — before the market prices it in.
              </p>

              <div className="grid grid-cols-3 gap-px border" style={{ background: "var(--border)", borderColor: "var(--border)" }}>
                <Stat value="17"      label="Chains indexed" />
                <Stat value="&lt;400ms" label="Detection latency" />
                <Stat value="2"       label="Simultaneous outputs" />
              </div>
            </div>

            {/* ── 01 Thesis ── */}
            <Anchor id="thesis" />
            <Divider n="01" />
            <H1>The<br />thesis</H1>
            <P>
              Markets don't move because people pay attention. They move because{" "}
              <S>independent participants begin expressing the same conviction</S> — before
              everyone else notices. That emergence is not trend. Trend is already visible.
              What precedes it is something rarer and more specific: synchronization.
            </P>
            <P>
              Every breakout starts the same way. A meme. A wallet cluster. A creator. A
              research thread. A cultural moment. Most remain trapped inside the community
              where they were born. A few escape — jumping from on-chain behavior to social
              conversation to creator content to mainstream attention. Each crossing accumulates
              more conviction. Each is a synchronization event. And each is observable
              before the repricing begins.
            </P>
            <Pull>
              Attention is abundant.<br />
              Synchronization is scarce.<br />
              Scarcity is what markets price.
            </Pull>
            <P>
              This is the core thesis behind ViralClaw. Not that markets are irrational, or
              that information is asymmetric in trivial ways. But that{" "}
              <S>synchronized conviction is a computable, observable, precursor event</S> —
              and that the tools to detect it at scale simply don't exist yet.
            </P>
            <P>
              ViralClaw is built to be those tools.
            </P>

            <HR />

            {/* ── 02 Definition ── */}
            <Anchor id="definition" />
            <Divider n="02" />
            <H1>Defining<br />synchronization</H1>
            <P>
              Synchronization is the emergence of the same belief across disconnected networks
              without centralized coordination. It is the scarce resource behind attention
              markets — and the earliest observable precursor to narrative repricing.
            </P>
            <P>
              It is not virality. Virality is a retrospective description of what already
              happened. Synchronization is what you observe in the formation stage — the
              moment before the thing is viral, when conviction is spreading across
              communities that haven't yet connected with each other.
            </P>
            <P>
              It is not trend. Trends are visible by definition. Synchronization is the
              signal that precedes the trend by hours — sometimes days. By the time something
              is trending, synchronization already happened. The window opened and, for most
              participants, already closed.
            </P>
            <Pull>
              Virality is retrospective.<br />
              Synchronization is present tense.<br />
              ViralClaw operates in the present.
            </Pull>

            <H2>What synchronization looks like in practice</H2>
            <Grid>
              <Cell label="On-chain" labelColor="var(--teal)">
                Smart money wallets begin accumulating quietly. Bridge volumes between
                ecosystems start increasing without a public catalyst. DEX depth shifts
                in ways that don't yet map to any visible narrative.
              </Cell>
              <Cell label="Social emergence" labelColor="var(--teal)">
                Independent researchers in different communities begin writing about the
                same theme — without apparent coordination. Vocabulary starts becoming
                shared across groups that don't follow each other.
              </Cell>
              <Cell label="Creator adoption" labelColor="var(--accent)">
                Certain creators — the ones who consistently move before the crowd — begin
                covering the narrative. Their adoption is itself a high-conviction secondary
                signal of synchronization depth.
              </Cell>
              <Cell label="Conviction formation" labelColor="var(--accent)">
                Independent participants who have never interacted begin expressing the
                same belief. Capital hasn't moved yet in a way anyone notices. Content
                hasn't peaked. The window is wide open.
              </Cell>
            </Grid>

            <Note type="tip">
              The distinction between synchronization and trend isn't philosophical — it's
              the entire product. ViralClaw is built to operate in the window between
              on-chain signal emergence and social narrative peak. That window averages
              4 to 8 hours. It is measurable, computable, and actionable.
            </Note>

            <HR />

            {/* ── 03 Economy ── */}
            <Anchor id="economy" />
            <Divider n="03" />
            <H1>The synchronization<br />economy</H1>
            <P>
              We believe markets built on attention have entered a new phase. Attention is
              abundant. Synchronization is scarce. And scarcity is what markets price.
            </P>
            <P>
              Just as financial markets price earnings, commodities price supply, and real
              estate prices location — <S>attention markets increasingly price synchronized
              conviction</S>. The projects, creators, protocols, and ideas that synchronize
              across independent communities accumulate belief long before they accumulate
              universal attention.
            </P>
            <P>
              This dynamic applies far beyond crypto. Any system where ideas compete for
              capital eventually rewards synchronization.
            </P>

            <Grid cols={3}>
              <Cell label="Memecoins">
                The ones that survive synchronize across on-chain behavior, social communities,
                and creator ecosystems simultaneously. The ones that don't, don't.
              </Cell>
              <Cell label="AI narratives">
                Model releases, capability claims, and new applications synchronize across
                developer communities, social platforms, and investor networks before
                mainstream adoption follows.
              </Cell>
              <Cell label="Open source">
                Projects that synchronize across GitHub stars, developer Twitter, and
                community Discord before their official announcement are the ones that
                compound fastest post-launch.
              </Cell>
              <Cell label="Consumer apps">
                The apps that break through aren't always the best ones. They're the ones
                whose early user communities synchronized across independent word-of-mouth
                channels before launch or growth spend.
              </Cell>
              <Cell label="Elections">
                Political momentum is measurable before polling catches up. Synchronization
                across grassroots communities, creator networks, and organic social behavior
                is the leading indicator.
              </Cell>
              <Cell label="Internet culture">
                Memes, aesthetic movements, slang — cultural exports synchronize across
                communities before they reach the mainstream. The diffusion is observable
                and computable at every stage.
              </Cell>
            </Grid>

            <P>
              ViralClaw begins with crypto — because on-chain data is the most honest,
              most real-time, and most legible expression of synchronized conviction that
              exists. But the synchronization economy is not confined to crypto. It is the
              operating model of every market where ideas compete for capital.
            </P>

            <HR />

            {/* ── 04 Problem ── */}
            <Anchor id="problem" />
            <Divider n="04" />
            <H1>The<br />problem</H1>
            <P>
              Every existing tool measures one dimension of the signal and calls it intelligence.
              Block explorers show wallets. Social tools show engagement. On-chain dashboards
              show liquidity. Sentiment trackers show sentiment.
            </P>
            <P>
              None of them observe <S>how independent signals begin reinforcing one another</S>.
              That convergence is where synchronization lives — and it is invisible to every
              category of tool that currently exists.
            </P>

            <H2>Four fundamental gaps</H2>

            {[
              {
                label: "On-chain data is raw at the speed that matters",
                body: "Block explorers and dashboards surface data, not intelligence. Interpreting what a wallet cluster, a bridge volume anomaly, or a DEX pattern actually means — in the context of a forming narrative — requires hours of manual synthesis. By the time that synthesis is complete, the window is often closing. The signal was always there. The infrastructure to act on it wasn't.",
              },
              {
                label: "Social signals arrive after the trade",
                body: "By the time a narrative hits Crypto Twitter with enough velocity to be recognized as a trend, the alpha window is already compressing. The 4 to 8 hour gap between on-chain signal emergence and social narrative peak is not a quirk — it's a structural property of how information spreads through communities sequentially rather than simultaneously. Most tools surface signals inside that lag, not before it.",
              },
              {
                label: "Cross-chain intelligence doesn't exist in practice",
                body: "A rotation that starts on Ethereum and moves to Base and Arbitrum is completely invisible to tools monitoring a single chain. The wallet cluster that forms on Solana before a narrative peaks on Crypto Twitter is only visible if you're watching Solana at the right moment. Cross-chain liquidity flows, correlated wallet behavior, and narrative bridges require simultaneous multi-chain intelligence that no current tool actually delivers at speed.",
              },
              {
                label: "Alpha and content are treated as separate problems",
                body: "The degen who wants to identify a high-conviction play and the creator who wants to publish a narrative before it peaks are responding to the exact same underlying signal. Every existing tool serves one audience. ViralClaw is built on the observation that the intelligence is the same — the outputs are different. Both deserve to be served simultaneously from the same source of truth.",
              },
            ].map(item => (
              <details
                key={item.label}
                className="border group mb-2"
                style={{ borderColor: "var(--border)", background: "var(--bg-2)" }}
              >
                <summary
                  className="px-5 py-4 cursor-pointer font-mono text-[0.63rem] tracking-[0.04em] uppercase select-none list-none flex items-center justify-between"
                  style={{ color: "var(--text-3)" }}
                >
                  <span className="group-open:text-[var(--text-1)] transition-colors">{item.label}</span>
                  <span className="group-open:rotate-45 transition-transform inline-block" style={{ color: "var(--accent)" }}>+</span>
                </summary>
                <p className="px-5 pb-5 text-[0.86rem] leading-[1.88]" style={{ color: "var(--text-2)" }}>
                  {item.body}
                </p>
              </details>
            ))}

            <HR />

            {/* ── 05 Solution ── */}
            <Anchor id="solution" />
            <Divider n="05" />
            <H1>What<br />ViralClaw is</H1>
            <P>
              ViralClaw is the Synchronization Intelligence Layer.
            </P>
            <P>
              It is not another social analytics platform. It is not another on-chain
              dashboard. It is not another sentiment tracker. It is not a content scheduling
              tool, a wallet tracker, or an AI wrapper on top of existing data sources.
            </P>
            <P>
              It is a new category of infrastructure: a system that{" "}
              <S>continuously observes how independent signals converge into collective
              conviction</S> across on-chain behavior, social networks, content ecosystems,
              creator activity, liquidity flows, and community formation — and surfaces
              that convergence as two simultaneously actionable outputs: participation alpha
              for degens and content intelligence for creators.
            </P>
            <Pull>
              Same signal. Two outputs.<br />
              Degens act. Creators publish.<br />
              Both win.
            </Pull>
            <P>
              The synchronization event is the product. Everything ViralClaw does is built
              to detect that event earlier, score it more accurately, interpret its context
              more precisely, and deliver its implications more usefully than any combination
              of existing tools allows.
            </P>

            <H2>Four layers</H2>
            <Grid>
              <Cell label="01 — Ingestion" accent>
                Real-time indexing of 17 blockchains — wallet flows, bridge volumes, DEX
                activity, contract deployments — plus social velocity across Crypto Twitter,
                Farcaster, and Telegram. On-chain is the primary signal source. Social is
                the confirmation layer.
              </Cell>
              <Cell label="02 — Scoring" accent>
                Proprietary synchronization scoring: signal strength, wallet reputation,
                cross-chain correlation, and social lag. Surfaces the 0.3% of signals
                where independent networks are beginning to agree.
              </Cell>
              <Cell label="03 — Interpretation" accent>
                Maps the narrative behind the convergence — what's moving, why, which
                ecosystems are involved, what historical pattern it resembles, and how
                long the window is estimated to remain open.
              </Cell>
              <Cell label="04 — Dual output" accent>
                Every high-conviction synchronization event simultaneously produces a
                structured alpha brief for degens and a content brief for creators —
                in under 400 milliseconds.
              </Cell>
            </Grid>

            <HR />

            {/* ── 06 What we measure ── */}
            <Anchor id="what-we-measure" />
            <Divider n="06" />
            <H1>What we<br />measure</H1>
            <P>
              ViralClaw measures synchronization itself — by observing how independent
              signals converge into collective conviction. None of the dimensions below
              matter in isolation. Their convergence does.
            </P>

            <H2>Signal dimensions</H2>
            <Grid cols={2}>
              <Cell label="On-chain wallet behavior" labelColor="var(--teal)">
                Smart money positioning. Accumulation patterns across wallets that don't
                share public connections. New activations from known high-reputation
                addresses. Position size changes that don't yet have a social narrative
                to explain them.
              </Cell>
              <Cell label="Holder distribution" labelColor="var(--teal)">
                How conviction is spreading through the holder base over time. Concentration
                versus diffusion. Early accumulator profiles. The difference between a
                manipulated signal and a genuine synchronization event is often legible here.
              </Cell>
              <Cell label="Liquidity evolution" labelColor="var(--teal)">
                DEX depth changes. Bridge flow direction and magnitude. Liquidity migration
                between ecosystems. Capital moves with conviction — and it moves before
                the narrative catches up.
              </Cell>
              <Cell label="Narrative propagation" labelColor="var(--amber)">
                How ideas spread across platforms. When the same vocabulary appears in
                independent communities without coordinated seeding. Cross-platform
                diffusion velocity as a signal rather than a metric.
              </Cell>
              <Cell label="Creator adoption velocity" labelColor="var(--amber)">
                Which creators begin expressing conviction on a narrative before its
                social peak. Certain creators consistently initiate synchronization
                rather than follow it. Their early adoption is a computable secondary signal.
              </Cell>
              <Cell label="Community remix velocity" labelColor="var(--amber)">
                How fast a meme, framing, or narrative is adapted and remixed across
                communities. Remix velocity is a leading indicator of how deeply a
                narrative is embedding — before it becomes obvious to anyone watching
                engagement metrics.
              </Cell>
              <Cell label="Cross-platform diffusion" labelColor="var(--accent)">
                The moment an idea crosses from one platform to another is measurable.
                From on-chain behavior to Farcaster to Crypto Twitter — each crossing is
                a synchronization event, and each is observable in the moment it occurs.
              </Cell>
              <Cell label="Temporal convergence" labelColor="var(--accent)">
                Independent signals arriving within the same time window is itself
                informative. Temporal clustering across unrelated data sources is the
                most reliable leading indicator that synchronization is underway —
                not correlation between any two specific signals.
              </Cell>
            </Grid>

            <Note type="tip">
              The insight is not that any one of these signals predicts anything. It's that
              their simultaneous convergence across independent networks is the observable
              event that precedes repricing — consistently, measurably, and early enough
              to act on.
            </Note>

            <HR />

            {/* ── 07 Architecture ── */}
            <Anchor id="architecture" />
            <Divider n="07" />
            <H1>Signal<br />architecture</H1>
            <P>
              Seven modules in the intelligence stack, each with a defined role. Raw signal
              flows through ingestion, scoring, interpretation, and dual output delivery.
              Signal Memory sits outside the forward pipeline — it is the feedback layer
              that makes every other module improve over time.
            </P>

            <div className="my-7 overflow-x-auto border" style={{ borderColor: "var(--border)" }}>
              <table className="w-full" style={{ minWidth: 500 }}>
                <thead>
                  <tr className="border-b" style={{ background: "var(--bg-3)", borderColor: "var(--border)" }}>
                    {["Module", "Role", "Output type"].map(h => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left font-mono text-[0.5rem] tracking-[0.14em] uppercase"
                        style={{ color: "var(--text-3)" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "On-Chain Scanner",       role: "Multi-chain real-time indexing",           out: "RawSignal[]" },
                    { name: "Narrative Engine",        role: "Social velocity + cross-platform diffusion", out: "SocialSignal[]" },
                    { name: "Trend Scoring Model",     role: "Synchronization conviction scoring",       out: "ScoredSignal[]" },
                    { name: "Narrative Interpreter",   role: "Context, pattern match, window estimate",  out: "IntelligenceEvent" },
                    { name: "Alpha Engine",            role: "Degen participation brief generation",     out: "AlphaBrief" },
                    { name: "Content Engine",          role: "Creator brief + angle generation",         out: "ContentBrief" },
                    { name: "Signal Memory",           role: "Outcome tracking → model feedback loop",   out: "SignalOutcome[]" },
                  ].map(row => (
                    <tr
                      key={row.name}
                      className="border-b last:border-0 transition-colors"
                      style={{ borderColor: "var(--border)", background: "var(--bg-2)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-3)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "var(--bg-2)")}
                    >
                      <td className="px-4 py-3 font-mono text-[0.63rem] align-top" style={{ color: "var(--accent)" }}>{row.name}</td>
                      <td className="px-4 py-3 text-[0.75rem] align-top" style={{ color: "var(--text-2)" }}>{row.role}</td>
                      <td className="px-4 py-3 font-mono text-[0.58rem] align-top" style={{ color: "var(--text-3)" }}>{row.out}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Note type="tip">
              Signal Memory is what separates ViralClaw from a data feed. Every signal
              outcome — whether the alpha played, how long the content window lasted,
              which chain the rotation went to — feeds back into the scoring model. The
              intelligence compounds with every cycle.
            </Note>

            <HR />

            {/* ── 08 Intelligence engine ── */}
            <Anchor id="intelligence" />
            <Divider n="08" />
            <H1>Intelligence<br />engine</H1>
            <P>
              The scoring model is what separates ViralClaw from a blockchain explorer or
              social aggregator. Every signal is evaluated across four dimensions before
              it reaches the output layer. Only their combined score determines whether a
              signal produces a brief — no single dimension is sufficient.
            </P>

            <H2>Scoring dimensions</H2>
            <Grid>
              <Cell label="Signal strength" accent>
                Magnitude of the on-chain event relative to 30-day historical baseline —
                wallet size, transaction volume, bridge amount, DEX liquidity delta.
                Strength without correlation is noise.
              </Cell>
              <Cell label="Wallet reputation" accent>
                Smart money scoring based on historical outcome tracking via Signal Memory.
                High-reputation wallets moving early carry substantially more conviction
                weight. Reputation is dynamic — updated with every tracked outcome.
              </Cell>
              <Cell label="Cross-chain correlation" accent>
                How many independent chains are showing the same pattern simultaneously.
                Signals correlated across 3+ ecosystems score significantly higher than
                single-chain anomalies. Independent markets agreeing is harder to manufacture.
              </Cell>
              <Cell label="Social lag measurement" accent>
                How far ahead of social conversation the on-chain signal is. A signal
                detected 6 hours before any social mention scores higher than one that
                already appears in Crypto Twitter search. Lag is a proxy for window remaining.
              </Cell>
            </Grid>

            <H2>Window estimation</H2>
            <P>
              Every high-conviction signal includes an estimated participation and content
              window — open, closing soon, or closing. Window estimates are based on
              pattern matching against historical synchronization events of similar type,
              magnitude, and cross-chain correlation, continuously refined by Signal Memory.
            </P>
            <P>
              Window estimates are probabilistic, not deterministic. They are the best
              available inference from available data — not a guarantee. Risk context is
              included with every alpha brief precisely because conviction without risk
              context is still noise.
            </P>

            <HR />

            {/* ── 09 Dual outputs ── */}
            <Anchor id="outputs" />
            <Divider n="09" />
            <H1>Dual<br />outputs</H1>
            <P>
              The same synchronization event generates two structured outputs simultaneously.
              Both are designed to be immediately actionable. Neither is raw data that
              requires further interpretation to use.
            </P>
            <P>
              This is the core product insight: the intelligence is the same for the degen
              and the creator. The format of what they need from it is different. Serving
              both from a single upstream source — simultaneously, with no latency between
              them — is what makes the dual output model possible.
            </P>

            {[
              {
                label: "Alpha Brief — for degens",
                color: "var(--accent)",
                listColor: "crimson" as const,
                items: [
                  "Signal summary: what's moving, on which chains, and at what magnitude",
                  "Conviction score (1–10) with scoring dimension breakdown",
                  "Cross-chain correlation evidence and rotation vector",
                  "Estimated participation window — open, closing soon, or closing",
                  "Historical pattern match if applicable from Signal Memory",
                  "Risk context: what would invalidate the thesis",
                ],
              },
              {
                label: "Content Brief — for creators",
                color: "var(--teal)",
                listColor: "cyan" as const,
                items: [
                  "Narrative summary: the story behind the signal in plain language",
                  "Three content angle variants with hooks and audience framing",
                  "Verifiable on-chain evidence links — transaction-level sources",
                  "Social velocity context: how far ahead of the conversation you are",
                  "Optimal publish window with urgency level — open, publish soon, closing",
                  "Cross-platform diffusion status: which communities have it, which don't yet",
                ],
              },
            ].map(output => (
              <div key={output.label} className="mb-8 border overflow-hidden" style={{ borderColor: "var(--border)" }}>
                <div className="px-5 py-4 flex items-center gap-4 border-b" style={{ borderColor: "var(--border)", background: "var(--bg-2)" }}>
                  <span className="font-cond text-[1rem] font-bold uppercase tracking-[0.06em]" style={{ color: output.color }}>
                    {output.label}
                  </span>
                </div>
                <div className="p-5">
                  <List items={output.items} color={output.listColor} />
                </div>
              </div>
            ))}

            <HR />

            {/* ── 10 Users ── */}
            <Anchor id="users" />
            <Divider n="10" />
            <H1>Who<br />it's for</H1>
            <P>
              Three audiences. Each defined not by demographic but by the relationship they
              have to synchronization intelligence — what they need from it, and what
              changes when they have it.
            </P>

            {[
              {
                label: "On-chain degens",
                color: "var(--accent)",
                body: "Alpha hunters who need to identify high-conviction plays before the crowd arrives — and who need structured intelligence, not raw data requiring synthesis under time pressure. ViralClaw gives them scored, interpreted, actionable briefs with window estimates and risk context. The work of synthesis is already done.",
              },
              {
                label: "Web3 creators and analysts",
                color: "var(--teal)",
                body: "Content creators, newsletter writers, and analysts who publish on-chain narratives — and who want to be first on the story, not reactive to it after the social conversation peaks. ViralClaw gives them the narrative before it's visible on Crypto Twitter, with the on-chain evidence already assembled and three angles to choose from.",
              },
              {
                label: "DeFi funds and trading desks",
                color: "var(--green)",
                body: "Professional operations that need systematic cross-chain signal coverage at a scale individual monitoring can't provide. API integration, configurable signal filters, custom chain and wallet cluster focus, and private intelligence layers that don't share signal flow with competitors.",
              },
            ].map(u => (
              <div key={u.label} className="mb-4 border p-5" style={{ borderColor: "var(--border)", background: "var(--bg-2)" }}>
                <div className="font-cond text-[0.95rem] font-bold uppercase tracking-[0.06em] mb-3" style={{ color: u.color }}>
                  {u.label}
                </div>
                <p className="text-[0.85rem] leading-[1.85]" style={{ color: "var(--text-2)", maxWidth: "60ch" }}>
                  {u.body}
                </p>
              </div>
            ))}

            <HR />

            {/* ── 11 Moat ── */}
            <Anchor id="moat" />
            <Divider n="11" />
            <H1>The<br />moat</H1>
            <P>
              Any sufficiently funded competitor can build a 17-chain scanner. Nobody can
              copy six months of signal outcome data that continuously improves how the
              scoring model weights signals, evaluates wallet reputation, and estimates
              window duration.
            </P>
            <P>
              Signal Memory is the compounding moat. It begins accumulating from the
              moment the first signal is processed. The intelligence layer that early
              cohort members operate on in Phase 1 is materially more accurate by Phase 2.
              The gap compounds. It does not plateau.
            </P>

            <Pull>
              Competitors can copy features.<br />
              They cannot copy six months<br />
              of outcome data.
            </Pull>

            <Grid>
              <Cell label="Signal Memory compounds" accent>
                Every outcome — whether alpha played, how long the content window lasted,
                which chain the rotation went to — improves the scoring model. The system
                gets materially better with each cycle. This is not incremental. It is
                compounding.
              </Cell>
              <Cell label="Cross-chain depth" accent>
                17-chain simultaneous coverage with real-time correlation scoring is a
                significant infrastructure investment. Single-chain tools cannot replicate
                the cross-ecosystem synchronization detection layer.
              </Cell>
              <Cell label="Dual output positioning" accent>
                Serving both degens and creators from the same intelligence layer makes
                ViralClaw structurally different from any existing tool. Neither audience
                has a purpose-built solution. ViralClaw serves both simultaneously.
              </Cell>
              <Cell label="Timing advantage" accent>
                The gap between on-chain detection and social narrative peak is the product.
                As Signal Memory improves window estimation accuracy, that timing advantage
                compounds for every user across every signal type.
              </Cell>
            </Grid>

            <HR />

            {/* ── 12 Monetization ── */}
            <Anchor id="monetization" />
            <Divider n="12" />
            <H1>Monetization</H1>
            <P>
              Tiered subscription model tied directly to output type and signal volume.
              No ads. No data selling. No token mechanics. No misaligned incentives.
            </P>
            <P>
              ViralClaw makes money when its users have better intelligence. That alignment
              is the product philosophy, and it is reflected in the pricing model.
            </P>

            {[
              {
                label: "Degen tier",
                color: "var(--accent)",
                desc: "Full signal stack — on-chain scanner, cross-chain correlation, synchronization scoring, and structured alpha briefs with window estimates and risk context. Delivered via webhook, Telegram, and API. Built for individuals and small trading operations.",
              },
              {
                label: "Creator tier",
                color: "var(--teal)",
                desc: "Everything in Degen plus the full content intelligence layer — narrative briefs, three angle variants per signal, on-chain evidence links, publish-window timing, and cross-platform diffusion status. For Web3 content creators, newsletter writers, and analysts.",
              },
              {
                label: "Studio / fund tier",
                color: "var(--green)",
                desc: "Multi-seat access, custom signal configuration, private intelligence layers, REST API endpoints with configurable rate limits, and dedicated onboarding. For DeFi funds, trading desks, and content studios that need systematic synchronization coverage.",
              },
            ].map(m => (
              <div key={m.label} className="mb-4 border p-5" style={{ borderColor: "var(--border)", background: "var(--bg-2)" }}>
                <div className="font-mono text-[0.54rem] tracking-[0.16em] uppercase mb-3" style={{ color: m.color }}>{m.label}</div>
                <p className="text-[0.85rem] leading-[1.85]" style={{ color: "var(--text-2)", maxWidth: "60ch" }}>{m.desc}</p>
              </div>
            ))}

            <HR />

            {/* ── 13 Vision ── */}
            <Anchor id="vision" />
            <Divider n="13" />
            <H1>Long-term<br />vision</H1>
            <P>
              The version of ViralClaw described in this litepaper is an intelligence layer.
              The version we are building toward is infrastructure — the foundational
              synchronization layer that the next generation of on-chain participants,
              Web3 creators, and digital market operators is built on top of.
            </P>
            <P>
              Just as Bloomberg became the operating system for financial intelligence,
              ViralClaw aims to become the operating system for synchronization intelligence
              — across digital markets, creator economies, and any system where ideas compete
              for capital.
            </P>
            <P>
              In the long-term vision, Signal Memory has accumulated enough outcome data to
              predict not just that a signal is high-conviction — but <S>which specific window
              timing, which chains it will rotate to, and how long the content narrative will
              have staying power</S>. The intelligence compounds until the gap between ViralClaw
              users and everyone else is not an advantage — it is a structural condition of
              the market.
            </P>

            <Pull>
              Attention attracts.<br />
              Synchronization reprices.<br />
              ViralClaw detects the moment<br />
              before everyone else does.
            </Pull>

            <P>
              We are in the earliest stage of building this. The signal pipeline is being
              built. The scoring model is running. Signal Memory begins accumulating when
              the first cohort goes live. The intelligence layer that exists at the end
              of Phase 3 is not the product we can describe today — it is what six months
              of outcome data and compounding model updates will produce.
            </P>
            <P>
              That is the point. The moat is not a feature. It is a compounding process.
              And it starts now.
            </P>

            {/* Closing CTA */}
            <div className="mt-16 pt-12" style={{ borderTop: "1px solid var(--border)" }}>
              <div className="border p-7" style={{ borderColor: "var(--accent-border)", background: "var(--accent-dim)" }}>
                <p className="font-mono text-[0.54rem] tracking-[0.2em] uppercase flex items-center gap-2 mb-5" style={{ color: "var(--accent)" }}>
                  <span className="w-3 h-px inline-block" style={{ background: "var(--accent)" }} />
                  Early access — invite only
                </p>
                <p className="font-cond font-bold uppercase leading-[1.05] mb-4" style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", color: "var(--text-1)" }}>
                  Join the first cohort
                </p>
                <p className="text-[0.85rem] leading-[1.82] mb-7" style={{ color: "var(--text-2)", maxWidth: "46ch" }}>
                  30 to 50 degens and creators. Founder pricing, permanently locked in.
                  Direct access to the team. Real influence over what gets built in what order.
                  The intelligence you train in Phase 1 is what you benefit from in Phase 3.
                  No credit card required to apply.
                </p>
                <Link
                  href="/#access"
                  className="inline-flex font-mono text-[0.63rem] font-medium tracking-[0.14em] uppercase no-underline px-7 py-3 transition-colors"
                  style={{ background: "var(--accent)", color: "#fff" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--accent-hover)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "var(--accent)")}
                >
                  Get early access →
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-6">
                {["© 2025 ViralClaw", "Litepaper v0.3", "Subject to change", "synchronization intelligence"].map(t => (
                  <span key={t} className="font-mono text-[0.52rem] tracking-[0.1em] uppercase" style={{ color: "var(--text-4)" }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
