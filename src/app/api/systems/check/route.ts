import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");

    if (!name) {
      return NextResponse.json({ exists: false });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Case-insensitive exact match
    const { data: systems, error } = await supabase
      .from("ai_systems")
      .select("id, name")
      .ilike("name", name.trim())
      .limit(1);

    if (error) {
      console.error("Error checking duplicates:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (systems && systems.length > 0) {
      return NextResponse.json({ exists: true, id: systems[0].id });
    }

    return NextResponse.json({ exists: false });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
