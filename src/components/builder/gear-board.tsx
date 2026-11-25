// Slot dell'equipaggiamento divisi per gruppo, con il riepilogo dei bonus.
import { GameGlyph } from "@/components/game/game-glyph"
import { GameIcon } from "@/components/game/game-icon"
import type { CharacterBuild } from "@/hooks/character-build.types"
import type { GearPiece } from "@/lib/builder.types"
import { BUILD_SLOTS, SLOT_GLYPHS, SLOT_GROUPS, formatStat } from "@/lib/builder.utils"

export function GearBoard({ cb, pieces }: { cb: CharacterBuild; pieces: Map<string, GearPiece> }) {
  return (
    <section aria-label="Equipaggiamento" className="space-y-4 rounded-xl border border-line bg-surface p-4">
      <Hud cb={cb} />
      <div className="grid gap-4 sm:grid-cols-2">
        {SLOT_GROUPS.map(([group, types]) => (
          <section key={group}>
            <h3 className="mb-2 font-display text-lg text-gold">{group}</h3>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(146px,100%),1fr))] gap-1.5">
              {BUILD_SLOTS.filter((s) => types.includes(s.type)).map((s) => {
                const piece = cb.build.gear[s.key] ? pieces.get(cb.build.gear[s.key]!) : undefined
                const temper = cb.build.temper[s.key]
                return (
                  <button key={s.key} type="button" aria-pressed={cb.slot === s.key} onClick={() => cb.selectSlot(s.key)} className="flex min-h-12 items-center gap-2 rounded-lg border border-transparent bg-raised p-1.5 text-left hover:border-line-strong aria-pressed:border-gold aria-pressed:bg-[color-mix(in_oklab,var(--gold)_10%,var(--raised))]">
                    {piece ? <GameIcon src={piece.art} size={34} /> : <span className="grid size-[34px] shrink-0 place-items-center rounded-[4px] bg-bg text-dim"><GameGlyph src={SLOT_GLYPHS[s.type]} className="size-5" /></span>}
                    <span className="min-w-0">
                      <small className="block text-xs text-muted">{s.label}</small>
                      <strong className="block text-[13px] font-semibold [overflow-wrap:anywhere]">{piece ? piece.name + (temper ? ` +${temper}` : "") : "Scegli pezzo"}</strong>
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </div>
      <p className="text-xs text-muted">{cb.stats.coverage}</p>
    </section>
  )
}

export function Hud({ cb }: { cb: CharacterBuild }) {
  return (
    <dl className="grid grid-cols-2 divide-line border-b border-line pb-3 sm:grid-cols-4 sm:divide-x">
      {cb.stats.hud.map((h) => (
        <div key={h.label} className="px-3 py-1">
          <dt className="text-xs text-muted">{h.label}</dt>
          <dd className="text-2xl font-semibold tabular-nums">{formatStat(h.value)}</dd>
        </div>
      ))}
    </dl>
  )
}
