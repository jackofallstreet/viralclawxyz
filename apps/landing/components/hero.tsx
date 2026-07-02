import Link from "next/link";
import { VideoHeroBg } from "./video-hero-bg";

export default function Hero() {
  return (
    <div className="relative overflow-hidden" style={{ minHeight: "100svh" }}>

      {/* ── Video background ── */}
      <VideoHeroBg opacity={0.4} />

      {/* ── All existing hero content — untouched, just lifted by zIndex ── */}
      <div className="relative" style={{ zIndex: 3 }}>
        <div className="max-w-[1320px] mx-auto px-[clamp(1.25rem,5vw,2.5rem)]">
          <div className="pt-[clamp(2.5rem,6vw,4.5rem)] pb-[clamp(1rem,3vw,2rem)] grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start lg:gap-16">

            {/* Left column */}
            <div>
              <div
                className="font-mono text-[clamp(0.57rem,1.4vw,0.63rem)] tracking-[0.2em] uppercase text-[var(--accent)] flex items-center gap-2 mb-5"
                style={{ animation: "fadeUp 0.6s 0.1s ease forwards", opacity: 0 }}
              >
                <span className="w-4 h-px bg-[var(--accent)] block" />
                Synchronization Intelligence Layer
              </div>

              <h1
                className="font-cond text-[clamp(3.2rem,9vw,7.5rem)] font-extrabold leading-[0.87] uppercase tracking-tight text-[var(--text-1)] mb-[clamp(1rem,3vw,1.8rem)]"
                style={{ animation: "fadeUp 0.7s 0.2s ease forwards", opacity: 0 }}
              >
                Viral
                <span className="text-[var(--accent)] block">Claw</span>
                <span className="block text-[0.37em] font-light tracking-[0.18em] text-[var(--text-3)] mt-[0.4em]">
                  Alpha &amp; Content Edge
                </span>
              </h1>

              <p
                className="text-[clamp(0.88rem,2vw,0.98rem)] text-[var(--text-2)] leading-[1.8] max-w-[46ch] mb-[clamp(1.4rem,3.5vw,2rem)]"
                style={{ animation: "fadeUp 0.7s 0.35s ease forwards", opacity: 0 }}
              >
                One intelligence layer that captures viral trends across{" "}
                <strong className="text-[var(--text-1)] font-medium">on-chain data, social signals, and narrative cycles</strong>{" "}
                — and turns them into{" "}
                <strong className="text-[var(--text-1)] font-medium">participation alpha for degens</strong>{" "}
                and{" "}
                <strong className="text-[var(--text-1)] font-medium">content intelligence for creators</strong>.
              </p>

              <div
                className="flex flex-wrap gap-3"
                style={{ animation: "fadeUp 0.7s 0.5s ease forwards", opacity: 0 }}
              >
                <Link
                  href="#access"
                  className="font-mono text-[clamp(0.62rem,1.8vw,0.69rem)] font-medium tracking-[0.12em] uppercase text-[var(--text-1)] bg-[var(--accent)] px-[clamp(1.2rem,3vw,1.7rem)] py-[clamp(0.7rem,2vw,0.85rem)] no-underline inline-flex items-center gap-2 hover:bg-[var(--accent-hover)] hover:-translate-y-px transition-all duration-200"
                >
                  Get early access →
                </Link>
                <Link
                  href="#how"
                  className="font-mono text-[clamp(0.62rem,1.8vw,0.69rem)] font-normal tracking-[0.1em] uppercase text-[var(--teal)] border border-[var(--teal-border)] bg-[var(--teal-dim)] px-[clamp(1rem,2.5vw,1.3rem)] py-[clamp(0.7rem,2vw,0.85rem)] no-underline inline-flex items-center gap-2 hover:border-[var(--cyan-light)] hover:bg-[rgba(8,145,178,0.14)] transition-all duration-200"
                >
                  See how it works
                </Link>
              </div>
            </div>

            {/* Right column — dual output panels */}
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4"
              style={{ animation: "fadeIn 0.9s 0.55s ease forwards", opacity: 0 }}
            >
              {/* Degen Alpha Panel */}
              <div className="bg-[var(--bg-2)] border border-[var(--border)] overflow-hidden" style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
                <div className="bg-[var(--bg-3)] px-3 py-2 flex items-center justify-between border-b border-[var(--border)]">
                  <span className="font-mono text-[0.56rem] tracking-[0.12em] uppercase text-[var(--text-3)]">
                    Alpha Signal — ETH
                  </span>
                  <span className="font-mono text-[0.52rem] tracking-[0.08em] uppercase px-2 py-[2px] text-[var(--accent)] border border-[var(--accent-border)] bg-[var(--accent-dim)] flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-[var(--accent)] animate-[blinkA_1.5s_ease_infinite]" />
                    Live
                  </span>
                </div>
                <div className="p-[1rem_1.1rem]">
                  <div className="mb-4 pb-4 border-b border-[var(--border)]">
                    <div className="font-mono text-[0.54rem] tracking-[0.12em] uppercase text-[var(--text-3)] mb-1">
                      On-chain trend
                    </div>
                    <div className="text-[clamp(0.8rem,1.8vw,0.86rem)] text-[var(--text-1)] leading-[1.5]">
                      <span className="text-[var(--teal)]">Whale cluster forming</span> around restaking narrative.{" "}
                      <span className="text-[var(--green)]">4.2h ahead</span> of social peak — window still open.
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className="font-mono text-[0.56rem] tracking-[0.07em] px-2 py-[3px] text-[var(--green)] border border-[var(--green-border)] bg-[var(--green-dim)]">
                        ↑ Signal score: 9.1
                      </span>
                      <span className="font-mono text-[0.56rem] tracking-[0.07em] px-2 py-[3px] text-[var(--teal)] border border-[var(--teal-border)] bg-[var(--teal-dim)]">
                        23 wallets
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-[0.54rem] tracking-[0.12em] uppercase text-[var(--text-3)] mb-1">
                      Alpha brief
                    </div>
                    <div className="text-[clamp(0.8rem,1.8vw,0.86rem)] text-[var(--text-1)] leading-[1.5]">
                      Cross-chain rotation detected: ETH → Base.{" "}
                      <span className="text-[var(--accent)]">Participation window: 6–18h</span>. Brief ready.
                    </div>
                  </div>
                </div>
              </div>

              {/* Creator Content Panel */}
              <div className="bg-[var(--bg-2)] border border-[var(--border)] overflow-hidden" style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
                <div className="bg-[var(--bg-3)] px-3 py-2 flex items-center justify-between border-b border-[var(--border)]">
                  <span className="font-mono text-[0.56rem] tracking-[0.12em] uppercase text-[var(--text-3)]">
                    Content Intelligence
                  </span>
                  <span className="font-mono text-[0.52rem] tracking-[0.08em] uppercase px-2 py-[2px] text-[var(--teal)] border border-[var(--teal-border)] bg-[var(--teal-dim)] flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-[var(--cyan-light)] animate-[blinkA_2s_ease_infinite]" />
                    Ready
                  </span>
                </div>
                <div className="p-[1rem_1.1rem]">
                  <div className="mb-3 pb-3 border-b border-[var(--border)]">
                    <div className="font-mono text-[0.54rem] tracking-[0.12em] uppercase text-[var(--text-3)] mb-1">
                      Narrative window
                    </div>
                    <div className="text-[clamp(0.8rem,1.8vw,0.86rem)] text-[var(--text-1)] leading-[1.5]">
                      <span className="text-[var(--teal)]">Restaking narrative</span> trending across Crypto Twitter.{" "}
                      <span className="text-[var(--green)]">12× engagement</span> vs average posts in the last 48h.
                    </div>
                  </div>
                  <div className="font-mono text-[0.6rem] tracking-[0.04em]">
                    {[
                      { label: "Trend origin", val: "On-chain first", color: "var(--accent)" },
                      { label: "Social velocity", val: "+340% / 48h", color: "var(--green)" },
                      { label: "Content window", val: "Next 18–36h", color: "var(--cyan-light)" },
                      { label: "Ecosystem", val: "ETH / Base / ARB", color: "var(--text-2)" },
                      { label: "Brief generated", val: "Just now", color: "var(--text-3)" },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between py-[6px] border-b border-[var(--border)] last:border-0"
                      >
                        <span className="text-[var(--text-3)]">{row.label}</span>
                        <span className="font-medium" style={{ color: row.color }}>
                          {row.val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
