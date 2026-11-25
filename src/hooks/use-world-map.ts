"use client"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { MAP_INDEX } from "@/lib/client-data.utils"
import type { MapViewport, Point } from "@/lib/game.types"
import { MAP_RATIO, initialView, mapMarkers, maximumWidth, minimumWidth, visibleTiles } from "@/lib/map.utils"

const ZOOM_STEP = 1.6
const EMPTY_VIEW: MapViewport = { width: 0, dpr: 1, scrollLeft: 0, scrollTop: 0, clientWidth: 0, clientHeight: 0 }

/** Visore della mappa: zoom con pulsanti e rotella attorno al cursore, trascinamento col mouse, tile caricate a vista. */
export function useWorldMap(point: Point | null, overview: Point[], name: string) {
  const frameRef = useRef<HTMLDivElement>(null)
  const [view, setView] = useState<MapViewport>(EMPTY_VIEW)
  const pending = useRef<{ left: number; top: number } | null>(null)
  // Conta i riposizionamenti: lo scorrimento va applicato anche quando la larghezza resta uguale (es. "Torna al punto").
  const [jumps, setJumps] = useState(0)
  const frameQueued = useRef(false)
  const drag = useRef<[number, number, number, number] | null>(null)

  const measure = useCallback((width: number) => {
    const f = frameRef.current
    if (!f) return
    setView({ width, dpr: window.devicePixelRatio || 1, scrollLeft: f.scrollLeft, scrollTop: f.scrollTop, clientWidth: f.clientWidth, clientHeight: f.clientHeight })
  }, [])

  const limits = useCallback(() => {
    const f = frameRef.current!
    const min = minimumWidth(f.clientWidth, f.clientHeight)
    return { min, max: maximumWidth(min, window.devicePixelRatio || 1) }
  }, [])

  /** Porta la mappa alla larghezza `value` tenendo il punto `center` (in frazioni) sotto `anchor` (pixel del riquadro). */
  const position = useCallback((value: number, center: [number, number], anchor: [number, number]) => {
    const f = frameRef.current
    if (!f) return
    const { min, max } = limits()
    const width = Math.max(min, Math.min(value, max))
    const offset = Math.max(0, (f.clientWidth - width) / 2)
    pending.current = { left: center[0] * width + offset - anchor[0], top: center[1] * width * MAP_RATIO - anchor[1] }
    setView((v) => ({ ...v, width }))
    setJumps((n) => n + 1)
  }, [limits])

  // Applica lo scorrimento dopo che il nuovo palco è stato disegnato alla nuova larghezza.
  useLayoutEffect(() => {
    const f = frameRef.current
    if (!f || !pending.current) return
    f.scrollLeft = pending.current.left
    f.scrollTop = pending.current.top
    pending.current = null
    measure(view.width)
  }, [view.width, jumps, measure])

  const midpoint = (): [number, number] => {
    const f = frameRef.current!
    return [f.clientWidth / 2, f.clientHeight / 2]
  }

  const zoom = useCallback((factor: number, anchor?: [number, number]) => {
    const f = frameRef.current
    if (!f || !view.width) return
    const at = anchor ?? [f.clientWidth / 2, f.clientHeight / 2]
    const offset = Math.max(0, (f.clientWidth - view.width) / 2)
    position(view.width * factor, [(f.scrollLeft + at[0] - offset) / view.width, (f.scrollTop + at[1]) / (view.width * MAP_RATIO)], at)
  }, [position, view.width])

  const reset = useCallback(() => {
    const f = frameRef.current
    if (!f) return
    const { min, max } = limits()
    const start = initialView(point, overview, f.clientWidth, f.clientHeight, min, max)
    position(start.width, start.center, [f.clientWidth / 2, f.clientHeight / 2])
  }, [limits, overview, point, position])

  useEffect(() => {
    const id = requestAnimationFrame(reset)
    return () => cancelAnimationFrame(id)
  }, [reset])

  // La rotella deve poter bloccare lo scorrimento della pagina: serve un listener non passivo.
  const zoomRef = useRef(zoom)
  useEffect(() => {
    zoomRef.current = zoom
  })
  useEffect(() => {
    const f = frameRef.current
    if (!f) return
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      const rect = f.getBoundingClientRect()
      zoomRef.current(event.deltaY < 0 ? 1.25 : 0.8, [event.clientX - rect.left, event.clientY - rect.top])
    }
    f.addEventListener("wheel", onWheel, { passive: false })
    return () => f.removeEventListener("wheel", onWheel)
  }, [])

  const onScroll = () => {
    if (frameQueued.current) return
    frameQueued.current = true
    requestAnimationFrame(() => {
      frameQueued.current = false
      measure(view.width)
    })
  }

  const pointer = {
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return
      const f = event.currentTarget
      drag.current = [event.clientX, event.clientY, f.scrollLeft, f.scrollTop]
      f.setPointerCapture(event.pointerId)
    },
    onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => {
      if (!drag.current) return
      const f = event.currentTarget
      f.scrollLeft = drag.current[2] + drag.current[0] - event.clientX
      f.scrollTop = drag.current[3] + drag.current[1] - event.clientY
    },
    onLostPointerCapture: () => {
      drag.current = null
    },
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "+" || event.key === "=") zoom(ZOOM_STEP, midpoint())
    if (event.key === "-") zoom(1 / ZOOM_STEP, midpoint())
  }

  const { tiles } = useMemo(() => visibleTiles(view, MAP_INDEX), [view])
  const markers = useMemo(() => mapMarkers(point, overview, name), [point, overview, name])
  const min = minimumWidth(view.clientWidth, view.clientHeight)
  const max = maximumWidth(min, view.dpr)
  // Il ref resta fuori dall'oggetto: chi lo usa nel render deve leggere solo stato.
  return [frameRef, {
    width: view.width,
    tiles,
    markers,
    onScroll,
    onKeyDown,
    pointer,
    zoomIn: () => zoom(ZOOM_STEP),
    zoomOut: () => zoom(1 / ZOOM_STEP),
    reset,
    canZoomIn: view.width > 0 && view.width < max,
    canZoomOut: view.width > 0 && view.width > min,
  }] as const
}
