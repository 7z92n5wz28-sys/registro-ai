import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    if (searchParams.get("secret") !== "reset123") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Clean evaluations
    await supabase.from("evaluations").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    // Clean systems
    await supabase.from("ai_systems").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    return NextResponse.json({ success: true, message: "Database wiped clean" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
