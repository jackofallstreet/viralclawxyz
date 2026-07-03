import { NextRequest, NextResponse } from "next/server";

// OpenRouter uses OpenAI-compatible API format
// Set OPENROUTER_API_KEY in .env
// Optionally set OPENROUTER_MODEL (defaults to claude-sonnet-4-6 via OpenRouter)

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
const MODEL = process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-4-5";

export async function POST(req: NextRequest) {
  try {
    const { query, settings, mode } = await req.json();

    const systemPrompt =
      mode === "alpha"
        ? `You are ViralClaw's Alpha Engine — a synchronization intelligence system that detects on-chain signals and produces structured participation briefs for crypto traders.

Given a signal query or description, produce a structured JSON alpha brief with EXACTLY this shape:
{
  "signal_summary": "plain-language description of what's moving, which wallets, which chains",
  "conviction": <number 1-10>,
  "conviction_reasoning": "which dimensions scored highest and why",
  "chains": ["ETH", "BASE"],
  "cross_chain_map": "description of cross-chain correlation evidence and rotation vector",
  "window": "open" | "closing" | "closed",
  "window_hours": <estimated hours remaining as integer>,
  "risk_context": "what would invalidate this signal",
  "social_lag_hours": <how many hours ahead of social narrative this is as integer>,
  "pattern_match": "historical pattern this resembles, or null"
}

Focus areas: ${settings?.focus_area || "DeFi, on-chain alpha"}
Minimum conviction to flag: ${settings?.min_conviction || 7}
Ecosystems of interest: ${settings?.ecosystems?.join(", ") || "ETH, SOL, BASE, ARB"}

Respond ONLY with the raw JSON object. No markdown fences, no preamble, no explanation.`
        : `You are ViralClaw's Content Engine — a synchronization intelligence system that detects viral narrative windows and produces structured content briefs for Web3 creators.

Given a signal query or description, produce a structured JSON content brief with EXACTLY this shape:
{
  "narrative_summary": "the story behind the signal in plain language your audience can understand",
  "conviction": <number 1-10>,
  "social_lag_hours": <how many hours ahead of social narrative peak this is as integer>,
  "window": "open" | "closing" | "closed",
  "publish_urgency": "publish now" | "publish soon" | "closing",
  "angles": [
    "Angle 1: specific hook and framing",
    "Angle 2: different hook and framing",
    "Angle 3: third distinct angle"
  ],
  "evidence_links_description": "description of on-chain sources that would ground this content",
  "audience_framing": "how to explain the on-chain origin to your audience",
  "chains": ["ETH", "BASE"]
}

Creator voice: ${settings?.creator_voice || "analytical, first-principles, crypto-native"}
Ecosystems: ${settings?.ecosystems?.join(", ") || "ETH, SOL, BASE, ARB"}

Respond ONLY with the raw JSON object. No markdown fences, no preamble, no explanation.`;

    const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://viralclaw.xyz",
        "X-Title": "ViralClaw Intelligence Layer",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user",   content: query },
        ],
        response_format: { type: "json_object" }, // forces JSON on supported models
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch {
      return NextResponse.json(
        { error: "Failed to parse brief — model returned non-JSON", raw: text },
        { status: 422 }
      );
    }

    return NextResponse.json({ brief: parsed, mode });
  } catch (err: any) {
    console.error("Brief generation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
