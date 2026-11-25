import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { GameIcon } from "@/components/game/game-icon"
import { MapSearch } from "@/components/map/map-search"
import { WorldMapLazy } from "@/components/map/world-map-lazy"
import { ItemPositions } from "@/components/record/item-positions"
import { PageHeader } from "@/components/shell/app-shell"
import { SearchFieldFallback } from "@/components/ui/search-field-fallback"
import { nameOf, searchMapItems, worldCatalog } from "@/lib/game-data.utils"
import { buildRecord } from "@/lib/record.utils"
import { recordHref } from "@/lib/trade.utils"

export const metadata: Metadata = { title: "Mappa di Auroria" }

export default function MappaPage({ searchParams }: PageProps<"/mappa">) {
  return (
    <>
      <PageHeader title="Mappa di Auroria" description="Cerca un oggetto per vedere dove si raccoglie, chi lo rilascia e dove si consegna.">
        <Suspense fallback={<SearchFieldFallback label="Cerca un oggetto sulla mappa" placeholder="Es. Iron Ore" />}>
          <MapSearch />
        </Suspense>
      </PageHeader>
      <div className="px-4 py-6 sm:px-6 lg:px-10">
        <Suspense fallback={<WorldMapLazy name="Auroria" />}>
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
      {record ? (
        <section className="space-y-3">
          <h2 className="flex items-center gap-3 font-display text-2xl">
            <GameIcon src={record.art} size={40} />
            <Link href={recordHref(record.id)} className="hover:text-gold">{nameOf(record.id)}</Link>
          </h2>
          {record.positions ? (
            <ItemPositions key={record.id} section={record.positions} />
          ) : (
            <>
              <p className="text-sm text-ink-2">{record.positionsStatus ?? record.status ?? "Nessuna posizione di acquisizione verificata nelle fonti consultate."}</p>
              <WorldMapLazy point={record.mapPoint} name={record.name} />
            </>
          )}
        </section>
      ) : (
        <WorldMapLazy name="Auroria" />
      )}
    </div>
  )
}
