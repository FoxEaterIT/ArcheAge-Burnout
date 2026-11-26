"use client"
// Percorso: tappe in ordine sulla linea, lunghezza, tappe col clic o dai segnaposti visibili.
import { memo } from "react"
import { ArrowDownUp, MousePointerClick, Sparkles, Trash2, X } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import type { MapRouteModel } from "@/lib/map-explorer.types"

// memo: fino a 200 tappe, da non ridisegnare a ogni fotogramma mentre si trascina la mappa.
export const MapRoutePanel = memo(function MapRoutePanel({ route }: { route: MapRouteModel }) {
  return (
    <section aria-labelledby="map-route-title" className="space-y-3 border-t border-line pt-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="map-route-title" className="font-display text-xl">Percorso</h2>
        {route.stops.length > 1 ? <span className="text-xs text-muted tabular-nums">Lunghezza {route.lengthLabel} unità</span> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" aria-pressed={route.editing} onClick={route.toggleEditing} className={route.editing ? "border-gold text-gold max-lg:h-10" : "max-lg:h-10"}>
          <MousePointerClick aria-hidden />{route.editing ? "Clic sulla mappa: aggiunge tappe" : "Aggiungi tappe col clic"}
        </Button>
        <Button variant="outline" size="sm" className="max-lg:h-10" onClick={route.fromView}><Sparkles aria-hidden />Dai segnaposti visibili</Button>
      </div>
      {route.stops.length ? (
        <>
          <ol className="max-h-64 overflow-auto">
            {route.stops.map((stop, i) => (
              <li key={`${i}-${stop.x}-${stop.y}`} className="relative flex items-center gap-2 py-1 pl-7 text-sm">
                {/* Dorsale d'oro da un nodo all'altro: il primo tratto parte dal nodo, l'ultimo si ferma al nodo. */}
                <span aria-hidden className={cn("absolute left-[9px] w-[3px] bg-gold-strong", i === 0 ? "top-1/2" : "top-0", i === route.stops.length - 1 ? "bottom-1/2" : "bottom-0")} />
                <span aria-hidden className="absolute left-0 grid size-[21px] place-items-center rounded-full border-2 border-gold-strong bg-bg text-[10px] font-bold text-gold-strong tabular-nums">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate">
                  {stop.name ? <>{stop.name} </> : null}
                  <span className="text-xs text-dim tabular-nums">{stop.x}, {stop.y}</span>
                </span>
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
})
