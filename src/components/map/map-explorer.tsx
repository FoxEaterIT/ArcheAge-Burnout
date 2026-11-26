"use client"
// Mappa interattiva di Auroria: livelli, segnaposti raggruppati su canvas, punto scelto, raccolti, percorso e link.
import Image from "next/image"
import Link from "next/link"
import { Layers, Link2, LocateFixed, Minus, Plus, X } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { GameSelect } from "@/components/ui/game-select"
import { useMapExplorer } from "@/hooks/use-map-explorer"
import type { MapSearchOverlay } from "@/lib/map-explorer.types"
import type { MapLayerGroup } from "@/lib/map-layers.types"
import { MapLayersPanel } from "./map-layers-panel"
import { MapPointCard } from "./map-point-card"
import { MapRoutePanel } from "./map-route-panel"

type Props = { groups: MapLayerGroup[]; search: MapSearchOverlay | null }

export function MapExplorer({ groups, search }: Props) {
  const [frameRef, canvasRef, x] = useMapExplorer(groups, search)
  return (
    <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside
        id="map-panel"
        aria-label="Livelli e percorso"
        className={cn(
          "min-w-0 space-y-4 lg:sticky lg:top-4 lg:block lg:max-h-[calc(100dvh-2rem)] lg:self-start lg:overflow-auto lg:pr-2",
          // Sotto lg il pannello sale dal basso sopra la mappa, appena sopra la barra delle sezioni.
          "max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-50 max-lg:max-h-[70dvh] max-lg:overflow-auto max-lg:rounded-t-xl max-lg:border-t max-lg:border-line-strong max-lg:bg-surface max-lg:p-4 max-md:bottom-[calc(4rem+env(safe-area-inset-bottom))]",
          !x.panel.open && "max-lg:hidden",
        )}
      >
        <div className="flex justify-end lg:hidden">
          <Button variant="ghost" size="sm" className="text-muted" onClick={x.panel.toggleOpen}><X aria-hidden />Chiudi</Button>
        </div>
        <MapLayersPanel panel={x.panel} />
        <MapRoutePanel route={x.route} />
      </aside>
      <div className="min-w-0 space-y-3">
        {x.search ? (
          <div className="flex flex-wrap items-end gap-3">
            <p className="text-sm">
              Punti di <Link href={x.search.href} className="font-medium text-gold hover:underline">{x.search.name}</Link>
            </p>
            {x.search.sources.length > 1 ? (
              <GameSelect label="Fonte dell'oggetto" value={String(x.search.source)} onChange={(v) => x.search!.setSource(Number(v))} options={x.search.sources.map((s) => ({ value: String(s.index), label: `${s.label} (${s.count})` }))} className="w-auto min-w-64" />
            ) : null}
            {x.search.intro ? <p className="w-full text-sm text-ink-2">{x.search.intro}</p> : null}
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Button variant="outline" size="sm" className="lg:hidden" aria-expanded={x.panel.open} aria-controls="map-panel" onClick={x.panel.toggleOpen}>
            <Layers aria-hidden />Livelli ({x.panel.activeCount})
          </Button>
          <Button variant="outline" size="icon-sm" aria-label="Riduci" onClick={x.map.zoomOut} disabled={!x.map.canZoomOut}><Minus /></Button>
          <Button variant="outline" size="icon-sm" aria-label="Ingrandisci" onClick={x.map.zoomIn} disabled={!x.map.canZoomIn}><Plus /></Button>
          <Button variant="outline" size="sm" onClick={x.map.reset}><LocateFixed aria-hidden />Panoramica</Button>
          <Button variant="outline" size="sm" onClick={x.copyLink}><Link2 aria-hidden />Copia link</Button>
          <p role="status" className="text-xs text-muted">
            {x.status || (x.loadingCount ? `Carico ${x.loadingCount === 1 ? "un livello" : `${x.loadingCount} livelli`}…` : x.failedCount ? "Alcuni livelli non si sono caricati: spegnili e riaccendili per riprovare." : "")}
          </p>
        </div>
        <div className="relative">
          <div
            ref={frameRef}
            tabIndex={0}
            role="region"
            aria-label="Mappa di Auroria. Trascina per spostarti, rotella o + e − per lo zoom; i segnaposti visibili sono elencati sotto la mappa."
            onScroll={x.map.onScroll}
            onKeyDown={x.map.onKeyDown}
            onClick={x.onClick}
            {...x.pointer}
            className="relative h-[clamp(420px,calc(100dvh-15rem),920px)] cursor-grab overflow-auto overscroll-contain rounded-lg border border-line-strong bg-[#0f1a1f] active:cursor-grabbing"
          >
            <div className="relative mx-auto overflow-hidden" style={{ width: x.map.width || "100%", aspectRatio: "3 / 4" }}>
              {x.map.tiles.map((t) => (
                <Image key={t.key} src={t.src} alt="" width={256} height={256} unoptimized draggable={false} className="pointer-events-none absolute max-w-none select-none" style={{ left: t.left, top: t.top, width: t.size, height: t.size }} />
              ))}
            </div>
          </div>
          <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute top-px left-px z-10 rounded-lg" />
          {x.selected ? <MapPointCard point={x.selected} onClose={x.close} onToggleDone={x.toggleDone} onAddToRoute={x.addSelectedToRoute} /> : null}
        </div>
        {x.visible ? (
          <section aria-label="Segnaposti nella vista" className="space-y-2">
            <h2 className="text-sm text-muted">Segnaposti nella vista ({x.visible.length})</h2>
            {x.visible.length ? (
              <ul className="flex flex-wrap gap-2">
                {x.visible.map((m) => (
                  <li key={m.key}>
                    <Button variant="outline" size="sm" onClick={() => x.choose(m.layer, m.index)}>
                      {m.name}<span className="text-dim tabular-nums">{m.detail}</span>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">Nessun segnaposto qui: accendi un livello o spostati.</p>
            )}
          </section>
        ) : (
          <p className="text-xs text-dim">Ingrandisci per vedere l&apos;elenco dei segnaposti; un gruppo si apre con un clic.</p>
        )}
      </div>
    </div>
  )
}
