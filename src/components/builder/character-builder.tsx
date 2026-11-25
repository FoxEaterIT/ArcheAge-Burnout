"use client"
// Character Builder: classe, equipaggiamento, statistiche e rami abilità, salvati su questo dispositivo.
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCharacterBuild } from "@/hooks/use-character-build"
import type { BuilderData, BuilderView } from "@/lib/builder.types"
import { CLASSES } from "@/lib/builder.utils"
import { ClassPicker } from "./class-picker"
import { GearBoard } from "./gear-board"
import { GearPicker } from "./gear-picker"
import { StatsPanel } from "./stats-panel"
import { TraitTree } from "./trait-tree"

const TABS: [BuilderView, string][] = [["gear", "Equipaggiamento"], ["stats", "Statistiche"], ["traits", "Rami abilità"]]

export function CharacterBuilder({ data }: { data: BuilderData }) {
  const cb = useCharacterBuild(data)
  const pieces = useMemo(() => new Map(data.equipment.map((p) => [p.id, p])), [data.equipment])
  if (!cb.ready) return <p className="text-sm text-muted">Carico la build salvata…</p>
  if (cb.choosing) return <ClassPicker cb={cb} art={data.classArt} />
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-line bg-surface p-4">
        <div className="flex items-center gap-4">
          <div>
            <strong className="block font-display text-2xl font-normal">{cb.build.archetype}</strong>
            <small className="text-muted">{cb.build.archetype ? CLASSES[cb.build.archetype].join(" / ") : ""}</small>
          </div>
          <span className="text-sm text-ink-2">Livello {cb.build.level}</span>
          <Button variant="outline" size="sm" onClick={cb.startChoosing}>Cambia classe</Button>
        </div>
        <div className="grid w-full gap-1.5 sm:w-80">
          <Label htmlFor="build-name">Nome della build</Label>
          <Input id="build-name" maxLength={80} placeholder="Nome del personaggio o della build" value={cb.build.name} onChange={(e) => cb.setName(e.target.value)} className="h-9" />
        </div>
        <small role="status" className="w-full text-xs text-muted">{cb.status}</small>
      </div>
      <nav aria-label="Viste del builder" className="flex gap-6 border-b border-line">
        {TABS.map(([view, label]) => (
          <button key={view} type="button" aria-pressed={cb.view === view} onClick={() => cb.setView(view)} className="-mb-px border-b-2 border-transparent py-2 text-sm font-semibold text-muted hover:text-ink aria-pressed:border-gold aria-pressed:text-gold">{label}</button>
        ))}
      </nav>
      {cb.view === "gear" ? (
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)]">
          <GearBoard cb={cb} pieces={pieces} />
          <GearPicker cb={cb} data={data} pieces={pieces} />
        </div>
      ) : cb.view === "stats" ? (
        <StatsPanel cb={cb} />
      ) : (
        <TraitTree cb={cb} data={data} />
      )}
    </div>
  )
}
