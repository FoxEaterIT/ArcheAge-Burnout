# Esito: mappa interattiva a livelli

Piano: [`docs/plans/2026-11-26-mappa-livelli.md`](../plans/2026-11-26-mappa-livelli.md). Branch `feat/map-layers`.

## Fatto

`/mappa` ha le funzioni della mappa di interactivemap.app, costruite con i dati nostri.

- **Livelli:** 27, in 8 gruppi, per 117.905 segnaposti e 119.062 voci, con interruttori, conteggi e icone di gioco.
- **Raggruppamento su canvas.**
- **Scheda del punto:** mostra tutte le voci che stanno lì.
- **Raccolti** salvati nel browser.
- **Percorsi:** col clic o dai segnaposti visibili, con l'ordine ottimizzato.
- **Link condivisibile:** livelli, centro, zoom, punto e percorso.
- **Elenco da tastiera** dei segnaposti visibili.

La ricerca di un oggetto resta e si sovrappone ai livelli. La mappa delle schede non cambia.

## Prove

Sono tutte verdi:
- `pnpm typecheck`, `pnpm lint` e `pnpm build` (27 livelli generati come JSON statici);
- `pnpm test`: 70 test, 35 nuovi sulla mappa;
- `pnpm test:e2e`: 39 passati e 3 saltati, perché la copia del link si prova solo su desktop e il foglio dei livelli solo su mobile.

Con tutti i livelli accesi, trascinare costa circa 16–18 ms per fotogramma, misurato in sviluppo.

## Revisioni

- **Codice:** un bug e cinque cose da sistemare, tutti corretti.
  - Le voci nello stesso punto si sovrapponevano e se ne poteva aprire una sola: ora c'è un segnaposto per posizione, con tutte le voci.
  - Il punto restava scelto anche dopo aver spento il suo livello.
  - I nomi delle tappe si perdevano ricaricando la pagina.
  - Il messaggio di stato non si cancellava mai.
  - L'interruttore del gruppo accendeva livelli non trovati dalla ricerca.
  - Pannello e percorso si ridisegnavano a ogni fotogramma.
- **Note minori della revisione del codice:** tutte corrette.
  - Clic spostato di 1px.
  - Tocco dopo un trascinamento col mouse.
  - Punto scelto dentro un gruppo quando lo zoom è lontano.
  - Gruppi sul bordo che lampeggiavano.
  - Fuoco sulla scheda scelta da tastiera.
  - Esc sul pannello mobile.
  - Cache del browser per i livelli.
- **Design:** esito "fix", con tutte le correzioni fatte.
  - Su mobile la scheda del punto è fissa sopra la barra.
  - I gruppi del pannello si richiudono.
  - Il foglio mobile è più basso e porta in vista la mappa.
  - I gruppi grandi si disegnano sotto quelli piccoli.
  - Creature e oggetti hanno colori lontani da quelli degli eventi.
  - Le tappe mostrano anche le coordinate.
  - I controlli su mobile sono alti 40px.
  - Il nome nella scheda è un link oro.
  - La riga della ricerca sta nella barra.

## Differenze volute

- I dati di interactivemap.app non si usano: sono protetti da un token e da coordinate falsate apposta, e i loro termini lo vietano.
- I nostri dati coprono quasi solo il continente a ovest: la loro mappa ha circa 147.000 segnaposti, la nostra 117.905.
- La lunghezza del percorso è in unità di gioco: non abbiamo verificato a quanti metri corrispondono.

## Aperto

- Per il resto del continente servono altre fonti pulite: un export concesso, dati con licenza o segnalazioni della gilda.
- Un link con `zoom=16` su un telefono con densità 2 si apre a zoom 8 (limite della risoluzione delle tile).
