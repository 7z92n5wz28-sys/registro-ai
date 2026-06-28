import { CheckCircle2 } from "lucide-react";

export default function DpoSuccessPage() {
  return (
    <div className="max-w-2xl mx-auto mt-20 px-4">
      <div className="card text-center gap-6 py-12">
        <CheckCircle2 size={56} className="text-[var(--color-g1)] mx-auto" strokeWidth={1.5} />
        <div>
          <h1 className="text-2xl font-semibold mb-3">Parere Acquisito con Successo</h1>
          <p className="text-[var(--text-secondary)] leading-relaxed max-w-md mx-auto">
            Grazie per aver espresso il Suo parere formale ai sensi dell'AI Act.
            L'esito è stato registrato nel sistema e notificato all'Istituto Scolastico.
          </p>
        </div>
        <p className="text-sm text-[var(--text-muted)] mt-4">
          Può chiudere in sicurezza questa finestra.
        </p>
      </div>
    </div>
  );
}
