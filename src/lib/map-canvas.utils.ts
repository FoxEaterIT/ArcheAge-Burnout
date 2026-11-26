// Disegno dei segnaposti sul canvas della mappa interattiva.
import type { CanvasPalette, DrawItem, ScreenView } from "./map-cluster.types"
import { itemRadius, shortCount, toScreen } from "./map-cluster.utils"
import { toFraction } from "./map.utils"

/** Da questa larghezza del palco (zoom 4) i punti singoli mostrano l'icona di gioco. */
export const ICON_WIDTH = 4608
export const SEARCH_LAYER = "ricerca"

/** Legge i colori dei token dal documento. */
export function readPalette(root: HTMLElement): CanvasPalette {
  const css = getComputedStyle(root)
  const v = (name: string) => css.getPropertyValue(name).trim()
  return { bg: v("--bg"), surface: v("--surface"), ink: v("--ink"), gold: v("--gold-strong"), font: getComputedStyle(document.body).fontFamily }
}

export function drawRoute(ctx: CanvasRenderingContext2D, stops: { x: number; y: number }[], view: ScreenView, palette: CanvasPalette) {
  if (!stops.length) return
  const points = stops.map((s) => toScreen(view, ...toFraction([s.x, s.y])))
  ctx.lineJoin = "round"
  ctx.lineCap = "round"
  if (points.length > 1) {
    ctx.beginPath()
    points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
    ctx.strokeStyle = palette.bg
    ctx.lineWidth = 7
    ctx.stroke()
    ctx.strokeStyle = palette.gold
    ctx.lineWidth = 3
    ctx.stroke()
  }
  ctx.font = `700 10px ${palette.font}`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  points.forEach(([x, y], i) => {
    if (x < -20 || y < -20 || x > view.clientWidth + 20 || y > view.clientHeight + 20) return
    ctx.beginPath()
    ctx.arc(x, y, 9, 0, Math.PI * 2)
    ctx.fillStyle = palette.bg
    ctx.fill()
    ctx.strokeStyle = palette.gold
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = palette.gold
    ctx.fillText(String(i + 1), x, y + 0.5)
  })
}

/** Gruppo: cerchio nel colore del livello più presente, con il conteggio scuro al centro. */
export function drawCluster(ctx: CanvasRenderingContext2D, item: Extract<DrawItem, { kind: "cluster" }>, color: string, palette: CanvasPalette) {
  const r = itemRadius(item, false)
  ctx.beginPath()
  ctx.arc(item.sx, item.sy, r, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
  ctx.strokeStyle = palette.bg
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.fillStyle = palette.bg
  ctx.font = `700 11px ${palette.font}`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(shortCount(item.count), item.sx, item.sy + 0.5)
}

/** Punto singolo: da vicino l'icona di gioco in una cornice scura con l'anello del gruppo, da lontano un puntino. */
export function drawPoint(ctx: CanvasRenderingContext2D, item: DrawItem, color: string, image: HTMLImageElement | null, large: boolean, palette: CanvasPalette) {
  const r = itemRadius(item, large)
  ctx.beginPath()
  ctx.arc(item.sx, item.sy, r, 0, Math.PI * 2)
  if (large) {
    ctx.fillStyle = palette.surface
    ctx.fill()
    ctx.strokeStyle = color
    ctx.lineWidth = 2.5
    ctx.stroke()
    if (image?.complete && image.naturalWidth) ctx.drawImage(image, item.sx - 9, item.sy - 9, 18, 18)
    else {
      ctx.beginPath()
      ctx.arc(item.sx, item.sy, 5, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
    }
    return
  }
  ctx.fillStyle = color
  ctx.fill()
  ctx.strokeStyle = palette.bg
  ctx.lineWidth = 1.5
  ctx.stroke()
}

/** Punti della ricerca di un oggetto: segnaposti chiari, numerati quando sono pochi. */
export function drawSearchPoint(ctx: CanvasRenderingContext2D, item: DrawItem, numbered: boolean, palette: CanvasPalette) {
  const r = numbered ? 10 : 5
  ctx.beginPath()
  ctx.arc(item.sx, item.sy, r, 0, Math.PI * 2)
  ctx.fillStyle = palette.ink
  ctx.fill()
  ctx.strokeStyle = palette.bg
  ctx.lineWidth = 2
  ctx.stroke()
  if (!numbered || item.kind !== "point") return
  ctx.fillStyle = palette.bg
  ctx.font = `700 10px ${palette.font}`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(String(item.index + 1), item.sx, item.sy + 0.5)
}

/** Anello del punto scelto, sopra a tutto. */
export function drawSelection(ctx: CanvasRenderingContext2D, x: number, y: number, palette: CanvasPalette) {
  ctx.beginPath()
  ctx.arc(x, y, 17, 0, Math.PI * 2)
  ctx.strokeStyle = palette.bg
  ctx.lineWidth = 5
  ctx.stroke()
  ctx.strokeStyle = palette.ink
  ctx.lineWidth = 2.5
  ctx.stroke()
}
