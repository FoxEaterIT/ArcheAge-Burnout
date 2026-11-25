"use client"
// Colonna "Prossime aperture": lo stato degli eventi accanto alle rotte, per chi prepara un carico prima di un evento.
import Link from "next/link"
import { CircleDot } from "lucide-react"
import { cn } from "cn"
import { useEventClock } from "@/hooks/use-event-clock"
import { EVENT_FILL as DOT, EVENT_TONE as TONE, EVENT_TYPES } from "@/lib/events.utils"

export function EventsRail() {
  const e = useEventClock()
  return (
    <aside aria-labelledby="rail-title" className="space-y-3 self-start xl:sticky xl:top-6">
      <h2 id="rail-title" className="font-display text-xl">Prossime aperture</h2>
      <ol className="relative space-y-4 pl-6 before:absolute before:top-2 before:bottom-2 before:left-[7px] before:w-[3px] before:rounded-full before:bg-line-strong">
        {EVENT_TYPES.map((type, i) => {
          const s = e.states[i]
          return (
            <li key={type.key} className="relative">
              <span aria-hidden className={cn("absolute top-1.5 -left-6 size-[17px] rounded-full border-[3px] border-bg", DOT[type.family])} />
              <p className="text-sm">{type.title}</p>
              <p className={cn("flex items-center gap-1.5 text-sm", TONE[type.family])}>
                {s?.active ? <CircleDot aria-hidden className="size-3.5" /> : null}
                <span>{s ? (s.active ? "In corso · " : "Tra ") : ""}</span>
                <span className="font-semibold tabular-nums">{s?.countdown ?? "--:--:--"}</span>
              </p>
            </li>
          )
        })}
      </ol>
      <Link href="/eventi" className="inline-block text-sm text-gold hover:underline">Tutti gli orari</Link>
    </aside>
  )
}
