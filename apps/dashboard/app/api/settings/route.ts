import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!
  );
}

export async function GET() {
  try {
    const { data, error } = await getSupabase()
      .from("settings")
      .select("*")
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    return NextResponse.json({ settings: data || null });
  } catch (err: any) {
    return NextResponse.json({ settings: null, error: err.message }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = getSupabase();

    // Upsert — one settings row per install
    const { data: existing } = await supabase
      .from("settings")
      .select("id")
      .limit(1)
      .single();

    let result;
    if (existing?.id) {
      const { data, error } = await supabase
        .from("settings")
        .update(body)
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from("settings")
        .insert([body])
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    return NextResponse.json({ settings: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
