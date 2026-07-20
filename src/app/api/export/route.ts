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
      "Nome",
      "Fornitore",
      "Sito web",
      "Tipologia",
      "Attività",
      "Soggetti",
      "Data adozione",
      "Responsabile",
      "Livello rischio",
      "Adempimenti",
      "Punteggio",
      "Parere auto",
      "Parere finale DPO",
      "Esito avallo",
      "Note DPO",
      "Data valutazione"
    ];

    const getAdempimenti = (risk: string) => {
      if (risk === "unacceptable") return "Blocco immediato - adozione non consentita";
      if (risk === "high") return "DPIA + FRIA";
      if (risk === "limited") return "Informativa agli interessati + procedura interna";
      if (risk === "minimal") return "Monitoraggio ordinario + codici di condotta consigliati";
      return "";
    };

    const rows = (systems || []).map((s: any) => {
      const attivita = [
        ...(s.activities_didattica || []),
        ...(s.activities_amministrazione || [])
      ].join("; ");

      // Parere finale DPO vs Esito avallo:
      // Se vogliamo separare le due cose logicamente (esito = approved, parere = Buono)
      // possiamo fare un mapping veloce o mettere dpo_final_verdict su "Esito avallo"
      const esitoAvalloMap: Record<string, string> = {
        approved: "Approvato",
        approved_with_conditions: "Approvato con condizioni",
        rejected: "Non approvato",
        pending: "In attesa"
      };

      const esitoAvalloStr = esitoAvalloMap[s.dpo_final_verdict] || s.dpo_final_verdict || "";

      return [
        s.name || "",
        s.provider || "",
        s.website_url || "",
        (s.categories || []).join("; "),
        attivita,
        (s.subjects || []).join("; "),
        s.adoption_date ? new Date(s.adoption_date).toLocaleDateString("it-IT") : "",
        s.responsible_person || "",
        s.risk_level || "da_valutare",
        getAdempimenti(s.risk_level),
        s.dpo_score !== null ? s.dpo_score : "",
        s.dpo_auto_verdict || "",
        s.dpo_auto_verdict || "", // "Parere finale DPO": di solito e' derivato o salvato altrove, qui lo mettiamo simile a auto o lo lasciamo vuoto se non c'e' field specifico oltre esito. 
        esitoAvalloStr,
        s.dpo_conditions || s.dpo_motivations || "",
        s.registered_at ? new Date(s.registered_at).toLocaleDateString("it-IT") : "",
      ];
    });

    const csvContent = "\uFEFF" + [
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
