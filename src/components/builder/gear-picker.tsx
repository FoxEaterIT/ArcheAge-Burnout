// Scelta del pezzo per lo slot attivo: pezzo equipaggiato con tempra, ricerca, elenco con il confronto dei bonus.
import Link from "next/link"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GameIcon } from "@/components/game/game-icon"
import type { BuilderData, CharacterBuild, GearPiece } from "@/lib/builder.types"
import { slotByKey, temperRanks, temperSummary } from "@/lib/builder.utils"
import { fmtDecimal } from "@/lib/text.utils"
import { recordHref } from "@/lib/trade.utils"

export function GearPicker({ cb, data, pieces }: { cb: CharacterBuild; data: BuilderData; pieces: Map<string, GearPiece> }) {
  const slot = slotByKey(cb.slot)
  const worn = cb.build.gear[cb.slot] ? pieces.get(cb.build.gear[cb.slot]!) : undefined
  const table = worn ? data.temperTables[worn.id] : undefined
  const rank = cb.build.temper[cb.slot] ?? 0
  return (
    <section aria-labelledby="picker" className="space-y-3 rounded-xl border border-line bg-surface p-4">
      <h3 id="picker" className="font-display text-lg text-gold">{slot.label} · Scegli equipaggiamento</h3>
      {worn ? (
        <div className="space-y-2 rounded-lg border border-line bg-bg p-3 text-sm">
          {table ? (
            <label className="flex items-center gap-2">
              Livello di tempra
              <select value={rank} onChange={(e) => cb.setTemper(Number(e.target.value))} className="h-8 rounded-lg border border-input bg-input/30 px-2">
                {temperRanks(table).map((r) => <option key={r} value={r}>+{r}</option>)}
              </select>
            </label>
          ) : slot.type === "Weapon" || slot.type === "Armor" ? (
            <p className="text-xs text-muted">Progressione di tempra non disponibile.</p>
          ) : null}
          {table ? <p className="text-ink-2">{temperSummary(worn.id, rank, data)}</p> : null}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild><Link href={recordHref(worn.id)}>Scheda · {worn.name}</Link></Button>
            <Button variant="ghost" size="sm" onClick={cb.unequip}>Rimuovi</Button>
          </div>
        </div>
      ) : null}
      <Input type="search" aria-label="Cerca un pezzo per nome" placeholder="Cerca un pezzo per nome" value={cb.search} onChange={(e) => cb.setSearch(e.target.value)} className="h-9" />
      {slot.type === "Weapon" && cb.build.archetype ? (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={cb.classOnly} onChange={(e) => cb.setClassOnly(e.target.checked)} className="size-4 accent-[var(--gold-strong)]" />
          Armi della classe
        </label>
      ) : null}
      <div className="flex max-h-[510px] flex-col gap-1 overflow-auto pr-1">
        {cb.options.length ? (
          cb.options.map((o) => (
            <button key={o.piece.id} type="button" aria-pressed={o.equipped} onClick={() => cb.equip(o.piece.id)} className="flex items-center gap-3 rounded-lg border border-transparent bg-raised p-2.5 text-left hover:border-line-strong aria-pressed:border-gold">
              <GameIcon src={o.piece.art} size={42} />
              <span className="min-w-0 text-sm">
                <span className="block [overflow-wrap:anywhere]">{o.piece.name}</span>
                <small className="block text-xs text-muted">{o.detail}</small>
                {o.equipped ? <small className="block text-xs text-gold">Equipaggiato</small> : null}
                {o.changes === "unavailable" ? <small className="block text-xs text-dim">Confronto non disponibile</small> : null}
                {o.changes === "same" ? <small className="block text-xs text-dim">Stessi bonus di combattimento</small> : null}
                {Array.isArray(o.changes)
                  ? o.changes.map((c) => <small key={c.stat} className={cn("mr-2 inline-block text-xs", c.delta > 0 ? "text-gain" : "text-loss")}>{(c.delta > 0 ? "+" : "") + fmtDecimal(c.delta) + " " + c.stat}</small>)
                  : null}
              </span>
            </button>
          ))
        ) : (
          <p className="text-sm text-muted">Nessun pezzo corrisponde alla ricerca.</p>
        )}
      </div>
    </section>
  )
}
