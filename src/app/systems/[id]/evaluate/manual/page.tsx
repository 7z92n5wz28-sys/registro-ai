import { createClient } from "@/utils/supabase/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import WizardShell from "@/components/wizard/WizardShell";

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
    notFound();
  }

  // Fetch AI evidences
  const { data: aiEvidences } = await supabase
    .from("ai_evidences")
    .select("*")
    .eq("evaluation_id", evaluation.id);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-2">
        <Link href={`/systems/${id}`} className="p-2 rounded-full hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="main-title text-2xl">Revisione Assistita: {system.name}</h1>
          <p className="subtitle">Verifica l'analisi automatica dell'AI e integra le informazioni mancanti</p>
        </div>
      </div>

      <WizardShell system={system} evaluation={evaluation} aiEvidences={aiEvidences || []} />
    </div>
  );
}
