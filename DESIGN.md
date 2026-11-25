---
name: ArcheAge Burnout
description: Strumento di gilda per ArcheAge Chronicles, notte di zinco con una linea d'oro accesa che collega ogni relazione dell'app.
colors:
  bg: "#09090b"
  surface: "#141416"
  raised: "#1c1c20"
  line: "#27272a"
  line-strong: "#3f3f46"
  ink: "#f4f4f5"
  ink-2: "#d4d4d8"
  muted: "#a1a1aa"
  dim: "#8a8a94"
  gold: "#fee685"
  gold-strong: "#ffd230"
  on-gold: "#18181b"
  copper: "oklab(0.555 0.107 0.123)"
  rift: "#ff8a73"
  nightmare: "#c3a6ff"
  gain: "#b9df99"
  loss: "#ffb4a9"
typography:
  display:
    fontFamily: "Marcellus, Georgia, serif"
    fontSize: "2.25rem"
    fontWeight: 400
    lineHeight: 1.11
    letterSpacing: "0em"
  headline:
    fontFamily: "Marcellus, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.33
  title:
    fontFamily: "Marcellus, Georgia, serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.4
  body:
    fontFamily: "Noto Sans, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: "Noto Sans, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.33
  countdown:
    fontFamily: "Noto Sans, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
    fontFeature: "tnum"
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  icon-frame: "4px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  gutter: "40px"
  rail: "92px"
components:
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.on-gold}"
    rounded: "{rounded.lg}"
    height: "32px"
    padding: "0 10px"
  button-outline:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    height: "36px"
  input-field:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    height: "36px"
    padding: "0 10px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "20px"
  nav-item:
    textColor: "{colors.muted}"
    rounded: "{rounded.lg}"
    width: "76px"
  nav-item-active:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.gold}"
  badge-best:
    backgroundColor: "{colors.gold}"
    textColor: "#000000"
    rounded: "{rounded.sm}"
    padding: "1px 6px"
  icon-frame:
    backgroundColor: "{colors.raised}"
    rounded: "{rounded.icon-frame}"
---

# Design System: ArcheAge Burnout

## Overview

**Creative North Star: "La Linea di Auroria"**

L'app è una mappa di trasporto notturna disegnata con i colori di ArcheAge Chronicles: fondo di zinco quasi nero, testo freddo e una sola linea calda che si accende dove conta. Ogni relazione dei dati è resa come linea con fermate: dalla partenza alle destinazioni di un pacco, dalle aperture degli eventi alla giornata. Il valore migliore è la tratta accesa in oro, il resto resta spento sulla linea grigia.

Chi la usa è un membro della gilda accanto al gioco, in alt-tab, e cerca una risposta in pochi secondi. Per questo la superficie è densa ma ferma: righe pulite, numeri tabellari, bordi sottili al posto delle ombre, nessun movimento che non porti informazione. I titoli in Marcellus danno il tono del lettering del gioco; tutto il resto è Noto Sans leggibile a 14px.

L'arte di gioco (icone, glifi della barra, emblema della gilda) entra nel sistema così com'è, in cornici scure o come maschera tinta dal colore del testo, mai ridisegnata. Dove il gioco non offre un glifo, le icone d'interfaccia sono lucide.

**Key Characteristics:**
- Notte di zinco in tema unico scuro (`color-scheme: dark`), nessun tema chiaro.
- Una sola linea d'oro accesa per schermata: la rotta migliore, la sezione attiva, il link.
- Profondità per strati tonali e bordi da 1px, non per ombre.
- Le relazioni sono linee con nodi (rotte, prossime aperture, fascia oraria), non schede uguali.
- Numeri sempre tabellari (`tabular-nums`) e in formato `it-IT`.
- Colore come informazione: corallo per Crimson Rift, lilla per Brutal Nightmare, oro per il valore.

## Colors

Zinco quasi nero con oro ambra come unico accento caldo; corallo e lilla identificano le due famiglie di eventi.

