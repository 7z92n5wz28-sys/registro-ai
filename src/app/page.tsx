import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Plus, Download, ShieldAlert, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default async function RegistryPage() {
  const supabase = await createClient();
  const { data: systems, error } = await supabase
    .from("v_registry")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching registry:", error);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="dashboard-hero">
        <div>
          <h1 className="main-title">Registro AI</h1>
          <p className="subtitle">
            Gestisci e valuta gli strumenti di Intelligenza Artificiale in uso nell’istituto.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <a href="/api/export" download className="header-btn">
            <Download size={18} />
            <span>Esporta CSV</span>
          </a>
          <Link href="/systems/new" className="header-btn bg-[var(--primary)] text-white border-transparent hover:bg-[var(--primary-light)] hover:text-white">
            <Plus size={18} />
            <span>Nuovo Sistema AI</span>
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="table-header">
          <h2>Strumenti Censiti ({systems?.length || 0})</h2>
        </div>

        <div className="responsive-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Strumento</th>
                <th>Provider</th>
                <th>Area d'Uso</th>
                <th>Stato Valutazione</th>
                <th>Rischio AI Act</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {systems && systems.length > 0 ? (
                systems.map((system) => (
                  <tr key={system.id}>
                    <td className="font-medium text-[var(--text-primary)]">
                      <div>{system.name}</div>
                      {system.website_url && (
                        <a href={system.website_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--primary)] hover:underline">{system.website_url}</a>
                      )}
                    </td>
                    <td>{system.provider || "-"}</td>
                    <td className="capitalize">{system.activity_area || "-"}</td>
                    <td>
                      <StatusBadge status={system.status} />
                    </td>
                    <td>
                      <RiskBadge level={system.risk_level} />
                    </td>
                    <td>
                      <Link href={`/systems/${system.id}`} className="text-[var(--primary)] font-medium text-sm hover:underline">
                        Dettagli
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <div className="text-center py-14 flex flex-col items-center gap-3">
                      <AlertCircle size={40} className="text-[var(--text-muted)]" strokeWidth={1.5} />
                      <p className="text-[var(--text-muted)] font-medium">Nessun sistema AI censito</p>
                      <p className="text-sm text-[var(--text-muted)]">Inizia aggiungendo il primo strumento AI in uso nell’istituto.</p>
                      <Link href="/systems/new" className="header-btn bg-[var(--primary)] text-white border-transparent hover:bg-[var(--primary-light)] hover:text-white mt-2">
                        <Plus size={16} />
                        Aggiungi il primo strumento
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  const statusMap: Record<string, { label: string, colorClass: string, icon: any }> = {
    'draft': { label: 'Bozza', colorClass: 'text-[var(--text-secondary)] bg-[var(--bg-muted)]', icon: Clock },
    'pending_review': { label: 'In revisione', colorClass: 'text-[var(--color-g3)] bg-[var(--color-g3-glow)]', icon: Clock },
    'approved': { label: 'Approvato', colorClass: 'text-[var(--color-g1)] bg-[var(--color-g1-glow)]', icon: CheckCircle2 },
    'approved_with_conditions': { label: 'Approv. con cond.', colorClass: 'text-[var(--color-g2)] bg-[var(--color-g2-glow)]', icon: CheckCircle2 },
    'rejected': { label: 'Non Approvato', colorClass: 'text-[var(--color-g4)] bg-[var(--color-g4-glow)]', icon: ShieldAlert },
    'archived': { label: 'Archiviato', colorClass: 'text-[var(--text-secondary)] bg-[var(--bg-muted)]', icon: Clock },
  };

  const config = statusMap[status || 'draft'] || statusMap['draft'];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.colorClass}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
}

function RiskBadge({ level }: { level: string | null }) {
  if (!level) return <span className="text-[var(--text-muted)]">Da valutare</span>;
  
  const riskMap: Record<string, { label: string, colorClass: string }> = {
    'unacceptable': { label: 'Inaccettabile', colorClass: 'text-[var(--color-g4)] bg-[var(--color-g4-glow)]' },
    'high': { label: 'Alto Rischio', colorClass: 'text-[var(--color-g3)] bg-[var(--color-g3-glow)]' },
    'limited': { label: 'Limitato', colorClass: 'text-[var(--color-g2)] bg-[var(--color-g2-glow)]' },
    'minimal': { label: 'Minimo', colorClass: 'text-[var(--color-g1)] bg-[var(--color-g1-glow)]' },
  };

  const config = riskMap[level];

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.colorClass}`}>
      {config.label}
    </span>
  );
}
