# ArcheAge Burnout: regole per gli agenti

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- kit:section project -->
## Il progetto

ArcheAge Burnout è lo strumento della gilda Burnout per ArcheAge Chronicles: rotte commerciali e ricette per banco di creazione, catalogo degli oggetti, eventi con countdown ed export `.ics`, character builder e mappa di Auroria. Nasce da un'unica pagina HTML offline, "Atlante dei commerci", che portiamo su Next.js.

L'originale è `reference/atlante-dei-commerci-offline.html` (31 MB, fuori da git): fonte di verità per dati e comportamento finché il porting non è finito. Prima di leggerlo o estrarne dati, `docs/porting.md` (come aprirlo e dove sta ogni dato).

Documenti in `docs/`: piani in `docs/plans/`, esiti in `docs/outcomes/`. Interfaccia, commenti e documentazione in italiano; i nomi del gioco (oggetti, luoghi, eventi) restano in inglese come nel client. Commit in inglese, Conventional Commits.

Risposte in chat: stile della skill `caveman` (`.agents/skills/caveman/SKILL.md`) dalla prima risposta, con le sue eccezioni; risposte lunghe solo su richiesta, "stop caveman" lo spegne. Codice, documenti, commit e piani in prosa normale.

<!-- kit:section decisions -->
## Decisioni prese

- 2026-11-25: il prodotto si chiama ArcheAge Burnout; "Atlante dei commerci" era il nome del file offline.
- 2026-11-25: porting su Next.js (App Router) + React + TypeScript + Tailwind CSS + shadcn/ui; scaffold fatto con `create-next-app` 16.4.6 e `shadcn` 4.23.0.
- 2026-11-25: i dati si estraggono dall'originale con uno script ripetibile, mai ricopiati a mano (`docs/porting.md`).
- Rami: `main` è il ramo stabile. Ogni modifica parte da un branch staccato da `main` e ci torna con un merge. Niente merge e niente push senza richiesta. Un branch unito si cancella, in locale e su GitHub.
- Si usa pnpm. Mai npm o yarn.
- Prima di ogni merge, controllo del branch intero (`git diff main...<branch>`) con un `code-reviewer`: qualità, performance, bug. Si correggono i problemi, ognuno con il suo test quando è un bug, e si rilanciano le prove.
- Design: si parte da `impeccable`. Contesto di prodotto e stile stanno in `PRODUCT.md` e `DESIGN.md` in radice, da creare con `/impeccable init` e `/impeccable document`. `design-taste-frontend` e `high-end-visual-design` alzano la qualità visiva; gli agent `impeccable-*` servono per asset, documentazione dello stile e revisione finale.
- Consumo di token (abbonamenti Pro): la sessione gira su Sonnet con effort medium (`.claude/settings.json`); Opus con effort high solo per piani grandi, architettura e la review del branch prima del merge. I subagent si lanciano sempre con `model` ed `effort` espliciti: `implementer`, `debugger`, `test-engineer`, `doc-writer`, `git-master`, `designer`, `Explore` su Sonnet medium. Superpowers è spento in questo progetto: come riaccenderlo è in `CLAUDE.md`.

<!-- kit:section stack -->
## Stack e cartelle

Next.js 16 (App Router, `src/`) + React 19 + TypeScript. UI: Tailwind CSS v4 e shadcn/ui (Radix, preset Nova, lucide-react). Gestore pacchetti pnpm, alias `@/*` → `src/*`.

- `src/app/`: route. `next.config.ts` ha `cacheComponents` e `partialPrefetching` accesi (default di Next 16.4): per cache e prefetch valgono le skill `next-cache-components-*` e `next-partial-prefetching-*`.
- `src/components/ui/`: componenti shadcn (`pnpm dlx shadcn@latest add <nome>`), si possono modificare segnando le modifiche con `Burnout:`. `cn` arriva dal pacchetto `cn` di shadcn, non da `clsx` + `tailwind-merge`.
- `src/lib/`: logica pura da testare (rotte, ricette, orari degli eventi, statistiche del builder). `game-data.utils.ts` è l'unico accesso ai JSON di `src/data/generated/` ed è `server-only`: ai componenti client passa solo il sottoinsieme che serve.
- `src/hooks/`: custom hook (`use-*.ts`), uno per file.
- `e2e/`: test Playwright.

Convenzioni dei file (2026-11-25, decise dal proprietario):
- tipi e interfacce in file `*.types.ts`;
- funzioni e costanti in file `*.utils.ts`, con i test accanto (`*.utils.test.ts`);
- stato, effetti e logica dei componenti client in custom hook;
- i file `.tsx` contengono solo TSX: niente calcoli, niente tipi esportati, pochissima logica;
- best practice React e Next.js secondo la skill `vercel-react-best-practices`: Server Components di default, `"use client"` solo dove serve interazione, dati minimi passati al client, nessun componente definito dentro un altro.

<!-- kit:section checks -->
## Prove

