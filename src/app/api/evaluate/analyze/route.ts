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

      // PROMPT 1: Estrazione Evidenze e Tipologia Strumento
      const extractionResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `Sei un esperto legale e un analista IT specializzato in AI Act. Estrai evidenze strutturate dal contesto fornito. Restituisci JSON con:
            1. 'evidences': array di { parameter_key, ai_proposed_value, ai_rationale }. IMPORTANTISSIMO: L'array 'evidences' DEVE contenere SEMPRE esattamente 5 elementi. I 'parameter_key' DEVONO essere esattamente 'q1', 'q2', 'q3', 'q4', 'q5' corrispondenti ai 5 divieti dell'AI Act (manipolazione, social scoring, riconoscimento emozioni, categorizzazione biometrica, accesso istituzioni). Se non ci sono evidenze che il sistema compia una certa pratica, imposta 'ai_proposed_value' a "no" e usa il rationale per spiegare l'assenza di rischi (es. "Nessun riscontro di pratiche di social scoring").
            2. 'system_info': oggetto contenente:
               - 'categories': array di stringhe (valori ammessi: "writing_assistant", "chatbot", "image_generator", "presentations", "quiz", "concept_maps", "search", "translation", "coding", "accessibility_bes_dsa", "other")
               - 'subjects': array di stringhe (valori ammessi: "students", "minor_students", "teachers", "ata", "families", "no_personal_data")
               - 'activities_didattica': array di stringhe (valori ammessi: "teaching_materials", "quiz", "tutoring", "bes_dsa", "research", "coding", "other")
               - 'activities_amministrazione': array di stringhe (valori ammessi: "circulars", "spreadsheets", "schedules", "pnrr", "other")
            Inferisci le informazioni nel modo più plausibile in base alla documentazione trovata o alle conoscenze generali sullo strumento e sul fornitore.`
          },
          {
            role: "user",
            content: contextText.substring(0, 50000) // Truncate context to avoid token limits
          }
        ]
      });

      const extracted = JSON.parse(extractionResponse.choices[0].message.content || "{}");
      if (extracted.evidences && Array.isArray(extracted.evidences)) {
        aiEvidences = extracted.evidences.map((e: any) => ({
          evaluation_id: evaluationId,
          parameter_key: e.parameter_key,
          ai_proposed_value: e.ai_proposed_value,
          ai_rationale: e.ai_rationale,
          ai_confidence: "high"
        }));
      }

      if (extracted.system_info) {
        await supabase.from("ai_systems").update({
          categories: extracted.system_info.categories || [],
          subjects: extracted.system_info.subjects || [],
          activities_didattica: extracted.system_info.activities_didattica || [],
          activities_amministrazione: extracted.system_info.activities_amministrazione || []
        }).eq("id", systemId);
      }

      // PROMPT 2: Classificazione Rischio AI Act
      const classificationResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `Sei un AI Act compliance officer. Basandoti sul contesto, determina se il sistema compie pratiche vietate (manipolazione, social scoring, emotion recognition, categorizzazione biometrica) o ad alto rischio (accesso istruzione). Restituisci JSON: 
            {
              "risk_level": "unacceptable" | "high" | "minimal",
              "q1_manipulation": "yes" | "no",
              "q2_social_scoring": "yes" | "no",
              "q3_emotion": "yes" | "no",
              "q4_biometric": "yes" | "no",
              "q5_education_access": "yes" | "no"
            }`
          },
          {
            role: "user",
            content: contextText.substring(0, 50000)
          }
        ]
      });

      const classData = JSON.parse(classificationResponse.choices[0].message.content || "{}");
      riskLevel = classData.risk_level || "minimal";
      complianceReqs = {
        q1: classData.q1_manipulation || "no",
        q2: classData.q2_social_scoring || "no",
        q3: classData.q3_emotion || "no",
        q4: classData.q4_biometric || "no",
        q5: classData.q5_education_access || "no"
      };

      // PROMPT 3: Raccomandazioni di mitigazione
      const mitigationResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Sei un DPO per istituti scolastici. Basandoti sul sistema analizzato, scrivi un paragrafo (max 500 caratteri) con le condizioni e misure tecniche necessarie per utilizzarlo in sicurezza a scuola. Non usare markdown, solo testo."
          },
          {
            role: "user",
            content: `Risk level: ${riskLevel}. Context: ${contextText.substring(0, 10000)}`
          }
        ]
      });

      dpoConditions = mitigationResponse.choices[0].message.content || "";

    } else {
      console.log("No OPENAI_API_KEY provided. Using mock data.");
      
      aiEvidences = [
        { evaluation_id: evaluationId, parameter_key: "q1", ai_proposed_value: "no", ai_rationale: "Nessun rischio di manipolazione.", ai_confidence: "high" },
        { evaluation_id: evaluationId, parameter_key: "q2", ai_proposed_value: "no", ai_rationale: "Non effettua social scoring.", ai_confidence: "high" },
        { evaluation_id: evaluationId, parameter_key: "q3", ai_proposed_value: "no", ai_rationale: "Non rileva emozioni.", ai_confidence: "high" },
        { evaluation_id: evaluationId, parameter_key: "q4", ai_proposed_value: "no", ai_rationale: "Nessuna categorizzazione biometrica.", ai_confidence: "high" },
        { evaluation_id: evaluationId, parameter_key: "q5", ai_proposed_value: "no", ai_rationale: "Non incide sull'accesso all'istruzione.", ai_confidence: "high" }
      ];

      dpoConditions = "Assicurarsi di non inserire nomi di studenti nei prompt. Disattivare la cronologia di salvataggio dei dati sul server del fornitore.";
      riskLevel = "minimal";
      complianceReqs = { q1: "no", q2: "no", q3: "no", q4: "no", q5: "no" };
    }

    // Save evidences to DB
    if (aiEvidences.length > 0) {
      await supabase.from("ai_evidences").insert(aiEvidences);
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
