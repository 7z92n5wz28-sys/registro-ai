import { ExternalLink, Info, Check, X } from "lucide-react";
import AIBadge from "./AIBadge";

interface AIMeta {
  value: "si" | "no";
  rationale: string;
  sourceUrl: string | null;
  sourceSnippet: string | null;
  confidence: "inferred" | "to_verify";
}

interface DeterministicMeta {
  value: "si" | "no";
  rationale: string;
}

export default function QuestionCard({
  id,
  text,
  subtext,
  value,
  onChange,
  aiMeta,
  deterministicMeta
}: {
  id: string;
  text: string;
  subtext?: string;
  value: "si" | "no" | null;
  onChange: (val: "si" | "no") => void;
  aiMeta?: AIMeta;
  deterministicMeta?: DeterministicMeta;
}) {
  const isMatch = value && aiMeta && value === aiMeta.value;
  const isModified = value && aiMeta && value !== aiMeta.value;

  return (
    <div className="bg-white border border-[var(--border-soft)] rounded-xl p-5 shadow-sm flex flex-col gap-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex-1">
          <p className="font-medium text-[var(--text-primary)]">{text}</p>
          {subtext && <p className="text-sm text-[var(--text-secondary)] mt-1">{subtext}</p>}
          
          <div className="flex flex-wrap gap-2 mt-3">
            {deterministicMeta && (
              <AIBadge confidence="rule" customLabel={`Regola automatica: ${deterministicMeta.rationale}`} />
            )}
            {!deterministicMeta && aiMeta && (
              <AIBadge confidence={aiMeta.confidence} />
            )}
            {isModified && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--color-g3-glow)] border border-[var(--color-g3)] text-[var(--color-g3)] text-xs font-medium">
                Modificato rispetto all'AI
              </span>
            )}
            {isMatch && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--color-g1-glow)] border border-[var(--color-g1)] text-[var(--color-g1)] text-xs font-medium">
                Conferma AI
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 bg-[var(--bg-muted)] p-1 rounded-lg h-fit">
          <button
            type="button"
            onClick={() => onChange("si")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border transition-all ${
              value === "si" 
                ? "bg-[var(--text-primary)] text-white shadow-sm" 
                : "text-[var(--text-secondary)] hover:bg-white/50"
            }`}
          >
            Sì
          </button>
          <button
            type="button"
            onClick={() => onChange("no")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border transition-all ${
              value === "no" 
                ? "bg-white text-[var(--text-primary)] shadow-sm border border-[var(--border-strong)]" 
                : "text-[var(--text-secondary)] hover:bg-white/50"
            }`}
          >
            No
          </button>
        </div>
      </div>

      {aiMeta && (
        <div className="bg-[var(--bg-muted)] rounded-lg p-3 text-sm flex flex-col gap-2 border border-[var(--border-soft)] mt-2">
          <div className="flex items-start gap-2 text-[var(--text-secondary)]">
            <Info size={16} className="mt-0.5 shrink-0" />
            <p className="leading-relaxed">
              <strong>Motivazione AI:</strong> {aiMeta.rationale}
            </p>
          </div>
          
          {(aiMeta.sourceUrl || aiMeta.sourceSnippet) && (
            <div className="pl-6 border-t border-[var(--border-soft)] pt-2 mt-1">
              <p className="text-xs text-[var(--text-muted)] font-medium mb-1 uppercase tracking-wider">Evidenza / Fonte</p>
              {aiMeta.sourceUrl && (
                <a href={aiMeta.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[var(--primary)] hover:underline mb-1">
                  <ExternalLink size={14} />
                  <span className="truncate max-w-md">{aiMeta.sourceUrl}</span>
                </a>
              )}
              {aiMeta.sourceSnippet && (
                <div className="bg-white px-3 py-2 border-l-2 border-[var(--primary)] rounded text-xs italic text-[var(--text-secondary)] mt-1">
                  "{aiMeta.sourceSnippet}"
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