### Primary
- **Oro Chiaro d'Ambra** (`{colors.gold}`, #fee685): la linea accesa, i link, la sezione attiva, i titoli di gruppo nel catalogo, il fondo del bottone primario (con testo `{colors.on-gold}`), l'anello di focus e il cursore del testo.
- **Oro Pieno** (`{colors.gold-strong}`, #ffd230): solo dove serve più saturazione dell'oro chiaro su fondo scuro, come i punti della mappa, le caselle spuntate e il nodo selezionato nell'albero dei tratti.

### Secondary
- **Rame** (`{colors.copper}`, `oklab(0.555 0.107 0.123)`, circa #bb4d00): token dichiarato per le etichette, ma nella build non è ancora usato da nessun componente.
- **Corallo del Rift** (`{colors.rift}`, #ff8a73): famiglia Crimson Rift, per titoli di stato, countdown e nodi della colonna "Prossime aperture".
- **Lilla dell'Incubo** (`{colors.nightmare}`, #c3a6ff): famiglia Brutal Nightmare, stessi ruoli del corallo.

### Neutral
- **Notte di Zinco** (`{colors.bg}`, #09090b): fondo della pagina e fondo dei nodi sulla linea.
- **Lastra** (`{colors.surface}`, #141416): carte, barra laterale e barra in basso.
- **Lastra Sollevata** (`{colors.raised}`, #1c1c20): hover, voce di navigazione attiva, popover e sfondo dei tratti non appresi.
- **Filo** (`{colors.line}`, #27272a): bordi delle carte, dei separatori e dell'intestazione.
- **Filo Forte** (`{colors.line-strong}`, #3f3f46): la dorsale spenta della linea, i bordi dei controlli, i nodi non evidenziati.
- **Inchiostro** (`{colors.ink}`, #f4f4f5): testo principale e titoli.
- **Inchiostro Secondario** (`{colors.ink-2}`, #d4d4d8): destinazioni non migliori, valori, testo corrente nelle liste.
- **Grigio Fumo** (`{colors.muted}`, #a1a1aa): descrizioni, etichette di navigazione a riposo, ingredienti.
- **Grigio Spento** (`{colors.dim}`, #8a8a94): placeholder, conteggi, note a piè di pagina.
- **Guadagno** (`{colors.gain}`, #b9df99) e **Perdita** (`{colors.loss}`, #ffb4a9): variazioni delle statistiche nel selettore dell'equipaggiamento; la perdita fa anche da colore di errore e di distruzione.

### Named Rules
**The One Lit Line Rule.** In ogni gruppo l'oro accende una sola cosa: il valore migliore, la voce attiva o il link. Due elementi dorati allo stesso livello si annullano.

**The Event Family Rule.** Corallo e lilla appartengono agli eventi e a nient'altro: non decorano, dicono a quale famiglia appartiene una fascia, un nodo o un countdown.

**The Zinc Steps Rule.** I grigi sono una scala a gradini fissi (bg, surface, raised, line, line-strong). Non si inventano grigi intermedi.

## Typography

**Display Font:** Marcellus (con Georgia, serif), variabile `--font-title`, classe `font-display`
**Body Font:** Noto Sans (con system-ui, sans-serif), variabile `--font-text`, default di `html`

**Character:** Un titolo scolpito e un po' epico accanto a un testo neutro e molto leggibile; il contrasto è tra lettering di gioco e testo di strumento. Marcellus ha un solo peso (400): la gerarchia si fa con la dimensione, non con il grassetto.

### Hierarchy
- **Display** (Marcellus 400, 1.875rem su mobile, 2.25rem da `sm`, interlinea 1.11-1.2): `h1` di ogni pagina nell'intestazione, con sottotitolo in `{colors.muted}` a 14px sotto.
- **Headline** (Marcellus 400, 1.5rem): titoli di sezione grandi, come "Esplora per categoria".
- **Title** (Marcellus 400, 1.25rem o 1.125rem): sezioni dentro le carte e dentro le pagine, "Prossime aperture", righe evento, gruppi del catalogo.
- **Body** (Noto Sans 400, 0.875rem, interlinea 1.25rem): tutto il testo operativo; i nomi di carico a 1.125rem medium.
- **Label** (Noto Sans 400, 0.75rem): ingredienti, note, assi, intestazioni di campo dei filtri; le etichette della navigazione scendono a 11px.
- **Countdown** (Noto Sans 600, 1.875rem, tracking -0.025em, `tabular-nums`): il conto alla rovescia degli eventi, colorato dalla famiglia quando l'evento è in corso.

### Named Rules
**The Tabular Numbers Rule.** Prezzi, countdown, conteggi e assi orari usano `tabular-nums`; gli importi si mostrano `it-IT` con il separatore delle migliaia (`47.385 oro`).

**The Lettering Is for Titles Rule.** Marcellus vale per titoli e nomi di sezione; mai per corpo, tabelle o numeri.

## Layout

Guscio a due colonne: barra laterale fissa da 92px a sinistra (emblema e cinque sezioni), contenuto a destra. Sotto `md` la barra diventa una barra in basso a cinque colonne con padding di sicurezza e il contenuto lascia 5rem in fondo; compare un'intestazione compatta con emblema e nome. Il piè di pagina ha dati e cartografia.

Ogni pagina ha un'intestazione con filo sotto (titolo a sinistra, controlli a destra), poi il corpo. I margini laterali sono 16px su mobile, 24px da `sm`, 40px da `lg`; il respiro verticale è 24px sopra e 20px sotto l'intestazione. Il ritmo interno procede a passi di 4/8/12/16/20px, con gap di 16px tra carte e 32px tra gruppi di pagina.

Le Rotte sono una griglia di carichi a due colonne con una colonna destra fissa da 260px (da `xl`) per le prossime aperture, appiccicata sotto l'intestazione. La scheda di un oggetto usa una colonna laterale appiccicata per la mappa (circa un terzo) e una principale (due terzi). Gli Eventi sono righe a tre zone (220px titolo, fascia flessibile, 150px countdown). Il catalogo resta una griglia di categorie (cinque colonne da `xl`) perché su una pagina operativa lo schema noto serve a trovare in fretta. I filtri si dispongono in griglia e su mobile si ripiegano.

### Named Rules
**The Rail Never Moves Rule.** La navigazione laterale (o in basso) ha sempre le stesse cinque voci nello stesso ordine, con parità tra le sezioni; nessuna è promossa o nascosta.

## Elevation & Depth

La profondità è tonale e piatta: pagina, lastra, lastra sollevata, separati da filo da 1px. Le carte non hanno ombra a riposo. L'unico bagliore del sistema è dell'informazione: la linea d'oro accesa (`box-shadow: 0 0 10px var(--gold)`) sulla tratta migliore e sul suo nodo, e l'indicatore dell'ora corrente sulla fascia degli eventi (`0 0 6px white`). L'anello di focus è un contorno oro da 2px con scarto di 2px, che i controlli shadcn completano con un anello da 3px a metà opacità. Un'ombra morbida compare solo nei popover dei menu.

### Named Rules
**The Glow Means Data Rule.** Il bagliore è riservato alla tratta migliore e al "ora" degli eventi. Un bagliore su un elemento che non porta informazione è decorazione.

**The Hairline Rule.** Si separa con un filo da 1px (`{colors.line}`), non con ombre, sfondi alternati o righe doppie.

## Shapes

Forme morbide ma ferme: carte e pannelli a 14px, controlli e bottoni a 10px, voci di lista a 8px, badge a 6px, cornici delle icone di gioco a 4px, nodi e pillole circolari. Le icone dell'arte di gioco stanno in una cornice quadrata scura con gradiente (da #2a2a30 a #111113) e anello bianco al 12%. I glifi della barra laterale sono maschere monocromatiche che prendono il colore del testo, quindi si accendono in oro con la sezione attiva. Le linee hanno dorsale arrotondata da 3px e nodi circolari; nell'albero dei tratti i nodi sono rombi (quadrati ruotati).

## Components

### Navigation
Barra laterale di 92px su `{colors.surface}`: emblema della gilda in alto (fuso con `mix-blend-screen`), poi cinque voci verticali da 76px con glifo di gioco da 28px e etichetta da 11px. A riposo `{colors.muted}`; hover `{colors.raised}` con testo `{colors.ink}`; sezione attiva `{colors.raised}` con glifo ed etichetta in `{colors.gold}` e `aria-current="page"`. Su mobile la stessa lista sta in una barra fissa a cinque colonne con glifo da 24px, nessun fondo sulla voce attiva, solo l'oro.

### Route Line (componente firma)
La linea di trasporto di un carico: una dorsale verticale da 3px in `{colors.line-strong}`, un nodo di partenza (anello da 21px, bordo da 3px in `{colors.ink-2}`, centro `{colors.bg}`) e un nodo per ogni destinazione (cerchio da 13px, bordo da 2px). Ogni destinazione è una riga con nome a sinistra e ricavo a destra in `tabular-nums`. La tratta più redditizia si accende: nodo pieno `{colors.gold}`, tratto di dorsale d'oro da 3px dalla partenza al nodo, nome e importo in oro semibold, badge "Migliore" (sfondo oro, testo nero bold da 10px). Le altre restano grigie, in `{colors.ink-2}`. Quando il ricavo non è in oro, a destra compare il premio in oggetti con le icone di gioco. Lo stesso linguaggio (dorsale da 3px, nodi circolari) regge la colonna "Prossime aperture", dove il nodo prende il corallo o il lilla della famiglia dell'evento.

### Cards / Containers
Il carico (`CargoCard`) è l'unità: bordo 1px `{colors.line}`, sfondo `{colors.surface}`, raggio 14px, padding 20px, gap interno 16px. Dentro, nell'ordine: nome del carico con icona (titolo da 18px medium, hover oro se linkato), ingredienti di preparazione in `{colors.muted}` a 12px, la Route Line, e in fondo il totale per 7 pacchi in un `details` richiudibile. Un dato incerto o un pacco non più craftabile resta segnalato come tale a parole ("Prezzo da verificare al banco"), mai stimato. Le carte di categoria del catalogo hanno raggio 14px, padding 16px e titolo di gruppo in oro; le tessere degli oggetti in evidenza si accendono con il bordo oro in hover.

### Buttons
- **Shape:** morbida (raggio 10px), altezza 32px (36px nelle barre dei filtri), testo 14px medium.
- **Primary:** fondo `{colors.gold}`, testo `{colors.on-gold}`, hover all'80% di opacità, pressione di 1px verso il basso.
- **Outline:** fondo `{colors.bg}` con bordo `{colors.line-strong}`, usato per azioni come "Scarica calendario"; ha l'icona lucide a sinistra.
- **Ghost:** solo testo in `{colors.muted}`, per azioni secondarie come "Azzera".
- **Focus:** bordo oro con anello da 3px a mezza opacità, oltre al contorno globale oro da 2px.

### Inputs / Fields
Altezza 36px, raggio 10px, bordo `{colors.line-strong}`, fondo trasparente tinto da `input/30`, testo 14px da `md`. L'etichetta sta sopra, in testo normale (`{colors.ink}`), mai in maiuscolo. Il placeholder è `{colors.dim}`. Il focus sposta il bordo in oro con l'anello alone. Nei campi di ricerca l'icona lente lucide è dentro il campo, a sinistra. Le select sono Radix, stesse misure, con popover su `{colors.raised}`.

### Event Row (fascia sulla giornata)
Riga a tre zone separate da un filo: nome evento in Marcellus e stato nel colore della famiglia, una fascia da 12px (sfondo a tacche ogni 3 ore, finestre in corallo o lilla, indicatore bianco con bagliore sull'ora corrente) e il countdown da 30px a destra. In corso: icona `CircleDot` che pulsa e countdown nel colore della famiglia. Sotto la fascia, ora locale e durata in `{colors.muted}`.

### Game Icon
Arte di gioco in cornice quadrata scura con gradiente e anello sottile, mai tagliata (`object-contain`); misure 16-72px secondo il contesto. Il glifo della navigazione usa invece la maschera tinta.

## Do's and Don'ts

### Do:
- **Do** accendere in `{colors.gold}` una sola cosa per gruppo: la tratta migliore, la voce attiva o il link.
- **Do** rendere una relazione come linea con nodi (dorsale 3px, nodi circolari) prima di pensare a una scheda o a una tabella.
- **Do** colorare con corallo (`{colors.rift}`) e lilla (`{colors.nightmare}`) solo le due famiglie di evento.
- **Do** separare con fili da 1px (`{colors.line}`) e con i gradini `{bg}`, `{surface}`, `{raised}`.
- **Do** usare `tabular-nums` e il formato `it-IT` per ogni numero e importo.
- **Do** mostrare un dato non confermato come tale ("da verificare al banco"), in testo, accanto al valore o al posto suo.
- **Do** usare i glifi e le icone del gioco prima di quelli lucide, in cornice scura o come maschera.
- **Do** tenere ogni etichetta di campo in testo normale sopra il controllo.

### Don't:
- **Don't** fare una griglia di schede uguali o una tabella grigia con un accento dove una linea mostra la relazione; il catalogo-categorie è l'eccezione dichiarata, perché lì lo schema noto serve a trovare in fretta.
- **Don't** introdurre un tema chiaro: il tema scuro è unico per il vincolo del proprietario.
- **Don't** dare un'ombra morbida alle carte o usare il bagliore come decorazione.
- **Don't** usare Marcellus per corpo, numeri o tabelle.
- **Don't** usare il colore dorato per più di un elemento allo stesso livello.
- **Don't** ricolorare l'arte di gioco o l'emblema; si inseriscono come sono.

*Difetti non canonizzati (la build li porta, non sono regole per le prossime superfici):* le etichette in maiuscolo e tracking largo dei titoli di gruppo nei risultati del catalogo (`text-xs uppercase tracking-wide text-dim`) e la maiuscola da 10px del badge "Migliore" sono scelte locali da non ripetere come stile di etichetta; il token `copper` è dichiarato ma inutilizzato; i colori del marcatore della mappa (`#fb3838`, `#672725`, `#443050`, `#473416`) sono hex fuori palette scritti nel componente.
