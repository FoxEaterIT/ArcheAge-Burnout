// Estrae dati e immagini dall'Atlante offline (reference/atlante-dei-commerci-offline.html).
// Uso: node scripts/extract-original.mjs [percorso-html]
// Scrive i dati in src/data/generated/ e le immagini in public/game/. Ripetibile: riscrive tutto ogni volta.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const source = process.argv[2] ?? join(root, "reference/atlante-dei-commerci-offline.html")
const html = readFileSync(source, "utf8")
const dataDir = join(root, "src/data/generated")
const imageDir = join(root, "public/game")

/** Restituisce il letterale JSON (array o oggetto) che inizia in `start`, rispettando stringhe e annidamenti. */
function literalAt(code, start) {
  let depth = 0
  let quote = null
  let escaped = false
  for (let i = start; i < code.length; i++) {
    const c = code[i]
    if (quote) {
      if (escaped) escaped = false
      else if (c === "\\") escaped = true
      else if (c === quote) quote = null
    } else if (c === '"' || c === "'" || c === "`") quote = c
    else if (c === "[" || c === "{") depth++
    else if (c === "]" || c === "}") {
      depth--
      if (depth === 0) return code.slice(start, i + 1)
    }
  }
  throw new Error("letterale non chiuso a " + start)
}

const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1])
const literals = {}
for (const code of scripts) {
  for (const m of code.matchAll(/(?:const|let)\s+(\w+)\s*=\s*([[{])/g)) {
    if (m[1] in literals) continue
    try {
      literals[m[1]] = JSON.parse(literalAt(code, m.index + m[0].length - 1))
    } catch {
      // non è un dato JSON (es. una funzione o un'espressione): si ignora
    }
  }
}
const need = ["mapHD", "catalogArt", "rows", "embeddedIcons", "iconFiles", "acquisition", "materialPoints", "dismantling", "gameItems", "atlasTiles", "itemLocations", "recipeBook", "itemUses", "worldCatalog", "lunastoneRanges", "gearValues", "temperTables", "traitBook"]
for (const name of need) if (!literals[name]) throw new Error("dato mancante nell'originale: " + name)

rmSync(dataDir, { recursive: true, force: true })
rmSync(imageDir, { recursive: true, force: true })
mkdirSync(dataDir, { recursive: true })

let imageCount = 0
/** Scrive un data URI come file in public/game/<rel> e restituisce l'URL pubblico. */
function saveImage(dataUri, rel) {
  const m = /^data:image\/([a-z+]+);base64,(.+)$/.exec(dataUri)
  if (!m) throw new Error("immagine non valida per " + rel)
  const file = join(imageDir, rel + "." + (m[1] === "jpeg" ? "jpg" : m[1]))
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, Buffer.from(m[2], "base64"))
  imageCount++
  return "/game/" + rel + "." + (m[1] === "jpeg" ? "jpg" : m[1])
}
const slug = (name) => name.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
const writeData = (name, value) => writeFileSync(join(dataDir, name + ".json"), JSON.stringify(value))

// Immagini: arte del catalogo, icone dei commerci, tile della mappa, emblema.
const catalogArt = literals.catalogArt.map((uri, i) => saveImage(uri, "catalog/" + i))
const embedded = Object.fromEntries(Object.entries(literals.embeddedIcons).map(([file, uri]) => [file, saveImage(uri, "icons/" + file.replace(/\.[a-z]+$/, ""))]))
const tradeIcons = Object.fromEntries(Object.entries(literals.iconFiles).map(([name, value]) => [name, value.startsWith("data:") ? saveImage(value, "icons/" + slug(name)) : embedded[value]]))
for (const [coord, uri] of Object.entries(literals.atlasTiles)) saveImage(uri, "map/overview/" + coord)
literals.mapHD.images.forEach((uri, i) => saveImage(uri, "map/hd/" + i))
const emblem = /<header class="guild">[\s\S]*?<img[^>]*src="(data:image\/[^"]+)"/.exec(html)
if (emblem) saveImage(emblem[1], "emblem")

// Ricette per banco di creazione: lista HTML già pronta nell'originale.
const entities = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" }
const text = (s) => s.replace(/<[^>]+>/g, "").replace(/&(#\d+|#x[0-9a-f]+|\w+);/gi, (all, e) => (e[0] === "#" ? String.fromCodePoint(e[1] === "x" ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : entities[e] ?? all)).trim()
const banksHtml = /<details class="banks">([\s\S]*?)<\/details>\s*<section>/.exec(html)?.[1] ?? ""
const benches = []
for (const bench of banksHtml.split(/<details><summary>(?=[^<]*· \d+ ricette<\/summary>)/).slice(1)) {
  const name = text(bench.slice(0, bench.indexOf("</summary>"))).replace(/ · \d+ ricette$/, "")
  const recipes = []
  for (const m of bench.matchAll(/<li><details><summary>([\s\S]*?)<\/summary><p>([\s\S]*?)<\/p><ul>([\s\S]*?)<\/ul><\/details><\/li>/g)) {
    const deliveries = [...m[3].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((d) => {
      const [destination, reward] = text(d[1]).split(" → ")
      return { destination, reward }
    })
    recipes.push({ cargo: text(m[1]), cost: text(m[2]), deliveries })
  }
  benches.push({ name, recipes })
}

// Il catalogo usa l'indice dell'arte: lo trasformo nell'URL del file.
const worldCatalog = Object.fromEntries(Object.entries(literals.worldCatalog).map(([id, e]) => [id, [e[0], e[1], e[2], e[3], e[4], e[5] != null && e[5] >= 0 ? catalogArt[e[5]] : null, e[6]]]))

writeData("trade-routes", literals.rows)
writeData("trade-icons", tradeIcons)
// Nomi delle icone che aprono una scheda: stesso slug dell'originale (itemSlug, senza togliere i trattini ai bordi).
const itemSlug = (name) => name.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-")
writeData("trade-links", Object.fromEntries(Object.keys(literals.iconFiles).map((name) => [name, itemSlug(name)]).filter(([, id]) => id in literals.worldCatalog || id in literals.gameItems || id in literals.acquisition)))
writeData("benches", benches)
writeData("acquisition", literals.acquisition)
writeData("material-points", literals.materialPoints)
writeData("dismantling", literals.dismantling)
writeData("game-items", literals.gameItems)
writeData("item-locations", literals.itemLocations)
writeData("recipe-book", literals.recipeBook)
writeData("item-uses", literals.itemUses)
writeData("world-catalog", worldCatalog)
writeData("lunastone-ranges", literals.lunastoneRanges)
writeData("gear-values", literals.gearValues)
writeData("temper-tables", literals.temperTables)
writeData("trait-book", literals.traitBook)
writeData("map-index", literals.mapHD.index)

console.log(`dati: ${Object.keys(literals).length} blocchi letti, ${benches.length} banchi · immagini scritte: ${imageCount}`)
