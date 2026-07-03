import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, key);

export type Signal = {
  id: string;
  created_at: string;
  chain: string;
  type: "wallet" | "bridge" | "dex" | "narrative";
  summary: string;
  conviction: number;
  window: "open" | "closing" | "closed";
  chains: string[];
  social_lag_hours: number;
  status: "new" | "processing" | "briefed";
};

export type Brief = {
  id: string;
  created_at: string;
  signal_id: string;
  type: "alpha" | "content";
  status: "pending" | "approved" | "archived";
  conviction: number;
  window: "open" | "closing" | "closed";
  // Alpha brief fields
  signal_summary?: string;
  cross_chain_map?: string[];
  risk_context?: string;
  // Content brief fields
  narrative_summary?: string;
  angles?: string[];
  evidence_links?: string[];
  publish_window?: string;
  // Raw content
  content: string;
};

export type Settings = {
  id: string;
  user_id: string;
  output_type: "alpha" | "content" | "both";
  focus_area: string;
  min_conviction: number;
  ecosystems: string[];
  creator_voice: string;
  min_conviction_threshold: number;
};
