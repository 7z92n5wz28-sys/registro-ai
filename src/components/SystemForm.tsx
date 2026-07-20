"use client";

import { useState, useEffect } from "react";
import { Info, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import SensitiveDataBanner from "./wizard/SensitiveDataBanner";

export default function SystemForm({ 
  action, 
  initialData,
  submitLabel = "Censisci e avvia valutazione AI" 
}: { 
  action: (formData: FormData) => Promise<void>,
  initialData?: any,
  submitLabel?: string
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameInput, setNameInput] = useState(initialData?.name || "");
  const [websiteInput, setWebsiteInput] = useState(initialData?.website_url || "");
  const [duplicateId, setDuplicateId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // State per banner
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(initialData?.subjects || []);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialData?.categories?.[0] || "");
  const [selectedActivity, setSelectedActivity] = useState<string>(
    initialData?.activities_didattica?.[0] || initialData?.activities_amministrazione?.[0] || ""
  );

  // Fallback state
  const [showCategoryOther, setShowCategoryOther] = useState(selectedCategory === "other");
  const [showSubjectOther, setShowSubjectOther] = useState(selectedSubjects.includes("other"));
  const [showActivityOther, setShowActivityOther] = useState(selectedActivity === "other");

  // Check for duplicates when name changes
  useEffect(() => {
    if (!nameInput || nameInput.trim().length < 2 || initialData) {
      setDuplicateId(null);
      return;
    }

    const checkDuplicate = async () => {
      setIsChecking(true);
      try {
        const res = await fetch(`/api/systems/check?name=${encodeURIComponent(nameInput.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (data.exists) {
            setDuplicateId(data.id);
          } else {
            setDuplicateId(null);
          }
        }
      } catch (e) {
        console.error("Duplicate check failed", e);
      } finally {
        setIsChecking(false);
      }
    };

    const debounceTimer = setTimeout(checkDuplicate, 500);
    return () => clearTimeout(debounceTimer);
  }, [nameInput, initialData]);

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedSubjects([val]);
    setShowSubjectOther(val === "other");
  };

  const hasWebsite = websiteInput.trim().length > 0;

  return (
    <form action={action} onSubmit={() => setIsSubmitting(true)} className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h3 className="font-semibold text-[var(--text-primary)] border-b border-[var(--border-soft)] pb-2">Dati di base</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="text-sm font-medium">Nome strumento <span className="text-red-500">*</span></label>
            <input 
              name="name" 
              type="text" 
              required 
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="es. ChatGPT" 
              className={`modal-input ${duplicateId ? 'border-amber-500 bg-amber-500/10' : ''}`} 
            />
          </div>
          <div className="form-group">
            <label className="text-sm font-medium">Fornitore / Produttore <span className="text-red-500">*</span></label>
            <input name="provider" type="text" required defaultValue={initialData?.provider} placeholder="es. OpenAI" className="modal-input" />
          </div>
          <div className="form-group md:col-span-2">
            <label className="text-sm font-medium">URL sito web (permette l'analisi AI assistita)</label>
            <input 
              name="website_url" 
              type="url" 
              value={websiteInput}
              onChange={(e) => setWebsiteInput(e.target.value)}
              placeholder="es. https://chatgpt.com" 
              className="modal-input" 
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-semibold text-[var(--text-primary)] border-b border-[var(--border-soft)] pb-2">Dettagli di utilizzo</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="text-sm font-medium">Tipologia strumento</label>
            <select 
              name="category" 
              value={selectedCategory} 
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setShowCategoryOther(e.target.value === "other");
              }}
              className="modal-input"
            >
              <option value="">Seleziona...</option>
              <option value="writing_assistant">Assistente alla scrittura</option>
              <option value="chatbot">Chatbot / Assistente virtuale</option>
              <option value="image_generator">Generatore di immagini</option>
              <option value="presentations">Creazione presentazioni</option>
              <option value="quiz">Generatore di quiz/esercizi</option>
              <option value="concept_maps">Mappe concettuali</option>
              <option value="search">Motore di ricerca AI</option>
              <option value="translation">Traduttore automatico</option>
              <option value="tts">Sintesi vocale (TTS)</option>
              <option value="stt">Trascrizione (STT)</option>
              <option value="audio">Generazione audio/musica</option>
              <option value="video">Generazione video</option>
              <option value="image_editing">Fotoritocco AI</option>
              <option value="adaptive_tutor">Tutor adattivo</option>
              <option value="admin_support">Supporto amministrativo</option>
              <option value="data_analysis">Analisi dati</option>
              <option value="coding">Assistente programmazione</option>
              <option value="accessibility_bes_dsa">Accessibilità / BES-DSA</option>
              <option value="ai_detection">Rilevamento AI (anti-plagio)</option>
              <option value="other">Altro</option>
            </select>
            {showCategoryOther && <input name="category_other" type="text" placeholder="Specifica tipologia..." className="modal-input mt-2" />}
          </div>
          
          <div className="form-group">
            <label className="text-sm font-medium">Soggetti coinvolti</label>
            <select 
              name="subject" 
              value={selectedSubjects[0] || ""} 
              onChange={handleSubjectChange}
              className="modal-input"
            >
              <option value="">Seleziona...</option>
              <option value="students">Studenti (maggiorenni)</option>
              <option value="minor_students">Studenti (minorenni)</option>
              <option value="teachers">Docenti / Educatori</option>
              <option value="ata">Personale ATA</option>
              <option value="families">Famiglie</option>
              <option value="staff">Personale e studenti</option>
              <option value="external">Esterni</option>
              <option value="no_personal_data">Nessun dato personale trattato</option>
              <option value="other">Altro</option>
            </select>
            {showSubjectOther && <input name="subject_other" type="text" placeholder="Specifica soggetti..." className="modal-input mt-2" />}
          </div>

          <div className="form-group md:col-span-2">
            <label className="text-sm font-medium">Attività a cui è applicato lo strumento</label>
            <select 
              name="activity" 
              value={selectedActivity} 
              onChange={(e) => {
                setSelectedActivity(e.target.value);
                setShowActivityOther(e.target.value === "other");
              }}
              className="modal-input"
            >
              <option value="">Seleziona...</option>
              <optgroup label="Didattica">
                <option value="teaching_materials">Creazione materiali didattici</option>
                <option value="presentations">Creazione presentazioni</option>
                <option value="quiz">Creazione verifiche/quiz</option>
                <option value="maps">Creazione mappe/schemi</option>
                <option value="images">Creazione immagini</option>
                <option value="content">Generazione testi originali</option>
                <option value="text_synthesis">Sintesi testuale/riassunto</option>
                <option value="translations">Traduzione testi</option>
                <option value="tutoring">Tutoraggio personalizzato</option>
                <option value="bes_dsa">Supporto BES/DSA</option>
                <option value="languages">Apprendimento lingue straniere</option>
                <option value="coding">Apprendimento programmazione</option>
                <option value="research">Ricerca informazioni</option>
                <option value="transcription">Trascrizione lezioni/audio</option>
                <option value="podcast">Creazione podcast/audio</option>
                <option value="video">Creazione/editing video</option>
              </optgroup>
              <optgroup label="Amministrazione">
                <option value="circulars">Stesura circolari/comunicazioni</option>
                <option value="documents">Stesura documenti formali</option>
                <option value="spreadsheets">Analisi dati/Fogli di calcolo</option>
                <option value="admin">Supporto amministrativo</option>
                <option value="chatbot">Chatbot segreteria/URP</option>
                <option value="schedules">Pianificazione/orari</option>
                <option value="pnrr">Gestione progetti PNRR</option>
              </optgroup>
              <option value="other">Altro</option>
            </select>
            {showActivityOther && <input name="activity_other" type="text" placeholder="Specifica attività..." className="modal-input mt-2" />}
          </div>

          <div className="form-group">
            <label className="text-sm font-medium">Data adozione prevista (opzionale)</label>
            <input name="adoption_date" type="date" defaultValue={initialData?.adoption_date?.split("T")[0]} className="modal-input" />
          </div>

          <div className="form-group">
            <label className="text-sm font-medium">Responsabile del processo (opzionale)</label>
            <input name="responsible_person" type="text" defaultValue={initialData?.responsible_person} placeholder="es. Mario Rossi (Animatore Digitale)" className="modal-input" />
          </div>

          <div className="form-group md:col-span-2">
            <label className="text-sm font-medium">Note aggiuntive (opzionale)</label>
            <textarea name="notes" defaultValue={initialData?.notes} placeholder="Eventuali dettagli sul contesto d'uso..." className="modal-input min-h-[100px]" />
          </div>
        </div>
      </section>

      <SensitiveDataBanner 
        subjects={selectedSubjects} 
        categories={selectedCategory ? [selectedCategory] : []} 
        activities={selectedActivity ? [selectedActivity] : []} 
      />

      {duplicateId && !initialData && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-start gap-3 mt-2">
          <AlertTriangle className="text-amber-500 mt-0.5 flex-shrink-0" size={20} />
          <div className="flex-1">
            <p className="text-sm text-amber-500 font-medium mb-1">
              Attenzione: Questo strumento è già presente nel registro.
            </p>
            <p className="text-sm text-[var(--text-secondary)] mb-3">
              Un sistema con questo nome è già stato censito in precedenza. Invece di creare un duplicato, puoi aggiornare quello esistente.
            </p>
            <Link 
              href={`/systems/${duplicateId}`} 
              className="inline-flex items-center gap-2 text-sm font-medium bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 px-4 py-2 rounded-lg transition-colors w-fit"
            >
              Vai alla scheda del sistema <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {!initialData && !duplicateId && (
        <div className="bg-[var(--color-g2-glow)] p-4 rounded-xl flex items-start gap-3 mt-4">
          <Info className="text-[var(--color-g2)] mt-0.5" size={20} />
          <p className="text-sm text-[var(--text-secondary)]">
            Proseguendo, il sistema avvierà un <strong>check automatico tramite Intelligenza Artificiale</strong> visitando il sito del fornitore. 
            {hasWebsite ? "" : " (Inserisci un sito web per consentire l'analisi automatica)."}
          </p>
        </div>
      )}

      <div className="flex justify-end gap-4 mt-2">
        <button type="button" onClick={() => window.history.back()} className="header-btn">
          Annulla
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting || !!duplicateId || isChecking} 
          className="header-btn bg-[var(--primary)] text-white border-transparent hover:bg-[var(--primary-light)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Salvataggio..." : isChecking ? "Verifica in corso..." : (hasWebsite && !initialData ? "Compila con AI" : "Salva e prosegui")}
        </button>
      </div>
    </form>
  );
}
