// Tessera di un livello: icona di gioco e conteggio in alto, nome sotto a tutta larghezza (i nomi degli alberi
// si distinguono solo alla fine, "Mature Tree (Pine)"). Nel DOM il nome viene prima, così la casella si chiama
// "Boss 113". Accesa, prende il colore del suo gruppo (`--group`).
import { Check, RotateCcw } from "lucide-react"
import { cn } from "cn"
import { GameIcon } from "@/components/game/game-icon"
import type { MapPanelLayer } from "@/lib/map-explorer.types"

type Props = { layer: MapPanelLayer; onToggle: (id: string) => void; onClearDone: (id: string) => void }

export function MapLayerTile({ layer, onToggle, onClearDone }: Props) {
  const { info, on } = layer
  return (
    <li className="relative">
      <button
        type="button"
        role="checkbox"
        aria-checked={on}
        onClick={() => onToggle(info.id)}
        className={cn(
          "flex h-full w-full flex-col-reverse justify-end gap-1.5 rounded-lg border p-2 text-left transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          on ? "border-(--group)/55 bg-(--group)/10 text-ink" : "border-line text-ink-2 hover:border-line-strong hover:bg-raised",
        )}
      >
        <span className="line-clamp-2 text-sm leading-snug">{info.label}</span>
        <span className={cn("flex items-start justify-between gap-2", layer.done && "pr-7")}>
          <span className="relative">
            <GameIcon src={info.art} size={28} className={cn("transition-[opacity,filter]", !on && "opacity-50 grayscale")} />
            {on ? (
              <span aria-hidden className="absolute -right-1.5 -bottom-1.5 grid size-4 place-items-center rounded-full bg-(--group) text-bg ring-2 ring-surface">
                <Check className="size-3" strokeWidth={3} />
              </span>
            ) : null}
          </span>
          <span className={cn("pt-0.5 text-xs tabular-nums", layer.failed ? "text-loss" : on ? "text-ink-2" : "text-dim")}>
            {layer.failed ? "Non caricato" : layer.loading ? "Carico…" : layer.count}
          </span>
        </span>
      </button>
      {layer.done ? (
        <button
          type="button"
          onClick={() => onClearDone(info.id)}
          aria-label={`Azzera i raccolti di ${info.label}`}
          title="Azzera i raccolti"
          className="absolute top-1 right-1 grid size-7 place-items-center rounded-md text-dim outline-none after:absolute after:-inset-1.5 hover:bg-raised hover:text-ink focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <RotateCcw aria-hidden className="size-3.5" />
        </button>
      ) : null}
    </li>
  )
}
