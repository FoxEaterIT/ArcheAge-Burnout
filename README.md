# ArcheAge Burnout

Lo strumento della gilda Burnout per ArcheAge Chronicles: tutto quello che serve durante il gioco in un posto solo, in italiano. Nasce dall'Atlante dei commerci, la pagina offline della gilda, portata su Next.js.

## Sezioni

- **Rotte commerciali**: quale pacco preparare, dove portarlo e quanto rende. Ogni carico è una linea dal banco di partenza alle destinazioni, con il ricavo migliore acceso in oro. Filtri per obiettivo ("Cosa vuoi ottenere?"), ricerca, partenza, destinazione e tipo di ricompensa; totale ingredienti per 7 pacchi; ricette per banco di creazione.
- **Catalogo di Auroria**: oltre 9.500 voci tra armi, materiali, creature, missioni, abilità e zone. Esplora per categoria o cerca; filtri per categoria e rarità, ordinamento per nome o livello. I filtri stanno nell'indirizzo, quindi un link condiviso apre la stessa ricerca.
- **Schede**: a cosa serve un oggetto, chi lo rilascia, il bottino, la preparazione dei carichi, lo smontaggio, le tratte che lo danno e dove trovarlo sulla mappa. Le ricette hanno un calcolatore: scegli il livello e i pezzi, e vedi lavorazioni, oro e la catena di produzione fino ai materiali grezzi.
- **Mappa di Auroria**: cerca un oggetto e vedi i punti di raccolta, bottino e consegna. Zoom con i pulsanti, la rotella o i tasti + e −; trascina per spostarti.
- **Eventi**: countdown di Crimson Rift e Brutal Nightmare (Normal e Hard), in ora italiana e nell'ora del PC, timeline della giornata, tabella degli orari, simulazione di un orario e calendario `.ics` con avviso 10 minuti prima.
- **Character Builder**: classe, livello e punti attributo, equipaggiamento con confronto dei bonus e tempra, statistiche di combattimento e rami abilità. La build resta salvata nel browser di questo dispositivo, una per classe.

I vecchi link dell'Atlante (`…#/scheda/iron-ore`, `#/eventi`, `#/builder`) aprono la pagina nuova.

Ricavi e statistiche sono valori base dai dati RaidDex dell'8 novembre 2026: i prezzi effettivi vanno controllati in gioco.

## Sviluppo

Serve Node 22 e pnpm.

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm typecheck    # tipi, route comprese
pnpm lint
pnpm test         # logica pura con Vitest, fuso UTC
pnpm test:e2e     # Playwright su Google Chrome, a 1440 e 390 px
pnpm build
```

### Dati di gioco

Dati e immagini vengono dall'Atlante offline e sono già nel repository (`src/data/generated/`, `public/game/`). Per rigenerarli copia `Atlante dei commerci - offline.html` in `reference/atlante-dei-commerci-offline.html` (il file non è in git) e lancia:

```bash
node scripts/extract-original.mjs
```

Come è fatto l'originale e dove sta ogni dato: [`docs/porting.md`](docs/porting.md).

### Agenti AI

Regole per gli agenti in [`AGENTS.md`](AGENTS.md) (Claude Code lo legge da `CLAUDE.md`). Agenti e skill vengono dal kit di `andmils-claude-skills`: si aggiornano con `node ~/.claude-sync/kit/install.mjs` dalla radice del progetto. Contesto di prodotto e direzione grafica per la skill `impeccable` in `PRODUCT.md`, `DESIGN.md` e `.impeccable/`.
