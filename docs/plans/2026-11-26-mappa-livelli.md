# Piano: mappa interattiva a livelli

Obiettivo: le funzioni della mappa interattiva di interactivemap.app su `/mappa`, con i dati nostri. Ci sono:
- livelli per categoria con conteggi e icone;
- raggruppamento dei punti;
- posizione condivisibile;
- punti raccolti;
- percorsi.

Branch `feat/map-layers`.

I dati di interactivemap.app non si usano. Quel sito li protegge con un token e con coordinate falsate apposta, e i suoi termini ne vietano la copia. Le nostre fonti:
- `item-locations.json`, cioè RaidDex tramite l'Atlante: circa 117.000 punti fra raccolta, bottino, venditori, banchi, missioni, consegne e interazioni;
- `world-catalog.json`: 2.662 PNG, 1.254 mostri e 112 boss con la loro posizione.

## Architettura

- **Livelli.** `src/lib/map-layers.utils.ts` (`server-only`) costruisce dai dati generati l'elenco dei livelli. Ogni livello ha id stabile, gruppo, nome, conteggio e arte; i punti sono `[x, y, indice nome]` più i nomi e i link alle schede.
  - Gruppi: Alberi, Minerali, Piante, Creature, PNG, Produzione, Commercio, Oggetti.
  - Le fonti con lo stesso punto si fondono.
- **Punti di un livello.** Li serve `src/app/mappa/livelli/[livello]/route.ts` con `generateStaticParams` e `dynamicParams = false`: un JSON statico per livello, generato al build e scaricato solo quando il livello si accende.
- **Elenco dei livelli.** Senza punti, arriva alla pagina come prop.
- **Disegno.** I punti si disegnano su un `<canvas>` sopra le tile, fermo nel riquadro (`sticky`), ridisegnato a ogni scorrimento e zoom. Indice spaziale a griglia fissa e raggruppamento in celle di schermo: `src/lib/map-cluster.utils.ts`. Il clic su un gruppo ingrandisce, il clic su un punto apre la sua scheda breve.
- **Accessibilità.** Quando i punti visibili sono al massimo 40, compaiono anche in un elenco di pulsanti. Così la mappa si usa da tastiera e i test e2e la possono guidare.
- **Indirizzo.** Ci finiscono `livelli`, `x`, `y`, `zoom`, `punto` e `percorso`, scritti con `history.replaceState`; "Copia link" copia la vista. Parsing e scrittura in `src/lib/map-url.utils.ts`.
- **Raccolti.** Salvati nel `localStorage` alla chiave `burnout-map-raccolti-v1`, con id `livello:x,y`. Si possono nascondere, si contano per livello, si azzerano per livello.
- **Percorsi.**
  - Tappe aggiunte con il clic in modalità percorso; un clic vicino a un segnaposto si aggancia al punto.
  - In alternativa, "Percorso dai punti visibili" di un livello, fino a 200 punti.
  - Linea oro, distanza totale in unità di gioco, "Ottimizza ordine" (vicino più vicino più 2-opt).
  - Salvati in `localStorage` (`burnout-map-percorso-v1`) e nel link condiviso.
  - Logica in `src/lib/map-route.utils.ts`.
- **Ricerca di un oggetto.** La ricerca attuale (`q`, `oggetto`) resta e i punti dell'oggetto scelto si sovrappongono ai livelli. La mappa delle schede (`WorldMap`) non cambia.
- **Mobile.** I livelli stanno in un pannello che si apre sopra la mappa.

## Task

1. **Livelli.** Tipi, `map-layers.utils.ts`, route handler, elenco nella pagina. Test sui dati veri: ogni fonte finisce in un livello, conteggi, fusione dei doppioni, id stabili.
2. **Canvas e raggruppamento.** `map-cluster.utils.ts`, hook `use-map-canvas`, componente `MapExplorer` sopra `useWorldMap`. Test su indice, interrogazione della vista e raggruppamento.
3. **Pannello e scheda del punto.** Livelli con interruttori, ricerca fra i livelli, "tutti/nessuno", scheda del punto, elenco accessibile, ricerca di un oggetto sovrapposta, pannello mobile. e2e.
4. **Indirizzo e condivisione.** `map-url.utils.ts`, hook `use-map-url-state`, "Copia link". Test di andata e ritorno. e2e: un link apre i livelli e il punto.
5. **Raccolti.** Hook `use-map-progress`, nascondi raccolti, contatori, azzeramento. Test delle chiavi. e2e.
6. **Percorsi.** `map-route.utils.ts`, hook `use-map-route`, pannello. Test di distanza e ottimizzazione. e2e.
7. **Chiusura.** Revisione di design (impeccable), revisione del branch, documentazione (`AGENTS.md`, `README.md`, `DESIGN.md`, esito).
