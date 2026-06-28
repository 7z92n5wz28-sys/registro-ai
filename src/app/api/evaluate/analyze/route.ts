import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

export const maxDuration = 60; // Set max duration for API route

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
    const { data: crawlResults, error: fetchError } = await supabase
      .from("crawl_results")
      .select("*")
      .eq("evaluation_id", evaluationId);

    if (fetchError) throw fetchError;

    // Fetch system to get name/provider for ACN check
    const { data: systemInfo } = await supabase
      .from("ai_systems")
      .select("name, provider")
      .eq("id", systemId)
      .single();

    const ACN_QUALIFIED_KEYWORDS = [
      "google workspace", "microsoft 365", "microsoft azure", "aws", "amazon web services", 
      "canva", "aruba", "zoom", "cisco webex", "salesforce", "oracle", "sap", "ibm cloud",
      "cloudflare", "dropbox", "box", "slack", "webex", "adobe"
    ];

    let isAcnQualified = false;
    if (systemInfo) {
      const searchString = `${systemInfo.name} ${systemInfo.provider}`.toLowerCase();
      isAcnQualified = ACN_QUALIFIED_KEYWORDS.some(kw => searchString.includes(kw));
    }

    const contextText = crawlResults && crawlResults.length > 0 
      ? crawlResults.map((r: any) => `Source: ${r.url}\nContent:\n${r.content_markdown}`).join("\n\n---\n\n")
      : "Nessun contesto aggiuntivo disponibile dal web.";

    let aiEvidences = [];
    let dpoConditions = "";
    let riskLevel = "minimal";
    let complianceReqs = {
      q1: "no", q2: "no", q3: "no", q4: "no", q5: "no"
    };

    if (OPENAI_API_KEY) {
      const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
      const truncatedContext = contextText.substring(0, 30000);

      const promptSystem = `Sei un esperto legale, DPO scolastico e analista IT specializzato in AI Act. Analizza il contesto fornito e restituisci un SINGOLO OGGETTO JSON con la seguente struttura esatta:
{
  "evidences": [
    { "parameter_key": "q1", "ai_proposed_value": "yes|no", "ai_rationale": "Spiegazione dettagliata IN ITALIANO", "ai_source_url": "URL esatto della fonte o null", "ai_source_snippet": "Esatta citazione o null" },
    { "parameter_key": "q2", "ai_proposed_value": "yes|no", "ai_rationale": "Spiegazione dettagliata IN ITALIANO", "ai_source_url": "URL esatto della fonte o null", "ai_source_snippet": "Esatta citazione o null" },
    { "parameter_key": "q3", "ai_proposed_value": "yes|no", "ai_rationale": "Spiegazione dettagliata IN ITALIANO", "ai_source_url": "URL esatto della fonte o null", "ai_source_snippet": "Esatta citazione o null" },
    { "parameter_key": "q4", "ai_proposed_value": "yes|no", "ai_rationale": "Spiegazione dettagliata IN ITALIANO", "ai_source_url": "URL esatto della fonte o null", "ai_source_snippet": "Esatta citazione o null" },
    { "parameter_key": "q5", "ai_proposed_value": "yes|no", "ai_rationale": "Spiegazione dettagliata IN ITALIANO", "ai_source_url": "URL esatto della fonte o null", "ai_source_snippet": "Esatta citazione o null" }
  ],
  "system_info": {
    "categories": ["writing_assistant", "chatbot", "image_generator", "presentations", "quiz", "concept_maps", "search", "translation", "coding", "accessibility_bes_dsa", "other"],
    "subjects": ["students", "minor_students", "teachers", "ata", "families", "no_personal_data"],
    "activities_didattica": ["teaching_materials", "quiz", "tutoring", "bes_dsa", "research", "coding", "other"],
    "activities_amministrazione": ["circulars", "spreadsheets", "schedules", "pnrr", "other"]
  },
  "classification": {
    "risk_level": "unacceptable" | "high" | "minimal",
    "q1_manipulation": "yes" | "no",
    "q2_social_scoring": "yes" | "no",
    "q3_emotion": "yes" | "no",
    "q4_biometric": "yes" | "no",
    "q5_education_access": "yes" | "no"
  },
  "dpo_conditions": "Raccomandazioni di mitigazione in italiano (max 500 caratteri)"
}

REGOLE CRITICHE:
- 'evidences': DEVE contenere SEMPRE 5 elementi esatti per q1, q2, q3, q4, q5. Se non ci sono evidenze nei testi specifici per l'app ${systemInfo?.name || "in analisi"}, usa "no" e spiega nel rationale l'assenza di rischi.
- 'ai_source_url': Estrai l'URL corretto dal blocco 'Source: [URL]' SOLO SE riguarda l'app ${systemInfo?.name || "in analisi"}. Se l'informazione trovata appartiene a un'altra app (es. i-ready) o è una best practice generica (es. termly.io, europa.eu), la devi IGNORARE TOTALMENTE e restituire null. Non inserire MAI URL generici.
- 'ai_source_snippet': Copia e incolla la porzione di testo. Se non hai evidenze tratte direttamente dai documenti ufficiali di ${systemInfo?.name || "questa app"}, restituisci null. Non citare MAI app di terzi o articoli esterni.
- 'system_info': seleziona dai valori ammessi mostrati sopra (estrai solo quelli rilevanti).
- 'classification.risk_level': se una pratica vietata (q1-q4) è "yes", il rischio è "unacceptable". Se q5 è "yes", il rischio è "high". Altrimenti "minimal".
- 'dpo_conditions': scrivi misure tecniche chiare per l'uso a scuola (non usare markdown).`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: promptSystem },
          { role: "user", content: truncatedContext }
        ]
      });

      const extractedText = response.choices[0].message.content || "{}";
      console.log("OpenAI raw single-pass response:", extractedText);
      const extracted = JSON.parse(extractedText);

      // 1. Evidences
      if (extracted.evidences && Array.isArray(extracted.evidences)) {
        aiEvidences = extracted.evidences.map((e: any) => ({
          evaluation_id: evaluationId,
          parameter_key: e.parameter_key,
          ai_proposed_value: e.ai_proposed_value,
          ai_rationale: e.ai_rationale,
          ai_source_url: e.ai_source_url,
          ai_source_snippet: e.ai_source_snippet,
          ai_confidence: "inferred"
        }));
      } else {
        console.warn("OpenAI did not return an array of evidences! Extracted object:", extracted);
      }

      // 2. System Info
      if (extracted.system_info) {
        await supabase.from("ai_systems").update({
          categories: extracted.system_info.categories || [],
          subjects: extracted.system_info.subjects || [],
          activities_didattica: extracted.system_info.activities_didattica || [],
          activities_amministrazione: extracted.system_info.activities_amministrazione || []
        }).eq("id", systemId);
      }

      // 3. Classification
      if (extracted.classification) {
        riskLevel = extracted.classification.risk_level || "minimal";
        complianceReqs = {
          q1: extracted.classification.q1_manipulation || "no",
          q2: extracted.classification.q2_social_scoring || "no",
          q3: extracted.classification.q3_emotion || "no",
          q4: extracted.classification.q4_biometric || "no",
          q5: extracted.classification.q5_education_access || "no"
        };
      }

      // 4. DPO Conditions
      dpoConditions = extracted.dpo_conditions || "";

    } else {
      console.log("No OPENAI_API_KEY provided. Using mock data.");
      
      aiEvidences = [
        { evaluation_id: evaluationId, parameter_key: "q1", ai_proposed_value: "no", ai_rationale: "Nessun rischio di manipolazione.", ai_confidence: "inferred" },
        { evaluation_id: evaluationId, parameter_key: "q2", ai_proposed_value: "no", ai_rationale: "Non effettua social scoring.", ai_confidence: "inferred" },
        { evaluation_id: evaluationId, parameter_key: "q3", ai_proposed_value: "no", ai_rationale: "Non rileva emozioni.", ai_confidence: "inferred" },
        { evaluation_id: evaluationId, parameter_key: "q4", ai_proposed_value: "no", ai_rationale: "Nessuna categorizzazione biometrica.", ai_confidence: "inferred" },
        { evaluation_id: evaluationId, parameter_key: "q5", ai_proposed_value: "no", ai_rationale: "Non incide sull'accesso all'istruzione.", ai_confidence: "inferred" }
      ];

      dpoConditions = "Assicurarsi di non inserire nomi di studenti nei prompt. Disattivare la cronologia di salvataggio dei dati sul server del fornitore.";
      riskLevel = "minimal";
      complianceReqs = { q1: "no", q2: "no", q3: "no", q4: "no", q5: "no" };
    }

    // Save evidences to DB
    if (aiEvidences.length > 0) {
      const { error: insertError } = await supabase.from("ai_evidences").insert(aiEvidences);
      if (insertError) {
        console.error("Error inserting evidences:", insertError);
        throw insertError;
      }
    } else {
      console.warn("WARNING: aiEvidences array is empty! This means OpenAI didn't return any evidences.");
    }

    // Calcola score deterministico
    let score = 0;
    if (riskLevel === "minimal") score += 2;
    if (riskLevel === "high") score -= 2;
    if (riskLevel === "unacceptable") score -= 5;
    if (dpoConditions.length > 50) score += 1;

    let verdict = "approved";
    if (riskLevel === "unacceptable") verdict = "rejected";
    else if (score < 0) verdict = "rejected";
    else if (score >= 0 && score <= 2) verdict = "approved_with_conditions";

    // Update evaluation draft
    const { error: updateError } = await supabase
      .from("evaluations")
      .update({
        prohibited_vulnerability_manipulation: complianceReqs.q1 === "yes",
        prohibited_social_scoring: complianceReqs.q2 === "yes",
        prohibited_emotion_recognition: complianceReqs.q3 === "yes",
        prohibited_biometric_categorization: complianceReqs.q4 === "yes",
        prohibited_access_determination: complianceReqs.q5 === "yes",
        risk_level: riskLevel,
        dpo_conditions: dpoConditions,
        dpo_acn_marketplace: isAcnQualified,
        dpo_score: score,
        dpo_auto_verdict: verdict
      })
      .eq("id", evaluationId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in evaluate/analyze:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
