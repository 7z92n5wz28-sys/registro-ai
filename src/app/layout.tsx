import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Registro AI - ForSchool",
  description: "Registro AI per la conformità all'AI Act per le Istituzioni scolastiche",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="light-theme">
      <body className={`${inter.className} min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased`}>
        <div className="app-container">
          <header className="app-header">
            <div className="header-logo flex items-center gap-3">
              <img src="/AI_For_School-Logo_Primario-Positivo.svg" alt="AI ForSchool Logo" className="h-10 w-auto" />
              <span className="logo-text text-[var(--text-secondary)] font-medium text-sm">Registro AI</span>
            </div>
            <div className="header-controls">
              <div className="text-sm font-medium text-[var(--text-secondary)]">
                Istituto Comprensivo Demo
              </div>
            </div>
          </header>
          
          <main className="flex-1 w-full">
            {children}
          </main>
          
          <footer className="app-footer">
            © {new Date().getFullYear()} AI ForSchool. Tutti i diritti riservati.
          </footer>
        </div>
      </body>
    </html>
  );
}
