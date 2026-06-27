import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const DEMO_INSTITUTION_ID = "11111111-1111-1111-1111-111111111111";
    const DEMO_USER_ID = "22222222-2222-2222-2222-222222222222";

    const { data: system, error } = await supabase
      .from("ai_systems")
      .insert({
        institution_id: DEMO_INSTITUTION_ID,
        name: "Test System",
        provider: "Test Provider",
        website_url: "https://test.com",
        activity_area: "didattica",
        categories: [],
        subjects: [],
        activities_didattica: [],
        activities_amministrazione: [],
        created_by: DEMO_USER_ID,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, step: "ai_systems", error: error.message, details: error.details, hint: error.hint, code: error.code });
    }

    const { data: evaluation, error: evalError } = await supabase
      .from("evaluations")
      .insert({
        ai_system_id: system.id,
        institution_id: DEMO_INSTITUTION_ID,
        status: "draft",
        school_year: "2024/2025",
        version: 1,
        created_by: DEMO_USER_ID
      })
      .select()
      .single();

    if (evalError) {
      return NextResponse.json({ success: false, step: "evaluations", error: evalError.message, details: evalError.details, hint: evalError.hint, code: evalError.code });
    }

    // Clean it up immediately
    await supabase.from('ai_systems').delete().eq('id', system.id);

    return NextResponse.json({ success: true, message: "Insert successful", role_key_length: process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.length : 0 });
  } catch (error: any) {
    return NextResponse.json({ success: false, exception: error.message });
  }
}
