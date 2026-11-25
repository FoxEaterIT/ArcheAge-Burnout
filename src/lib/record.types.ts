// Modello della scheda di un oggetto, una creatura, una missione o un carico.
import type { MapSource, Point, RecipeTier, RouteStop } from "./game.types"

/** Riferimento a un'altra voce: `href` nullo se non ha una scheda. */
export type EntryLink = { id: string; name: string; art: string | null; href: string | null }
export type LinkWithNote = EntryLink & { note: string }

export type UsesSection = { lines: string[]; groups: { title: string; open: boolean; items: LinkWithNote[] }[]; empty: boolean }
export type CargoSection = { origin: string; recipe: string; deliveryOnly: boolean; batch: string[]; stops: RouteStop[] }
export type SalvageSection = { material: EntryLink; items: { gear: EntryLink; quantity: string; chance: string }[] }

export type RecipeModel = {
  key: string
  result: string
  title: string
  note: string | null
  meta: string
  tiers: RecipeTier[]
  /** Per ogni intermedio della catena, la variante usata per il calcolo. */
  subTiers: Record<string, RecipeTier>
  /** Nome, arte e link di ogni id che il calcolatore può mostrare. */
  entries: Record<string, EntryLink>
}

export type PositionsSection = { intro: string | null; sources: MapSource[]; defaultSource: number; flowers: boolean }

export type RecordModel = {
  id: string
  name: string
  category: string | null
  art: string | null
  itemLine: string | null
  uses: UsesSection | null
  lunastone: { stat: string; range: string }[] | "unknown" | null
  catalogTexts: string[]
  droppedBy: LinkWithNote[]
  loot: LinkWithNote[]
  cargo: CargoSection | null
  salvageYields: LinkWithNote[]
  description: string | null
  salvage: SalvageSection | "none" | null
  recipes: RecipeModel[]
  positions: PositionsSection | null
  positionsStatus: string | null
  mapPoint: Point | null
  status: string | null
  notes: string[]
  rewardRoutes: string[]
  shortcuts: { id: string; label: string }[]
}
