"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import DpoVerdictForm from "@/components/DpoVerdictForm";

export default function DpoStandaloneClient({
  evaluationId,
  systemId,
  autoVerdict,
  initialConditions,
  initialMotivations,
  initialVerdict
}: {
  evaluationId: string;
  systemId: string;
  autoVerdict: string;
  initialConditions: string;
  initialMotivations: string;
  initialVerdict: string;
}) {
  const router = useRouter();
  const [state, setState] = useState({
    esitoAvallo: initialVerdict || autoVerdict || "approved_with_conditions",
    noteDPO: initialMotivations || "",
  });
  const [conditions, setConditions] = useState(initialConditions || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/evaluate/${evaluationId}/verdict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          verdict: state.esitoAvallo, 
          conditions, 
          motivations: state.noteDPO 
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Errore durante il salvataggio del parere.");
      }

      router.push("/dpo/success");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="card">
        <h2 className="font-semibold border-b border-[var(--border-soft)] pb-3">Integrazione Condizioni</h2>
        <div className="form-group">
          <label className="text-sm font-medium">Condizioni e Prescrizioni</label>
          <p className="text-xs text-[var(--text-muted)]">Aggiungi o modifica le misure proposte dall'istituto.</p>
          <textarea
            className="modal-input min-h-[100px] resize-y mt-1"
            value={conditions}
            onChange={(e) => setConditions(e.target.value)}
          />
        </div>
      </div>
      
      <div className="card shadow-sm border border-[var(--border-soft)] overflow-hidden">
        <DpoVerdictForm 
          state={state} 
          onChange={setState} 
          isDpo={true} 
          autoVerdict={autoVerdict} 
        />
        
        {error && (
          <div className="p-4 bg-[var(--color-g4-glow)] text-[var(--color-g4)] text-sm mx-6">{error}</div>
        )}

        <div className="p-6 bg-gray-50 flex justify-end gap-3 border-t border-[var(--border-soft)]">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="header-btn bg-[var(--primary)] text-white border-transparent hover:bg-[var(--primary-light)] hover:text-white disabled:opacity-50"
          >
            <Send size={16} />
            {isSubmitting ? "Invio..." : "Registra Parere DPO"}
          </button>
        </div>
      </div>
    </div>
  );
}
