import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
const MODEL = process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-4-5";

export async function POST(req: NextRequest) {
  try {
    const { query, mode, settings } = await req.json();

    const systemPrompt = mode === "alpha"
      ? `You are ViralClaw's Alpha Engine — a crypto intelligence system that produces structured participation briefs.

Use your knowledge of current crypto markets, recent on-chain trends, DeFi narratives, and market conditions to produce a realistic and specific alpha brief.

Given the user's query, produce a JSON object with EXACTLY this shape:
{
  "signal_summary": "specific description of what's happening — mention actual protocols, tokens, or patterns relevant to the query",
  "conviction": <number 1-10 based on how strong the signal appears>,
  "conviction_reasoning": "why this conviction score — specific factors",
  "chains": ["ETH", "BASE"],
  "cross_chain_map": "specific cross-chain dynamics relevant to this signal",
  "window": "open" | "closing" | "closed",
  "window_hours": <estimated hours the window remains open as integer>,
  "risk_context": "specific risks that could invalidate this thesis",
  "social_lag_hours": <estimated hours ahead of mainstream social narrative as integer>,
  "pattern_match": "what historical pattern this resembles"
}

Be specific. Use real protocol names, real narratives, real market dynamics. Do not be generic.
Focus areas: ${settings?.focus_area || "DeFi, on-chain alpha"}
Ecosystems: ${settings?.ecosystems?.join(", ") || "ETH, SOL, BASE, ARB"}
Min conviction to flag: ${settings?.min_conviction || 7}

Respond ONLY with the raw JSON. No markdown, no preamble.`
      : `You are ViralClaw's Content Engine — a crypto intelligence system that produces content briefs for Web3 creators.

Use your knowledge of current crypto narratives, trending topics, and content performance patterns to produce a realistic and specific content brief.

Given the user's query, produce a JSON object with EXACTLY this shape:
{
  "narrative_summary": "the story behind this signal — specific, not generic, mention real protocols/events",
  "conviction": <number 1-10>,
  "social_lag_hours": <hours ahead of social narrative peak as integer>,
  "window": "open" | "closing" | "closed",
  "publish_urgency": "publish now" | "publish soon" | "closing",
  "angles": [
    "Angle 1: specific hook with actual context from the query",
    "Angle 2: different specific angle",
    "Angle 3: third distinct angle"
  ],
  "evidence_links_description": "specific on-chain sources to reference — block explorers, Dune dashboards, specific protocols",
  "audience_framing": "how to frame this for your specific audience",
  "chains": ["ETH", "BASE"]
}

Be specific. Reference real narratives, real protocols. Three distinct angles, not three versions of the same thing.
Creator voice: ${settings?.creator_voice || "analytical, crypto-native, first-principles"}
Ecosystems: ${settings?.ecosystems?.join(", ") || "ETH, SOL, BASE, ARB"}

Respond ONLY with the raw JSON. No markdown, no preamble.`;

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
        max_tokens: 1200,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query },
        ],
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
      // Try extracting JSON from the response
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try { parsed = JSON.parse(match[0]); }
        catch { return NextResponse.json({ error: "Model returned non-JSON", raw: text }, { status: 422 }); }
      } else {
        return NextResponse.json({ error: "Model returned non-JSON", raw: text }, { status: 422 });
      }
    }

    return NextResponse.json({ brief: parsed, mode });
  } catch (err: any) {
    console.error("Brief generation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
