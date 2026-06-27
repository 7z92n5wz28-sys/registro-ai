"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function EvaluatingPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [status, setStatus] = useState("Inizializzazione...");
  const supabase = createClient();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    async function runEval() {
      try {
        const resolvedParams = await params;
        const systemId = resolvedParams.id;
        
        setStatus("Recupero dati di base...");
        const { data: system } = await supabase.from("ai_systems").select("*").eq("id", systemId).single();
        const { data: evaluation } = await supabase.from("evaluations").select("*").eq("ai_system_id", systemId).eq("status", "draft").single();
        
        if (!system || !evaluation) {
          throw new Error("Sistema o valutazione non trovati.");
        }

        setStatus("Ricerca informazioni sul web (Tavily & Firecrawl)...");
        await fetch("/api/evaluate/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            evaluationId: evaluation.id,
            systemId: system.id,
            name: system.name,
            provider: system.provider,
            websiteUrl: system.website_url
          })
        });

        setStatus("Analisi intelligente dei requisiti (OpenAI)...");
        await fetch("/api/evaluate/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            evaluationId: evaluation.id,
            systemId: system.id
          })
        });

        setStatus("Analisi completata! Reindirizzamento in corso...");
        router.push(`/systems/${system.id}/evaluate/manual`);
      } catch (e) {
        console.error(e);
        setStatus("Errore durante l'elaborazione automatica. Verrai reindirizzato al wizard manuale.");
        setTimeout(() => {
          params.then(p => router.push(`/systems/${p.id}/evaluate/manual`));
        }, 3000);
      }
    }
    
    runEval();
  }, [params, router, supabase]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center p-8">
      <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Analisi AI in corso</h2>
      <p className="text-[var(--text-secondary)] max-w-md">
        Stiamo leggendo la documentazione ufficiale e analizzando la conformità all'AI Act per questo strumento.
      </p>
      <div className="bg-[var(--bg-muted)] py-2 px-4 rounded-full text-sm text-[var(--text-secondary)] font-medium animate-pulse mt-4">
        {status}
      </div>
    </div>
  );
}
