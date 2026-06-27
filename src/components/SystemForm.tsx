"use client";

import { useState } from "react";
import { Info } from "lucide-react";

const CATEGORIES = [
  { id: "writing_assistant", label: "Assistente scrittura (testi, riassunti)" },
  { id: "chatbot", label: "Chatbot (dialogo generico)" },
  { id: "image_generator", label: "Generazione immagini" },
  { id: "presentations", label: "Creazione presentazioni" },
  { id: "quiz", label: "Generazione quiz/verifiche" },
  { id: "concept_maps", label: "Mappe concettuali" },
  { id: "search", label: "Ricerca intelligente" },
  { id: "translation", label: "Traduzione" },
  { id: "coding", label: "Supporto coding/informatica" },
  { id: "accessibility_bes_dsa", label: "Accessibilità (BES/DSA)" },
  { id: "other", label: "Altro" }
];

const SUBJECTS = [
  { id: "students", label: "Studenti maggiorenni" },
  { id: "minor_students", label: "Studenti minorenni" },
  { id: "teachers", label: "Docenti" },
  { id: "ata", label: "Personale ATA" },
  { id: "families", label: "Famiglie" },
  { id: "no_personal_data", label: "Nessun dato personale inserito" }
];

const ACTIVITIES_DIDATTICA = [
  { id: "teaching_materials", label: "Creazione materiale didattico" },
  { id: "quiz", label: "Generazione verifiche e quiz" },
  { id: "tutoring", label: "Tutoraggio personalizzato" },
  { id: "bes_dsa", label: "Supporto BES/DSA" },
  { id: "research", label: "Ricerca informazioni" },
  { id: "coding", label: "Esercitazioni informatica/coding" },
  { id: "other", label: "Altro (didattica)" }
];

const ACTIVITIES_AMMINISTRAZIONE = [
  { id: "circulars", label: "Stesura circolari e comunicazioni" },
  { id: "spreadsheets", label: "Elaborazione dati/fogli calcolo" },
  { id: "schedules", label: "Gestione orari" },
  { id: "pnrr", label: "Gestione pratiche PNRR" },
  { id: "other", label: "Altro (amministrazione)" }
];

export default function SystemForm({ 
  action, 
  initialData,
  submitLabel = "Censisci e avvia valutazione" 
}: { 
  action: (formData: FormData) => Promise<void>,
  initialData?: any,
  submitLabel?: string
}) {
  const [activityArea, setActivityArea] = useState<"didattica" | "amministrazione">(
    initialData?.activity_area || "didattica"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await action(new FormData(e.currentTarget));
    } catch (error) {
      console.error(error);
      alert("Si è verificato un errore durante il salvataggio.");
      setIsSubmitting(false);
    }
  }

  const isChecked = (name: string, value: string) => {
    if (!initialData) return false;
    if (name === 'categories') return initialData.categories?.includes(value);
    if (name === 'subjects') return initialData.subjects?.includes(value);
    if (name === 'activities') {
      return initialData.activities_didattica?.includes(value) || 
             initialData.activities_amministrazione?.includes(value);
    }
    return false;
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Sezione 1: Dati Base */}
      <section className="flex flex-col gap-4">
        <h3 className="font-semibold text-[var(--text-primary)] border-b border-[var(--border-soft)] pb-2">1. Dati dello strumento</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="text-sm font-medium">Nome strumento <span className="text-red-500">*</span></label>
            <input name="name" type="text" required defaultValue={initialData?.name} placeholder="es. ChatGPT" className="modal-input" />
          </div>
          <div className="form-group">
            <label className="text-sm font-medium">Fornitore / Produttore <span className="text-red-500">*</span></label>
            <input name="provider" type="text" required defaultValue={initialData?.provider} placeholder="es. OpenAI" className="modal-input" />
          </div>
          <div className="form-group md:col-span-2">
            <label className="text-sm font-medium">URL sito web</label>
            <input name="website_url" type="url" defaultValue={initialData?.website_url} placeholder="es. https://chatgpt.com" className="modal-input" />
          </div>
        </div>
      </section>

      {/* Sezione 2: Tipologia */}
      <section className="flex flex-col gap-4">
        <h3 className="font-semibold text-[var(--text-primary)] border-b border-[var(--border-soft)] pb-2">2. Tipologia e Soggetti</h3>
        
        <div className="form-group">
          <label className="text-sm font-medium mb-2">Categorie (seleziona una o più) <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {CATEGORIES.map(cat => (
              <label key={cat.id} className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-[var(--bg-muted)]">
                <input type="checkbox" name="categories" value={cat.id} defaultChecked={isChecked('categories', cat.id)} className="rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]" />
                <span className="text-sm">{cat.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group mt-4">
          <label className="text-sm font-medium mb-2">Soggetti interessati dai dati inseriti <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {SUBJECTS.map(sub => (
              <label key={sub.id} className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-[var(--bg-muted)]">
                <input type="checkbox" name="subjects" value={sub.id} defaultChecked={isChecked('subjects', sub.id)} className="rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]" />
                <span className="text-sm">{sub.label}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* Sezione 3: Area di utilizzo */}
      <section className="flex flex-col gap-4">
        <h3 className="font-semibold text-[var(--text-primary)] border-b border-[var(--border-soft)] pb-2">3. Area d'uso e Finalità</h3>
        
        <div className="form-group">
          <label className="text-sm font-medium mb-2">Area di utilizzo principale</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="activity_area" value="didattica" checked={activityArea === "didattica"} onChange={() => setActivityArea("didattica")} className="text-[var(--primary)] focus:ring-[var(--primary)]" />
              <span>Didattica</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="activity_area" value="amministrazione" checked={activityArea === "amministrazione"} onChange={() => setActivityArea("amministrazione")} className="text-[var(--primary)] focus:ring-[var(--primary)]" />
              <span>Amministrazione e Segreteria</span>
            </label>
          </div>
        </div>

        <div className="form-group mt-4">
          <label className="text-sm font-medium mb-2">Attività specifiche previste (seleziona una o più) <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {(activityArea === "didattica" ? ACTIVITIES_DIDATTICA : ACTIVITIES_AMMINISTRAZIONE).map(act => (
              <label key={act.id} className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-[var(--bg-muted)]">
                <input type="checkbox" name="activities" value={act.id} defaultChecked={isChecked('activities', act.id)} className="rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]" />
                <span className="text-sm">{act.label}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      {!initialData && (
        <div className="bg-[var(--color-g2-glow)] p-4 rounded-xl flex items-start gap-3 mt-4">
          <Info className="text-[var(--color-g2)] mt-0.5" size={20} />
          <p className="text-sm text-[var(--text-secondary)]">
            Proseguendo con il censimento, verrà avviata la procedura di valutazione rischio ai sensi dell'AI Act. 
            Il sistema ti guiderà nei passaggi successivi per compilare l'analisi automatica tramite AI o quella manuale.
          </p>
        </div>
      )}

      <div className="flex justify-end gap-4 mt-2">
        <button type="button" onClick={() => window.history.back()} className="header-btn">
          Annulla
        </button>
        <button type="submit" disabled={isSubmitting} className="header-btn bg-[var(--primary)] text-white border-transparent hover:bg-[var(--primary-light)] hover:text-white disabled:opacity-50">
          {isSubmitting ? "Salvataggio..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
