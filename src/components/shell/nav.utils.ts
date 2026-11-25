// Sezioni dell'app con il glifo di gioco di ciascuna.
export const NAV_ITEMS = [
  { href: "/rotte", label: "Rotte", title: "Rotte commerciali", glyph: "/game/catalog/368.webp" },
  { href: "/catalogo", label: "Catalogo", title: "Catalogo di Auroria", glyph: "/game/catalog/364.webp" },
  { href: "/eventi", label: "Eventi", title: "Orari degli eventi", glyph: "/game/catalog/354.webp" },
  { href: "/builder", label: "Builder", title: "Character Builder", glyph: "/game/catalog/106.webp" },
  { href: "/mappa", label: "Mappa", title: "Mappa di Auroria", glyph: "/game/catalog/124.webp" },
] as const

/** La sezione è attiva sulla sua pagina e sulle sottopagine; le schede appartengono al catalogo. */
export function isActiveSection(path: string, href: string) {
  return path === href || path.startsWith(href + "/") || (href === "/catalogo" && path.startsWith("/scheda"))
}

/** Indirizzo nuovo per un link dell'Atlante offline (`#/scheda/…`, `#/eventi`, …); `null` se l'hash non è dell'Atlante. */
export function legacyHashTarget(hash: string) {
  if (!hash.startsWith("#/")) return null
  const path = hash.slice(1)
  if (path.startsWith("/scheda/")) return "/scheda/" + path.slice(8).split("/").map((s) => encodeURIComponent(safeDecode(s))).join("/")
  if (path.startsWith("/categoria/")) return "/catalogo?tipo=" + encodeURIComponent(safeDecode(path.slice(11)))
  const map: Record<string, string> = { "/rotte": "/rotte", "/catalogo": "/catalogo", "/eventi": "/eventi", "/builder": "/builder" }
  return map[path] ?? null
}

function safeDecode(s: string) {
  try {
    return decodeURIComponent(s)
  } catch {
    return s
  }
}
