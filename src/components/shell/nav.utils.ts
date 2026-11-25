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
