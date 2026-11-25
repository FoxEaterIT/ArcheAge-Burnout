// Dati e pezzi comuni ai mockup di design: dati veri dell'originale, nessuna logica definitiva.
import Image from "next/image"
import routes from "@/data/generated/trade-routes.json"
import icons from "@/data/generated/trade-icons.json"

export type Route = { origin: string; cargo: string; destination: string; payout: string; recipe: string }
export type CargoGroup = { origin: string; cargo: string; recipe: string; routes: Route[] }

export const ROUTES: Route[] = (routes as string[][]).map(([origin, cargo, destination, payout, recipe]) => ({ origin, cargo, destination, payout, recipe }))
export const ICONS = icons as Record<string, string>
const iconNames = Object.keys(ICONS).sort((a, b) => b.length - a.length)

export const ORIGINS = [...new Set(ROUTES.map((r) => r.origin))].sort()
export const DESTINATIONS = [...new Set(ROUTES.map((r) => r.destination))].sort()

export function cargoGroups(origin?: string): CargoGroup[] {
  const groups = new Map<string, CargoGroup>()
  for (const r of ROUTES) {
    if (origin && r.origin !== origin) continue
    const key = r.origin + "|" + r.cargo
    if (!groups.has(key)) groups.set(key, { origin: r.origin, cargo: r.cargo, recipe: r.recipe, routes: [] })
    groups.get(key)!.routes.push(r)
  }
  return [...groups.values()]
}

/** Oro del ricavo come numero, `null` se il ricavo è un oggetto. */
export function gold(payout: string) {
  const m = /^([\d,]+) Gold$/.exec(payout)
  return m ? Number(m[1].replaceAll(",", "")) : null
}

export function ingredients(recipe: string) {
  return recipe.split(/\s+(?=\d+×)/)
}

// "always": in italiano Intl non separa le migliaia sotto 10.000, e 2090 accanto a 47.385 si legge male
const numberFormat = new Intl.NumberFormat("it-IT", { useGrouping: "always" } as Intl.NumberFormatOptions)
export const fmt = (n: number) => numberFormat.format(n)

/** Testo con le icone di gioco davanti ai nomi riconosciuti, come nell'originale. */
export function GameText({ text, size = 24, className }: { text: string; size?: number; className?: string }) {
  const parts: React.ReactNode[] = []
  let start = 0
  while (start < text.length) {
    let at = text.length
    let found = ""
    for (const name of iconNames) {
      const i = text.indexOf(name, start)
      if (i >= 0 && i < at) {
        at = i
        found = name
      }
    }
    if (!found) {
      parts.push(text.slice(start))
      break
    }
    parts.push(text.slice(start, at))
    parts.push(
      <span key={at} className="inline-flex items-center gap-1.5 align-middle">
        <Image src={ICONS[found]} alt="" width={size} height={size} unoptimized className="shrink-0 rounded-[3px] bg-[linear-gradient(145deg,#2a2a30,#121215)] ring-1 ring-white/10" />
        {found}
      </span>,
    )
    start = at + found.length
  }
  return <span className={className}>{parts}</span>
}

export const NAV = ["Rotte commerciali", "Catalogo", "Eventi", "Character Builder", "Mappa"]

/** Palette ripresa dal sito ufficiale di ArcheAge Chronicles (fondi zinco, oro ambra, rame). */
export const AAC = {
  "--bg": "#09090b",
  "--surface": "#141416",
  "--raised": "#1c1c20",
  "--line": "#27272a",
  "--line-strong": "#3f3f46",
  "--ink": "#f4f4f5",
  "--ink-2": "#d4d4d8",
  "--muted": "#9f9fa9",
  "--dim": "#71717b",
  "--gold": "#fee685",
  "--gold-strong": "#ffd230",
  "--copper": "oklab(0.555 0.107 0.123)",
  "--lime": "#c8e35f",
  "--rift": "#ff8a73",
  "--nightmare": "#c3a6ff",
} as React.CSSProperties
