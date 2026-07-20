"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Hardcoded for Demo MVP
const DEMO_INSTITUTION_ID = "11111111-1111-1111-1111-111111111111";
const DEMO_USER_ID = "22222222-2222-2222-2222-222222222222";

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createSupabaseClient(supabaseUrl, supabaseKey);
}

export async function createAISystem(formData: FormData) {
  const supabase = createAdminClient();

  const name = formData.get("name") as string;
  const provider = formData.get("provider") as string;
  const website_url = formData.get("website_url") as string;
  
  const category = formData.get("category") as string;
  const category_other = formData.get("category_other") as string;
  const categories = category ? [category === "other" && category_other ? category_other : category] : [];

  const subject = formData.get("subject") as string;
  const subject_other = formData.get("subject_other") as string;
  const subjects = subject ? [subject === "other" && subject_other ? subject_other : subject] : [];

  const activity = formData.get("activity") as string;
  const activity_other = formData.get("activity_other") as string;
  const final_activity = activity === "other" && activity_other ? activity_other : activity;

  // Semplificazione: salviamo in didattica per ora, poi il DB separa in base al dominio
  const activities_didattica = final_activity ? [final_activity] : [];
  const activities_amministrazione: any[] = [];
  const activity_area = "didattica";

  const adoption_date = formData.get("adoption_date") as string;
  const responsible_person = formData.get("responsible_person") as string;
  const notes = formData.get("notes") as string;

  const { data: system, error } = await supabase
    .from("ai_systems")
    .insert({
      institution_id: DEMO_INSTITUTION_ID,
      name,
      provider,
      website_url,
      activity_area,
      categories,
      subjects,
      activities_didattica,
      activities_amministrazione,
      adoption_date: adoption_date || null,
      responsible_person,
      notes,
      created_by: DEMO_USER_ID,
      is_active: true
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating AI system:", error);
    throw new Error(error.message);
  }

  // Creazione bozza di valutazione
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
    console.error("Error creating evaluation draft:", evalError);
    throw new Error(evalError.message);
  }

  revalidatePath("/");
  
  if (website_url && website_url.trim().length > 0) {
    redirect(`/systems/${system.id}/evaluating`);
  } else {
    redirect(`/systems/${system.id}/evaluate/manual`);
  }
}

export async function markDpoRequestSent(systemId: string, evaluationId: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("evaluations")
    .update({
      status: "pending_dpo",
      updated_at: new Date().toISOString()
    })
    .eq("id", evaluationId);

  if (error) {
    console.error("Error marking DPO request sent:", error);
    throw new Error(error.message);
  }

  revalidatePath(`/systems/${systemId}`);
  redirect(`/systems/${systemId}`);
}

