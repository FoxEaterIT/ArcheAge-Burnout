"use client"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import type { CanvasPalette, DrawItem, MapScene, ScreenView } from "@/lib/map-cluster.types"
import { clusterView, hitTest, toScreen } from "@/lib/map-cluster.utils"
import { ICON_WIDTH, SEARCH_LAYER, drawCluster, drawPoint, drawRoute, drawSearchPoint, drawSelection, readPalette } from "@/lib/map-canvas.utils"

/** Oltre questi segnaposti singoli nella vista l'elenco accessibile lascia il posto all'invito a ingrandire. */
export const VISIBLE_LIST_LIMIT = 40
/** Con pochi punti della ricerca si numerano, come nella scheda dell'oggetto. */
const NUMBERED_SEARCH = 50

/**
 * Canvas dei segnaposti sopra le tile. Si ridisegna allo scorrimento (nello stesso fotogramma, senza passare
 * dallo stato di React), allo zoom e quando cambia la scena. Il riquadro resta l'unico bersaglio dei gesti:
 * il clic arriva a `hitAt`, che trova il segnaposto sotto il puntatore.
 */
export function useMapCanvas(frame: React.RefObject<HTMLDivElement | null>, width: number, scene: MapScene) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef(scene)
  const widthRef = useRef(width)
  const itemsRef = useRef<DrawItem[]>([])
  const paletteRef = useRef<CanvasPalette | null>(null)
  const images = useRef(new Map<string, HTMLImageElement>())
  const [visible, setVisible] = useState<{ layer: string; index: number }[] | null>(null)
  const visibleKey = useRef("")
  const drawRef = useRef<() => void>(() => {})

  /** Icona di gioco di un livello: si scarica una volta e, appena pronta, ridisegna. */
  function image(src: string) {
    let img = images.current.get(src)
    if (!img) {
      img = new Image()
      img.onload = () => drawRef.current()
      img.src = src
      images.current.set(src, img)
    }
    return img
  }

  const draw = () => {
    const f = frame.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!f || !canvas || !ctx) return
    paletteRef.current ??= readPalette(document.documentElement)
    const palette = paletteRef.current
    const dpr = window.devicePixelRatio || 1
    const w = f.clientWidth
    const h = f.clientHeight
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
    const s = sceneRef.current
    const stage = widthRef.current
    if (!stage) return
    const view: ScreenView = { width: stage, scrollLeft: f.scrollLeft, scrollTop: f.scrollTop, clientWidth: w, clientHeight: h }
    const large = stage >= ICON_WIDTH
    const colors = new Map(s.layers.map((l) => [l.id, l]))
    const items = clusterView(s.layers.map((l) => l.index), view, { spread: s.spread, hidden: s.hideDone ? s.done : undefined, pinned: s.selected })
    const numbered = (s.search?.fx.length ?? 0) <= NUMBERED_SEARCH
    // I punti della ricerca si raggruppano come gli altri, tranne quando sono pochi e numerati.
    const search = s.search ? clusterView([s.search], view, { spread: s.spread || numbered, pinned: s.selected }) : []

    drawRoute(ctx, s.route, view, palette)
    for (const item of items) {
      const layer = colors.get(item.layer)
      if (!layer) continue
      if (item.kind === "cluster") {
        drawCluster(ctx, item, layer.color, palette)
        continue
      }
      ctx.globalAlpha = s.done.get(item.layer)?.has(item.index) ? 0.35 : 1
      drawPoint(ctx, item, layer.color, layer.art ? image(layer.art) : null, large, palette)
      ctx.globalAlpha = 1
    }
    for (const item of search) {
      if (item.kind === "cluster") drawCluster(ctx, item, palette.ink, palette)
      else drawSearchPoint(ctx, item, numbered, palette)
    }
    if (s.selected) {
      const index = s.selected.layer === SEARCH_LAYER ? s.search : s.layers.find((l) => l.id === s.selected!.layer)?.index
      if (index && s.selected.index < index.fx.length) drawSelection(ctx, ...toScreen(view, index.fx[s.selected.index], index.fy[s.selected.index]), palette)
    }
    itemsRef.current = [...search, ...items]

    // Elenco accessibile: solo quando nella vista ci sono pochi segnaposti singoli.
    const all = itemsRef.current
    const list = all.length <= VISIBLE_LIST_LIMIT && all.every((i) => i.kind === "point") ? all.map((i) => ({ layer: i.layer, index: (i as { index: number }).index })) : null
    const key = list ? list.map((i) => `${i.layer}:${i.index}`).join("|") : "-"
    if (key !== visibleKey.current) {
      visibleKey.current = key
      setVisible(list)
    }
  }

  // I listener del riquadro e il caricamento delle icone chiamano sempre l'ultima versione del disegno.
  useLayoutEffect(() => {
    drawRef.current = draw
  })

  // Scena e zoom arrivano dallo stato: si ridisegna dopo che il visore ha applicato il nuovo scorrimento.
  useLayoutEffect(() => {
    sceneRef.current = scene
    widthRef.current = width
    drawRef.current()
  }, [scene, width])

  useEffect(() => {
    const f = frame.current
    if (!f) return
    const draw = () => drawRef.current()
    f.addEventListener("scroll", draw, { passive: true })
    const resize = new ResizeObserver(draw)
    resize.observe(f)
    return () => {
      f.removeEventListener("scroll", draw)
      resize.disconnect()
    }
  }, [frame])

  // Il ref resta fuori dall'oggetto: chi lo usa nel render deve leggere solo stato.
  return [canvasRef, {
    visible,
    /** Segnaposto sotto un punto della finestra (coordinate del puntatore). */
    hitAt: (clientX: number, clientY: number) => {
      const f = frame.current
      if (!f) return null
      const rect = f.getBoundingClientRect()
      return hitTest(itemsRef.current, clientX - rect.left, clientY - rect.top, widthRef.current >= ICON_WIDTH)
    },
  }] as const
}
