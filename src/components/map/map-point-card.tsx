"use client"
// Scheda breve del punto scelto: nome e scheda, dettaglio, coordinate, raccolto e percorso.
import Link from "next/link"
import { Check, Route, X } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import type { SelectedPoint } from "@/lib/map-explorer.types"
import { GROUP_SWATCH } from "@/lib/map-explorer.utils"

type Props = { point: SelectedPoint; onClose: () => void; onToggleDone: () => void; onAddToRoute: () => void }

export function MapPointCard({ point, onClose, onToggleDone, onAddToRoute }: Props) {
  return (
    <section aria-label={`Punto scelto: ${point.name}`} className="pointer-events-auto absolute bottom-3 left-3 z-20 w-[min(22rem,calc(100%-1.5rem))] space-y-2 rounded-xl border border-line-strong bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="flex items-center gap-2 text-xs text-muted">
          {point.group ? <span aria-hidden className={cn("size-2.5 rounded-full", GROUP_SWATCH[point.group])} /> : null}
          {point.layerLabel}
        </p>
        <Button variant="ghost" size="icon-xs" className="-mt-1 -mr-1 text-muted" onClick={onClose} aria-label="Chiudi"><X /></Button>
      </div>
      <h3 className="font-display text-lg leading-tight">
        {point.href ? <Link href={point.href} className="hover:text-gold">{point.name}</Link> : point.name}
      </h3>
      {point.detail ? <p className="text-sm text-ink-2">{point.detail}</p> : null}
      <p className="text-xs text-dim tabular-nums">{point.ref.x}, {point.ref.y}</p>
      <div className="flex flex-wrap gap-2 pt-1">
        {point.group ? (
          <Button variant="outline" size="sm" aria-pressed={point.done} onClick={onToggleDone} className={cn(point.done && "border-gain text-gain")}>
            <Check aria-hidden />{point.done ? "Raccolto" : "Segna raccolto"}
          </Button>
        ) : null}
        <Button variant="outline" size="sm" onClick={onAddToRoute}><Route aria-hidden />Aggiungi al percorso</Button>
        {point.href ? (
          <Button variant="ghost" size="sm" asChild className="text-muted"><Link href={point.href}>Apri la scheda</Link></Button>
        ) : null}
      </div>
    </section>
  )
}
