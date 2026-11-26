"use client"
// Scheda breve del punto scelto: le voci che stanno lì (con la loro scheda), coordinate, raccolto e percorso.
import Link from "next/link"
import { Check, Route, X } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { useFocusWhen } from "@/hooks/use-focus-when"
import type { SelectedPoint } from "@/lib/map-explorer.types"
import { GROUP_SWATCH, refId } from "@/lib/map-explorer.utils"

type Props = { point: SelectedPoint; onClose: () => void; onToggleDone: () => void; onAddToRoute: () => void }

export function MapPointCard({ point, onClose, onToggleDone, onAddToRoute }: Props) {
  const ref = useFocusWhen<HTMLElement>(point.focus, refId(point.ref))
  const [first, ...others] = point.entries
  return (
    <section
      ref={ref}
      tabIndex={-1}
      aria-label={`Punto scelto: ${first.name}`}
      className="absolute bottom-3 left-3 z-20 w-[min(22rem,calc(100%-1.5rem))] space-y-2 rounded-xl border border-line-strong bg-surface p-4 outline-none max-lg:fixed max-lg:inset-x-3 max-lg:bottom-3 max-lg:z-40 max-lg:w-auto max-md:bottom-[calc(4.5rem+env(safe-area-inset-bottom))]"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="flex items-center gap-2 text-xs text-muted">
          {point.group ? <span aria-hidden className={cn("size-2.5 rounded-full", GROUP_SWATCH[point.group])} /> : null}
          {point.layerLabel}
        </p>
        <Button variant="ghost" size="icon-sm" className="-mt-1 -mr-1 text-muted max-lg:size-10" onClick={onClose} aria-label="Chiudi il punto"><X /></Button>
      </div>
      <h3 className="font-display text-lg leading-tight">
        {first.href ? <Link href={first.href} className="text-gold underline-offset-4 hover:underline">{first.name}</Link> : first.name}
      </h3>
      {first.detail ? <p className="text-sm text-ink-2">{first.detail}</p> : null}
      {others.length ? (
        <div className="space-y-1">
          <p className="text-xs text-muted">Nello stesso punto</p>
          <ul className="max-h-28 space-y-1 overflow-auto text-sm">
            {others.map((e, i) => (
              <li key={`${i}-${e.name}`}>
                {e.href ? <Link href={e.href} className="text-gold underline-offset-4 hover:underline">{e.name}</Link> : e.name}
                {e.detail ? <span className="text-muted"> · {e.detail}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <p className="text-xs text-dim tabular-nums">{point.ref.x}, {point.ref.y}</p>
      <div className="flex flex-wrap gap-2 pt-1">
        {point.group ? (
          <Button variant="outline" size="sm" aria-pressed={point.done} onClick={onToggleDone} className={cn("max-lg:h-10", point.done && "border-gain text-gain")}>
            <Check aria-hidden />{point.done ? "Raccolto" : "Segna raccolto"}
          </Button>
        ) : null}
        <Button variant="outline" size="sm" className="max-lg:h-10" onClick={onAddToRoute}><Route aria-hidden />Aggiungi al percorso</Button>
      </div>
    </section>
  )
}
