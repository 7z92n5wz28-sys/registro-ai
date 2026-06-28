"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ShieldAlert, AlertCircle, Send } from "lucide-react";

interface DpoVerdictFormProps {
  systemId: string;
  evaluationId: string;
  autoVerdict: string | null;
  initialConditions: string;
  redirectUrl?: string;
}

const VERDICTS = [
  { id: "approved", label: "Approvato", description: "Autorizzato all'uso istituzionale senza condizioni particolari.", icon: CheckCircle2, color: "text-[var(--color-g1)]", border: "border-[var(--color-g1)]", bg: "bg-[var(--color-g1-glow)]" },
  { id: "approved_with_conditions", label: "Approvato con Condizioni", description: "Autorizzato all'uso con le misure di mitigazione specificate.", icon: AlertCircle, color: "text-[var(--color-g2)]", border: "border-[var(--color-g2)]", bg: "bg-[var(--color-g2-glow)]" },
  { id: "rejected", label: "Non Approvato", description: "Non autorizzato. Lo strumento presenta rischi non accettabili.", icon: ShieldAlert, color: "text-[var(--color-g4)]", border: "border-[var(--color-g4)]", bg: "bg-[var(--color-g4-glow)]" },
];

export default function DpoVerdictForm({ systemId, evaluationId, autoVerdict, initialConditions, redirectUrl }: DpoVerdictFormProps) {
  const [verdict, setVerdict] = useState(autoVerdict || "approved_with_conditions");
  const [conditions, setConditions] = useState(initialConditions);
  const [motivations, setMotivations] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/evaluate/${evaluationId}/verdict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verdict, conditions, motivations }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Errore durante il salvataggio del parere.");
      }

      router.push(redirectUrl || `/systems/${systemId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card gap-6">
      <h2 className="font-semibold border-b border-[var(--border-soft)] pb-3">Parere Formale del DPO</h2>

      <div>
        <p className="text-sm font-medium mb-3">Selezione Verdetto Finale</p>
        <div className="flex flex-col gap-3">
          {VERDICTS.map((v) => {
            const Icon = v.icon;
            const isSelected = verdict === v.id;
            return (
              <label
                key={v.id}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? `${v.border} ${v.bg}` : "border-[var(--border-soft)] hover:border-[var(--text-muted)]"}`}
              >
                <input type="radio" name="verdict" value={v.id} checked={isSelected} onChange={() => setVerdict(v.id)} className="hidden" />
                <Icon size={20} className={`mt-0.5 shrink-0 ${isSelected ? v.color : "text-[var(--text-muted)]"}`} />
                <div>
                  <p className={`font-semibold text-sm ${isSelected ? v.color : "text-[var(--text-primary)]"}`}>{v.label}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{v.description}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <div className="form-group">
        <label className="text-sm font-medium">Condizioni e Prescrizioni</label>
        <p className="text-xs text-[var(--text-muted)]">Specifica le condizioni d'uso, le misure organizzative richieste e le prescrizioni per gli utenti.</p>
        <textarea
          className="modal-input min-h-[100px] resize-y mt-1"
          value={conditions}
          onChange={(e) => setConditions(e.target.value)}
          placeholder="Es. Vietato l'inserimento di dati personali degli studenti. Necessaria la firma dell'informativa privacy aggiornata..."
        />
      </div>

      <div className="form-group">
        <label className="text-sm font-medium">Motivazione del Parere</label>
        <textarea
          className="modal-input min-h-[80px] resize-y"
          value={motivations}
          onChange={(e) => setMotivations(e.target.value)}
          placeholder="Motivazione sintetica del parere DPO..."
        />
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-[var(--color-g4-glow)] text-[var(--color-g4)] text-sm">{error}</div>
      )}

      <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border-soft)]">
        {!redirectUrl && <a href={`/systems/${systemId}`} className="header-btn">Annulla</a>}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="header-btn bg-[var(--primary)] text-white border-transparent hover:bg-[var(--primary-light)] hover:text-white disabled:opacity-50"
        >
          <Send size={16} />
          {isSubmitting ? "Salvataggio..." : "Registra Parere DPO"}
        </button>
      </div>
    </div>
  );
}
