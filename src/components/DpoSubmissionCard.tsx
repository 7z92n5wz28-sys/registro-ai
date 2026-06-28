"use client";

import { useState } from "react";
import { Mail, Check, Copy, ExternalLink, Clock } from "lucide-react";
import { markDpoRequestSent } from "@/app/actions";

export default function DpoSubmissionCard({ 
  systemId, 
  evaluationId, 
  systemName,
  riskLevel
}: { 
  systemId: string, 
  evaluationId: string,
  systemName: string,
  riskLevel: string
}) {
  const [copied, setCopied] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // Get the base URL from the browser
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const dpoLink = `${baseUrl}/dpo/evaluate/${evaluationId}`;

  const emailSubject = encodeURIComponent(`Richiesta parere DPO - Sistema AI: ${systemName}`);
  const emailBody = encodeURIComponent(
    `Gentile DPO,\n\n` +
    `Le chiediamo di esprimere il Suo parere formale in merito all'adozione del sistema di Intelligenza Artificiale "${systemName}", ai sensi del Regolamento Europeo sull'Intelligenza Artificiale (AI Act).\n\n` +
    `L'analisi preliminare ha classificato il sistema con livello di rischio: ${riskLevel === "unacceptable" ? "Inaccettabile" : riskLevel === "high" ? "Alto" : "Minimo"}.\n\n` +
    `Può prendere visione della scheda di valutazione completa ed esprimere il Suo parere vincolante cliccando sul seguente link sicuro:\n\n` +
    `${dpoLink}\n\n` +
    `Cordiali saluti.`
  );

  const mailtoLink = `mailto:?subject=${emailSubject}&body=${emailBody}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(dpoLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMarkAsSent = async () => {
    setIsPending(true);
    try {
      await markDpoRequestSent(systemId, evaluationId);
    } catch (e) {
      console.error(e);
      setIsPending(false);
    }
  };

  return (
    <div className="bg-[var(--color-g3-glow)] border border-[var(--color-g3)] p-6 rounded-xl flex flex-col items-center text-center gap-4">
      <div className="bg-white p-3 rounded-full shadow-sm">
        <Mail size={32} className="text-[var(--color-g3)]" strokeWidth={1.5} />
      </div>
      <div>
        <h3 className="font-semibold text-lg text-[var(--color-g3)]">Trasmesso al DPO per Parere</h3>
        <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-md mx-auto">
          La valutazione è completata. Puoi inviare la richiesta al tuo DPO copiando il link sicuro o generando un'email preimpostata dal tuo client.
        </p>
      </div>
      
      <div className="w-full max-w-sm mt-2 flex flex-col gap-3">
        <div className="flex bg-white border border-[var(--border-soft)] rounded-lg overflow-hidden shadow-sm">
          <input 
            type="text" 
            readOnly 
            value={dpoLink} 
            className="flex-1 px-3 py-2 text-xs font-mono text-[var(--text-secondary)] bg-transparent outline-none truncate"
          />
          <button 
            onClick={handleCopyLink}
            className="px-3 py-2 bg-[var(--bg-muted)] border-l border-[var(--border-soft)] hover:bg-gray-100 transition-colors flex items-center justify-center text-[var(--text-secondary)]"
            title="Copia link"
          >
            {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
          </button>
        </div>

        <div className="flex gap-2">
          <a 
            href={mailtoLink}
            onClick={handleMarkAsSent}
            className="flex-1 header-btn bg-[var(--color-g3)] text-white border-transparent hover:opacity-90 hover:text-white justify-center"
          >
            <Mail size={16} />
            Apri in Email
          </a>
          <button 
            onClick={handleMarkAsSent}
            disabled={isPending}
            className="flex-1 header-btn bg-white border-[var(--border-soft)] hover:bg-gray-50 justify-center text-[var(--text-primary)]"
          >
            <Check size={16} />
            {isPending ? "Salvataggio..." : "Segna come inviato"}
          </button>
        </div>
      </div>
    </div>
  );
}
