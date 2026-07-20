"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Save, CheckCircle2, ShieldAlert, Bot } from "lucide-react";
import { saveEvaluationDraft, submitEvaluation } from "@/app/actions";
import Step1Screening from "./Step1Screening";
import Step2Classification from "./Step2Classification";
import Step3DpoParams from "./Step3DpoParams";
import Step4Summary from "./Step4Summary";

interface WizardProps {
  system: any;
  evaluation: any;
  aiEvidences?: any[];
}

export default function WizardShell({ system, evaluation, aiEvidences = [] }: WizardProps) {
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Helper per inizializzare lo stato dalle evidenze AI o dal DB
  const getInitVal = (key: string, dbVal: boolean | undefined | null) => {
    if (dbVal === true) return "si";
    if (dbVal === false) return "no";
    const ev = aiEvidences.find((e) => e.parameter_key === key);
    return ev?.ai_proposed_value || null;
  };

  const getAiMeta = (key: string) => {
    const ev = aiEvidences.find((e) => e.parameter_key === key);
    if (!ev) return undefined;
    return {
      value: ev.ai_proposed_value,
      rationale: ev.ai_rationale,
      sourceUrl: ev.ai_source_url,
      sourceSnippet: ev.ai_source_snippet,
      confidence: ev.ai_confidence
    };
  };

  const [state, setState] = useState({
    prohibited: {
      emotion: getInitVal("emotion", evaluation?.prohibited_emotion_recognition),
      biometric: getInitVal("biometric", evaluation?.prohibited_biometric_categorization),
      scoring: getInitVal("scoring", evaluation?.prohibited_social_scoring),
      manipulation: getInitVal("manipulation", evaluation?.prohibited_vulnerability_manipulation),
    },
    risk: {
      access: getInitVal("access", evaluation?.risk_access),
      students: getInitVal("students", evaluation?.risk_students),
      orientation: getInitVal("orientation", evaluation?.risk_orientation),
      staff: getInitVal("staff", evaluation?.risk_staff),
      exam: getInitVal("exam", evaluation?.risk_exam),
      interaction: getInitVal("interaction", evaluation?.risk_interaction),
      synthetic: getInitVal("synthetic", evaluation?.risk_synthetic),
    },
    dpoParams: {
      serverUE: getInitVal("serverUE", evaluation?.dpo_server_eu),
      extraData: getInitVal("extraData", evaluation?.dpo_extra_data_required),
      marketing: getInitVal("marketing", evaluation?.dpo_marketing),
      dpa: getInitVal("dpa", evaluation?.dpo_dpa),
      acn: getInitVal("acn", evaluation?.dpo_acn_marketplace),
      usesAI: getInitVal("usesAI", evaluation?.dpo_effective_ai_usage),
    },
    dpoOverride: {
      esitoAvallo: evaluation?.dpo_final_verdict || "in_attesa",
      noteDPO: evaluation?.dpo_motivations || "",
    }
  });

  const updateState = (section: keyof typeof state, key: string, val: string) => {
    setState((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: val
      }
    }));
  };

  const updateFullSection = (section: keyof typeof state, val: any) => {
    setState((prev) => ({
      ...prev,
      [section]: val
    }));
  };

  // Logica di derivazione automatica (regole)
  const isRuleActive = (ruleFunc: () => boolean) => ruleFunc();

  const deterministicMeta = {
    // Esempio: Se categoria = "adaptive_tutor", valuta "students" automaticamente a "si"
    students: (system.categories?.includes("adaptive_tutor") || system.activities_didattica?.includes("tutoring"))
      ? { value: "si", rationale: "La categoria 'Tutor Adattivo' influisce automaticamente sulla valutazione." } : undefined,
    
    // Esempio: Se categorie = "chatbot", interaction a "si"
    interaction: (system.categories?.includes("chatbot") || system.activities_amministrazione?.includes("chatbot"))
      ? { value: "si", rationale: "Categoria chatbot impostata nei dati di base." } : undefined,

    // Esempio: Se categorie = "image_generator", synthetic a "si"
    synthetic: (system.categories?.includes("image_generator") || system.categories?.includes("video") || system.categories?.includes("audio") || system.activities_didattica?.includes("images") || system.activities_didattica?.includes("video") || system.activities_didattica?.includes("podcast"))
      ? { value: "si", rationale: "Le attività selezionate generano contenuti sintetici testuali o multimediali." } : undefined,
  };

  // Applica le regole deterministiche allo stato attuale (senza sovrascrivere se l'utente ha modificato, o magari sì)
  // Per ora passiamo il deterministicMeta alle card, che lo mostreranno come badge "Suggerito (regola)".

  // Calcolo Rischio
  const computeRiskLevel = () => {
    const { prohibited, risk } = state;
    if (Object.values(prohibited).some(v => v === "si")) return "unacceptable";
    if (risk.access === "si" || risk.students === "si" || risk.orientation === "si" || risk.staff === "si" || risk.exam === "si") return "high";
    return "minimal"; // Minimal/Limitato
  };

  const computedRiskLevel = computeRiskLevel();

  // Calcolo DPO Score
  const computeDpoScore = () => {
    let score = 0;
    
    // Parametri DPO
    if (state.dpoParams.serverUE === "si") score += 1;
    if (state.dpoParams.serverUE === "no") score -= 1;
    
    if (state.dpoParams.extraData === "si") score -= 1;
    if (state.dpoParams.extraData === "no") score += 6;
    
    if (state.dpoParams.marketing === "si") score -= 1;
    if (state.dpoParams.marketing === "no") score += 1;
    
    if (state.dpoParams.dpa === "si") score += 3;
    if (state.dpoParams.dpa === "no") score -= 1;
    
    if (state.dpoParams.acn === "si") score += 2;
    if (state.dpoParams.acn === "no") score -= 2;
    
    if (state.dpoParams.usesAI === "si") score += 0;
    if (state.dpoParams.usesAI === "no") score += 1;
    
    return score;
  };

  const dpoScore = computeDpoScore();

  // Calcolo Verdetto
  const computeAutoVerdict = () => {
    if (dpoScore <= 0) return "rejected";
    if (dpoScore >= 1 && dpoScore <= 5) return "approved_with_conditions";
    return "approved"; // 6-9 Buono, >=10 Ottimo
  };

  const computeAutoVerdictLabel = () => {
    if (dpoScore <= 0) return "Critico";
    if (dpoScore >= 1 && dpoScore <= 5) return "Sufficiente";
    if (dpoScore >= 6 && dpoScore <= 9) return "Buono";
    return "Ottimo";
  };

  const autoVerdict = computeAutoVerdict();
  const autoVerdictLabel = computeAutoVerdictLabel();

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await saveEvaluationDraft(system.id, evaluation.id, {
        ...state,
        computedRiskLevel,
        dpoScore,
        autoVerdict
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
        ...state,
        computedRiskLevel,
        dpoScore,
        autoVerdict
      });
    } catch (e) {
      alert("Errore durante l'invio.");
      setIsSaving(false);
    }
  };

  const isBlocked = computedRiskLevel === "unacceptable";
  
  // Validation for NEXT button
  const canGoNext = () => {
    if (isBlocked && step === 1) return true; // Se inaccettabile, permettiamo di saltare a Step 4? 
    // Secondo le specs: "La procedura guidata verrà bloccata e potrai passare direttamente alla scheda di sintesi."
    if (step === 1) {
      return Object.values(state.prohibited).every(v => v !== null);
    }
    if (step === 2) {
      return Object.values(state.risk).every(v => v !== null);
    }
    if (step === 3) {
      return Object.values(state.dpoParams).every(v => v !== null);
    }
    return true;
  };

  const handleNext = () => {
    if (isBlocked && step === 1) {
      setStep(4);
    } else {
      setStep(step + 1);
    }
  };

  const aiMetaProhibited = {
    emotion: getAiMeta("emotion"),
    biometric: getAiMeta("biometric"),
    scoring: getAiMeta("scoring"),
    manipulation: getAiMeta("manipulation"),
  };

  const aiMetaRisk = {
    access: getAiMeta("access"),
    students: getAiMeta("students"),
    orientation: getAiMeta("orientation"),
    staff: getAiMeta("staff"),
    exam: getAiMeta("exam"),
    interaction: getAiMeta("interaction"),
    synthetic: getAiMeta("synthetic"),
  };

  const aiMetaDpo = {
    serverUE: getAiMeta("serverUE"),
    extraData: getAiMeta("extraData"),
    marketing: getAiMeta("marketing"),
    dpa: getAiMeta("dpa"),
    acn: getAiMeta("acn"),
    usesAI: getAiMeta("usesAI"),
  };

  const steps = [
    { num: 1, title: "Screening Pratiche", desc: "Art. 5 AI Act" },
    { num: 2, title: "Classificazione", desc: "Livello di Rischio" },
    { num: 3, title: "Parametri DPO", desc: "Verifica e Misure" },
    { num: 4, title: "Sintesi e Avallo", desc: "Registrazione finale" },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Wizard Navigation */}
      <div className="lg:w-1/4">
        <div className="card sticky top-6">
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Percorso di Valutazione</h3>
          <ul className="flex flex-col gap-4 relative">
            <div className="absolute left-3.5 top-2 bottom-4 w-px bg-[var(--border-soft)] z-0"></div>
            
            {steps.map((s) => (
              <li key={s.num} className={`flex gap-3 z-10 ${step === s.num ? 'opacity-100' : 'opacity-50'} transition-opacity`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${step === s.num ? 'bg-[var(--primary)] text-white shadow-[var(--primary-glow)]' : 'bg-[var(--bg-muted)] text-[var(--text-secondary)] border border-[var(--border-soft)]'}`}>
                  {s.num}
                </div>
                <div>
                  <p className={`text-sm font-medium ${step === s.num ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'}`}>{s.title}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{s.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Wizard Area */}
      <div className="lg:w-3/4 flex flex-col gap-6">
        
        {step === 1 && (
          <Step1Screening 
            state={state.prohibited} 
            updateState={(k, v) => updateState("prohibited", k, v)} 
            aiMeta={aiMetaProhibited}
          />
        )}

        {step === 2 && (
          <Step2Classification 
            state={state.risk}
            updateState={(k, v) => updateState("risk", k, v)}
            aiMeta={aiMetaRisk}
            deterministicMeta={deterministicMeta}
          />
        )}

        {step === 3 && (
          <Step3DpoParams 
            state={state.dpoParams}
            updateState={(k, v) => updateState("dpoParams", k, v)}
            aiMeta={aiMetaDpo}
          />
        )}

        {step === 4 && (
          <Step4Summary 
            state={state}
            updateState={updateFullSection}
            computedRiskLevel={computedRiskLevel}
            dpoScore={dpoScore}
            autoVerdict={autoVerdict}
            autoVerdictLabel={autoVerdictLabel}
            isDpo={false}
          />
        )}

        {/* Wizard Controls */}
        <div className="flex justify-between items-center mt-4">
          <button 
            onClick={() => setStep(step === 4 && isBlocked ? 1 : step - 1)} 
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
            
            {step < 4 ? (
              <button 
                onClick={handleNext}
                disabled={!canGoNext()}
                className="header-btn bg-[var(--primary)] text-white hover:bg-[var(--primary-light)] border-transparent disabled:opacity-50 disabled:pointer-events-none"
              >
                {isBlocked && step === 1 ? "Vai alla Sintesi" : "Avanti"}
                <ArrowRight size={18} />
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={isSaving}
                className="header-btn bg-[var(--primary)] text-white hover:bg-[var(--primary-light)] border-transparent disabled:opacity-50"
              >
                {isSaving ? "Salvataggio..." : "Aggiungi al Registro"}
                <CheckCircle2 size={18} />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
