// Statistiche: livello e punti attributo, riepilogo e valori di combattimento per gruppo.
import { Minus, Plus, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GameSelect } from "@/components/ui/game-select"
import type { CharacterBuild } from "@/hooks/character-build.types"
import { ATTRIBUTES, LEVELS, STARTING_STATS, formatStat, pointsForLevel, statLabel } from "@/lib/builder.utils"
import { Hud } from "./gear-board"

export function StatsPanel({ cb }: { cb: CharacterBuild }) {
  const base = cb.build.archetype ? STARTING_STATS[cb.build.archetype] : [0, 0, 0, 0, 0, 0]
  return (
    <section aria-label="Statistiche del personaggio" className="grid gap-6 rounded-xl border border-line bg-surface p-5 lg:grid-cols-[minmax(260px,1fr)_minmax(0,2fr)]">
      <div className="space-y-4">
        <h3 className="font-display text-xl text-gold">{(cb.build.name.trim() || cb.build.archetype) + " · Lv. " + cb.build.level}</h3>
        <Hud cb={cb} />
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span>Livello personaggio</span>
            <GameSelect label="Livello personaggio" value={String(cb.build.level)} onChange={(v) => cb.setLevel(Number(v))} options={LEVELS.map((n) => ({ value: String(n), label: String(n), disabled: pointsForLevel(n) < cb.spent }))} className="w-20" />
          </div>
          <strong className="tabular-nums text-gold">{cb.left} punti disponibili</strong>
          <Button variant="ghost" size="sm" onClick={cb.resetPoints} disabled={!cb.spent}><RotateCcw />Riassegna punti</Button>
        </div>
        <h4 className="font-display text-lg">Attributi principali</h4>
        <ul className="space-y-1">
          {ATTRIBUTES.map((label, i) => (
            <li key={label} className="grid grid-cols-[1fr_auto_32px_32px] items-center gap-2 rounded-md bg-bg px-3 py-2">
              <span>
                {label}
                <small className="block text-xs text-muted">{base[i]} base + {cb.build.points[i]} assegnati</small>
              </span>
              <strong className="text-2xl font-semibold tabular-nums text-gold">{base[i] + cb.build.points[i]}</strong>
              <Button variant="outline" size="icon-sm" aria-label={"Riduci " + label} disabled={!cb.build.points[i]} onClick={() => cb.changePoint(i, -1)}><Minus /></Button>
              <Button variant="outline" size="icon-sm" aria-label={"Aumenta " + label} disabled={!cb.left} onClick={() => cb.changePoint(i, 1)}><Plus /></Button>
            </li>
          ))}
        </ul>
      </div>
      <div className="grid content-start gap-x-6 gap-y-4 sm:grid-cols-2">
        <p className="text-xs text-muted sm:col-span-2">{cb.stats.coverage}</p>
        {cb.stats.groups.map((g) => (
          <section key={g.label}>
            <h4 className="mb-1 border-b border-line-strong pb-1.5 font-display text-lg">{g.label}</h4>
            {g.keys.map((key) => (
              <div key={key} className="flex justify-between gap-2 border-b border-line py-1.5 text-sm">
                <span className="text-ink-2">{statLabel(key)}</span>
                <strong className="font-semibold tabular-nums">{formatStat(cb.stats.totals[key] || 0)}</strong>
              </div>
            ))}
          </section>
        ))}
      </div>
    </section>
  )
}
