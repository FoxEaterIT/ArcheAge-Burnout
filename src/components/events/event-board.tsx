"use client"
// Eventi: countdown per evento, timeline della giornata italiana, tabella e calendario da scaricare.
import { CalendarPlus } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEventClock } from "@/hooks/use-event-clock"
import { EVENT_TYPES } from "@/lib/events.utils"

const AXIS = ["00", "03", "06", "09", "12", "15", "18", "21", "24"]
const TONE = { rift: "text-rift", nightmare: "text-nightmare" } as const
const FILL = { rift: "bg-rift", nightmare: "bg-nightmare" } as const

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

      <div className="grid gap-4 md:grid-cols-2">
        {(e.ready ? e.states : EVENT_TYPES.map((t) => ({ key: t.key, title: t.title, family: t.family, active: false, status: "", countdown: "--:--:--", local: "", note: "" }))).map((s) => (
          <article key={s.key} className={cn("rounded-xl border bg-surface p-5 sm:p-7", s.active ? "border-current " + TONE[s.family] : "border-line")}>
            <h2 className="font-display text-2xl text-ink">{s.title}</h2>
            <p className={cn("mt-4 text-sm font-semibold", TONE[s.family])}>{s.active ? "● " : ""}{s.status}</p>
            <p className="font-sans text-5xl font-semibold tracking-tight text-ink tabular-nums sm:text-6xl">{s.countdown}</p>
            <p className="mt-2 text-sm text-ink-2">{s.local}</p>
            <p className="text-xs text-muted">{s.note}</p>
          </article>
        ))}
      </div>

      {e.timeline ? (
        <section aria-labelledby="day" className="space-y-3 rounded-xl border border-line bg-surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="day" className="font-display text-xl">Finestre confermate · ora italiana</h2>
            <Button variant="outline" onClick={e.download}><CalendarPlus aria-hidden />Scarica calendario · avviso 10 minuti prima</Button>
          </div>
          <div className="grid gap-x-4 gap-y-2 sm:grid-cols-[190px_1fr] sm:items-center">
            {e.timeline.tracks.map((t) => (
              <div key={t.key} className="contents">
                <span className="text-sm text-ink-2">{t.title}</span>
                <div className="relative h-3 rounded-sm bg-[repeating-linear-gradient(to_right,var(--raised)_0_calc(12.5%-1px),var(--line-strong)_calc(12.5%-1px)_12.5%)]">
                  {t.slots.map((slot, i) => <span key={i} className={cn("absolute inset-y-0 rounded-sm", FILL[t.family])} style={{ left: `${slot.left * 100}%`, width: `${slot.width * 100}%` }} />)}
                  <span aria-hidden className="absolute -inset-y-1 w-0.5 bg-white shadow-[0_0_6px_white]" style={{ left: `${e.marker * 100}%` }} />
                </div>
              </div>
            ))}
            <span className="hidden sm:block" />
            <div className="flex justify-between text-xs text-dim tabular-nums">{AXIS.map((h) => <span key={h}>{h}</span>)}</div>
          </div>
          <p className="text-xs text-muted">Linea bianca: ora visualizzata.</p>
        </section>
      ) : null}

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
