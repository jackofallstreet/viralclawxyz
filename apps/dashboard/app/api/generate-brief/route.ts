import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { query, settings, mode } = await req.json();

    const systemPrompt = mode === "alpha"
      ? `You are ViralClaw's Alpha Engine — a synchronization intelligence system that detects on-chain signals and produces structured participation briefs for crypto traders.

Given a signal query or description, produce a structured JSON alpha brief with EXACTLY this shape:
{
  "signal_summary": "plain-language description of what's moving, which wallets, which chains",
  "conviction": <number 1-10>,
  "conviction_reasoning": "which dimensions scored highest and why",
  "chains": ["ETH", "BASE"],
  "cross_chain_map": "description of cross-chain correlation evidence and rotation vector",
  "window": "open" | "closing" | "closed",
  "window_hours": <estimated hours remaining>,
  "risk_context": "what would invalidate this signal",
  "social_lag_hours": <how many hours ahead of social narrative this is>,
  "pattern_match": "historical pattern this resembles, or null"
}

Focus areas: ${settings?.focus_area || "DeFi, on-chain alpha"}
Minimum conviction to flag: ${settings?.min_conviction || 7}
Ecosystems of interest: ${settings?.ecosystems?.join(", ") || "ETH, SOL, BASE, ARB"}

Respond ONLY with the JSON object. No markdown, no preamble.`
      : `You are ViralClaw's Content Engine — a synchronization intelligence system that detects viral narrative windows and produces structured content briefs for Web3 creators.

Given a signal query or description, produce a structured JSON content brief with EXACTLY this shape:
{
  "narrative_summary": "the story behind the signal in plain language your audience can understand",
  "conviction": <number 1-10>,
  "social_lag_hours": <how many hours ahead of social narrative peak this is>,
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

Respond ONLY with the JSON object. No markdown, no preamble.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: query }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "";

    let parsed;
    try {
      parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch {
      return NextResponse.json({ error: "Failed to parse brief", raw: text }, { status: 422 });
    }

    return NextResponse.json({ brief: parsed, mode });
  } catch (err: any) {
    console.error("Brief generation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
