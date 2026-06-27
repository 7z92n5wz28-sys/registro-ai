import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const institutionId = "11111111-1111-1111-1111-111111111111"; // Demo

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: systems, error } = await supabase
      .from("v_registry")
      .select("*")
      .eq("institution_id", institutionId)
      .order("name");

    if (error) throw error;

    // Build CSV
    const headers = [
      "Nome strumento",
      "Fornitore",
      "URL Sito",
      "Area",
      "Soggetti",
      "Categorie",
      "Stato Valutazione",
      "Rischio AI Act",
      "Punteggio DPO",
      "Verdetto Auto",
      "Anno Scolastico",
      "Data Censimento",
    ];

    const rows = (systems || []).map((s: any) => [
      s.name || "",
      s.provider || "",
      s.website_url || "",
      s.activity_area || "",
      (s.subjects || []).join("; "),
      (s.categories || []).join("; "),
      s.status || "draft",
      s.risk_level || "da_valutare",
      s.dpo_score !== null ? s.dpo_score : "",
      s.dpo_auto_verdict || "",
      s.school_year || "",
      s.created_at ? new Date(s.created_at).toLocaleDateString("it-IT") : "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="registro-ai-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
