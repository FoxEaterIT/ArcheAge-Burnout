"use client"
import { useEffect, useMemo, useState } from "react"
import type { Build, BuilderData, BuilderView, ClassName, SlotKey } from "@/lib/builder.types"
import {
  BUILD_KEY, CLASSES, DRAFT_KEY, EMPTY_BUILD, branchEntries, branchTraitPoints, buildTraitPoints, gearOptions, normalizeBuild, pieceName, pointsForLevel,
  readings, spentPoints, toggleTrait, traitLayout,
} from "@/lib/builder.utils"
import { readStored, writeStored } from "@/lib/storage.utils"

/** Stato del Character Builder: build salvata sul dispositivo, slot e ramo scelti, viste. */
export function useCharacterBuild(data: BuilderData) {
  const [build, setBuild] = useState<Build | null>(null)
  const [status, setStatus] = useState("")
  const [choosing, setChoosing] = useState(false)
  const [view, setView] = useState<BuilderView>("gear")
  const [slot, setSlot] = useState<SlotKey>("primary")
  const [search, setSearch] = useState("")
  const [classOnly, setClassOnly] = useState(true)
  const [branchChoice, setBranch] = useState<string | null>(null)
  const [selectedTrait, setSelectedTrait] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)

  // La build vive nel browser: si legge dopo il montaggio, così server e client disegnano lo stesso HTML.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lettura una tantum dal localStorage
    setBuild(normalizeBuild(readStored(BUILD_KEY)))
  }, [])

  const save = (next: Build) => {
    setBuild(next)
    setStatus(writeStored(BUILD_KEY, next) ? "Build salvata su questo dispositivo" : "Salvataggio locale non disponibile")
  }
  const update = (change: (b: Build) => Build) => build && save(change(build))

  const b = build ?? EMPTY_BUILD
  const branch = branchChoice && b.archetype && (CLASSES[b.archetype] as readonly string[]).includes(branchChoice) ? branchChoice : b.archetype ? CLASSES[b.archetype][0] : ""
  const names = useMemo(() => pieceName(data.equipment), [data.equipment])
  const stats = useMemo(() => readings(b, data, names), [b, data, names])
  const options = useMemo(() => gearOptions(b, slot, search, classOnly, data), [b, slot, search, classOnly, data])
  const layout = useMemo(() => traitLayout(b, branch, data), [b, branch, data])
  const entries = useMemo(() => branchEntries(b, branch, data.traitBook), [b, branch, data.traitBook])
  const traitId = selectedTrait && entries.some(([id]) => id === selectedTrait) ? selectedTrait : data.traitBook[branch + "0"] ? branch + "0" : entries[0]?.[0] ?? null

  return {
    ready: build !== null,
    build: b,
    status,
    choosing: choosing || (build !== null && !b.archetype),
    view,
    setView,
    stats,
    spent: spentPoints(b),
    left: pointsForLevel(b.level) - spentPoints(b),
    setName: (name: string) => update((x) => ({ ...x, name: name.slice(0, 80) })),
    startChoosing: () => setChoosing(true),
    chooseClass: (name: ClassName) => {
      if (build && build.archetype !== name) {
        if (build.archetype) writeStored(DRAFT_KEY(build.archetype), build)
        const draft = normalizeBuild(readStored(DRAFT_KEY(name)))
        save({ ...draft, archetype: name })
      } else update((x) => ({ ...x, archetype: name }))
      setChoosing(false)
      setBranch(null)
      setSelectedTrait(null)
      setSlot("primary")
    },
    setLevel: (level: number) => update((x) => ({ ...x, level })),
    changePoint: (i: number, delta: number) => update((x) => ({ ...x, points: x.points.map((n, j) => (j === i ? n + delta : n)) })),
    resetPoints: () => update((x) => ({ ...x, points: x.points.map(() => 0) })),
    slot,
    selectSlot: (key: SlotKey) => {
      setSlot(key)
      setSearch("")
    },
    search,
    setSearch,
    classOnly,
    setClassOnly,
    options,
    equip: (id: string) =>
      update((x) => {
        const temper = { ...x.temper }
        if (x.gear[slot] !== id) delete temper[slot]
        return { ...x, gear: { ...x.gear, [slot]: id }, temper }
      }),
    unequip: () =>
      update((x) => {
        const gear = { ...x.gear }
        const temper = { ...x.temper }
        delete gear[slot]
        delete temper[slot]
        return { ...x, gear, temper }
      }),
    setTemper: (rank: number) => update((x) => ({ ...x, temper: { ...x.temper, [slot]: rank } })),
    branch,
    setBranch: (weapon: string) => {
      setBranch(weapon)
      setSelectedTrait(null)
    },
    layout,
    traitId,
    selectTrait: setSelectedTrait,
    toggleTrait: (id: string) => update((x) => toggleTrait(x, branch, id)),
    resetBranch: () =>
      update((x) => {
        const traits = { ...x.traits }
        for (const [id] of entries) delete traits[id]
        return { ...x, traits }
      }),
    branchPoints: branchTraitPoints(b, entries),
    buildPoints: buildTraitPoints(b, data.traitBook),
    zoom,
    setZoom: (value: number) => setZoom(Math.max(0.6, Math.min(1.6, Math.round(value * 10) / 10))),
  }
}
