"use client"
// Posizioni di un oggetto sulla mappa: fonte (raccolta, bottino, interazione…) e punto.
import { WorldMapLazy } from "@/components/map/world-map-lazy"
import { useItemPositions } from "@/hooks/use-item-positions"
import type { PositionsSection } from "@/lib/record.types"

const selectClass = "h-9 w-full rounded-lg border border-input bg-input/30 px-2.5 text-sm"

export function ItemPositions({ section }: { section: PositionsSection }) {
  const p = useItemPositions(section)
  return (
    <div className="space-y-2">
      {section.intro ? <p className="text-sm text-ink-2">{section.intro}</p> : null}
      <select aria-label="Fonte del materiale" value={p.source} onChange={(e) => p.setSource(Number(e.target.value))} className={selectClass}>
        {section.sources.map((s, i) => <option key={i} value={i}>{`${s.label} (${s.points.length})`}</option>)}
      </select>
      {p.points.length > 1 ? (
        <select aria-label="Posizione della fonte" value={p.spot} onChange={(e) => p.setSpot(e.target.value)} className={selectClass}>
          <option value="all">{p.allLabel}</option>
          {p.points.map(([x, y], i) => <option key={i} value={i}>{`Punto ${i + 1} di ${p.points.length} · ${x}, ${y}`}</option>)}
        </select>
      ) : null}
      <WorldMapLazy key={`${p.source}-${p.spot}`} point={p.point} overview={p.overview} name={p.label} />
    </div>
  )
}
