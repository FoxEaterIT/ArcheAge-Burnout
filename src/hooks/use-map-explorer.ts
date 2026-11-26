"use client"
import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useEffectEvent, useLayoutEffect, useMemo, useRef, useState } from "react"
import type { MapScene, ScreenView } from "@/lib/map-cluster.types"
import { fromScreen, indexLayer, pointsInView } from "@/lib/map-cluster.utils"
import { SEARCH_LAYER } from "@/lib/map-canvas.utils"
import type { LayerBundle, MapPanelGroup, MapPanelModel, MapPointRef, MapRouteModel, MapSearchOverlay, RouteStop, SelectedPoint } from "@/lib/map-explorer.types"
import {
  GROUP_ACCENT, GROUP_COLOR_VARS, GROUP_SWATCH, MAX_ROUTE_STOPS, ZOOM_UNIT, doneCount, doneIndices, nearestFirst, optimizeRoute, parseMapUrl, refId, serializeMapUrl, startView,
} from "@/lib/map-explorer.utils"
import type { MapLayerGroup, MapLayerGroupId, MapLayerPoint } from "@/lib/map-layers.types"
import { fromFraction, initialView, maximumWidth, minimumWidth } from "@/lib/map.utils"
import { fmt } from "@/lib/text.utils"
import { useMapCanvas } from "./use-map-canvas"
import { useMapLayerData } from "./use-map-layer-data"
import { useMapPanelView } from "./use-map-panel-view"
import { useMapProgress } from "./use-map-progress"
import { useMapRoute } from "./use-map-route"
import { useReplaceQuery } from "./use-replace-query"
import { useWorldMap } from "./use-world-map"

const NO_POINTS: [number, number][] = []
const PANEL_TOGGLE_ID = "map-panel-toggle"
/** Un messaggio di stato resta visibile per questo tempo, poi torna lo stato dei livelli. */
const STATUS_MS = 6000

function readGroupColors() {
  const css = getComputedStyle(document.documentElement)
  return Object.fromEntries(Object.entries(GROUP_COLOR_VARS).map(([group, name]) => [group, css.getPropertyValue(name).trim()])) as Record<MapLayerGroupId, string>
}

/** Nome di un segnaposto con più voci: il primo, più quante altre ce ne sono. */
const markerName = (bundle: LayerBundle, point: MapLayerPoint) => {
  const others = point.length - 3
  return bundle.data.entries[point[2]][0] + (others > 0 ? ` +${others}` : "")
}

/** Punto del riquadro sotto il puntatore, dentro il bordo: le coordinate del disegno partono da lì. */
function pointerAt(event: React.MouseEvent<HTMLDivElement>): [number, number] {
  const f = event.currentTarget
  const rect = f.getBoundingClientRect()
  return [event.clientX - rect.left - f.clientLeft, event.clientY - rect.top - f.clientTop]
}

