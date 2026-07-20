import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

export const maxDuration = 60;

const SYSTEM_PROMPT_BASE = `Sei un esperto legale, DPO scolastico e analista IT specializzato in AI Act. Analizza il contesto fornito e restituisci un SINGOLO OGGETTO JSON.

REGOLE CRITICHE:
- Per il campo 'f' (fonte), usa SEMPRE in ordine di priorità:
  1. Un SINGOLO URL HTTPS che hai realmente consultato e che parla SPECIFICAMENTE della funzionalità richiesta.
  2. Se non hai trovato una pagina specifica: "Nessuna fonte specifica reperita — valutazione basata sulla descrizione fornita".
  NON inventare URL. NON riportare un URL solo perché è la home page.
- Estrai l'URL corretto dal blocco 'Source: [URL]' SOLO SE riguarda l'app in analisi. Se l'informazione trovata appartiene a un'altra app o è generica, la devi IGNORARE TOTALMENTE e restituire null o stringa descrittiva.
- Il campo 'c' indica la confidenza: usa "to_verify" se sei insicuro, se è un'ipotesi o un'inferenza indiretta. Altrimenti "inferred".
- Il campo 'r' deve essere strettamente "si" o "no".
- Il campo 'm' deve contenere una chiara spiegazione (rationale) in italiano.`;

