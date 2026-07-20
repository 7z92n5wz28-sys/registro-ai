"use client";

import { CheckCircle2, ShieldAlert, AlertCircle, Clock } from "lucide-react";

interface DpoVerdictFormProps {
  state: any;
  onChange: (val: any) => void;
  isDpo?: boolean;
  autoVerdict?: string;
}

const VERDICTS = [
  { id: "approved", label: "Ottimo (Approvato)", description: "Autorizzato all'uso istituzionale senza condizioni particolari.", icon: CheckCircle2, color: "text-[var(--color-g1)]", border: "border-[var(--color-g1)]", bg: "bg-[var(--color-g1-glow)]" },
  { id: "approved_with_conditions", label: "Buono / Sufficiente (Con Condizioni)", description: "Autorizzato all'uso con le misure di mitigazione specificate.", icon: AlertCircle, color: "text-[var(--color-g2)]", border: "border-[var(--color-g2)]", bg: "bg-[var(--color-g2-glow)]" },
  { id: "rejected", label: "Critico (Non Approvato)", description: "Non autorizzato. Lo strumento presenta rischi non accettabili.", icon: ShieldAlert, color: "text-[var(--color-g4)]", border: "border-[var(--color-g4)]", bg: "bg-[var(--color-g4-glow)]" },
  { id: "in_attesa", label: "In Attesa di Parere DPO", description: "Salva nel registro ma inibisce l'uso fino al parere formale del DPO.", icon: Clock, color: "text-amber-500", border: "border-amber-500", bg: "bg-amber-50" },
];

export default function DpoVerdictForm({ state, onChange, isDpo, autoVerdict }: DpoVerdictFormProps) {
  
  const updateField = (key: string, value: string) => {
    onChange({ ...state, [key]: value });
  };

  const selectedVerdict = state?.esitoAvallo || (isDpo ? autoVerdict : "in_attesa");

  return (
    <div className="p-6 flex flex-col gap-6 bg-white">
      <div>
        <p className="text-sm font-medium mb-3">Esito Avallo (Override manuale)</p>
        <div className="flex flex-col gap-3">
          {VERDICTS.map((v) => {
            // Se non è il DPO a compilare, nascondiamo alcune opzioni?
            // Le specifiche dicono che Animatore/DPO possono sovrascrivere il parere.
            const Icon = v.icon;
            const isSelected = selectedVerdict === v.id;
            return (
              <label
                key={v.id}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? `${v.border} ${v.bg}` : "border-[var(--border-soft)] hover:border-[var(--text-muted)]"}`}
              >
                <input 
                  type="radio" 
                  name="esitoAvallo" 
                  value={v.id} 
                  checked={isSelected} 
                  onChange={() => updateField("esitoAvallo", v.id)} 
                  className="hidden" 
                />
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
        <label className="text-sm font-medium">Note DPO / Motivazione del Parere</label>
        <textarea
          className="modal-input min-h-[100px] resize-y"
          value={state?.noteDPO || ""}
          onChange={(e) => updateField("noteDPO", e.target.value)}
          placeholder="Giustificazione per eventuale variazione rispetto al parere automatico, oppure note aggiuntive..."
        />
      </div>
    </div>
  );
}
