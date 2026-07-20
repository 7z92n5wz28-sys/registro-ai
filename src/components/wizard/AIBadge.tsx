import { Brain, Check, AlertTriangle, Sparkles } from "lucide-react";

type ConfidenceLevel = "rule" | "inferred" | "to_verify";

export default function AIBadge({ 
  confidence, 
  customLabel 
}: { 
  confidence: ConfidenceLevel;
  customLabel?: string;
}) {
  if (confidence === "rule") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 border border-purple-200 text-purple-700 text-xs font-medium">
        <Sparkles size={14} />
        {customLabel || "Suggerito (regola) · verifica"}
      </div>
    );
  }

  if (confidence === "inferred") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--color-g1-glow)] border border-[var(--color-g1)] text-[var(--color-g1)] text-xs font-medium">
        <Brain size={14} />
        {customLabel || "AI · inferito"}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--color-g3-glow)] border border-[var(--color-g3)] text-[var(--color-g3)] text-xs font-medium">
      <AlertTriangle size={14} />
      {customLabel || "AI · da verificare"}
    </div>
  );
}
