import { ShieldAlert, ShieldCheck, HelpCircle } from "lucide-react";
import DpoVerdictForm from "../DpoVerdictForm";

export default function Step4Summary({
  state,
  updateState,
  computedRiskLevel,
  dpoScore,
  autoVerdict,
  autoVerdictLabel,
  isDpo
}: {
  state: any;
  updateState: (key: "prohibited" | "risk" | "dpoParams" | "dpoOverride", val: any) => void;
  computedRiskLevel: "unacceptable" | "high" | "minimal";
  dpoScore: number;
  autoVerdict: string;
  autoVerdictLabel?: string;
  isDpo?: boolean;
}) {
  return (
    <div className="flex flex-col gap-8">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-soft)] rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Sintesi e Avallo DPO</h2>
        <p className="text-[var(--text-secondary)]">
          Riepilogo della classificazione del rischio e del punteggio DPO calcolato in base alle tue risposte.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Livello di Rischio */}
        <div className="bg-white border border-[var(--border-soft)] rounded-xl p-6 shadow-sm flex flex-col gap-4">
          <h3 className="font-semibold text-lg text-[var(--text-primary)] border-b border-[var(--border-soft)] pb-2">
            Livello di Rischio AI Act
          </h3>
          
          <div className="flex items-center gap-4 mt-2">
            {computedRiskLevel === "unacceptable" && (
              <>
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <div className="text-sm text-[var(--text-secondary)]">Rischio</div>
                  <div className="text-xl font-bold text-red-600">Inaccettabile</div>
                </div>
              </>
            )}
            {computedRiskLevel === "high" && (
              <>
                <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <div className="text-sm text-[var(--text-secondary)]">Rischio</div>
                  <div className="text-xl font-bold text-orange-600">Alto (Tier 1)</div>
                </div>
              </>
            )}
            {computedRiskLevel === "minimal" && (
              <>
                <div className="w-12 h-12 rounded-full bg-[var(--color-g1-glow)] text-[var(--color-g1)] flex items-center justify-center">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <div className="text-sm text-[var(--text-secondary)]">Rischio</div>
                  <div className="text-xl font-bold text-[var(--color-g1)]">Limitato / Minimo</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Punteggio DPO */}
        <div className="bg-white border border-[var(--border-soft)] rounded-xl p-6 shadow-sm flex flex-col gap-4">
          <h3 className="font-semibold text-lg text-[var(--text-primary)] border-b border-[var(--border-soft)] pb-2">
            Score Parere DPO
          </h3>
          
          <div className="flex items-center gap-4 mt-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
              dpoScore >= 6 ? "bg-green-100 text-green-700" :
              dpoScore >= 1 ? "bg-blue-100 text-blue-700" :
              "bg-red-100 text-red-700"
            }`}>
              {dpoScore > 0 ? `+${dpoScore}` : dpoScore}
            </div>
            <div>
              <div className="text-sm text-[var(--text-secondary)]">Parere automatico proposto</div>
              <div className="text-lg font-bold text-[var(--text-primary)]">
                {autoVerdictLabel || (
                  autoVerdict === "approved" ? "Approvare" :
                  autoVerdict === "approved_with_conditions" ? "Approvare con Condizioni" :
                  "Non Approvare"
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[var(--border-soft)] rounded-xl shadow-sm overflow-hidden">
        <DpoVerdictForm
          state={state.dpoOverride}
          onChange={(val) => updateState("dpoOverride", val)}
          isDpo={isDpo}
          autoVerdict={autoVerdict}
        />
      </div>
    </div>
  );
}
