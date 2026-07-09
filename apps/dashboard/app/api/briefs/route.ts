import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function db() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!
  );
}

// Map DB row (signal_window) → API response (window) for backward compat
function toApi(row: any) {
  if (!row) return row;
  const { signal_window, ...rest } = row;
  return { ...rest, window: signal_window };
}

// Map API body (window) → DB insert (signal_window)
function toDB(body: any) {
  const { window: win, ...rest } = body;
  return { ...rest, ...(win !== undefined ? { signal_window: win } : {}) };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type   = searchParams.get("type");
    const status = searchParams.get("status");

    let q = db()
      .from("briefs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (type   && type   !== "all") q = q.eq("type",   type);
    if (status && status !== "all") q = q.eq("status", status);

    const { data, error } = await q;
    if (error) throw error;

    return NextResponse.json({ briefs: (data || []).map(toApi) });
  } catch (err: any) {
    return NextResponse.json({ briefs: [], error: err.message }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, error } = await db()
      .from("briefs")
      .insert([toDB(body)])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ brief: toApi(data) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();
    const { data, error } = await db()
      .from("briefs")
      .update(toDB(updates))
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ brief: toApi(data) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const { error } = await db()
      .from("briefs")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ deleted: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
