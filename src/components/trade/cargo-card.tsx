// Un carico: preparazione, linea delle destinazioni, totale per 7 pacchi.
import Link from "next/link"
import { GameText } from "@/components/game/game-text"
import type { CargoGroup } from "@/lib/game.types"
import { PACKS_PER_BATCH, recordHref } from "@/lib/trade.utils"
import { RouteLine } from "./route-line"

export function CargoCard({ group, recordId }: { group: CargoGroup; recordId?: string }) {
  return (
    <article className="flex min-w-0 flex-col gap-4 rounded-xl border border-line bg-surface p-5 [content-visibility:auto] [contain-intrinsic-size:auto_340px]">
      <div>
        <h2 className="text-lg font-medium">
          {recordId ? (
            <Link href={recordHref(recordId)} className="hover:text-gold"><GameText text={group.cargo} size={34} linked={false} /></Link>
          ) : (
            <GameText text={group.cargo} size={34} linked={false} />
          )}
        </h2>
        <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
          <span className="sr-only">{group.deliveryOnly ? "Solo consegna: " : "Preparazione per 1 pacco: "}</span>
          {group.ingredients.map((i) => <GameText key={i} text={i} size={16} />)}
        </p>
      </div>
      <RouteLine origin={group.origin} stops={group.stops} />
      {group.deliveryOnly ? (
        <p className="text-xs text-dim">Puoi consegnare i pacchi già posseduti.</p>
      ) : (
        <details className="group text-xs text-muted">
          <summary className="cursor-pointer select-none hover:text-ink">Totale per {PACKS_PER_BATCH} pacchi</summary>
          <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
            {group.batch.map((i) => <GameText key={i} text={i} size={16} />)}
          </p>
        </details>
      )}
    </article>
  )
}
