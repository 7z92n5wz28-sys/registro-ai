import { AlertTriangle } from "lucide-react";

export default function SensitiveDataBanner({ 
  subjects = [], 
  categories = [], 
  activities = [] 
}: { 
  subjects?: string[], 
  categories?: string[],
  activities?: string[]
}) {
  const isSensibile = 
    subjects.includes("students") || 
    subjects.includes("minor_students") ||
    subjects.includes("teachers") ||
    subjects.includes("ata") ||
    categories.includes("accessibility_bes_dsa") ||
    activities.includes("bes_dsa");

  if (!isSensibile) return null;

  return (
    <div className="bg-[var(--color-g4-glow)] border border-[var(--color-g4)] p-4 rounded-xl flex items-start gap-3 my-4">
      <AlertTriangle className="text-[var(--color-g4)] mt-0.5 flex-shrink-0" size={20} />
      <div>
        <p className="text-sm font-semibold text-[var(--color-g4)] mb-1">
          Promemoria Dati Sensibili
        </p>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Stai censendo uno strumento che tratta dati di studenti, minori, personale o categorie particolari (BES/DSA).
          È tassativamente vietato immettere dati personali, sanitari o identificativi in strumenti non esplicitamente
          approvati e sprovvisti di apposito Data Processing Agreement (DPA).
        </p>
      </div>
    </div>
  );
}
