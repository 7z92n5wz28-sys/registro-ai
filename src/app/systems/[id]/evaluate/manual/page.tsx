import { createClient } from "@/utils/supabase/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ManualEvaluationWizard from "@/components/ManualEvaluationWizard";

export default async function ManualEvaluationPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params; // system ID

  // Fetch system
  const { data: system, error: sysError } = await supabase
    .from("ai_systems")
    .select("*")
    .eq("id", id)
    .single();

  if (sysError || !system) notFound();

  // Fetch the latest evaluation draft for this system
  const { data: evaluation, error: evalError } = await supabase
    .from("evaluations")
    .select("*")
    .eq("ai_system_id", id)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  if (evalError || !evaluation) {
    // Ideally this shouldn't happen because we create a draft on system creation,
    // but handle gracefully
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-2">
        <Link href={`/systems/${id}`} className="p-2 rounded-full hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="main-title text-2xl">Valutazione Manuale: {system.name}</h1>
          <p className="subtitle">Completa l'analisi di rischio e i requisiti normativi</p>
        </div>
      </div>

      <ManualEvaluationWizard system={system} evaluation={evaluation} />
    </div>
  );
}
