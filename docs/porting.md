# Porting dall'originale offline

L'originale è `reference/atlante-dei-commerci-offline.html`: un'unica pagina HTML di 31 MB, fuori da git. Ogni macchina lo copia a mano dallo zip "Atlante dei commerci - da condividere.zip".

## Come leggerlo

Mai intero: le immagini sono circa 7.000 data URI base64 (webp). Prima si tolgono, in un file temporaneo fuori dal progetto, poi si cerca per nome:

```python
import re
s = open('reference/atlante-dei-commerci-offline.html', encoding='utf-8').read()
t = re.sub(r'data:image/[a-z]+;base64,[A-Za-z0-9+/=]+', 'DATAURI', s)  # da 31 MB a circa 6 MB
```

## Dove stanno i dati

Tre `<script>` in fondo alla pagina.

| Script | Costante | Contenuto |
|---|---|---|
| primo | `mapHD` | tile della mappa di Auroria ad alta definizione |
| secondo | `catalogArt` | arte del catalogo |
| terzo | `rows` | rotte: banco, pacco, destinazione, ricompensa, costo |
| terzo | `recipeBook`, `cargoEntries`, `acquisition`, `dismantling`, `materialPoints`, `itemUses` | ricette, carichi, provenienza e uso dei materiali |
| terzo | `gameItems`, `worldCatalog`, `catalogEntries`, `lootSources`, `lunastoneRanges`, `iconFiles`, `embeddedIcons` | catalogo e icone |
| terzo | `atlasTiles`, `mapBounds`, `itemLocations` | mappa e posizioni degli oggetti |
| terzo | `eventTypes` | eventi: ore UTC giornaliere e durata in minuti |
| terzo | `gearValues`, `temperTables`, `traitBook` | character builder |

Le sezioni dell'interfaccia: Rotte commerciali, Catalogo, Eventi, Character Builder, Mappa (pulsanti in `nav.atlas-nav`). Il builder salva in `localStorage` con le chiavi `burnout-character-v1` e `burnout-draft-<archetipo>`.

## Regola

I dati si estraggono con uno script ripetibile verso file tipizzati, e le immagini verso file in `public/`; nessun dato ricopiato a mano. Ogni sezione portata ha un test che confronta dati e calcoli con l'originale.
