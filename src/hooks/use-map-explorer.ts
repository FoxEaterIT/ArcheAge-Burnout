"use client"
import { useSearchParams } from "next/navigation"
import { useEffect, useEffectEvent, useMemo, useState } from "react"
import type { MapScene } from "@/lib/map-cluster.types"
import { fromScreen, indexLayer, pointsInView } from "@/lib/map-cluster.utils"
import { SEARCH_LAYER } from "@/lib/map-canvas.utils"
import type { MapPointRef, MapSearchOverlay, SelectedPoint } from "@/lib/map-explorer.types"
import {
  GROUP_COLOR_VARS, GROUP_SWATCH, MAX_ROUTE_STOPS, ZOOM_UNIT, doneCount, doneIndices, optimizeRoute, parseMapUrl, pointId, refId, serializeMapUrl, startView,
} from "@/lib/map-explorer.utils"
import type { MapLayerGroup, MapLayerGroupId, MapLayerInfo } from "@/lib/map-layers.types"
import { fromFraction, initialView, maximumWidth, minimumWidth } from "@/lib/map.utils"
import { fmt } from "@/lib/text.utils"
import { useMapCanvas } from "./use-map-canvas"
import { useMapLayerData } from "./use-map-layer-data"
import { useMapProgress } from "./use-map-progress"
import { useMapRoute } from "./use-map-route"
import { useReplaceQuery } from "./use-replace-query"
import { useWorldMap } from "./use-world-map"

const NO_POINTS: [number, number][] = []

function readGroupColors() {
  const css = getComputedStyle(document.documentElement)
  return Object.fromEntries(Object.entries(GROUP_COLOR_VARS).map(([group, name]) => [group, css.getPropertyValue(name).trim()])) as Record<MapLayerGroupId, string>
}

/**
 * Mappa interattiva: livelli accesi, punto scelto, raccolti, percorso, ricerca di un oggetto e indirizzo condivisibile.
 * I componenti ricevono solo valori pronti e azioni.
 */
