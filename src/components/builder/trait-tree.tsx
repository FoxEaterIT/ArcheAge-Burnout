"use client"
// Rami abilità: un ramo per arma della classe, nodi a rombo collegati, scheda del tratto scelto.
import { Minus, Plus } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { GameIcon } from "@/components/game/game-icon"
import { useDragScroll } from "@/hooks/use-drag-scroll"
import type { CharacterBuild } from "@/hooks/character-build.types"
import type { BuilderData } from "@/lib/builder.types"
import { CLASSES, traitLocked, treeGroupLabel } from "@/lib/builder.utils"

export function TraitTree({ cb, data }: { cb: CharacterBuild; data: BuilderData }) {
  const drag = useDragScroll()
  const selected = cb.layout.nodes.find((n) => n.id === cb.traitId)
  const locked = selected ? traitLocked(cb.build, cb.branch, selected.id, selected.group) : false
  return (
    <section aria-label="Rami abilità" className="grid gap-4 rounded-xl border border-line bg-surface p-4 md:grid-cols-[minmax(180px,24%)_minmax(0,1fr)]">
      <div className="flex flex-wrap items-center gap-2 md:col-span-2">
        {cb.build.archetype ? CLASSES[cb.build.archetype].map((w) => (
          <Button key={w} variant="outline" size="sm" aria-pressed={cb.branch === w} onClick={() => cb.setBranch(w)} className="aria-pressed:border-gold aria-pressed:text-gold">{w}</Button>
        )) : null}
        <Button variant="outline" size="icon-sm" aria-label="Riduci albero" onClick={() => cb.setZoom(cb.zoom - 0.2)}><Minus /></Button>
        <Button variant="outline" size="icon-sm" aria-label="Ingrandisci albero" onClick={() => cb.setZoom(cb.zoom + 0.2)}><Plus /></Button>
        <span className="text-sm tabular-nums text-muted">{Math.round(cb.zoom * 100)}%</span>
        <Button variant="ghost" size="sm" className="ml-auto" disabled={!cb.branchPoints} onClick={cb.resetBranch}>Azzera ramo</Button>
      </div>
      <aside className="space-y-2 text-sm">
        {selected ? (
          <>
            <small className="text-muted">{cb.build.archetype} · {cb.branch}</small>
            <h3 className="font-display text-2xl">{selected.name}</h3>
            <p className="text-ink-2">{treeGroupLabel(selected.group)} · {selected.points} PT</p>
            <Button onClick={() => cb.toggleTrait(selected.id)} disabled={locked}>{selected.learned ? "Rimuovi tratto" : "Apprendi tratto"}</Button>
            {locked ? <p className="text-muted">Richiede il bonus iniziale del ramo.</p> : null}
          </>
        ) : null}
        <p className="text-muted">{cb.branchPoints} PT nel ramo · {cb.buildPoints} PT nella build</p>
      </aside>
      <div tabIndex={0} aria-label="Mappa dei tratti" title="Trascina per spostarti" {...drag} className="h-[clamp(360px,65vh,760px)] cursor-grab overflow-auto overscroll-contain rounded-lg border border-line-strong bg-bg active:cursor-grabbing">
        <div className="relative mx-auto w-[640px]" style={{ height: cb.layout.height, zoom: cb.zoom }}>
          {cb.layout.headings.map((h) => <strong key={h.label} className="absolute left-3 font-display text-lg font-normal text-gold" style={{ top: h.y }}>{h.label}</strong>)}
          {cb.layout.lines.map((l, i) => (
            <i key={i} aria-hidden className="absolute h-px origin-left bg-line-strong" style={{ left: l.x1, top: l.y1, width: Math.hypot(l.x2 - l.x1, l.y2 - l.y1), transform: `rotate(${Math.atan2(l.y2 - l.y1, l.x2 - l.x1)}rad)` }} />
          ))}
          {cb.layout.nodes.map((n) => (
            <button key={n.id} type="button" aria-pressed={n.id === cb.traitId} aria-label={`${n.name} · ${n.points} PT${n.learned ? " · appreso" : ""}`} onClick={() => cb.selectTrait(n.id)} className="group absolute size-[46px] -translate-x-1/2 -translate-y-1/2" style={{ left: n.x, top: n.y }}>
              <span className={cn("absolute inset-[5px] grid rotate-45 place-items-center border shadow-[0_0_0_3px_var(--bg),0_0_0_4px_var(--line-strong)]", n.learned ? "border-gold bg-gold" : "border-line-strong bg-raised", "group-aria-pressed:outline-2 group-aria-pressed:outline-offset-4 group-aria-pressed:outline-gold-strong")}>
                <span className="-rotate-45"><GameIcon src={n.art ?? data.fallbackSkillArt} size={26} className={n.learned ? "" : "opacity-80"} /></span>
              </span>
              <small className="absolute top-[49px] left-1/2 w-[146px] -translate-x-1/2 text-center text-xs leading-tight text-ink-2">{n.name}</small>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
