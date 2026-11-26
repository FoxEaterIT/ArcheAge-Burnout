"use client"
// Percorso: tappe in ordine sulla linea, lunghezza, tappe col clic o dai segnaposti visibili.
import { ArrowDownUp, MousePointerClick, Sparkles, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { useMapExplorer } from "@/hooks/use-map-explorer"

type RouteModel = ReturnType<typeof useMapExplorer>[2]["route"]

export function MapRoutePanel({ route }: { route: RouteModel }) {
  return (
    <section aria-labelledby="map-route-title" className="space-y-3 border-t border-line pt-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="map-route-title" className="font-display text-xl">Percorso</h2>
        {route.stops.length > 1 ? <span className="text-xs text-muted tabular-nums">Lunghezza {route.lengthLabel} unità</span> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" aria-pressed={route.editing} onClick={route.toggleEditing} className={route.editing ? "border-gold text-gold" : undefined}>
          <MousePointerClick aria-hidden />{route.editing ? "Clic sulla mappa: aggiunge tappe" : "Aggiungi tappe col clic"}
        </Button>
        <Button variant="outline" size="sm" onClick={route.fromView}><Sparkles aria-hidden />Dai segnaposti visibili</Button>
      </div>
      {route.stops.length ? (
        <>
          <ol className="relative max-h-64 space-y-1 overflow-auto pl-6 before:absolute before:top-2 before:bottom-2 before:left-[9px] before:w-[3px] before:rounded-full before:bg-gold-strong">
            {route.stops.map((stop, i) => (
              <li key={`${i}-${stop.x}-${stop.y}`} className="relative flex items-center gap-2 text-sm">
                <span aria-hidden className="absolute -left-6 grid size-[21px] place-items-center rounded-full border-2 border-gold-strong bg-bg text-[10px] font-bold text-gold-strong tabular-nums">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate">{stop.name ?? <span className="text-muted tabular-nums">{stop.x}, {stop.y}</span>}</span>
                <Button variant="ghost" size="icon-xs" className="text-dim" onClick={() => route.remove(i)} aria-label={`Togli la tappa ${i + 1}`}><X /></Button>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-1">
            <Button variant="ghost" size="sm" className="text-muted" onClick={route.optimize} disabled={route.stops.length < 3}><Sparkles aria-hidden />Ottimizza ordine</Button>
            <Button variant="ghost" size="sm" className="text-muted" onClick={route.reverse} disabled={route.stops.length < 2}><ArrowDownUp aria-hidden />Inverti</Button>
            <Button variant="ghost" size="sm" className="text-muted" onClick={route.clear}><Trash2 aria-hidden />Svuota</Button>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted">Nessuna tappa. Attiva «Aggiungi tappe col clic» e tocca la mappa, oppure crea il percorso dai segnaposti visibili.</p>
      )}
    </section>
  )
}
