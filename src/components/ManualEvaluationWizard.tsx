"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Save, CheckCircle2, AlertTriangle, ShieldAlert, Info } from "lucide-react";
import Link from "next/link";
import { saveEvaluationDraft, submitEvaluation } from "@/app/actions";

interface WizardProps {
  system: any;
  evaluation: any;
  aiEvidences?: any[];
}

const AI_ACT_QUESTIONS = [
  { id: "q1", text: "Il sistema sfrutta vulnerabilità legate a età, disabilità, condizioni socio-economiche (es. manipola studenti deboli)?" },
  { id: "q2", text: "Il sistema effettua classificazione sociale basata sul comportamento ('social scoring')?" },
  { id: "q3", text: "Il sistema rileva le emozioni degli studenti o del personale in classe o sul posto di lavoro?" },
  { id: "q4", text: "Il sistema categorizza dati biometrici per dedurre convinzioni, orientamento sessuale, razza?" },
  { id: "q5", text: "Il sistema viene utilizzato per determinare l'accesso alle istituzioni o valutare i risultati di apprendimento per orientare il percorso formativo?" },
];

export default function ManualEvaluationWizard({ system, evaluation, aiEvidences = [] }: WizardProps) {
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  
  const [answers, setAnswers] = useState<Record<string, "yes" | "no" | null>>({
    q1: evaluation?.prohibited_vulnerability_manipulation === true ? "yes" : evaluation?.prohibited_vulnerability_manipulation === false ? "no" : null,
    q2: evaluation?.prohibited_social_scoring === true ? "yes" : evaluation?.prohibited_social_scoring === false ? "no" : null,
    q3: evaluation?.prohibited_emotion_recognition === true ? "yes" : evaluation?.prohibited_emotion_recognition === false ? "no" : null,
    q4: evaluation?.prohibited_biometric_categorization === true ? "yes" : evaluation?.prohibited_biometric_categorization === false ? "no" : null,
    q5: evaluation?.prohibited_access_determination === true ? "yes" : evaluation?.prohibited_access_determination === false ? "no" : null,
  });

  const [dpoConditions, setDpoConditions] = useState(evaluation?.dpo_conditions || "");
  const [dpoAcn, setDpoAcn] = useState(evaluation?.dpo_acn_marketplace || false);

  // Auto-calculate risk based on answers
  const calculateRisk = () => {
    const vals = Object.values(answers);
    if (vals.some(v => v === null)) return "da_valutare"; // Incompleto
    
    // Se q1-q4 hanno almeno un SI -> Inaccettabile
    if (answers.q1 === "yes" || answers.q2 === "yes" || answers.q3 === "yes" || answers.q4 === "yes") {
      return "unacceptable";
    }
    // Se q5 ha SI -> Alto rischio
    if (answers.q5 === "yes") return "high";
    
    // Altrimenti -> Rischio Minimo/Limitato
    return "minimal";
  };

  // Auto-calculate DPO score and verdict
  const calculateDpoScore = (risk: string) => {
    let score = 0;
    if (risk === "minimal") score += 2;
    if (risk === "high") score -= 2;
    if (risk === "unacceptable") score -= 5;

    if (dpoAcn) score += 2;
    if (dpoConditions.length > 50) score += 1;

    return score;
  };

  const calculateVerdict = (risk: string, score: number) => {
    if (risk === "unacceptable") return "rejected";
    if (score < 0) return "rejected";
    if (score >= 0 && score <= 2) return "approved_with_conditions";
    return "approved";
  };

  const risk = calculateRisk();
  const dpoScore = calculateDpoScore(risk);
  const verdict = calculateVerdict(risk, dpoScore);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await saveEvaluationDraft(system.id, evaluation.id, {
        compliance_requirements: answers,
        risk_level: risk === "da_valutare" ? null : risk,
        dpo_conditions: dpoConditions,
        dpo_score: dpoScore,
        dpo_acn_marketplace: dpoAcn,
        dpo_auto_verdict: verdict
      });
      alert("Bozza salvata con successo!");
    } catch (e) {
      alert("Errore durante il salvataggio.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await submitEvaluation(system.id, evaluation.id, {
        compliance_requirements: answers,
        risk_level: risk,
        dpo_conditions: dpoConditions,
        dpo_score: dpoScore,
        dpo_acn_marketplace: dpoAcn,
        dpo_auto_verdict: verdict
      });
    } catch (e) {
      alert("Errore durante l'invio.");
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Wizard Navigation */}
      <div className="lg:w-1/4">
        <div className="card sticky top-6">
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Percorso di Valutazione</h3>
          <ul className="flex flex-col gap-4 relative">
            <div className="absolute left-3.5 top-2 bottom-4 w-px bg-[var(--border-soft)] z-0"></div>
            
            <li className={`flex gap-3 z-10 ${step === 1 ? 'opacity-100' : 'opacity-60'} transition-opacity`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${step === 1 ? 'bg-[var(--primary)] text-white shadow-[var(--primary-glow)]' : 'bg-[var(--bg-muted)] text-[var(--text-secondary)] border border-[var(--border-soft)]'}`}>
                1
              </div>
              <div>
                <p className={`text-sm font-medium ${step === 1 ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'}`}>Screening AI Act</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Analisi dei requisiti normativi</p>
              </div>
            </li>
            
            <li className={`flex gap-3 z-10 ${step === 2 ? 'opacity-100' : 'opacity-60'} transition-opacity`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${step === 2 ? 'bg-[var(--primary)] text-white shadow-[var(--primary-glow)]' : 'bg-[var(--bg-muted)] text-[var(--text-secondary)] border border-[var(--border-soft)]'}`}>
                2
              </div>
              <div>
                <p className={`text-sm font-medium ${step === 2 ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'}`}>Mitigazione e DPO</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Misure tecniche e parere DPO</p>
              </div>
            </li>

            <li className={`flex gap-3 z-10 ${step === 3 ? 'opacity-100' : 'opacity-60'} transition-opacity`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${step === 3 ? 'bg-[var(--primary)] text-white shadow-[var(--primary-glow)]' : 'bg-[var(--bg-muted)] text-[var(--text-secondary)] border border-[var(--border-soft)]'}`}>
                3
              </div>
              <div>
                <p className={`text-sm font-medium ${step === 3 ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'}`}>Sintesi e Avallo</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Revisione e conferma</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Main Wizard Area */}
      <div className="lg:w-3/4 flex flex-col gap-6">
        
        {step === 1 && (
          <div className="card !gap-6">
            <h2 className="text-lg font-semibold border-b border-[var(--border-soft)] pb-3">Step 1: Analisi Requisiti AI Act</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Rispondi alle seguenti domande per determinare il livello di rischio dello strumento secondo l'AI Act.
            </p>

            <div className="flex flex-col gap-5">
              {AI_ACT_QUESTIONS.map((q, idx) => {
                const evidence = aiEvidences.find(e => e.parameter_key === q.id || e.parameter_key.includes(`q${idx + 1}`));
                return (
                <div key={q.id} className="p-4 rounded-xl border border-[var(--border-soft)] bg-[var(--bg-muted)] hover:border-[var(--primary)] transition-colors group">
                  <p className="text-sm font-medium text-[var(--text-primary)] mb-3">
                    <span className="text-[var(--primary)] font-bold mr-2">Q{idx + 1}.</span>
                    {q.text}
                  </p>

                  {evidence && (
                    <div className="mb-4 p-3 bg-[var(--color-g2-glow)] border border-[var(--color-g2)] rounded-lg text-sm text-[var(--text-primary)] flex items-start gap-2">
                      <Info className="shrink-0 mt-0.5 text-[var(--color-g2)]" size={16} />
                      <div>
                        <strong className="text-[var(--color-g2)]">Deduzione AI ({evidence.ai_proposed_value.toUpperCase()}):</strong> {evidence.ai_rationale}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer border transition-all ${answers[q.id] === 'yes' ? 'bg-[var(--color-g4-glow)] border-[var(--color-g4)] text-[var(--color-g4)] font-medium' : 'bg-white border-[var(--border-soft)] text-[var(--text-secondary)]'}`}>
                      <input type="radio" name={q.id} value="yes" checked={answers[q.id] === 'yes'} onChange={() => setAnswers({...answers, [q.id]: "yes"})} className="hidden" />
                      Sì
                    </label>
                    <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer border transition-all ${answers[q.id] === 'no' ? 'bg-[var(--color-g1-glow)] border-[var(--color-g1)] text-[var(--color-g1)] font-medium' : 'bg-white border-[var(--border-soft)] text-[var(--text-secondary)]'}`}>
                      <input type="radio" name={q.id} value="no" checked={answers[q.id] === 'no'} onChange={() => setAnswers({...answers, [q.id]: "no"})} className="hidden" />
                      No
                    </label>
                  </div>
                </div>
              )})}
            </div>

            {risk !== "da_valutare" && (
              <div className={`mt-4 p-5 rounded-xl border flex items-start gap-4 ${risk === 'unacceptable' ? 'bg-[var(--color-g4-glow)] border-[var(--color-g4)]' : risk === 'high' ? 'bg-[var(--color-g3-glow)] border-[var(--color-g3)]' : 'bg-[var(--color-g1-glow)] border-[var(--color-g1)]'}`}>
                {risk === 'unacceptable' ? <ShieldAlert className="text-[var(--color-g4)] mt-0.5" /> : risk === 'high' ? <AlertTriangle className="text-[var(--color-g3)] mt-0.5" /> : <CheckCircle2 className="text-[var(--color-g1)] mt-0.5" />}
                <div>
                  <h4 className={`font-semibold ${risk === 'unacceptable' ? 'text-[var(--color-g4)]' : risk === 'high' ? 'text-[var(--color-g3)]' : 'text-[var(--color-g1)]'}`}>
                    Esito Previsionale: {risk === 'unacceptable' ? "Rischio Inaccettabile (Pratica Vietata)" : risk === 'high' ? "Alto Rischio" : "Rischio Minimo/Limitato"}
                  </h4>
                  <p className="text-sm opacity-80 mt-1">
                    {risk === 'unacceptable' ? "Il sistema rientra nelle pratiche vietate dall'Art. 5 dell'AI Act. Non può essere adottato." : 
                     risk === 'high' ? "Il sistema richiede misure di mitigazione stringenti, trasparenza e sorveglianza umana (Art. 6 e Allegato III)." : 
                     "Il sistema presenta requisiti minimi di conformità (es. trasparenza se chatbot)."}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="card !gap-6">
            <h2 className="text-lg font-semibold border-b border-[var(--border-soft)] pb-3">Step 2: Mitigazione e DPO</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Inserisci le misure previste per mitigare i rischi e il parere preliminare del DPO.
            </p>

            <div className="form-group">
              <label className="text-sm font-medium mb-1">Misure di Mitigazione e Condizioni d'Uso</label>
              <p className="text-xs text-[var(--text-muted)] mb-2">Es. divieto di inserimento dati personali, anonimizzazione preventiva, etc.</p>
              <textarea 
                className="modal-input min-h-[120px] resize-y" 
                placeholder="Descrivi le misure di mitigazione..."
                value={dpoConditions}
                onChange={(e) => setDpoConditions(e.target.value)}
              ></textarea>
            </div>

            <div className="form-group p-4 bg-[var(--bg-muted)] rounded-xl border border-[var(--border-soft)]">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={dpoAcn} 
                  onChange={(e) => setDpoAcn(e.target.checked)} 
                  className="rounded w-5 h-5 border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <div>
                  <span className="text-sm font-medium block">Qualificato ACN / Presente su Cloud Marketplace</span>
                  <span className="text-xs text-[var(--text-muted)]">Il fornitore ha superato i requisiti di sicurezza dell'Agenzia per la Cybersicurezza Nazionale.</span>
                </div>
              </label>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="card !gap-6">
            <h2 className="text-lg font-semibold border-b border-[var(--border-soft)] pb-3">Step 3: Sintesi e Avallo</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-[var(--bg-muted)] rounded-xl">
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">Rischio AI Act</p>
                <p className={`font-semibold capitalize ${risk === 'unacceptable' ? 'text-[var(--color-g4)]' : risk === 'high' ? 'text-[var(--color-g3)]' : 'text-[var(--color-g1)]'}`}>
                  {risk === "da_valutare" ? "Non completo" : risk === "unacceptable" ? "Inaccettabile" : risk === "high" ? "Alto" : "Minimo/Limitato"}
                </p>
              </div>
              <div className="p-4 bg-[var(--bg-muted)] rounded-xl">
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">Verdetto DPO (Calcolato)</p>
                <p className={`font-semibold capitalize ${verdict === 'rejected' ? 'text-[var(--color-g4)]' : verdict === 'approved' ? 'text-[var(--color-g1)]' : 'text-[var(--color-g2)]'}`}>
                  {verdict === "rejected" ? "Non Approvato" : verdict === "approved" ? "Approvato" : "Approvato con Condizioni"}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[var(--border-soft)]">
              <h4 className="text-sm font-semibold mb-2">Dettaglio Punteggio ({dpoScore})</h4>
              <ul className="text-sm flex flex-col gap-1 text-[var(--text-secondary)]">
                <li>Rischio {risk}: {risk === 'minimal' ? '+2' : risk === 'high' ? '-2' : '-5'}</li>
                <li>Qualificato ACN: {dpoAcn ? '+2' : '0'}</li>
                <li>Condizioni di mitigazione dettagliate: {dpoConditions.length > 50 ? '+1' : '0'}</li>
              </ul>
            </div>

            {verdict === "rejected" && (
              <div className="p-4 bg-[var(--color-g4-glow)] text-[var(--color-g4)] rounded-xl text-sm font-medium flex gap-3 items-center">
                <ShieldAlert />
                <span>Lo strumento non possiede i requisiti per l'approvazione istituzionale.</span>
              </div>
            )}
            {verdict !== "rejected" && (
              <div className="p-4 bg-[var(--color-g1-glow)] text-[var(--color-g1)] rounded-xl text-sm font-medium flex gap-3 items-center">
                <CheckCircle2 />
                <span>Lo strumento può essere sottomesso per la revisione e l'avallo formale del DPO.</span>
              </div>
            )}
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex justify-between items-center mt-4">
          <button 
            onClick={() => setStep(step - 1)} 
            disabled={step === 1}
            className="header-btn disabled:opacity-50 disabled:pointer-events-none"
          >
            <ArrowLeft size={18} />
            Indietro
          </button>
          
          <div className="flex gap-3">
            <button 
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="header-btn"
            >
              <Save size={18} />
              Salva Bozza
            </button>
            
            {step < 3 ? (
              <button 
                onClick={() => setStep(step + 1)}
                disabled={risk === "da_valutare"}
                className="header-btn bg-[var(--primary)] text-white hover:bg-[var(--primary-light)] border-transparent disabled:opacity-50 disabled:pointer-events-none"
              >
                Avanti
                <ArrowRight size={18} />
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={isSaving}
                className="header-btn bg-[var(--primary)] text-white hover:bg-[var(--primary-light)] border-transparent disabled:opacity-50"
              >
                {isSaving ? "Invio in corso..." : "Sottometti per Avallo DPO"}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
