"use client"
// Pannello dei livelli: gruppi con interruttore, livelli con icona e conteggio, ricerca e raccolti.
import { Search } from "lucide-react"
import { cn } from "cn"
import { GameIcon } from "@/components/game/game-icon"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { useMapExplorer } from "@/hooks/use-map-explorer"

type Panel = ReturnType<typeof useMapExplorer>[2]["panel"]

export function MapLayersPanel({ panel }: { panel: Panel }) {
  return (
    <section aria-labelledby="map-layers-title" className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 id="map-layers-title" className="font-display text-xl">Livelli</h2>
        <div className="flex gap-1">
          <Button variant="ghost" size="xs" className="text-muted" onClick={panel.all}>Tutti</Button>
          <Button variant="ghost" size="xs" className="text-muted" onClick={panel.none} disabled={!panel.activeCount}>Nessuno</Button>
        </div>
      </div>
      <div className="relative">
        <Search aria-hidden className="pointer-events-none absolute top-2.5 left-2.5 size-4 text-dim" />
        <Input type="search" aria-label="Cerca un livello" placeholder="Cerca un livello" value={panel.filter} onChange={(e) => panel.setFilter(e.target.value)} className="h-9 pl-8" />
      </div>
      {panel.groups.length ? (
        <div className="space-y-4">
          {panel.groups.map((g) => (
            <fieldset key={g.group.id} className="space-y-1.5">
              <legend className="flex w-full items-center gap-2.5 pb-1">
                <Checkbox id={`group-${g.group.id}`} checked={g.checked} onCheckedChange={(on) => panel.setGroup(g.group, on === true)} />
                <span aria-hidden className={cn("size-2.5 rounded-full", g.swatch)} />
                <Label htmlFor={`group-${g.group.id}`} className="flex-1 text-sm font-medium">{g.group.label}</Label>
                <span className="text-xs text-dim tabular-nums">{g.total}</span>
              </legend>
              <ul className="space-y-0.5 border-l border-line pl-3">
                {g.layers.map((l) => (
                  <li key={l.info.id} className="flex items-center gap-2.5 rounded-md py-1 pr-1">
                    <Checkbox id={`layer-${l.info.id}`} checked={l.on} onCheckedChange={() => panel.toggle(l.info.id)} />
                    <GameIcon src={l.info.art} size={22} />
                    <Label htmlFor={`layer-${l.info.id}`} className={cn("min-w-0 flex-1 truncate text-sm font-normal", l.on ? "text-ink" : "text-ink-2")}>{l.info.label}</Label>
                    {l.failed ? <span className="text-xs text-loss">Non caricato</span> : l.loading ? <span className="text-xs text-dim">Carico…</span> : null}
                    <span className="text-xs text-dim tabular-nums">{l.count}</span>
                    {l.done ? (
                      <Button variant="ghost" size="xs" className="h-5 px-1 text-[11px] text-dim" onClick={() => panel.clearDone(l.info.id)} aria-label={`Azzera i raccolti di ${l.info.label}`}>Azzera</Button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </fieldset>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">Nessun livello con questo nome.</p>
      )}
      <div className="flex items-center gap-2.5 border-t border-line pt-3">
        <Checkbox id="hide-done" checked={panel.hideDone} onCheckedChange={(on) => panel.setHideDone(on === true)} />
        <Label htmlFor="hide-done" className="text-sm font-normal">Nascondi i punti raccolti</Label>
      </div>
    </section>
  )
}
