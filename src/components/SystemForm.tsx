"use client";

import { useState, useEffect } from "react";
import { Info, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

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
  const [duplicateId, setDuplicateId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

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
            <label className="text-sm font-medium">URL sito web (usato per l'analisi AI) <span className="text-red-500">*</span></label>
            <input name="website_url" type="url" required defaultValue={initialData?.website_url} placeholder="es. https://chatgpt.com" className="modal-input" />
          </div>
        </div>
      </section>

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
              className="inline-flex items-center gap-2 text-sm font-medium bg-amber-500/20 text-amber-600 hover:bg-amber-500/30 px-3 py-1.5 rounded-lg transition-colors"
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
            Proseguendo, il sistema avvierà un <strong>check automatico tramite Intelligenza Artificiale</strong> visitando il sito del fornitore. Verrà generata una proposta di valutazione (tipologia, rischi, misure) che potrai successivamente <strong>verificare e integrare manualmente</strong> nel Wizard.
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
          {isSubmitting ? "Avvio procedura..." : isChecking ? "Verifica in corso..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