export async function POST(req: Request) {
  try {
    const { evaluationId, systemId } = await req.json();

    if (!evaluationId || !systemId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    // Fetch crawl results
    const { data: crawlResults } = await supabase
      .from("crawl_results")
      .select("*")
      .eq("evaluation_id", evaluationId);

    // Fetch system
    const { data: systemInfo } = await supabase
      .from("ai_systems")
      .select("*")
      .eq("id", systemId)
      .single();

    if (!systemInfo) {
      return NextResponse.json({ error: "System not found" }, { status: 404 });
    }

    const contextCommon = `
STRUMENTO IN ANALISI:
- Nome: ${systemInfo.name}
- Fornitore: ${systemInfo.provider}
- Sito web: ${systemInfo.website_url || "non indicato"}
- Tipologia: ${(systemInfo.categories || []).join(", ") || "non indicata"}
- Soggetti coinvolti: ${(systemInfo.subjects || []).join(", ") || "non indicati"}
- Attività Didattica: ${(systemInfo.activities_didattica || []).join(", ") || "non indicata"}
- Attività Amministrazione: ${(systemInfo.activities_amministrazione || []).join(", ") || "non indicata"}
- Note: ${systemInfo.notes || "nessuna"}

FONTI WEB ANALIZZATE:
${crawlResults && crawlResults.length > 0 
  ? crawlResults.map((r: any) => `Source: ${r.url}\nContent:\n${r.content_markdown}`).join("\n\n---\n\n").substring(0, 30000)
  : "Nessun contesto aggiuntivo disponibile dal web."}
`;

    let aiEvidences: any[] = [];

    if (OPENAI_API_KEY) {
      const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

      const runCall = async (promptName: string, promptContent: string, keys: string[]) => {
        try {
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: `${SYSTEM_PROMPT_BASE}\n\n${promptContent}` },
              { role: "user", content: contextCommon }
            ]
          });
          
          const extractedText = response.choices[0].message.content || "{}";
          const extracted = JSON.parse(extractedText);
          
          const results = [];
          for (const key of keys) {
            if (extracted[key]) {
              const rVal = String(extracted[key].r || "").toLowerCase();
              let r = rVal.startsWith("s") || rVal.startsWith("y") ? "si" : "no";
              
              const cVal = String(extracted[key].c || "").toLowerCase();
              let c = cVal.includes("verif") ? "to_verify" : "inferred";
              
              // I parametri DPO (chiamata 5) sono tutti fattuali e richiedono sempre verifica
              if (promptName === "DPO") {
                 c = "to_verify";
              }

              let f = extracted[key].f;
              let url = null;
              let snippet = null;
              
              if (f && typeof f === "string") {
                if (f.startsWith("http")) {
                  url = f;
                } else {
                  snippet = f;
                }
              }

              results.push({
                evaluation_id: evaluationId,
                parameter_key: key,
                ai_proposed_value: r,
                ai_rationale: extracted[key].m || "",
                ai_source_url: url,
                ai_source_snippet: snippet,
                ai_confidence: c
              });
            }
          }
          return results;
        } catch (err) {
          console.error(`Error in OpenAI call ${promptName}:`, err);
          throw err;
        }
      };

      const p1 = runCall(
        "Vietate", 
        `Analizza le pratiche vietate (art. 5 AI Act). 
        emotion: Riconoscimento emozioni in ambienti educativi o lavorativi.
        biometric: Categorizzazione biometrica su dati sensibili.
        scoring: Social scoring basato su comportamento.
        manipulation: Pratiche manipolative verso vulnerabili/minori.
        Restituisci JSON: { "emotion": {"r":"si|no", "m":"motivo", "c":"inferred|to_verify", "f":"fonte url/testo"}, "biometric": {...}, "scoring": {...}, "manipulation": {...} }`, 
        ["emotion", "biometric", "scoring", "manipulation"]
      );
      
      const p2 = runCall(
        "Tier1_1", 
        `Analizza alto rischio (Allegato III). 
        access: Determina l'accesso o l'ammissione alle istituzioni scolastiche.
        students: Valuta i risultati dell'apprendimento o il livello di istruzione.
        orientation: Valuta per orientamento a specifici percorsi formativi.
        Restituisci JSON: { "access": {"r":"si|no", "m":"motivo", "c":"inferred|to_verify", "f":"fonte"}, "students": {...}, "orientation": {...} }`, 
        ["access", "students", "orientation"]
      );
      
      const p3 = runCall(
        "Tier1_2", 
        `Analizza alto rischio (Allegato III).
        staff: Reclutamento, selezione, task allocation o valutazione delle performance del personale.
        exam: Proctoring (sorveglianza automatica) durante esami.
        Restituisci JSON: { "staff": {"r":"si|no", "m":"motivo", "c":"inferred|to_verify", "f":"fonte"}, "exam": {...} }`, 
        ["staff", "exam"]
      );
      
      const p4 = runCall(
        "Tier2", 
        `Analizza rischio limitato (art. 50).
        interaction: Interagisce direttamente con persone fisiche (es. chatbot).
        synthetic: Genera contenuti sintetici testuali, audio, immagini o video (deepfake).
        Restituisci JSON: { "interaction": {"r":"si|no", "m":"motivo", "c":"inferred|to_verify", "f":"fonte"}, "synthetic": {...} }`, 
        ["interaction", "synthetic"]
      );
      
      const p5 = runCall(
        "DPO", 
        `Analizza parametri DPO.
        serverUE: Server o dati conservati nello Spazio Economico Europeo.
        extraData: Richiede inserimento di dati personali ulteriori oltre ai dati di login.
        marketing: Usa i dati per inviare comunicazioni di marketing.
        dpa: È presente e sottoscrivibile un Data Processing Agreement (DPA).
        acn: Lo strumento è nel catalogo ACN o usa infrastruttura qualificata ACN (es. AWS, Azure, Google Cloud).
        usesAI: Utilizza effettivamente Intelligenza Artificiale generativa o inferenziale.
        Restituisci JSON: { "serverUE": {"r":"si|no", "m":"...", "c":"...", "f":"..."}, "extraData": {...}, "marketing": {...}, "dpa": {...}, "acn": {...}, "usesAI": {...} }`, 
        ["serverUE", "extraData", "marketing", "dpa", "acn", "usesAI"]
      );

      const results = await Promise.allSettled([p1, p2, p3, p4, p5]);
      
      results.forEach(res => {
        if (res.status === "fulfilled") {
          aiEvidences.push(...res.value);
        } else {
          console.error("Una chiamata AI ha fallito:", res.reason);
        }
      });
      
      // Controllo ACN keyword locale come fallback supplementare
      const ACN_QUALIFIED_KEYWORDS = [
        "google workspace", "microsoft 365", "microsoft azure", "aws", "amazon web services", 
        "canva", "aruba", "zoom", "cisco webex", "salesforce", "oracle", "sap", "ibm cloud",
        "cloudflare", "dropbox", "box", "slack", "webex", "adobe"
      ];
      const searchString = `${systemInfo.name} ${systemInfo.provider}`.toLowerCase();
      const isAcnQualified = ACN_QUALIFIED_KEYWORDS.some(kw => searchString.includes(kw));

      const acnEvidence = aiEvidences.find(e => e.parameter_key === "acn");
      if (acnEvidence && isAcnQualified && acnEvidence.ai_proposed_value === "no") {
        acnEvidence.ai_proposed_value = "si";
        acnEvidence.ai_rationale = "Corrispondenza rilevata con vendor cloud/infrastrutture qualificati ACN.";
        acnEvidence.ai_confidence = "to_verify";
      }

    } else {
      console.log("No OPENAI_API_KEY provided. Using mock data.");
      aiEvidences = [
        { evaluation_id: evaluationId, parameter_key: "emotion", ai_proposed_value: "no", ai_rationale: "Mock data", ai_confidence: "inferred" }
      ];
    }

    // Save evidences
    if (aiEvidences.length > 0) {
      // Pulisce vecchie evidences per questa evaluation
      await supabase.from("ai_evidences").delete().eq("evaluation_id", evaluationId);
      
      const { error: insertError } = await supabase.from("ai_evidences").insert(aiEvidences);
      if (insertError) {
        console.error("Error inserting evidences:", insertError);
        throw insertError;
      }
    }

    return NextResponse.json({ success: true, count: aiEvidences.length });
  } catch (error: any) {
    console.error("Error in evaluate/analyze:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
