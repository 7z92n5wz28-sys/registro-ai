"use client";

import { useState } from "react";
import { Info } from "lucide-react";

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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h3 className="font-semibold text-[var(--text-primary)] border-b border-[var(--border-soft)] pb-2">Dati di base</h3>
        
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
            <label className="text-sm font-medium">URL sito web (usato per l'analisi AI) <span className="text-red-500">*</span></label>
            <input name="website_url" type="url" required defaultValue={initialData?.website_url} placeholder="es. https://chatgpt.com" className="modal-input" />
          </div>
        </div>
      </section>

      {!initialData && (
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
        <button type="submit" disabled={isSubmitting} className="header-btn bg-[var(--primary)] text-white border-transparent hover:bg-[var(--primary-light)] hover:text-white disabled:opacity-50">
          {isSubmitting ? "Avvio procedura..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

