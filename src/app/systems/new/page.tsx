import { createAISystem } from "@/app/actions";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import SystemForm from "@/components/SystemForm";

export default function NewSystemPage() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/" className="p-2 rounded-full hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="main-title text-2xl">Nuovo Sistema AI</h1>
          <p className="subtitle">Censisci un nuovo strumento di Intelligenza Artificiale</p>
        </div>
      </div>

      <div className="card">
        <SystemForm action={createAISystem} />
      </div>
    </div>
  );
}