/**
 * Mappa interattiva: livelli accesi, punto scelto, raccolti, percorso, ricerca di un oggetto e indirizzo condivisibile.
 * I componenti ricevono solo valori pronti e azioni; pannello e percorso non cambiano mentre si trascina la mappa.
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
  const [selectedRef, setSelectedRef] = useState<(MapPointRef & { focus?: boolean }) | null>(initial.point)
  const [filter, setFilter] = useState("")
  const [panelView, setPanelView] = useMapPanelView()
  const [panelOpen, setPanelOpen] = useState(false)
  // Gruppi aperti nel pannello: all'inizio solo quelli con un livello acceso, così il pannello resta corto.
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(groups.filter((g) => g.layers.some((l) => active.includes(l.id))).map((g) => g.id)))
  const [status, setStatus] = useState("")
  const [colors] = useState(readGroupColors)
  const [start] = useState(() => startView(initial))
  const [routeFromUrl] = useState<RouteStop[]>(() => initial.route.map(([x, y]) => ({ x, y, name: null })))

  // Fonte scelta della ricerca: si riparte dalla fonte predefinita quando cambia l'oggetto cercato.
  const [source, setSource] = useState({ name: search?.name ?? "", index: search?.defaultSource ?? 0 })
  if ((search?.name ?? "") !== source.name) setSource({ name: search?.name ?? "", index: search?.defaultSource ?? 0 })
  const searchPoints = search?.sources[source.index]?.points ?? NO_POINTS

  const { bundles, loading, failed } = useMapLayerData(active)
  const progress = useMapProgress()
  const route = useMapRoute(routeFromUrl)
  const [frameRef, map] = useWorldMap(null, NO_POINTS, "Auroria", start)

  // Vista letta dal riquadro al momento del gesto: lo stato della vista può essere indietro di un fotogramma.
  const widthRef = useRef(map.width)
  useLayoutEffect(() => {
    widthRef.current = map.width
  })
  const liveView = useCallback((): ScreenView | null => {
    const f = frameRef.current
    if (!f || !widthRef.current) return null
    return { width: widthRef.current, scrollLeft: f.scrollLeft, scrollTop: f.scrollTop, clientWidth: f.clientWidth, clientHeight: f.clientHeight }
  }, [frameRef])

  useEffect(() => {
    if (!status) return
    const id = window.setTimeout(() => setStatus(""), STATUS_MS)
    return () => window.clearTimeout(id)
  }, [status])

  const searchBundle: LayerBundle | null = useMemo(() => {
    if (!search || !searchPoints.length) return null
    const data = { id: SEARCH_LAYER, entries: [[search.name, search.href, search.sources[source.index]?.label ?? ""] as [string, string, string]], points: searchPoints.map(([x, y]): MapLayerPoint => [x, y, 0]) }
    return { data, index: indexLayer(data) }
  }, [search, searchPoints, source.index])
  const bundleOf = useCallback((layer: string) => (layer === SEARCH_LAYER ? searchBundle : bundles.get(layer)) ?? null, [bundles, searchBundle])

  const doneIdx = useMemo(() => new Map([...bundles.values()].map((b) => [b.data.id, doneIndices(b.data, progress.done)])), [bundles, progress.done])

  // Un punto di un livello spento non è più scelto: niente scheda e niente `punto` nell'indirizzo.
  const pointRef = selectedRef && (selectedRef.layer === SEARCH_LAYER || active.includes(selectedRef.layer)) ? selectedRef : null
  const selected: SelectedPoint | null = useMemo(() => {
    if (!pointRef) return null
    const bundle = bundleOf(pointRef.layer)
    if (!bundle) return null
    const index = bundle.data.points.findIndex(([x, y]) => x === pointRef.x && y === pointRef.y)
    if (index < 0) return null
    const entries = bundle.data.points[index].slice(2).map((i) => {
      const [name, href, detail] = bundle.data.entries[i]
      return { name, href, detail }
    })
    const info = layerInfo.get(pointRef.layer)
    return { ref: pointRef, index, entries, layerLabel: info?.label ?? "Ricerca", group: info?.group ?? null, done: progress.done.has(refId(pointRef)), focus: Boolean(pointRef.focus) }
  }, [pointRef, bundleOf, layerInfo, progress.done])

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
  const fitKey = `${search?.name ?? ""}|${source.index}`
  const [fitted, setFitted] = useState(start ? fitKey : "")
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
  const query = view.width
    ? serializeMapUrl(
        {
          layers: active,
          center: fromFraction(fromScreen(view, view.clientWidth / 2, view.clientHeight / 2)),
          zoom: view.width / ZOOM_UNIT,
          point: pointRef && pointRef.layer !== SEARCH_LAYER ? { layer: pointRef.layer, x: pointRef.x, y: pointRef.y } : null,
          route: route.stops.map((s) => [s.x, s.y] as [number, number]),
        },
        new URLSearchParams(params.toString()),
      )
    : null
  useReplaceQuery(query)

  const stopFor = useCallback(
    (layer: string, index: number): RouteStop | null => {
      const bundle = bundleOf(layer)
      const point = bundle?.data.points[index]
      return bundle && point ? { x: point[0], y: point[1], name: markerName(bundle, point) } : null
    },
    [bundleOf],
  )
  const { add: addRouteStop, full: routeFull } = route
  const addStop = useCallback(
    (stop: RouteStop | null) => {
      if (!stop) return
      if (routeFull) setStatus(`Il percorso ha già ${MAX_ROUTE_STOPS} tappe.`)
      else addRouteStop(stop)
    },
    [routeFull, addRouteStop],
  )
  const choose = useCallback(
    (layer: string, index: number, focus = false) => {
      const point = bundleOf(layer)?.data.points[index]
      if (point) setSelectedRef({ layer, x: point[0], y: point[1], focus })
    },
    [bundleOf],
  )

  const term = filter.trim().toLowerCase()
  const panelGroups: MapPanelGroup[] = useMemo(
    () =>
      groups
        .map((g) => {
          const layers = g.layers.filter((l) => !term || l.label.toLowerCase().includes(term) || g.label.toLowerCase().includes(term))
          const on = layers.filter((l) => active.includes(l.id)).length
          return {
            group: g,
            // L'interruttore del gruppo agisce sui livelli che si vedono, anche con una ricerca nel pannello.
            ids: layers.map((l) => l.id),
            expanded: Boolean(term) || expanded.has(g.id),
            swatch: GROUP_SWATCH[g.id],
            accent: GROUP_ACCENT[g.id],
            checked: on === 0 ? false : on === layers.length ? true : ("indeterminate" as const),
            total: fmt(g.layers.reduce((n, l) => n + l.count, 0)),
            layers: layers.map((l) => {
              const doneHere = doneCount(l.id, progress.done)
              return { info: l, on: active.includes(l.id), loading: loading.includes(l.id), failed: failed.includes(l.id), count: doneHere ? `${fmt(doneHere)}/${fmt(l.count)}` : fmt(l.count), done: doneHere }
            }),
          }
        })
        .filter((g) => g.layers.length),
    [groups, term, active, expanded, loading, failed, progress.done],
  )

  const { clearLayer, hideDone, setHideDone } = progress
  const panel: MapPanelModel = useMemo(() => {
    const toggleOpen = () => {
      // Chiudendo, il fuoco torna al pulsante che ha aperto il pannello. Aprendo (su mobile), la mappa sale in cima
      // allo schermo, così resta visibile sopra il foglio e si vede l'effetto dei livelli.
      if (panelOpen) document.getElementById(PANEL_TOGGLE_ID)?.focus()
      else document.getElementById(PANEL_TOGGLE_ID)?.scrollIntoView({ block: "start", behavior: "smooth" })
      setPanelOpen(!panelOpen)
    }
    return {
      groups: panelGroups,
      filter,
      setFilter,
      view: panelView,
      setView: setPanelView,
      open: panelOpen,
      toggleOpen,
      toggleId: PANEL_TOGGLE_ID,
      onKeyDown: (event) => {
        if (event.key === "Escape" && panelOpen) toggleOpen()
      },
      setExpanded: (id, open) =>
        setExpanded((current) => {
          if (current.has(id) === open) return current
          const next = new Set(current)
          if (open) next.add(id)
          else next.delete(id)
          return next
        }),
      activeCount: active.length,
      toggle: (id) => setActive((current) => (current.includes(id) ? current.filter((a) => a !== id) : [...current, id])),
      setGroup: (ids, on) => setActive((current) => (on ? [...new Set([...current, ...ids])] : current.filter((id) => !ids.includes(id)))),
      all: () => setActive([...layerInfo.keys()]),
      none: () => setActive([]),
      clearDone: clearLayer,
      hideDone,
      setHideDone,
    }
  }, [panelGroups, filter, panelView, setPanelView, panelOpen, active.length, layerInfo, clearLayer, hideDone, setHideDone])

  const { stops, editing, length, toggleEditing, remove, optimize, reverse, clear, replace } = route
  const fromView = useCallback(() => {
    const v = liveView()
    if (!v) return
    const indexes = [...scene.layers.map((l) => l.index), ...(searchBundle ? [searchBundle.index] : [])]
    const { found, total } = pointsInView(indexes, v, MAX_ROUTE_STOPS, scene.hideDone ? scene.done : undefined)
    if (!total) return setStatus("Nessun segnaposto nella vista: accendi un livello o spostati.")
    if (total > MAX_ROUTE_STOPS) return setStatus(`Nella vista ci sono ${fmt(total)} segnaposti: ingrandisci finché sono al massimo ${MAX_ROUTE_STOPS}.`)
    // Si parte dal segnaposto più vicino al centro della vista.
    const ordered = nearestFirst(found, [v.clientWidth / 2, v.clientHeight / 2])
    replace(optimizeRoute(ordered.flatMap(({ layer, index }) => stopFor(layer, index) ?? [])))
    setStatus(`Percorso di ${found.length} tappe dai segnaposti visibili.`)
  }, [liveView, scene.layers, scene.hideDone, scene.done, searchBundle, replace, stopFor])
  const routeModel: MapRouteModel = useMemo(
    () => ({ stops, editing, lengthLabel: fmt(Math.round(length)), toggleEditing, remove, optimize, reverse, clear, fromView }),
    [stops, editing, length, toggleEditing, remove, optimize, reverse, clear, fromView],
  )

  const visible = canvas.visible?.flatMap(({ layer, index }) => {
    const bundle = bundleOf(layer)
    const point = bundle?.data.points[index]
    if (!bundle || !point) return []
    // Le coordinate distinguono i punti con lo stesso nome (otto nodi di Archeum vicini).
    return [{ key: `${layer}:${index}`, layer, index, name: markerName(bundle, point), detail: `${point[0]}, ${point[1]}` }]
  })

  // I ref restano fuori dall'oggetto: chi lo usa nel render deve leggere solo stato.
  return [frameRef, canvasRef, {
    map,
    panel,
    route: routeModel,
    search: search
      ? {
          name: search.name,
          href: search.href,
          intro: search.intro,
          options: search.sources.map((s, i) => ({ value: String(i), label: `${s.label} (${s.total > s.points.length ? `${fmt(s.points.length)} di ${fmt(s.total)}` : fmt(s.total)})` })),
          source: String(source.index),
          setSource: (value: string) => setSource({ name: search.name, index: Number(value) }),
        }
      : null,
    selected,
    close: () => setSelectedRef(null),
    toggleDone: () => selected && selected.ref.layer !== SEARCH_LAYER && progress.toggle(refId(selected.ref)),
    addSelectedToRoute: () => selected && addStop({ x: selected.ref.x, y: selected.ref.y, name: selected.entries[0]?.name ?? null }),
    visible,
    choose,
    status: status || (loading.length ? `Carico ${loading.length === 1 ? "un livello" : `${loading.length} livelli`}…` : failed.length ? "Alcuni livelli non si sono caricati: spegnili e riaccendili per riprovare." : ""),
    copyLink: () => {
      const url = `${window.location.origin}${window.location.pathname}${query ? `?${query}` : ""}`
      navigator.clipboard.writeText(url).then(
        () => setStatus("Link copiato: apre questa vista con i livelli accesi."),
        () => setStatus("Copia non riuscita: copia l'indirizzo dalla barra del browser."),
      )
    },
    /** Clic sul riquadro: un gruppo ingrandisce, un punto si sceglie (o diventa tappa), il vuoto chiude o aggiunge una tappa. */
    onClick: (event: React.MouseEvent<HTMLDivElement>) => {
      if (map.wasDrag()) return
      const at = pointerAt(event)
      const hit = canvas.hitAt(at)
      if (hit?.kind === "cluster") return map.zoomAt(2.5, at)
      if (hit) return route.editing ? addStop(stopFor(hit.layer, hit.index)) : choose(hit.layer, hit.index)
      const v = liveView()
      if (route.editing && v) {
        const [x, y] = fromFraction(fromScreen(v, at[0], at[1]))
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
        event.currentTarget.style.cursor = canvas.hitAt(pointerAt(event)) ? "pointer" : route.editing ? "crosshair" : ""
      },
    },
  }] as const
}
