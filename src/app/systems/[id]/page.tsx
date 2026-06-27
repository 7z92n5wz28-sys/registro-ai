import { createClient } from "@/utils/supabase/server";
import { ArrowLeft, Pencil, ShieldAlert, AlertTriangle, FileText, CheckCircle2, Clock, XCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function SystemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: system, error } = await supabase
    .from("v_evaluation_detail")
    .select("*")
    .eq("ai_system_id", id)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching system detail:", error);
  }

  // Se non c'è ancora una valutazione associata in v_evaluation_detail, potremmo dover leggere solo da ai_systems
  // ma nella nostra action di creazione, creiamo sempre la bozza. Se per qualche motivo manca:
  let displayData: any = system;
  
  if (!displayData) {
    const { data: rawSystem } = await supabase.from("ai_systems").select("*").eq("id", id).single();
    if (!rawSystem) notFound();
    displayData = { ...rawSystem, ai_system_id: id, status: "draft" } as any;
  }

  if (!displayData) return null;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 rounded-full hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="main-title text-2xl">{displayData.system_name || displayData.name}</h1>
            <p className="subtitle">{displayData.provider} • {displayData.website_url}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href={`/systems/${id}/edit`} className="header-btn">
            <Pencil size={16} />
            <span>Modifica Base</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonna principale */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="card !gap-6">
            <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-4">
              <h2 className="font-semibold text-[var(--text-primary)]">Stato Valutazione AI Act</h2>
              <StatusBadge status={displayData.status} />
            </div>
            
            {displayData.status === "draft" && (
              <div className="bg-[var(--bg-muted)] p-6 rounded-xl flex flex-col items-center justify-center text-center gap-4 border border-[var(--border-soft)]">
                <ShieldAlert className="text-[var(--text-secondary)]" size={48} strokeWidth={1.5} />
                <div>
                  <h3 className="font-semibold text-lg text-[var(--text-primary)]">Valutazione non avviata</h3>
                  <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto mt-1">
                    Questo strumento è stato censito ma non è ancora stata completata la valutazione dei rischi ai sensi dell'AI Act.
                  </p>
                </div>
                <div className="flex gap-4 mt-4">
                  <Link href={`/systems/${id}/evaluate/manual`} className="header-btn bg-[var(--text-primary)] text-white hover:bg-[var(--text-secondary)] hover:text-white border-transparent">
                    <FileText size={16} />
                    <span>Verifica Risultati AI e Compila Manualmente</span>
                  </Link>
                </div>
              </div>
            )}
            
            {/* Valutazione in attesa di revisione DPO */}
            {displayData.status === "pending_review" && (
              <div className="bg-[var(--color-g3-glow)] border border-[var(--color-g3)] p-5 rounded-xl flex flex-col items-center text-center gap-3">
                <Clock size={36} className="text-[var(--color-g3)]" strokeWidth={1.5} />
                <div>
                  <h3 className="font-semibold text-[var(--color-g3)]">In attesa del Parere DPO</h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">La valutazione è stata completata. Il DPO deve ora rilasciare il parere formale.</p>
                </div>
                <Link href={`/systems/${id}/evaluate/dpo`} className="header-btn bg-[var(--color-g3)] text-white border-transparent hover:opacity-90 hover:text-white mt-1">
                  <ExternalLink size={15} />
                  Rilascia Parere DPO
                </Link>
              </div>
            )}

            {/* Valutazione con risultati */}
            {(displayData.status === "approved" || displayData.status === "approved_with_conditions" || displayData.status === "rejected") && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-[var(--bg-muted)] flex flex-col gap-1">
                    <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Livello di Rischio</span>
                    <span className={`font-semibold text-base capitalize ${
                      displayData.risk_level === "unacceptable" ? "text-[var(--color-g4)]" :
                      displayData.risk_level === "high" ? "text-[var(--color-g3)]" : "text-[var(--color-g1)]"
                    }`}>
                      {displayData.risk_level === "unacceptable" ? "Inaccettabile" : displayData.risk_level === "high" ? "Alto" : displayData.risk_level === "minimal" ? "Minimo" : "-"}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-[var(--bg-muted)] flex flex-col gap-1">
                    <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Punteggio DPO</span>
                    <span className="font-semibold text-base">{displayData.dpo_score !== null ? displayData.dpo_score : "-"}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[var(--bg-muted)] flex flex-col gap-1">
                    <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Qualificato ACN</span>
                    <span className="font-semibold text-base">{displayData.dpo_acn_marketplace ? "Sì" : "No"}</span>
                  </div>
                </div>
                {displayData.dpo_conditions && (
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Condizioni d'Uso</p>
                    <p className="text-sm text-[var(--text-secondary)] bg-[var(--bg-muted)] p-3 rounded-xl leading-relaxed">{displayData.dpo_conditions}</p>
                  </div>
                )}
                {displayData.dpo_motivations && (
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Motivazione Parere DPO</p>
                    <p className="text-sm text-[var(--text-secondary)] bg-[var(--bg-muted)] p-3 rounded-xl leading-relaxed">{displayData.dpo_motivations}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="font-semibold text-[var(--text-primary)] border-b border-[var(--border-soft)] pb-4 mb-4">Informazioni Tecniche</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1">Categorie</span>
                <div className="flex flex-wrap gap-2">
                  {displayData.categories?.map((c: string) => (
                    <span key={c} className="px-2 py-1 bg-[var(--bg-muted)] text-[var(--text-secondary)] rounded-md text-xs">{c}</span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1">Area di Utilizzo</span>
                <span className="px-2 py-1 bg-[var(--bg-muted)] text-[var(--text-secondary)] rounded-md text-xs capitalize">{displayData.activity_area}</span>
              </div>
              <div className="col-span-2">
                <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1">Soggetti Interessati</span>
                <div className="flex flex-wrap gap-2">
                  {displayData.subjects?.map((s: string) => (
                    <span key={s} className="px-2 py-1 bg-[var(--bg-muted)] text-[var(--text-secondary)] rounded-md text-xs">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <div className="card !p-5">
            <h3 className="font-semibold text-[var(--text-primary)] text-sm mb-4">Metadati</h3>
            <ul className="flex flex-col gap-3 text-sm">
              <li className="flex justify-between">
                <span className="text-[var(--text-muted)]">Data Censimento:</span>
                <span className="font-medium">{new Date(displayData.created_at).toLocaleDateString("it-IT")}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-[var(--text-muted)]">Stato Servizio:</span>
                <span className="font-medium text-[var(--color-g1)]">Attivo</span>
              </li>
              <li className="flex justify-between">
                <span className="text-[var(--text-muted)]">Versione:</span>
                <span className="font-medium">v{displayData.version || 1}</span>
              </li>
            </ul>
          </div>
          
          <div className="card !p-5 !bg-[#FDF9F0] border-[#FDEBCE]">
            <div className="flex items-center gap-2 mb-2 text-[var(--color-g3)]">
              <AlertTriangle size={18} />
              <h3 className="font-semibold text-sm">Attenzione</h3>
            </div>
            <p className="text-xs text-[#8C6B20] leading-relaxed">
              Finché la valutazione non è stata approvata dal DPO, l'uso di questo strumento a fini istituzionali o didattici con dati personali non è autorizzato ai sensi dell'AI Act.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return null;
  
  const statusMap: Record<string, { label: string, colorClass: string, icon: any }> = {
    'draft': { label: 'Bozza', colorClass: 'text-[var(--text-secondary)] bg-[var(--bg-muted)]', icon: Clock },
    'pending_review': { label: 'In revisione', colorClass: 'text-[var(--color-g3)] bg-[var(--color-g3-glow)]', icon: Clock },
    'approved': { label: 'Approvato', colorClass: 'text-[var(--color-g1)] bg-[var(--color-g1-glow)]', icon: CheckCircle2 },
    'approved_with_conditions': { label: 'Approv. con cond.', colorClass: 'text-[var(--color-g2)] bg-[var(--color-g2-glow)]', icon: CheckCircle2 },
    'rejected': { label: 'Non Approvato', colorClass: 'text-[var(--color-g4)] bg-[var(--color-g4-glow)]', icon: ShieldAlert },
    'archived': { label: 'Archiviato', colorClass: 'text-[var(--text-secondary)] bg-[var(--bg-muted)]', icon: Clock },
  };

  const config = statusMap[status] || statusMap['draft'];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.colorClass}`}>
      <Icon size={14} />
      {config.label}
    </span>
  );
}
