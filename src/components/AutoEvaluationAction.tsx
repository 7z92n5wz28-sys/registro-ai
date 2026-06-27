"use client";

import { useState } from "react";
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface AutoEvaluationProps {
  systemId: string;
  evaluationId: string;
  name: string;
  provider: string | null;
  websiteUrl: string | null;
}

export default function AutoEvaluationAction({ systemId, evaluationId, name, provider, websiteUrl }: AutoEvaluationProps) {
  const [status, setStatus] = useState<"idle" | "searching" | "analyzing" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleEvaluate = async () => {
    setStatus("searching");
    setErrorMsg("");
    
    try {
      // 1. Fase di Ricerca e Crawling
      const searchRes = await fetch("/api/evaluate/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemId, evaluationId, name, provider, websiteUrl })
      });
      
      if (!searchRes.ok) {
        throw new Error("Errore durante la ricerca e il crawling");
      }

      setStatus("analyzing");

      // 2. Fase di Analisi AI
      const analyzeRes = await fetch("/api/evaluate/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemId, evaluationId })
      });

      if (!analyzeRes.ok) {
        throw new Error("Errore durante l'analisi AI");
      }

      setStatus("success");
      
      // Ricarica la pagina per mostrare i dati compilati
      setTimeout(() => {
        router.push(`/systems/${systemId}/evaluate/manual`);
      }, 1500);
      
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err.message || "Si è verificato un errore imprevisto.");
    }
  };

  if (status === "searching" || status === "analyzing") {
    return (
      <div className="flex flex-col gap-2 items-center text-center p-3 w-full bg-[var(--primary-glow)] rounded-lg text-[var(--primary)] text-sm">
        <Loader2 className="animate-spin" size={20} />
        <span className="font-medium">
          {status === "searching" ? "Ricerca e analisi sito web in corso..." : "Analisi documenti con Intelligenza Artificiale..."}
        </span>
        <span className="text-xs opacity-80">Questa operazione può richiedere fino a un minuto.</span>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col gap-2 items-center text-center p-3 w-full bg-[var(--color-g1-glow)] rounded-lg text-[var(--color-g1)] text-sm font-medium">
        <CheckCircle2 size={20} />
        <span>Valutazione completata. Apertura bozza...</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col gap-2 items-center text-center p-3 w-full bg-[var(--color-g4-glow)] rounded-lg text-[var(--color-g4)] text-sm">
        <AlertCircle size={20} />
        <span className="font-medium">Errore nella valutazione</span>
        <span className="text-xs">{errorMsg}</span>
        <button onClick={() => setStatus("idle")} className="underline mt-1 text-xs hover:text-[var(--text-primary)]">Riprova</button>
      </div>
    );
  }

  return (
    <button 
      onClick={handleEvaluate}
      className="header-btn bg-[var(--primary)] text-white hover:bg-[var(--primary-light)] hover:text-white border-transparent shadow-[var(--primary-glow)]"
    >
      <Sparkles size={16} />
      <span>Valuta con AI</span>
    </button>
  );
}