export async function updateAISystem(id: string, formData: FormData) {
  const supabase = createAdminClient();

  const name = formData.get("name") as string;
  const provider = formData.get("provider") as string;
  const website_url = formData.get("website_url") as string;
  
  const category = formData.get("category") as string;
  const category_other = formData.get("category_other") as string;
  const categories = category ? [category === "other" && category_other ? category_other : category] : [];

  const subject = formData.get("subject") as string;
  const subject_other = formData.get("subject_other") as string;
  const subjects = subject ? [subject === "other" && subject_other ? subject_other : subject] : [];

  const activity = formData.get("activity") as string;
  const activity_other = formData.get("activity_other") as string;
  const final_activity = activity === "other" && activity_other ? activity_other : activity;

  const activities_didattica = final_activity ? [final_activity] : [];
  const activity_area = "didattica";

  const adoption_date = formData.get("adoption_date") as string;
  const responsible_person = formData.get("responsible_person") as string;
  const notes = formData.get("notes") as string;

  const { error } = await supabase
    .from("ai_systems")
    .update({
      name,
      provider,
      website_url,
      activity_area: activity_area as any,
      categories: categories as any[],
      subjects: subjects as any[],
      activities_didattica: activities_didattica as any[],
      adoption_date: adoption_date || null,
      responsible_person,
      notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating AI system:", error);
    throw new Error(error.message);
  }

  revalidatePath(`/systems/${id}`);
  revalidatePath("/");
  redirect(`/systems/${id}`);
}

export async function deleteSystem(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("ai_systems").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function saveEvaluationDraft(systemId: string, evaluationId: string, data: any) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("evaluations")
    .update({
      // Step 1
      prohibited_emotion_recognition: data.prohibited?.emotion === "si",
      prohibited_biometric_categorization: data.prohibited?.biometric === "si",
      prohibited_social_scoring: data.prohibited?.scoring === "si",
      prohibited_vulnerability_manipulation: data.prohibited?.manipulation === "si",
      
      // Step 2 (Tier 1 & 2)
      risk_access: data.risk?.access === "si",
      risk_students: data.risk?.students === "si",
      risk_orientation: data.risk?.orientation === "si",
      risk_staff: data.risk?.staff === "si",
      risk_exam: data.risk?.exam === "si",
      risk_interaction: data.risk?.interaction === "si",
      risk_synthetic: data.risk?.synthetic === "si",
      risk_level: data.computedRiskLevel,
      
      // Step 3 (DPO Params)
      dpo_server_eu: data.dpoParams?.serverUE === "si",
      dpo_extra_data_required: data.dpoParams?.extraData === "si",
      dpo_marketing: data.dpoParams?.marketing === "si",
      dpo_dpa: data.dpoParams?.dpa === "si",
      dpo_acn_marketplace: data.dpoParams?.acn === "si",
      dpo_effective_ai_usage: data.dpoParams?.usesAI === "si",
      dpo_score: data.dpoScore,
      dpo_auto_verdict: data.autoVerdict,
      
      // Step 4 overrides (if any in draft)
      dpo_final_verdict: data.dpoOverride?.esitoAvallo,
      dpo_motivations: data.dpoOverride?.noteDPO,
      
      updated_at: new Date().toISOString()
    })
    .eq("id", evaluationId);

  if (error) {
    console.error("Error saving evaluation draft:", error);
    throw new Error(error.message);
  }

  revalidatePath(`/systems/${systemId}`);
}

export async function submitEvaluation(systemId: string, evaluationId: string, data: any) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("evaluations")
    .update({
      // Step 1
      prohibited_emotion_recognition: data.prohibited?.emotion === "si",
      prohibited_biometric_categorization: data.prohibited?.biometric === "si",
      prohibited_social_scoring: data.prohibited?.scoring === "si",
      prohibited_vulnerability_manipulation: data.prohibited?.manipulation === "si",
      
      // Step 2
      risk_access: data.risk?.access === "si",
      risk_students: data.risk?.students === "si",
      risk_orientation: data.risk?.orientation === "si",
      risk_staff: data.risk?.staff === "si",
      risk_exam: data.risk?.exam === "si",
      risk_interaction: data.risk?.interaction === "si",
      risk_synthetic: data.risk?.synthetic === "si",
      risk_level: data.computedRiskLevel,
      
      // Step 3
      dpo_server_eu: data.dpoParams?.serverUE === "si",
      dpo_extra_data_required: data.dpoParams?.extraData === "si",
      dpo_marketing: data.dpoParams?.marketing === "si",
      dpo_dpa: data.dpoParams?.dpa === "si",
      dpo_acn_marketplace: data.dpoParams?.acn === "si",
      dpo_effective_ai_usage: data.dpoParams?.usesAI === "si",
      dpo_score: data.dpoScore,
      dpo_auto_verdict: data.autoVerdict,
      
      // Step 4
      dpo_final_verdict: data.dpoOverride?.esitoAvallo === "in_attesa" ? null : data.dpoOverride?.esitoAvallo,
      dpo_motivations: data.dpoOverride?.noteDPO,
      
      status: "pending_review",
      registered_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", evaluationId);

  if (error) {
    console.error("Error submitting evaluation:", error);
    throw new Error(error.message);
  }

  revalidatePath(`/systems/${systemId}`);
  redirect(`/`);
}

export async function forceReevaluateSystem(systemId: string) {
  const supabase = createAdminClient();

  // Get current max version
  const { data: evaluations } = await supabase
    .from("evaluations")
    .select("version")
    .eq("ai_system_id", systemId)
    .order("version", { ascending: false })
    .limit(1);

  const currentVersion = (evaluations && evaluations.length > 0) ? evaluations[0].version : 0;

  // Create new draft evaluation
  const { data: evaluation, error: evalError } = await supabase
    .from("evaluations")
    .insert({
      ai_system_id: systemId,
      institution_id: DEMO_INSTITUTION_ID,
      status: "draft",
      school_year: "2024/2025",
      version: currentVersion + 1,
      created_by: DEMO_USER_ID
    })
    .select()
    .single();

  if (evalError) {
    console.error("Error creating new evaluation draft:", evalError);
    throw new Error(evalError.message);
  }

  // Check if system has website url
  const { data: system } = await supabase.from("ai_systems").select("website_url").eq("id", systemId).single();
  
  revalidatePath(`/systems/${systemId}`);

  if (system?.website_url) {
    redirect(`/systems/${systemId}/evaluating`);
  } else {
    redirect(`/systems/${systemId}/evaluate/manual`);
  }
}
