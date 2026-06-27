# Registro AI – AI ForSchool

Sistema di censimento e valutazione degli strumenti di Intelligenza Artificiale in uso nelle istituzioni scolastiche, conforme all'AI Act europeo.

## Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **AI Engine**: OpenAI gpt-4o + Tavily Search + Firecrawl
- **Deploy**: Vercel
- **Monitoring**: Sentry

## Funzionalità MVP

1. **Censimento Sistemi AI** — registrazione completa (nome, fornitore, categorie, soggetti, area d'uso)
2. **Valutazione Manuale** — wizard a 3 step con screening AI Act, misure di mitigazione, calcolo punteggio DPO
3. **Valutazione Automatica con AI** — ricerca web (Tavily), crawling sito (Firecrawl), analisi con gpt-4o
4. **Workflow Avallo DPO** — parere formale con selezione verdetto e motivazioni
5. **Esportazione CSV** — export del registro completo
6. **Dashboard** — tabella con badge stato/rischio, navigazione diretta

## Setup Locale

```bash
npm install
cp .env.example .env.local   # configura le variabili
npm run dev                   # http://localhost:3000
```

## Variabili Ambiente

| Variabile | Obbligatoria | Descrizione |
|-----------|-------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL progetto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Chiave pubblica Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ | Chiave service role (per API routes server-side) |
| `OPENAI_API_KEY` | ⚠️ | Chiave OpenAI (senza → usa mock) |
| `TAVILY_API_KEY` | ⚠️ | Chiave Tavily (senza → usa mock) |
| `FIRECRAWL_API_KEY` | ⚠️ | Chiave Firecrawl (senza → usa mock) |

> Senza le chiavi AI il sistema funziona in modalità mock, permettendo di testare tutta la UI.

## Route

```
/                                  → Dashboard
/systems/new                       → Censimento nuovo strumento
/systems/[id]                      → Dettaglio + stato valutazione
/systems/[id]/edit                 → Modifica dati base
/systems/[id]/evaluate/manual      → Wizard valutazione manuale
/systems/[id]/evaluate/dpo         → Parere formale DPO
/api/evaluate/search               → POST: Tavily + Firecrawl
/api/evaluate/analyze              → POST: Analisi OpenAI gpt-4o
/api/evaluate/[id]/verdict         → POST: Verdetto DPO
/api/export                        → GET: Export CSV
```
