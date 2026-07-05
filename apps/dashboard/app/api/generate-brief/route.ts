import { NextRequest, NextResponse } from "next/server";

const OR_BASE = "https://openrouter.ai/api/v1";
const MODEL   = process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-4-5";

// ─── Chain detection ──────────────────────────────────────────────────────────

function detectChain(q: string): string | null {
  const s = q.toLowerCase();
  if (s.includes("solana") || s.includes(" sol ") || s.includes("pump.fun") || s.includes("raydium")) return "solana";
  if (s.includes(" eth ") || s.includes("ethereum") || s.includes("uniswap") || s.includes("erc")) return "ethereum";
  if (s.includes("base")) return "base";
  if (s.includes("arbitrum") || s.includes(" arb ")) return "arbitrum";
  if (s.includes("bsc") || s.includes(" bnb ")) return "bsc";
  return null;
}

function needsLive(q: string): boolean {
  return /hottest|trending|top |best |new |latest|recent|now|today|this week|last week|\d+\s*days|24h|pumping|mooning|volume|launch|narrative|meta|season|what is|what'?s|who is|memecoin|meme coin|altcoin|defi|nft|airdrop|rotate/i.test(q);
}

function needsBrianContext(q: string): boolean {
  return /protocol|liquidity|tvl|yield|apr|apy|position|swap|bridge|stake|lend|borrow|pool|vault/i.test(q);
}

// ─── Birdeye ──────────────────────────────────────────────────────────────────
// Best for: Solana trending tokens, real holder/volume/price data

async function fetchBirdeyeTrending() {
  try {
    const res = await fetch(
      "https://public-api.birdeye.so/defi/token_trending?sort_by=rank&sort_type=asc&offset=0&limit=20",
      {
        headers: {
          "X-API-KEY": process.env.BIRDEYE_KEY!,
          "x-chain": "solana",
        },
        next: { revalidate: 120 },
      }
    );
    if (!res.ok) return null;
    const d = await res.json();
    return d.data?.tokens || d.data?.items || null;
  } catch { return null; }
}

async function fetchBirdeyeGainers() {
  try {
    const res = await fetch(
      "https://public-api.birdeye.so/defi/gainers_losers?type=1D&sort_by=pnlUsd&sort_type=desc&limit=20",
      {
        headers: {
          "X-API-KEY": process.env.BIRDEYE_KEY!,
          "x-chain": "solana",
        },
        next: { revalidate: 120 },
      }
    );
    if (!res.ok) return null;
    const d = await res.json();
    return d.data?.items || null;
  } catch { return null; }
}