export function useMapExplorer(groups: MapLayerGroup[], search: MapSearchOverlay | null) {
  const params = useSearchParams()
  const layerInfo = useMemo(() => new Map(groups.flatMap((g) => g.layers.map((l) => [l.id, l]))), [groups])
  const [initial] = useState(() => parseMapUrl(new URLSearchParams(params.toString())))
  const [active, setActive] = useState<string[]>(() => {
    const chosen = initial.layers ?? [...layerInfo.values()].filter((l) => l.on).map((l) => l.id)
    const withPoint = initial.point && !chosen.includes(initial.point.layer) ? [...chosen, initial.point.layer] : chosen
    return withPoint.filter((id) => layerInfo.has(id))
  })
  const [selectedRef, setSelectedRef] = useState<MapPointRef | null>(initial.point)
  const [filter, setFilter] = useState("")
  const [panelOpen, setPanelOpen] = useState(false)
  const [status, setStatus] = useState("")
  const [colors] = useState(readGroupColors)
  const [start] = useState(() => startView(initial))

  // Fonte scelta della ricerca: si riparte dalla fonte predefinita quando cambia l'oggetto cercato.
  const [source, setSource] = useState({ name: search?.name ?? "", index: search?.defaultSource ?? 0 })
  if ((search?.name ?? "") !== source.name) setSource({ name: search?.name ?? "", index: search?.defaultSource ?? 0 })
  const searchPoints = search?.sources[source.index]?.points ?? NO_POINTS

  const { bundles, loading, failed } = useMapLayerData(active)
  const progress = useMapProgress()
  const route = useMapRoute(useMemo(() => initial.route.map(([x, y]) => ({ x, y, name: null })), [initial]))
  const [frameRef, map] = useWorldMap(null, NO_POINTS, "Auroria", start)

  const searchBundle = useMemo(() => {
    if (!search || !searchPoints.length) return null
    const data = { id: SEARCH_LAYER, entries: [[search.name, search.href, search.sources[source.index]?.label ?? ""] as [string, string, string]], points: searchPoints.map(([x, y]) => [x, y, 0] as [number, number, number]) }
    return { data, index: indexLayer(data) }
  }, [search, searchPoints, source.index])

  const doneIdx = useMemo(() => new Map([...bundles.values()].map((b) => [b.data.id, doneIndices(b.data, progress.done)])), [bundles, progress.done])

  const selected: SelectedPoint | null = useMemo(() => {
    if (!selectedRef) return null
    const bundle = selectedRef.layer === SEARCH_LAYER ? searchBundle : bundles.get(selectedRef.layer)
    if (!bundle) return null
    const index = bundle.data.points.findIndex(([x, y]) => x === selectedRef.x && y === selectedRef.y)
    if (index < 0) return null
    const [name, href, detail] = bundle.data.entries[bundle.data.points[index][2]]
    const info = layerInfo.get(selectedRef.layer)
    return { ref: selectedRef, index, name, href, detail, layerLabel: info?.label ?? "Ricerca", group: info?.group ?? null, done: progress.done.has(refId(selectedRef)) }
  }, [selectedRef, bundles, searchBundle, layerInfo, progress.done])

  const scene: MapScene = useMemo(
    () => ({
      layers: active.flatMap((id) => {
        const bundle = bundles.get(id)
        const info = layerInfo.get(id)
        return bundle && info ? [{ id, index: bundle.index, color: colors[info.group], art: info.art }] : []
      }),
      done: doneIdx,
      hideDone: progress.hideDone,
      selected: selected ? { layer: selected.ref.layer, index: selected.index } : null,
      route: route.stops,
      search: searchBundle?.index ?? null,
      spread: map.width > 0 && !map.canZoomIn,
    }),
    [active, bundles, layerInfo, colors, doneIdx, progress.hideDone, selected, route.stops, searchBundle, map.width, map.canZoomIn],
  )
  const [canvasRef, canvas] = useMapCanvas(frameRef, map.width, scene)

  // Una nuova ricerca inquadra i suoi punti; al primo montaggio vince la vista del link, se c'è.
  const fitSearch = useEffectEvent(() => {
    const f = frameRef.current
    if (!f || !searchPoints.length) return
    const min = minimumWidth(f.clientWidth, f.clientHeight)
    const view = initialView(null, searchPoints, f.clientWidth, f.clientHeight, min, maximumWidth(min, window.devicePixelRatio || 1))
    map.goTo(view.width, view.center)
  })
  const [fitted, setFitted] = useState(start ? `${search?.name ?? ""}|${source.index}` : "")
  const fitKey = `${search?.name ?? ""}|${source.index}`
  useEffect(() => {
    if (!search || fitKey === fitted) return
    const id = requestAnimationFrame(() => {
      fitSearch()
      setFitted(fitKey)
    })
    return () => cancelAnimationFrame(id)
  }, [fitKey, fitted, search])

  // Stato nell'indirizzo, quando la vista è misurata.
  const view = map.view
  const center = view.width ? fromFraction(fromScreen({ ...view }, view.clientWidth / 2, view.clientHeight / 2)) : null
  const urlState = {
    layers: active,
    center,
    zoom: view.width ? view.width / ZOOM_UNIT : null,
    point: selectedRef && selectedRef.layer !== SEARCH_LAYER ? selectedRef : null,
    route: route.stops.map((s) => [s.x, s.y] as [number, number]),
  }
  const query = view.width ? serializeMapUrl(urlState, new URLSearchParams(params.toString())) : null
  useReplaceQuery(query)

  const toggle = (id: string) => setActive((current) => (current.includes(id) ? current.filter((a) => a !== id) : [...current, id]))
  const setGroup = (group: MapLayerGroup, on: boolean) => {
    const ids = group.layers.map((l) => l.id)
    setActive((current) => (on ? [...new Set([...current, ...ids])] : current.filter((id) => !ids.includes(id))))
  }
  const choose = (layer: string, index: number) => {
    const bundle = layer === SEARCH_LAYER ? searchBundle : bundles.get(layer)
    const point = bundle?.data.points[index]
    if (point) setSelectedRef({ layer, x: point[0], y: point[1] })
  }
  const stopFor = (layer: string, index: number) => {
    const bundle = layer === SEARCH_LAYER ? searchBundle : bundles.get(layer)
    const point = bundle?.data.points[index]
    return point ? { x: point[0], y: point[1], name: bundle.data.entries[point[2]][0] } : null
  }
  const addStop = (stop: { x: number; y: number; name: string | null } | null) => {
    if (!stop) return
    if (route.full) setStatus(`Il percorso ha già ${MAX_ROUTE_STOPS} tappe.`)
    else route.add(stop)
  }

  const term = filter.trim().toLowerCase()
  const panelGroups = groups
    .map((g) => {
      const layers = g.layers.filter((l) => !term || l.label.toLowerCase().includes(term) || g.label.toLowerCase().includes(term))
      const on = layers.filter((l) => active.includes(l.id)).length
      return {
        group: g,
        swatch: GROUP_SWATCH[g.id],
        checked: on === 0 ? false : on === layers.length ? true : ("indeterminate" as const),
        total: fmt(g.layers.reduce((n, l) => n + l.count, 0)),
        layers: layers.map((l: MapLayerInfo) => {
          const doneHere = doneCount(l.id, progress.done)
          return {
            info: l,
            on: active.includes(l.id),
            loading: loading.includes(l.id),
            failed: failed.includes(l.id),
            count: doneHere ? `${fmt(doneHere)}/${fmt(l.count)}` : fmt(l.count),
            done: doneHere,
          }
        }),
      }
    })
    .filter((g) => g.layers.length)

  const visible = canvas.visible?.flatMap(({ layer, index }) => {
    const bundle = layer === SEARCH_LAYER ? searchBundle : bundles.get(layer)
    const point = bundle?.data.points[index]
    if (!bundle || !point) return []
    const [name] = bundle.data.entries[point[2]]
    // Le coordinate distinguono i punti con lo stesso nome (otto nodi di Archeum vicini).
    return [{ key: `${layer}:${index}`, layer, index, name, detail: `${point[0]}, ${point[1]}` }]
  })

  // I ref restano fuori dall'oggetto: chi lo usa nel render deve leggere solo stato.
  return [frameRef, canvasRef, {
    map,
    panel: {
      groups: panelGroups,
      filter,
      setFilter,
      open: panelOpen,
      toggleOpen: () => setPanelOpen((o) => !o),
      activeCount: active.length,
      toggle,
      setGroup,
      all: () => setActive([...layerInfo.keys()]),
      none: () => setActive([]),
      clearDone: progress.clearLayer,
      hideDone: progress.hideDone,
      setHideDone: progress.setHideDone,
    },
    search: search
      ? { name: search.name, href: search.href, intro: search.intro, sources: search.sources.map((s, i) => ({ index: i, label: s.label, count: s.total > s.points.length ? `${fmt(s.points.length)} di ${fmt(s.total)}` : fmt(s.total) })), source: source.index, setSource: (index: number) => setSource({ name: search.name, index }) }
      : null,
    selected,
    close: () => setSelectedRef(null),
    toggleDone: () => selected && selected.ref.layer !== SEARCH_LAYER && progress.toggle(pointId(selected.ref.layer, selected.ref.x, selected.ref.y)),
    addSelectedToRoute: () => selected && addStop({ x: selected.ref.x, y: selected.ref.y, name: selected.name }),
    visible,
    choose,
    loadingCount: loading.length,
    failedCount: failed.length,
    status,
    copyLink: () => {
      const url = `${window.location.origin}${window.location.pathname}${query ? `?${query}` : ""}`
      navigator.clipboard.writeText(url).then(
        () => setStatus("Link copiato: apre questa vista con i livelli accesi."),
        () => setStatus("Copia non riuscita: copia l'indirizzo dalla barra del browser."),
      )
    },
    route: {
      ...route,
      lengthLabel: fmt(Math.round(route.length)),
      fromView: () => {
        const indexes = scene.layers.map((l) => l.index)
        const { found, total } = pointsInView(indexes, { ...view }, MAX_ROUTE_STOPS, progress.hideDone ? doneIdx : undefined)
        if (!total) return setStatus("Nessun segnaposto nella vista: accendi un livello o spostati.")
        if (total > MAX_ROUTE_STOPS) return setStatus(`Nella vista ci sono ${fmt(total)} segnaposti: ingrandisci finché sono al massimo ${MAX_ROUTE_STOPS}.`)
        route.replace(optimizeRoute(found.flatMap(({ layer, index }) => stopFor(layer, index) ?? [])))
        setStatus(`Percorso di ${found.length} tappe dai segnaposti visibili.`)
      },
    },
    /** Clic sul riquadro: un gruppo ingrandisce, un punto si sceglie (o diventa tappa), il vuoto chiude o aggiunge una tappa. */
    onClick: (event: React.MouseEvent<HTMLDivElement>) => {
      if (map.wasDrag()) return
      const hit = canvas.hitAt(event.clientX, event.clientY)
      const rect = event.currentTarget.getBoundingClientRect()
      const at: [number, number] = [event.clientX - rect.left, event.clientY - rect.top]
      if (hit?.kind === "cluster") return map.zoomAt(2.5, at)
      if (hit) return route.editing ? addStop(stopFor(hit.layer, hit.index)) : choose(hit.layer, hit.index)
      if (route.editing) {
        const [x, y] = fromFraction(fromScreen({ ...view }, at[0], at[1]))
        return addStop({ x, y, name: null })
      }
      setSelectedRef(null)
    },
    /** Gesti del riquadro: il trascinamento del visore, più il cursore a mano sopra i segnaposti. */
    pointer: {
      ...map.pointer,
      onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => {
        map.pointer.onPointerMove(event)
        if (event.buttons) return
        event.currentTarget.style.cursor = canvas.hitAt(event.clientX, event.clientY) ? "pointer" : route.editing ? "crosshair" : ""
      },
    },
  }] as const
}
