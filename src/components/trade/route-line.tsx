// La linea: dal banco di partenza alle destinazioni, la più redditizia accesa in oro.
import { cn } from "cn"
import { GameText } from "@/components/game/game-text"
import type { RouteStop } from "@/lib/game.types"
import { fmt } from "@/lib/text.utils"

export function RouteLine({ origin, stops }: { origin: string; stops: RouteStop[] }) {
  return (
    <ol className="relative space-y-3 pl-7 before:absolute before:top-2.5 before:bottom-2.5 before:left-[9px] before:w-[3px] before:rounded-full before:bg-line-strong">
      <li className="relative text-sm text-muted">
        <span aria-hidden className="absolute top-0.5 -left-7 size-[21px] rounded-full border-[3px] border-ink-2 bg-bg" />
        <span className="sr-only">Partenza: </span>
        {origin}
      </li>
      {stops.map((s) => (
        <li key={s.destination} className="relative flex items-center justify-between gap-3 text-sm">
          {s.best ? <span aria-hidden className="absolute -top-[calc(100%+0.75rem)] -left-[19px] h-[calc(100%+1.25rem)] w-[3px] rounded-full bg-gold shadow-[0_0_10px_var(--gold)]" /> : null}
          <span aria-hidden className={cn("absolute -left-[23px] size-[13px] rounded-full border-2", s.best ? "border-gold bg-gold shadow-[0_0_10px_var(--gold)]" : "border-line-strong bg-bg")} />
          <span className={cn("min-w-0", s.best ? "text-gold" : "text-ink-2")}>
            {s.destination}
            {s.best ? <span className="ml-2 rounded-sm bg-gold px-1.5 py-px align-[1px] text-[10px] font-bold tracking-wide text-black uppercase">Migliore<span className="sr-only"> ricavo</span></span> : null}
          </span>
          {s.gold !== null ? (
            <span className={cn("tabular-nums", s.best ? "font-semibold text-gold" : "text-ink-2")}>{fmt(s.gold)} oro</span>
          ) : (
            <GameText text={s.payout} size={20} className="text-right text-xs text-ink-2" />
          )}
        </li>
      ))}
    </ol>
  )
}
