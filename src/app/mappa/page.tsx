import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { GameIcon } from "@/components/game/game-icon"
import { MapExplorerLazy } from "@/components/map/map-explorer-lazy"
import { MapSearch } from "@/components/map/map-search"
import { PageHeader } from "@/components/shell/app-shell"
import { SearchFieldFallback } from "@/components/ui/search-field-fallback"
import { mapLayers, searchMapItems, worldCatalog } from "@/lib/game-data.utils"
import { buildRecord, mapSearchOverlay } from "@/lib/record.utils"

export const metadata: Metadata = { title: "Mappa di Auroria" }

export default function MappaPage({ searchParams }: PageProps<"/mappa">) {
  return (
    <>
      <PageHeader title="Mappa di Auroria" description="Accendi i livelli per vedere alberi, minerali, creature, PNG e banchi; cerca un oggetto per vedere dove si trova.">
        <Suspense fallback={<SearchFieldFallback label="Cerca un oggetto sulla mappa" placeholder="Es. Iron Ore" />}>
          <MapSearch />
        </Suspense>
      </PageHeader>
      <div className="px-4 py-6 sm:px-6 lg:px-10">
        <Suspense fallback={<div className="h-[clamp(420px,calc(100dvh-15rem),920px)] animate-pulse rounded-lg border border-line bg-surface lg:ml-[324px]" />}>
          <MapBody searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  )
}

async function MapBody({ searchParams }: Pick<PageProps<"/mappa">, "searchParams">) {
  const params = await searchParams
  const q = typeof params.q === "string" ? params.q : ""
  const selected = typeof params.oggetto === "string" && Object.hasOwn(worldCatalog, params.oggetto) ? params.oggetto : null
  const record = selected ? buildRecord(selected) : null
  const search = record ? mapSearchOverlay(record) : null
  const { rows, more } = selected ? { rows: [], more: false } : searchMapItems(q)
  return (
    <div className="space-y-4">
      {q && !selected ? (
        rows.length ? (
          <ul className="flex flex-wrap gap-2">
            {rows.map((row) => (
              <li key={row.id}>
                <Link href={`/mappa?q=${encodeURIComponent(row.name)}&oggetto=${encodeURIComponent(row.id)}`} className="inline-flex items-center gap-2 rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-sm hover:border-gold hover:text-gold">
                  <GameIcon src={row.art} size={24} />{row.name}
                </Link>
              </li>
            ))}
            {more ? <li className="self-center text-xs text-muted">Affina la ricerca per vedere altri risultati.</li> : null}
          </ul>
        ) : (
          <p className="text-sm text-muted">Nessun oggetto trovato.</p>
        )
      ) : null}
      {record && !search ? <p className="text-sm text-ink-2">{record.name}: {record.positionsStatus ?? record.status ?? "Nessuna posizione di acquisizione verificata nelle fonti consultate."}</p> : null}
      <MapExplorerLazy groups={mapLayers().groups} search={search} />
    </div>
  )
}
