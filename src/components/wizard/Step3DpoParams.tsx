import QuestionCard from "./QuestionCard";

export default function Step3DpoParams({
  state,
  updateState,
  aiMeta
}: {
  state: any;
  updateState: (key: string, val: string) => void;
  aiMeta: any;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-soft)] rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Parametri di Valutazione DPO</h2>
        <p className="text-[var(--text-secondary)]">
          Verifica i 6 parametri che determinano il punteggio e il parere automatico proposto per il DPO.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <QuestionCard
          id="serverUE"
          text="I server o i dati dello strumento sono localizzati all'interno dello Spazio Economico Europeo (UE)?"
          subtext="Un 'Sì' incrementa il punteggio (+1), un 'No' lo riduce (-1)."
          value={state.serverUE}
          onChange={(val) => updateState("serverUE", val)}
          aiMeta={aiMeta.serverUE}
        />
        <QuestionCard
          id="extraData"
          text="Lo strumento richiede l'inserimento di dati personali ulteriori oltre ai dati di login essenziali?"
          subtext="Un 'Sì' riduce il punteggio (-1), un 'No' lo incrementa fortemente (+6)."
          value={state.extraData}
          onChange={(val) => updateState("extraData", val)}
          aiMeta={aiMeta.extraData}
        />
        <QuestionCard
          id="marketing"
          text="Lo strumento utilizza i dati per inviare comunicazioni di marketing o profilazione commerciale?"
          subtext="Un 'Sì' riduce il punteggio (-1), un 'No' lo incrementa (+1)."
          value={state.marketing}
          onChange={(val) => updateState("marketing", val)}
          aiMeta={aiMeta.marketing}
        />
        <QuestionCard
          id="dpa"
          text="È presente e sottoscrivibile un Data Processing Agreement (DPA) con il fornitore?"
          subtext="Un 'Sì' incrementa fortemente il punteggio (+3), un 'No' lo riduce (-1)."
          value={state.dpa}
          onChange={(val) => updateState("dpa", val)}
          aiMeta={aiMeta.dpa}
        />
        <QuestionCard
          id="acn"
          text="Lo strumento è presente nel catalogo ACN o usa infrastruttura cloud qualificata ACN?"
          subtext="Un 'Sì' incrementa il punteggio (+2), un 'No' lo riduce (-2)."
          value={state.acn}
          onChange={(val) => updateState("acn", val)}
          aiMeta={aiMeta.acn}
        />
        <QuestionCard
          id="usesAI"
          text="Lo strumento utilizza effettivamente funzionalità di Intelligenza Artificiale?"
          subtext="Un 'Sì' ha impatto neutro (0), un 'No' incrementa il punteggio (+1) indicando minor complessità."
          value={state.usesAI}
          onChange={(val) => updateState("usesAI", val)}
          aiMeta={aiMeta.usesAI}
        />
      </div>
    </div>
  );
}
