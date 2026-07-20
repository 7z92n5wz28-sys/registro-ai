import QuestionCard from "./QuestionCard";

export default function Step2Classification({
  state,
  updateState,
  aiMeta,
  deterministicMeta
}: {
  state: any;
  updateState: (key: string, val: string) => void;
  aiMeta: any;
  deterministicMeta: any;
}) {
  return (
    <div className="flex flex-col gap-8">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-soft)] rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Classificazione Livello di Rischio (Allegato III / art. 50)</h2>
        <p className="text-[var(--text-secondary)]">
          Determina il livello di rischio dello strumento rispondendo alle domande seguenti.
        </p>
      </div>

      {/* Tier 1 - Alto Rischio */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--color-g3-glow)] text-[var(--color-g3)] flex items-center justify-center font-bold">1</div>
          <h3 className="font-semibold text-lg text-[var(--text-primary)]">Sistemi ad Alto Rischio (Tier 1)</h3>
        </div>
        
        <QuestionCard
          id="access"
          text="Determina l'accesso o l'ammissione alle istituzioni scolastiche"
          subtext="Esempio: smistamento automatico di iscritti, assegnazione borse di studio basata su profiling AI."
          value={state.access}
          onChange={(val) => updateState("access", val)}
          aiMeta={aiMeta.access}
          deterministicMeta={deterministicMeta.access}
        />
        <QuestionCard
          id="students"
          text="Valuta i risultati dell'apprendimento o il livello di istruzione"
          subtext="Esempio: grading automatico di temi, calcolo crediti formativi, tutor adattivo che influisce sulla valutazione."
          value={state.students}
          onChange={(val) => updateState("students", val)}
          aiMeta={aiMeta.students}
          deterministicMeta={deterministicMeta.students}
        />
        <QuestionCard
          id="orientation"
          text="Valuta persone per orientamento a specifici percorsi formativi"
          subtext="Esempio: test psico-attitudinali automatizzati che precludono l'accesso ad alcuni percorsi."
          value={state.orientation}
          onChange={(val) => updateState("orientation", val)}
          aiMeta={aiMeta.orientation}
          deterministicMeta={deterministicMeta.orientation}
        />
        <QuestionCard
          id="staff"
          text="Reclutamento, selezione, task allocation o valutazione delle performance del personale"
          subtext="Esempio: screening automatico CV, smistamento docenti/supplenze automatizzato."
          value={state.staff}
          onChange={(val) => updateState("staff", val)}
          aiMeta={aiMeta.staff}
          deterministicMeta={deterministicMeta.staff}
        />
        <QuestionCard
          id="exam"
          text="Proctoring (sorveglianza automatica) durante esami"
          subtext="Esempio: software anti-copiatura che usa webcam o microfono analizzando comportamenti anomali."
          value={state.exam}
          onChange={(val) => updateState("exam", val)}
          aiMeta={aiMeta.exam}
          deterministicMeta={deterministicMeta.exam}
        />
      </section>

      {/* Tier 2 - Rischio Limitato */}
      <section className="flex flex-col gap-4 mt-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--color-g2-glow)] text-[var(--color-g2)] flex items-center justify-center font-bold">2</div>
          <h3 className="font-semibold text-lg text-[var(--text-primary)]">Sistemi a Rischio Limitato (Tier 2)</h3>
        </div>

        <QuestionCard
          id="interaction"
          text="Interagisce direttamente con persone fisiche"
          subtext="Esempio: chatbot, assistenti virtuali a cui l'utente fa domande dirette."
          value={state.interaction}
          onChange={(val) => updateState("interaction", val)}
          aiMeta={aiMeta.interaction}
          deterministicMeta={deterministicMeta.interaction}
        />
        <QuestionCard
          id="synthetic"
          text="Genera contenuti sintetici testuali, audio, immagini o video (deepfake)"
          subtext="Esempio: generatori di testo, tool text-to-image/video."
          value={state.synthetic}
          onChange={(val) => updateState("synthetic", val)}
          aiMeta={aiMeta.synthetic}
          deterministicMeta={deterministicMeta.synthetic}
        />
      </section>

      {/* Tier 3 Info */}
      <div className="bg-[var(--color-g1-glow)] border border-[var(--color-g1)] rounded-xl p-5 mt-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-[var(--color-g1)] text-white flex items-center justify-center font-bold text-sm">3</div>
          <h3 className="font-semibold text-lg text-[var(--color-g1)]">Sistemi a Rischio Minimo (Tier 3)</h3>
        </div>
        <p className="text-sm text-[var(--text-secondary)] pl-11">
          Il Rischio Minimo viene assegnato in automatico <strong>per esclusione</strong> se rispondi "No" a tutte le domande dei Tier 1 e Tier 2. 
          Non ci sono ulteriori parametri di valutazione per questa categoria.
        </p>
      </div>

    </div>
  );
}
