import QuestionCard from "./QuestionCard";

export default function Step1Screening({
  state,
  updateState,
  aiMeta
}: {
  state: any;
  updateState: (key: string, val: string) => void;
  aiMeta: any;
}) {
  const isBlocked = Object.values(state).some(val => val === "si");

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-soft)] rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Screening pratiche vietate (art. 5)</h2>
        <p className="text-[var(--text-secondary)]">
          Rispondi alle seguenti domande per verificare che lo strumento non rientri nelle pratiche vietate dall'AI Act.
        </p>
      </div>

      {isBlocked && (
        <div className="bg-[var(--color-g4-glow)] border-l-4 border-[var(--color-g4)] p-5 rounded-r-xl flex flex-col gap-2">
          <h3 className="font-bold text-[var(--color-g4)] text-lg uppercase tracking-wide">Rischio Inaccettabile</h3>
          <p className="text-sm text-[var(--text-secondary)] font-medium">
            L'adozione dello strumento è vietata in quanto integra una pratica inaccettabile ai sensi dell'art. 5 dell'AI Act.
            La procedura guidata verrà bloccata e potrai passare direttamente alla scheda di sintesi.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <QuestionCard
          id="emotion"
          text="Riconoscimento emozioni in ambienti educativi"
          subtext="Rileva le emozioni degli studenti o del personale a fini didattici o valutativi?"
          value={state.emotion}
          onChange={(val) => updateState("emotion", val)}
          aiMeta={aiMeta.emotion}
        />
        <QuestionCard
          id="biometric"
          text="Categorizzazione biometrica su caratteristiche sensibili"
          subtext="Categorizza dati biometrici per dedurre convinzioni politiche, religione, razza o orientamento sessuale?"
          value={state.biometric}
          onChange={(val) => updateState("biometric", val)}
          aiMeta={aiMeta.biometric}
        />
        <QuestionCard
          id="scoring"
          text="Social scoring basato su comportamento sociale"
          subtext="Effettua classificazione sociale o valutazione sistematica del comportamento?"
          value={state.scoring}
          onChange={(val) => updateState("scoring", val)}
          aiMeta={aiMeta.scoring}
        />
        <QuestionCard
          id="manipulation"
          text="Pratiche manipolative verso vulnerabili/minori"
          subtext="Sfrutta vulnerabilità legate a età o disabilità in modo da causare un danno fisico o psicologico?"
          value={state.manipulation}
          onChange={(val) => updateState("manipulation", val)}
          aiMeta={aiMeta.manipulation}
        />
      </div>
    </div>
  );
}
