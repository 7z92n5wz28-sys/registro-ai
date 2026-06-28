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
  
  // Arrays vuoti di default (saranno inferiti dall'AI e rivisti nel wizard)
  const activity_area = "didattica";
  const categories: any[] = [];
  const subjects: any[] = [];
  const activities_didattica: any[] = [];
  const activities_amministrazione: any[] = [];

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
  redirect(`/systems/${system.id}/evaluating`);
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
  const activity_area = formData.get("activity_area") as string;
  
  // Arrays
  const categories = formData.getAll("categories") as string[];
  const subjects = formData.getAll("subjects") as string[];
  const activities = formData.getAll("activities") as string[];

  const activities_didattica = activity_area === "didattica" ? activities : [];
  const activities_amministrazione = activity_area === "amministrazione" ? activities : [];

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
      activities_amministrazione: activities_amministrazione as any[],
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

export async function saveEvaluationDraft(systemId: string, evaluationId: string, data: any) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("evaluations")
    .update({
      prohibited_vulnerability_manipulation: data.compliance_requirements?.q1 === "yes",
      prohibited_social_scoring: data.compliance_requirements?.q2 === "yes",
      prohibited_emotion_recognition: data.compliance_requirements?.q3 === "yes",
      prohibited_biometric_categorization: data.compliance_requirements?.q4 === "yes",
      prohibited_access_determination: data.compliance_requirements?.q5 === "yes",
      risk_level: data.risk_level,
      dpo_conditions: data.dpo_conditions,
      dpo_score: data.dpo_score,
      dpo_acn_marketplace: data.dpo_acn_marketplace,
      dpo_auto_verdict: data.dpo_auto_verdict,
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
      prohibited_vulnerability_manipulation: data.compliance_requirements?.q1 === "yes",
      prohibited_social_scoring: data.compliance_requirements?.q2 === "yes",
      prohibited_emotion_recognition: data.compliance_requirements?.q3 === "yes",
      prohibited_biometric_categorization: data.compliance_requirements?.q4 === "yes",
      prohibited_access_determination: data.compliance_requirements?.q5 === "yes",
      risk_level: data.risk_level,
      dpo_conditions: data.dpo_conditions,
      dpo_score: data.dpo_score,
      dpo_acn_marketplace: data.dpo_acn_marketplace,
      dpo_auto_verdict: data.dpo_auto_verdict,
      status: "pending_review",
      updated_at: new Date().toISOString()
    })
    .eq("id", evaluationId);

  if (error) {
    console.error("Error submitting evaluation:", error);
    throw new Error(error.message);
  }

  revalidatePath(`/systems/${systemId}`);
  redirect(`/systems/${systemId}`);
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

  revalidatePath(`/systems/${systemId}`);
  redirect(`/systems/${systemId}/evaluating`);
}
