"use client"
// Visore della mappa di Auroria: tile a più livelli, segnaposti, zoom e trascinamento.
import Image from "next/image"
import { Minus, Plus, LocateFixed } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { useWorldMap } from "@/hooks/use-world-map"
import type { Point } from "@/lib/game.types"

type Props = { point?: Point | null; overview?: Point[]; name: string; className?: string }

const NO_POINTS: Point[] = []

export function WorldMap({ point = null, overview = NO_POINTS, name, className }: Props) {
  const [frameRef, map] = useWorldMap(point, overview, name)
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Button variant="outline" size="icon-sm" aria-label="Riduci" onClick={map.zoomOut} disabled={!map.canZoomOut}><Minus /></Button>
        <Button variant="outline" size="icon-sm" aria-label="Ingrandisci" onClick={map.zoomIn} disabled={!map.canZoomIn}><Plus /></Button>
        <Button variant="outline" size="sm" onClick={map.reset}><LocateFixed />{point ? "Torna al punto" : "Panoramica"}</Button>
        <span className="text-muted">{point ? `${name} · ${point.join(", ")}` : overview.length ? name : "Auroria"}</span>
      </div>
      <div
        ref={frameRef}
        tabIndex={0}
        aria-label="Mappa di Auroria. Trascina per spostarti, rotella o + e − per lo zoom."
        onScroll={map.onScroll}
        onKeyDown={map.onKeyDown}
        {...map.pointer}
        className="relative h-[clamp(300px,55vh,600px)] cursor-grab overflow-auto overscroll-contain rounded-lg border border-line-strong bg-[#0f1a1f] active:cursor-grabbing"
      >
        <div className="relative mx-auto overflow-hidden" style={{ width: map.width || "100%", aspectRatio: "3 / 4" }}>
          {map.tiles.map((t) => (
            <Image key={t.key} src={t.src} alt="" width={256} height={256} unoptimized draggable={false} className="pointer-events-none absolute max-w-none select-none" style={{ left: t.left, top: t.top, width: t.size, height: t.size }} />
          ))}
          {map.markers.map((m) => (
            <span
              key={m.key}
              title={m.title}
              className={cn(
                "absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full",
                m.kind === "point" && "size-4 border-[3px] border-white bg-[#fb3838] shadow-[0_0_0_4px_#672725]",
                m.kind === "pin" && "grid size-[22px] place-items-center bg-[#443050] text-[13px] leading-none font-bold text-white ring-2 ring-white",
                m.kind === "dot" && "size-[7px] border border-[#473416] bg-gold-strong",
              )}
              style={{ left: `${m.left * 100}%`, top: `${m.top * 100}%` }}
            >
              {m.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
