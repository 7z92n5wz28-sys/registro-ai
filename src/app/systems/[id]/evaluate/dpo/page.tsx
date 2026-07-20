import { createClient } from "@/utils/supabase/server";
import { ArrowLeft, CheckCircle2, ShieldAlert, AlertCircle, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import DpoVerdictForm from "@/components/DpoVerdictForm";
import DpoStandaloneClient from "@/components/DpoStandaloneClient";

export default async function DpoReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params; // system ID

  const { data: evaluation, error } = await supabase
    .from("v_evaluation_detail")
    .select("*")
    .eq("ai_system_id", id)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  if (error || !evaluation) notFound();

  // Only show if in pending_review
  if (evaluation.status !== "pending_review") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center gap-6 py-10">
          {evaluation.status === "approved" || evaluation.status === "approved_with_conditions" ? (
            <CheckCircle2 size={48} className="text-[var(--color-g1)] mx-auto" />
          ) : evaluation.status === "rejected" ? (
            <ShieldAlert size={48} className="text-[var(--color-g4)] mx-auto" />
          ) : (
            <Clock size={48} className="text-[var(--text-muted)] mx-auto" />
          )}
          <div>
            <h2 className="text-xl font-semibold mb-2">
              {evaluation.status === "draft"
                ? "Valutazione non ancora completata"
                : evaluation.status === "approved" || evaluation.status === "approved_with_conditions"
                ? "Avallo DPO già rilasciato"
                : "Strumento non approvato"}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {evaluation.status === "draft"
                ? "Prima di procedere con il parere DPO, completa la valutazione dello strumento."
                : "Il parere DPO è stato già registrato per questa valutazione."}
            </p>
          </div>
          <Link href={`/systems/${id}`} className="header-btn mx-auto">
            Torna al Dettaglio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-2">
        <Link href={`/systems/${id}`} className="p-2 rounded-full hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="main-title text-2xl">Parere DPO: {evaluation.system_name}</h1>
          <p className="subtitle">Revisione finale e avallo formale ai sensi dell'AI Act</p>
        </div>
      </div>

      {/* Riepilogo valutazione */}
      <div className="card">
        <h2 className="font-semibold border-b border-[var(--border-soft)] pb-3">Sintesi della Valutazione</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-[var(--bg-muted)] rounded-xl">
            <p className="section-label mb-1">Rischio AI Act</p>
            <p className={`font-semibold capitalize text-sm ${evaluation.risk_level === "unacceptable" ? "text-[var(--color-g4)]" : evaluation.risk_level === "high" ? "text-[var(--color-g3)]" : "text-[var(--color-g1)]"}`}>
              {evaluation.risk_level === "unacceptable" ? "Inaccettabile" : evaluation.risk_level === "high" ? "Alto" : evaluation.risk_level === "minimal" ? "Minimo" : "Non valutato"}
            </p>
          </div>
          <div className="p-3 bg-[var(--bg-muted)] rounded-xl">
            <p className="section-label mb-1">Punteggio DPO</p>
            <p className="font-semibold text-sm">{evaluation.dpo_score !== null ? evaluation.dpo_score : "-"}</p>
          </div>
          <div className="p-3 bg-[var(--bg-muted)] rounded-xl">
            <p className="section-label mb-1">Verdetto Calcolato</p>
            <p className={`font-semibold text-sm ${evaluation.dpo_auto_verdict === "rejected" ? "text-[var(--color-g4)]" : evaluation.dpo_auto_verdict === "approved" ? "text-[var(--color-g1)]" : "text-[var(--color-g2)]"}`}>
              {evaluation.dpo_auto_verdict === "rejected" ? "Non Approvato" : evaluation.dpo_auto_verdict === "approved" ? "Approvato" : "Approv. con Cond."}
            </p>
          </div>
          <div className="p-3 bg-[var(--bg-muted)] rounded-xl">
            <p className="section-label mb-1">Qualif. ACN</p>
            <p className="font-semibold text-sm">{evaluation.dpo_acn_marketplace ? "Sì" : "No"}</p>
          </div>
        </div>

        {evaluation.dpo_conditions && (
          <div className="mt-2">
            <p className="section-label mb-2">Misure di mitigazione proposte</p>
            <p className="text-sm text-[var(--text-secondary)] bg-[var(--bg-muted)] p-3 rounded-xl leading-relaxed">{evaluation.dpo_conditions}</p>
          </div>
        )}

        {/* Requisiti AI Act */}
        <div className="mt-2">
          <p className="section-label mb-3">Screening AI Act</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {[
              { key: "prohibited_vulnerability_manipulation", label: "Manipolazione vulnerabilità" },
              { key: "prohibited_social_scoring", label: "Social scoring" },
              { key: "prohibited_emotion_recognition", label: "Riconoscimento emozioni" },
              { key: "prohibited_biometric_categorization", label: "Categorizzazione biometrica" },
              { key: "prohibited_access_determination", label: "Determinazione accesso istruzione" },
            ].map(({ key, label }) => {
              const val = (evaluation as any)[key];
              return (
                <div key={key} className={`flex items-center justify-between p-2.5 rounded-lg border ${val ? "border-[var(--color-g4)] bg-[var(--color-g4-glow)]" : "border-[var(--border-soft)] bg-[var(--bg-muted)]"}`}>
                  <span className={val ? "text-[var(--color-g4)]" : "text-[var(--text-secondary)]"}>{label}</span>
                  <span className={`font-semibold text-xs ${val ? "text-[var(--color-g4)]" : "text-[var(--color-g1)]"}`}>{val ? "SÌ ⚠️" : "No ✓"}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form Parere DPO */}
      <DpoStandaloneClient
        systemId={id}
        evaluationId={evaluation.id!}
        autoVerdict={(evaluation.dpo_auto_verdict as string) || ""}
        initialConditions={(evaluation.dpo_conditions as string) || ""}
        initialMotivations={(evaluation.dpo_motivations as string) || ""}
        initialVerdict={(evaluation.dpo_final_verdict as string) || ""}
      />
    </div>
  );
}