async function fetchBirdeyeSearch(query: string) {
  try {
    const res = await fetch(
      `https://public-api.birdeye.so/defi/v3/search?keyword=${encodeURIComponent(query)}&chain=solana&target=token&sort_by=volume_24h_usd&sort_type=desc&limit=10`,
      {
        headers: {
          "X-API-KEY": process.env.BIRDEYE_KEY!,
          "x-chain": "solana",
        },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return null;
    const d = await res.json();
    return d.data?.items || null;
  } catch { return null; }
}

function formatBirdeye(tokens: any[]): string {
  if (!tokens?.length) return "";
  return tokens.slice(0, 15).map((t: any) => {
    const name   = t.name || t.symbol || "Unknown";
    const sym    = t.symbol ? `(${t.symbol})` : "";
    const price  = t.price ? `$${Number(t.price).toFixed(6)}` : "";
    const vol    = t.volume24hUSD || t.volume_24h_usd
      ? `$${((t.volume24hUSD || t.volume_24h_usd) / 1e6).toFixed(2)}M vol`
      : "";
    const chg    = t.priceChange24hPercent || t.price_change_24h_percent;
    const change = chg != null ? `${chg > 0 ? "+" : ""}${Number(chg).toFixed(1)}% 24h` : "";
    const mc     = t.marketcap || t.mc
      ? `$${((t.marketcap || t.mc) / 1e6).toFixed(1)}M mcap`
      : "";
    const holders = t.holder ? `${t.holder.toLocaleString()} holders` : "";
    return `• ${name} ${sym}: ${[price, change, vol, mc, holders].filter(Boolean).join(" | ")}`;
  }).join("\n");
}

// ─── CoinGecko Pro ────────────────────────────────────────────────────────────
// Best for: global trending, category data, coins with market context

async function fetchCGTrending() {
  try {
    const res = await fetch(
      "https://pro-api.coingecko.com/api/v3/search/trending",
      {
        headers: { "x-cg-pro-api-key": process.env.COINGECKO_KEY! },
        next: { revalidate: 300 },
      }
    );
    if (!res.ok) return null;
    const d = await res.json();
    return d.coins?.slice(0, 15).map((c: any) => c.item) || null;
  } catch { return null; }
}

async function fetchCGCategory(category: string) {
  try {
    const res = await fetch(
      `https://pro-api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=${category}&order=volume_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h,7d`,
      {
        headers: { "x-cg-pro-api-key": process.env.COINGECKO_KEY! },
        next: { revalidate: 180 },
      }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function fetchCGSearch(query: string) {
  try {
    const res = await fetch(
      `https://pro-api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`,
      {
        headers: { "x-cg-pro-api-key": process.env.COINGECKO_KEY! },
        next: { revalidate: 120 },
      }
    );
    if (!res.ok) return null;
    const d = await res.json();
    // Get top coin IDs from search, then fetch market data
    const ids = d.coins?.slice(0, 8).map((c: any) => c.id).join(",");
    if (!ids) return null;
    const mktRes = await fetch(
      `https://pro-api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=volume_desc&sparkline=false&price_change_percentage=24h,7d`,
      {
        headers: { "x-cg-pro-api-key": process.env.COINGECKO_KEY! },
        next: { revalidate: 120 },
      }
    );
    if (!mktRes.ok) return null;
    return await mktRes.json();
  } catch { return null; }
}

function detectCGCategory(q: string): string | null {
  const s = q.toLowerCase();
  if (s.includes("meme") || s.includes("doge") || s.includes("pepe")) return "meme-token";
  if (s.includes("ai") || s.includes("artificial intelligence") || s.includes("agent")) return "artificial-intelligence";
  if (s.includes("defi") || s.includes("dex") || s.includes("yield")) return "decentralized-finance-defi";
  if (s.includes("nft") || s.includes("gaming") || s.includes("game")) return "gaming";
  if (s.includes("layer 2") || s.includes("l2") || s.includes("rollup")) return "layer-2";
  if (s.includes("rwa") || s.includes("real world")) return "real-world-assets-rwa";
  return null;
}

function formatCG(coins: any[]): string {
  if (!coins?.length) return "";
  return coins.slice(0, 15).map((c: any) => {
    const chg24 = c.price_change_percentage_24h != null ? `${c.price_change_percentage_24h > 0 ? "+" : ""}${Number(c.price_change_percentage_24h).toFixed(1)}% 24h` : "";
    const chg7  = c.price_change_percentage_7d_in_currency != null ? `${c.price_change_percentage_7d_in_currency > 0 ? "+" : ""}${Number(c.price_change_percentage_7d_in_currency).toFixed(1)}% 7d` : "";
    const vol   = c.total_volume ? `$${(c.total_volume / 1e6).toFixed(1)}M vol` : "";
    const mc    = c.market_cap   ? `$${(c.market_cap   / 1e6).toFixed(0)}M mcap` : "";
    const rank  = c.market_cap_rank ? `#${c.market_cap_rank}` : "";
    return `• ${c.name} (${c.symbol?.toUpperCase()}) ${rank}: $${c.current_price} | ${[chg24, chg7, vol, mc].filter(Boolean).join(" | ")}`;
  }).join("\n");
}

function formatCGTrending(coins: any[]): string {
  if (!coins?.length) return "";
  return coins.map((c: any) => {
    const rank = c.market_cap_rank ? `#${c.market_cap_rank} by mcap` : "unranked";
    const score = c.score != null ? `trending rank #${c.score + 1}` : "";
    const price = c.data?.price ? `$${Number(c.data.price).toFixed(6)}` : "";
    const chg   = c.data?.price_change_percentage_24h?.usd != null
      ? `${c.data.price_change_percentage_24h.usd > 0 ? "+" : ""}${Number(c.data.price_change_percentage_24h.usd).toFixed(1)}% 24h`
      : "";
    const vol   = c.data?.total_volume ? `${c.data.total_volume}` : "";
    return `• ${c.name} (${c.symbol?.toUpperCase()}) — ${[rank, score, price, chg, vol].filter(Boolean).join(" | ")}`;
  }).join("\n");
}

// ─── Brian API ────────────────────────────────────────────────────────────────
// Best for: protocol context, DeFi position data, on-chain action interpretation

async function fetchBrianContext(query: string) {
  try {
    const res = await fetch(
      "https://api.brianknows.org/api/v0/agent/knowledge",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-brian-api-key": process.env.BRIAN_KEY!,
        },
        body: JSON.stringify({ prompt: query, kb: "public-knowledge-box" }),
        next: { revalidate: 120 },
      }
    );
    if (!res.ok) return null;
    const d = await res.json();
    return d.result?.answer || d.answer || null;
  } catch { return null; }
}

// ─── DexScreener (free fallback) ─────────────────────────────────────────────

async function fetchDexSearch(query: string) {
  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const d = await res.json();
    return d.pairs?.slice(0, 12) || null;
  } catch { return null; }
}

function formatDex(pairs: any[]): string {
  if (!pairs?.length) return "";
  return pairs.slice(0, 10).map((p: any) => {
    const chg  = p.priceChange?.h24 != null ? `${p.priceChange.h24 > 0 ? "+" : ""}${Number(p.priceChange.h24).toFixed(1)}% 24h` : "";
    const vol  = p.volume?.h24 ? `$${(p.volume.h24 / 1e6).toFixed(2)}M vol` : "";
    const liq  = p.liquidity?.usd ? `$${(p.liquidity.usd / 1e3).toFixed(0)}K liq` : "";
    const fdv  = p.fdv ? `$${(p.fdv / 1e6).toFixed(1)}M FDV` : "";
    const age  = p.pairCreatedAt ? `${Math.floor((Date.now() - p.pairCreatedAt) / 86400000)}d old` : "";
    const name = p.baseToken?.name || "Unknown";
    const sym  = p.baseToken?.symbol || "";
    const chain = p.chainId || "";
    return `• ${name} (${sym}) on ${chain}: ${[chg, vol, fdv, liq, age].filter(Boolean).join(" | ")}`;
  }).join("\n");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { query, mode, settings } = await req.json();

    const chain    = detectChain(query);
    const useLive  = needsLive(query);
    const useBrian = needsBrianContext(query);
    const cgCat    = detectCGCategory(query);
    const isSolana = chain === "solana" || (!chain && /memecoin|meme|pump\.fun|raydium|jupiter/i.test(query));

    const dataSections: string[] = [];

    if (useLive) {
      // Run all relevant fetches in parallel
      const fetches = await Promise.allSettled([
        // Birdeye — Solana-first
        isSolana ? fetchBirdeyeTrending()       : Promise.resolve(null),
        isSolana ? fetchBirdeyeGainers()        : Promise.resolve(null),
        isSolana ? fetchBirdeyeSearch(query)    : Promise.resolve(null),
        // CoinGecko — global trending + category
        fetchCGTrending(),
        cgCat ? fetchCGCategory(cgCat)          : Promise.resolve(null),
        fetchCGSearch(query),
        // DexScreener — cross-chain fallback
        fetchDexSearch(query),
      ]);

      const [
        beTrend, beGainers, beSearch,
        cgTrend, cgCatData, cgSearchData,
        dexData,
      ] = fetches.map(r => r.status === "fulfilled" ? r.value : null);

      if (beTrend?.length) {
        dataSections.push(`BIRDEYE — Solana trending tokens right now:\n${formatBirdeye(beTrend)}`);
      }
      if (beGainers?.length) {
        dataSections.push(`BIRDEYE — Solana top gainers (24h):\n${formatBirdeye(beGainers)}`);
      }
      if (beSearch?.length) {
        dataSections.push(`BIRDEYE — Solana search results for "${query}":\n${formatBirdeye(beSearch)}`);
      }
      if (cgTrend?.length) {
        dataSections.push(`COINGECKO — Global trending right now:\n${formatCGTrending(cgTrend)}`);
      }
      if (cgCatData?.length && cgCat) {
        dataSections.push(`COINGECKO — Top coins in category "${cgCat}" by volume:\n${formatCG(cgCatData)}`);
      }
      if (cgSearchData?.length) {
        dataSections.push(`COINGECKO — Market data for coins matching "${query}":\n${formatCG(cgSearchData)}`);
      }
      if (dexData?.length && !beTrend?.length) {
        dataSections.push(`DEXSCREENER — DEX pairs matching "${query}":\n${formatDex(dexData)}`);
      }
    }

    // Brian for protocol/DeFi context
    if (useBrian || (!useLive && query.length > 10)) {
      const brianAnswer = await fetchBrianContext(query);
      if (brianAnswer) {
        dataSections.push(`BRIAN (on-chain knowledge):\n${brianAnswer}`);
      }
    }

    const hasLive = dataSections.length > 0;
    const liveBlock = hasLive
      ? `\n\n=== LIVE REAL-TIME DATA (fetched right now — use as PRIMARY source) ===\n${dataSections.join("\n\n")}\n=== END LIVE DATA ===`
      : "";

    const liveInstruction = hasLive
      ? "CRITICAL: Real-time data is provided below. Base your analysis on the ACTUAL tokens, prices, volumes, and patterns in this data. Name specific tokens by their actual names and tickers. Quote real numbers. Do NOT fall back to your training data when live data is available."
      : "Use your most current knowledge. Be specific — name real protocols, real narratives, real market dynamics. Avoid generic statements.";

    const systemPrompt = mode === "alpha"
      ? `You are ViralClaw's Alpha Engine — producing structured crypto participation briefs.

${liveInstruction}

Produce a JSON object with EXACTLY this shape:
{
  "signal_summary": "name specific tokens from the live data with their actual price action and volume numbers",
  "conviction": <1-10>,
  "conviction_reasoning": "cite specific numbers — e.g. '$4.2M volume in 24h, +340% price action, 12k holders'",
  "chains": ["SOL"],
  "cross_chain_map": "cross-chain flow context if relevant",
  "window": "open" | "closing" | "closed",
  "window_hours": <integer>,
  "risk_context": "specific risks for the named tokens — liquidity depth, age, concentration",
  "social_lag_hours": <integer — how many hours ahead of CT/Telegram chatter is this>,
  "pattern_match": "historical analog if relevant"
}

Focus: ${settings?.focus_area || "DeFi, memecoins, on-chain alpha"}
Chains: ${settings?.ecosystems?.join(", ") || "ETH, SOL, BASE, ARB"}

Respond ONLY with raw JSON. No markdown.`
      : `You are ViralClaw's Content Engine — producing content briefs for Web3 creators.

${liveInstruction}

Produce a JSON object with EXACTLY this shape:
{
  "narrative_summary": "the story right now using actual token names and real numbers from the data",
  "conviction": <1-10>,
  "social_lag_hours": <integer>,
  "window": "open" | "closing" | "closed",
  "publish_urgency": "publish now" | "publish soon" | "closing",
  "angles": [
    "Angle 1: specific hook using actual token names and real data points from the live feed",
    "Angle 2: completely different angle with specific evidence",
    "Angle 3: third distinct angle, different format or audience lens"
  ],
  "evidence_links_description": "specific sources — e.g. 'DexScreener for [TOKEN] showing $4M 24h volume, Birdeye holder chart, pump.fun launch data'",
  "audience_framing": "how to explain this to your specific audience",
  "chains": ["SOL"]
}

Creator voice: ${settings?.creator_voice || "analytical, crypto-native, first-principles"}

Respond ONLY with raw JSON. No markdown.`;

    const userMessage = hasLive ? `${query}${liveBlock}` : query;

    const res = await fetch(`${OR_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://viralclaw.xyz",
        "X-Title": "ViralClaw Intelligence Layer",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1400,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user",   content: userMessage },
        ],
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      throw new Error(`OpenRouter ${res.status}: ${t}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";

    let parsed: any;
    try {
      parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch {
      const m = text.match(/\{[\s\S]*\}/);
      if (m) {
        try { parsed = JSON.parse(m[0]); }
        catch { return NextResponse.json({ error: "Non-JSON response", raw: text }, { status: 422 }); }
      } else {
        return NextResponse.json({ error: "Non-JSON response", raw: text }, { status: 422 });
      }
    }

    // Tag data sources used
    parsed._sources = [
      hasLive && dataSections.some(s => s.startsWith("BIRDEYE")) ? "Birdeye" : null,
      hasLive && dataSections.some(s => s.startsWith("COINGECKO")) ? "CoinGecko" : null,
      hasLive && dataSections.some(s => s.startsWith("DEXSCREENER")) ? "DexScreener" : null,
      dataSections.some(s => s.startsWith("BRIAN")) ? "Brian" : null,
    ].filter(Boolean);

    return NextResponse.json({ brief: parsed, mode });
  } catch (err: any) {
    console.error("[generate-brief]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
