"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { CheckCircle2, AlertTriangle, Search, Brain, ArrowRight } from "lucide-react";

interface EvalResult {
  searchSources: number;
  aiEvidences: number;
  totalQuestions: number;
  matchedQuestions: number;
  systemInfo: any;
  acnQualified?: boolean;
}

export default function EvaluatingPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [phase, setPhase] = useState<"searching" | "analyzing" | "done" | "error">("searching");
  const [status, setStatus] = useState("Inizializzazione...");
  const [result, setResult] = useState<EvalResult | null>(null);
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
        const { data: evaluation } = await supabase
          .from("evaluations")
          .select("*")
          .eq("ai_system_id", systemId)
          .eq("status", "draft")
          .order("version", { ascending: false })
          .limit(1)
          .single();
        
        if (!system || !evaluation) {
          throw new Error("Sistema o valutazione non trovati.");
        }

        // Phase 1: Search
        setPhase("searching");
        setStatus("Ricerca informazioni sul web...");
        const searchRes = await fetch("/api/evaluate/search", {
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
        const searchData = await searchRes.json();

        // Phase 2: Analyze
        setPhase("analyzing");
        setStatus("Analisi intelligente dei requisiti...");
        const analyzeRes = await fetch("/api/evaluate/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            evaluationId: evaluation.id,
            systemId: system.id
          })
        });

        if (!analyzeRes.ok) {
          const errData = await analyzeRes.json();
          throw new Error(errData.error || "Errore durante l'analisi AI");
        }

        // Phase 3: Collect results
        const { data: evidences } = await supabase
          .from("ai_evidences")
          .select("*")
          .eq("evaluation_id", evaluation.id);

        const { data: updatedSystem } = await supabase
          .from("ai_systems")
          .select("*")
          .eq("id", systemId)
          .single();

        const { data: updatedEval } = await supabase
          .from("evaluations")
          .select("dpo_acn_marketplace")
          .eq("id", evaluation.id)
          .single();

        const matched = (evidences || []).filter(e => 
          [
            "emotion", "biometric", "scoring", "manipulation",
            "access", "students", "orientation", "staff", "exam", "interaction", "synthetic",
            "serverUE", "extraData", "marketing", "dpa"
          ].includes(e.parameter_key)
        ).length;

        setResult({
          searchSources: searchData?.sourcesCount || (searchData?.sources?.length || 0),
          aiEvidences: evidences?.length || 0,
          totalQuestions: 15,
          matchedQuestions: matched,
          systemInfo: updatedSystem,
          acnQualified: updatedEval?.dpo_acn_marketplace || false
        } as any);

        setPhase("done");
      } catch (e) {
        console.error(e);
        setPhase("error");
        setStatus("Errore durante l'elaborazione automatica.");
      }
    }
    
    runEval();
  }, [params, router, supabase]);

  const handleContinue = async () => {
    const resolvedParams = await params;
    router.push(`/systems/${resolvedParams.id}/evaluate/manual`);
  };

  if (phase === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center p-8">
        <AlertTriangle size={48} className="text-[var(--color-g3)]" />
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Problema durante l'analisi</h2>
        <p className="text-[var(--text-secondary)] max-w-md">{status}</p>
        <button onClick={handleContinue} className="header-btn bg-[var(--primary)] text-white border-transparent hover:bg-[var(--primary-light)] hover:text-white mt-4">
          Prosegui comunque con il Wizard Manuale
          <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  if (phase === "done" && result) {
    const manualNeeded = result.totalQuestions - result.matchedQuestions;
    const categories = result.systemInfo?.categories || [];
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-8 p-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <CheckCircle2 size={36} className="text-[var(--color-g1)]" />
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Analisi AI Completata</h2>
        </div>
        
        <p className="text-[var(--text-secondary)] text-center">
          L'intelligenza artificiale ha analizzato le fonti disponibili per <strong>{result.systemInfo?.name || "questo strumento"}</strong>.
          Ecco un riepilogo di cosa è stato trovato.
        </p>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          <div className="card !p-4 text-center">
            <Search size={24} className="mx-auto mb-2 text-[var(--primary)]" />
            <p className="text-2xl font-bold text-[var(--text-primary)]">{result.searchSources}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Fonti web analizzate</p>
          </div>
          <div className="card !p-4 text-center">
            <CheckCircle2 size={24} className="mx-auto mb-2 text-[var(--color-g1)]" />
            <p className="text-2xl font-bold text-[var(--color-g1)]">{result.matchedQuestions}/{result.totalQuestions}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Requisiti verificati dall'AI</p>
          </div>
          <div className="card !p-4 text-center">
            <AlertTriangle size={24} className="mx-auto mb-2 text-[var(--color-g3)]" />
            <p className="text-2xl font-bold text-[var(--color-g3)]">{manualNeeded}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Richiedono input manuale</p>
          </div>
          <div className={`card !p-4 text-center ${result.acnQualified ? 'border-[var(--color-g1)] bg-[var(--color-g1-glow)]' : 'border-[var(--color-g4)] bg-[var(--color-g4-glow)]'}`}>
            <Brain size={24} className={`mx-auto mb-2 ${result.acnQualified ? 'text-[var(--color-g1)]' : 'text-[var(--color-g4)]'}`} />
            <p className={`text-lg font-bold ${result.acnQualified ? 'text-[var(--color-g1)]' : 'text-[var(--color-g4)]'}`}>
              {result.acnQualified ? "Trovata" : "Assente"}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Qualifica Cloud ACN</p>
          </div>
        </div>

        {/* Inferred categories */}
        {categories.length > 0 && (
          <div className="w-full card !p-4">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Tipologia dedotta dall'AI</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((c: string) => (
                <span key={c} className="px-2 py-1 bg-[var(--primary-glow)] text-[var(--primary)] rounded-md text-xs font-medium">{c.replace(/_/g, ' ')}</span>
              ))}
            </div>
          </div>
        )}

        {/* What's next */}
        <div className="w-full bg-[var(--bg-muted)] border border-[var(--border-soft)] rounded-xl p-5">
          <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-2">Prossimo passo</h3>
          {manualNeeded === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">
              ✅ L'AI ha verificato <strong>tutti i requisiti</strong>. Nel wizard troverai le risposte già pre-compilate con le evidenze trovate.
              Dovrai solo <strong>validare</strong> ogni risposta e confermare.
            </p>
          ) : (
            <p className="text-sm text-[var(--text-secondary)]">
              L'AI ha verificato <strong>{result.matchedQuestions} su {result.totalQuestions}</strong> requisiti. Per i restanti <strong>{manualNeeded}</strong> dovrai fornire la risposta manualmente. Le domande già compilate dall'AI mostreranno l'evidenza trovata con una bandierina verde.
            </p>
          )}
        </div>

        <button onClick={handleContinue} className="header-btn bg-[var(--primary)] text-white border-transparent hover:bg-[var(--primary-light)] hover:text-white text-base px-8 py-3">
          Vai al Wizard di Revisione
          <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  // Loading states
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center p-8">
      <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Analisi AI in corso</h2>
      <p className="text-[var(--text-secondary)] max-w-md">
        Stiamo leggendo la documentazione ufficiale e analizzando la conformità all'AI Act per questo strumento.
      </p>
      
      {/* Progress steps */}
      <div className="flex flex-col gap-3 w-full max-w-sm mt-4">
        <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${phase === "searching" ? "bg-[var(--primary-glow)] border border-[var(--primary)]" : "bg-[var(--color-g1-glow)] border border-[var(--color-g1)]"}`}>
          {phase === "searching" ? (
            <div className="w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin shrink-0"></div>
          ) : (
            <CheckCircle2 size={20} className="text-[var(--color-g1)] shrink-0" />
          )}
          <div className="text-left">
            <p className="text-sm font-medium">Fase 1: Ricerca fonti</p>
            <p className="text-xs text-[var(--text-muted)]">Tavily + Firecrawl sul sito ufficiale</p>
          </div>
        </div>
        
        <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${phase === "analyzing" ? "bg-[var(--primary-glow)] border border-[var(--primary)]" : phase === "done" ? "bg-[var(--color-g1-glow)] border border-[var(--color-g1)]" : "bg-[var(--bg-muted)] border border-[var(--border-soft)] opacity-50"}`}>
          {phase === "analyzing" ? (
            <div className="w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin shrink-0"></div>
          ) : phase === "done" ? (
            <CheckCircle2 size={20} className="text-[var(--color-g1)] shrink-0" />
          ) : (
            <Brain size={20} className="text-[var(--text-muted)] shrink-0" />
          )}
          <div className="text-left">
            <p className="text-sm font-medium">Fase 2: Analisi AI Act</p>
            <p className="text-xs text-[var(--text-muted)]">OpenAI valuta requisiti e classificazione</p>
          </div>
        </div>
      </div>
    </div>
  );
}
