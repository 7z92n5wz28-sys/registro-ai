import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: systems } = await supabase.from("ai_systems").select("*").order("created_at", { ascending: false }).limit(1);
    if (!systems || systems.length === 0) return NextResponse.json({ error: "no systems" });

    const sysId = systems[0].id;
    const { data: evals } = await supabase.from("evaluations").select("*").eq("ai_system_id", sysId).order("created_at", { ascending: false }).limit(1);
    if (!evals || evals.length === 0) return NextResponse.json({ error: "no evals" });

    const evalId = evals[0].id;
    const { data: evidences, error: evErr } = await supabase.from("ai_evidences").select("*").eq("evaluation_id", evalId);
    
    return NextResponse.json({
      system: systems[0],
      evaluation: evals[0],
      evidences: evidences,
      evErr: evErr
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
