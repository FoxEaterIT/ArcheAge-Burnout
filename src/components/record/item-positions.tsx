"use client"
// Posizioni di un oggetto sulla mappa: fonte (raccolta, bottino, interazione…) e punto.
import { WorldMapLazy } from "@/components/map/world-map-lazy"
import { GameSelect } from "@/components/ui/game-select"
import { useItemPositions } from "@/hooks/use-item-positions"
import type { PositionsSection } from "@/lib/record.types"

export function ItemPositions({ section }: { section: PositionsSection }) {
  const p = useItemPositions(section)
  return (
    <div className="space-y-2">
      {section.intro ? <p className="text-sm text-ink-2">{section.intro}</p> : null}
      <GameSelect label="Fonte del materiale" value={String(p.source)} onChange={(v) => p.setSource(Number(v))} options={section.sources.map((s, i) => ({ value: String(i), label: `${s.label} (${s.total})` }))} />
      {p.sampled ? <p className="text-xs text-muted">{p.sampled}</p> : null}
      {p.listed ? (
        <GameSelect label="Posizione della fonte" value={p.spot} onChange={p.setSpot} options={p.spotOptions} />
      ) : null}
      <WorldMapLazy key={`${p.source}-${p.spot}`} point={p.point} overview={p.overview} name={p.label} />
    </div>
  )
}
