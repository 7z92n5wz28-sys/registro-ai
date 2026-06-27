import { updateAISystem } from "@/app/actions";
import { createClient } from "@/utils/supabase/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import SystemForm from "@/components/SystemForm";

export default async function EditSystemPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: system, error } = await supabase
    .from("ai_systems")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !system) {
    notFound();
  }

  // Bind the id to the server action
  const updateSystemWithId = updateAISystem.bind(null, id);

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-2">
        <Link href={`/systems/${id}`} className="p-2 rounded-full hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="main-title text-2xl">Modifica Sistema AI</h1>
          <p className="subtitle">Aggiorna le informazioni di base dello strumento</p>
        </div>
      </div>

      <div className="card">
        <SystemForm 
          action={updateSystemWithId} 
          initialData={system} 
          submitLabel="Salva Modifiche" 
        />
      </div>
    </div>
  );
}