| Dove | Comando | Cosa prova |
|---|---|---|
| radice | `pnpm typecheck` | `next typegen` + `tsc`, tipi delle route compresi |
| radice | `pnpm lint` | ESLint di Next.js (`.agents`, `.claude`, `.codex`, `reference` esclusi) |
| radice | `pnpm test` | Vitest, logica pura in `src/**/*.test.ts`, `TZ=UTC` |
| radice | `pnpm build` | build di produzione |
| radice | `pnpm test:e2e` | Playwright con Google Chrome installato, a 1440 e 390 px; riusa il `pnpm dev` sulla porta 3000 se è già aperto |

Dopo ogni modifica: `pnpm typecheck`, `pnpm lint`, `pnpm test`. Ogni sezione portata ha un test che confronta i suoi dati e calcoli con l'originale, e un test e2e del percorso principale.

<!-- kit:section roles -->
## Ruoli e dati sensibili

Nessun login, nessun ruolo, nessun dato personale: solo dati di gioco. Le build del character builder restano nel browser (`localStorage`, nell'originale chiavi `burnout-character-v1` e `burnout-draft-<archetipo>`).

<!-- kit:section domain -->
## Regole di dominio

- Eventi: gli orari in `eventTypes` sono ore UTC che si ripetono ogni giorno (le mezze ore come `3.5`), con durata in minuti. L'interfaccia li mostra nell'ora di Roma (`Europe/Rome`) e nell'ora del PC; l'export `.ics` usa UTC con `RRULE:FREQ=DAILY`. I test fissano l'istante e girano con `TZ=UTC`; skill `dates-and-time-zones`.
- Oro e quantità: nell'originale le stringhe sono in formato inglese (`41,067 Gold`). Nei dati diventano numeri interi; a schermo si formattano `it-IT`.
- Un prezzo marcato "da verificare al banco" o un pacco "non più craftabile" resta segnalato come tale, mai stimato.

<!-- kit:section integrations -->
## Integrazioni esterne

Nessuna. L'app funziona con i soli dati inclusi; niente chiamate a server di gioco o siti terzi.

<!-- kit:section style -->
## Stile grafico

L'originale: tema scuro "pergamena e oro" (fondo `#191817`, inchiostro `#e5dcc6`, oro `#dbc393`, linee `#625644`), titoli Georgia, testo Segoe UI, angoli vivi, bordi doppi. Fino a `DESIGN.md` vale come riferimento; dopo, vince `DESIGN.md`. Tono: italiano semplice, da compagno di gilda.

<!-- BEGIN:kit -->
## How we work

- **Flow:** idea, then a design or plan in the docs folder named in `project`, then task by task with the test written before the code, then the checks in `checks`, then the outcome in the docs folder.
- **Language:** code, docs and messages follow the languages set in `project`. At most one question at a time, with the recommended option.
- **Git:** small conventional commits, closed by the agent's attribution lines, adding files by name. No merge, PR or push unless asked. The stable branch is the one set in `decisions`.
- **Secrets and sensitive data:** never in chat or in the repository. Commands that ask for a password are run by the user. What the agent does not read is listed in `roles`.
- **Before saying "done":** run the checks in `checks` and report the real result.
- **Token budget:** every subagent start reloads the whole context, so use them sparingly. A plan of up to 4 tasks runs inline in the main session, without subagents. Pass `model` and `effort` on every subagent call: routine work (implement, debug, tests, docs, git, search) on the cheaper model at medium effort, the strongest model only for plans, architecture and the branch review. Run the checks directly instead of launching `verifier`, unless their output is long.
- **Superpowers:** with `subagent-driven-development` the implementer is `implementer` and the one review is `code-reviewer` on the whole branch at the end, not after every task. Spec and quality reviewers per task are skipped. Plans name files, signatures and the tests to write; they do not paste the full code the implementer will write.

## Agents and reviews

The kit agents are in `.claude/agents/` (Claude Code, Cursor), `.codex/agents/` (Codex) and `.gemini/agents/` (Gemini CLI); each one's description says when to use it: `architect`, `planner` (docs only), `implementer`, `code-reviewer`, `verifier`, `debugger`, `test-engineer`, `doc-writer`, `git-master` (git only), `designer`, and the read-only specialists `security-reviewer`, `access-reviewer`, `domain-guardian`, `integration-guardian`. Reviews:
- `code-reviewer` once on the whole branch before the merge, applying the specialists' checks for the topics it touches;
- `access-reviewer` at the end of each pair of tasks that touches permissions or schema;
- `security-reviewer`, `domain-guardian`, `integration-guardian` and `verifier` at the end of the plan, when their topic is touched.

Lasting decisions go in `decisions` or the docs folder, not only in an agent's local memory. Skills sit in `.agents/skills/` (`.claude/skills` links to it). The kit writes this block, its agents and its skills: change them in the kit, not here, then run `node ~/.claude-sync/kit/install.mjs` from the project root. The project's own agents and skills sit beside the kit's, under other names.
<!-- END:kit -->
