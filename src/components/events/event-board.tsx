"use client"
// Eventi: countdown per evento, timeline della giornata italiana, tabella e calendario da scaricare.
import { CalendarPlus, CircleDot } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEventClock } from "@/hooks/use-event-clock"
import { EVENT_AXIS as AXIS, EVENT_FILL as FILL, EVENT_TONE as TONE, EVENT_TYPES } from "@/lib/events.utils"

export function EventBoard() {
  const e = useEventClock()
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p aria-live="off" className="min-h-6 font-medium tabular-nums">{e.clock}</p>
        <details className="text-sm">
          <summary className="cursor-pointer text-muted hover:text-ink">Simula un orario</summary>
          <div className="mt-2 flex flex-wrap items-end gap-2">
            <div className="grid gap-1.5">
              <Label htmlFor="preview">Data e ora locale del PC</Label>
              <Input id="preview" type="datetime-local" value={e.preview} onChange={(ev) => e.setPreview(ev.target.value)} className="h-9" />
            </div>
            <Button variant="outline" className="h-9" onClick={e.live} disabled={!e.preview}>Torna in diretta</Button>
          </div>
        </details>
      </div>

      <section aria-labelledby="day" className="space-y-1 rounded-xl border border-line bg-surface p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 id="day" className="font-display text-xl">Aperture di oggi · ora italiana</h2>
          <Button variant="outline" onClick={e.download}><CalendarPlus aria-hidden />Scarica calendario · avviso 10 minuti prima</Button>
        </div>
        {EVENT_TYPES.map((type, i) => {
          const s = e.states[i]
          const track = e.timeline?.tracks[i]
          return (
            <article key={type.key} aria-label={type.title} className={cn("grid gap-x-5 gap-y-2 border-t border-line py-4 first-of-type:border-0 md:grid-cols-[220px_minmax(0,1fr)_150px] md:items-center")}>
              <div>
                <h3 className="font-display text-lg">{type.title}</h3>
                <p className={cn("flex items-center gap-1.5 text-sm font-semibold", TONE[type.family])}>
                  {s?.active ? <CircleDot aria-hidden className="size-3.5 animate-pulse" /> : null}
                  {s?.status ?? " "}
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="relative h-3 rounded-sm bg-[repeating-linear-gradient(to_right,var(--raised)_0_calc(12.5%-1px),var(--line-strong)_calc(12.5%-1px)_12.5%)]">
                  {track?.slots.map((slot, j) => <span key={j} className={cn("absolute inset-y-0 rounded-sm", FILL[type.family])} style={{ left: `${slot.left * 100}%`, width: `${slot.width * 100}%` }} />)}
                  {e.ready ? <span aria-hidden className="absolute -inset-y-1 w-0.5 bg-white shadow-[0_0_6px_white]" style={{ left: `${e.marker * 100}%` }} /> : null}
                </div>
                <p className="text-xs text-muted">{s ? `${s.local} · ${type.duration} minuti` : " "}</p>
              </div>
              <p className={cn("text-3xl font-semibold tracking-tight tabular-nums md:text-right", s?.active ? TONE[type.family] : "text-ink")}>{s?.countdown ?? "--:--:--"}</p>
            </article>
          )
        })}
        <div className="grid border-t border-line pt-2 md:grid-cols-[220px_minmax(0,1fr)_150px] md:gap-x-5">
          <span className="hidden md:block" />
          <div className="flex justify-between text-xs text-dim tabular-nums">{AXIS.map((h) => <span key={h}>{h}</span>)}</div>
        </div>
        <p className="pt-1 text-xs text-muted">Linea bianca: ora visualizzata.</p>
      </section>

      {e.timeline ? (
        <section aria-labelledby="schedule" className="space-y-3">
          <h2 id="schedule" className="font-display text-xl">Orari giornalieri · ora italiana</h2>
          <div className="overflow-x-auto rounded-xl border border-line bg-surface">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-line-strong text-left">
                  {EVENT_TYPES.map((t) => <th key={t.key} scope="col" className={cn("px-4 py-2.5 font-medium", TONE[t.family])}>{t.title}</th>)}
                </tr>
              </thead>
              <tbody>
                {e.timeline.rows.map((row, i) => (
                  <tr key={i} className="border-b border-line last:border-0">
                    {row.map((cell, j) => <td key={j} className="px-4 py-2.5 tabular-nums text-ink-2">{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted">Ora italiana · Ciclo indicato dalla gilda, con riferimento al 9 novembre 2026 alle 13:00.</p>
        </section>
      ) : null}
    </div>
  )
}
