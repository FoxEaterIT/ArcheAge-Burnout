"use client"
import { useEffect, useMemo, useState } from "react"
import { EVENT_TYPES, dayPosition, eventCalendar, eventState, icsStamp, scheduleRows, slotStart, slotWidth } from "@/lib/events.utils"

const pcClock = new Intl.DateTimeFormat("it-IT", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZoneName: "short" })
const pcEvent = new Intl.DateTimeFormat("it-IT", { weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })

/** Orologio degli eventi: ticchetta ogni secondo; con una data simulata mostra quell'istante. Nullo prima del montaggio, per non sbagliare l'idratazione. */
export function useEventClock() {
  const [tick, setTick] = useState<number | null>(null)
  const [preview, setPreview] = useState("")
  useEffect(() => {
    const update = () => setTick(Date.now())
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])
  const simulated = preview ? new Date(preview).getTime() : Number.NaN
  const now = Number.isFinite(simulated) ? simulated : tick
  const day = now === null ? null : new Date(now).toISOString().slice(0, 10)
  // La timeline e la tabella cambiano solo col giorno: si ricalcolano al cambio di data, non ogni secondo.
  const timeline = useMemo(() => {
    if (day === null) return null
    const ref = Date.parse(day + "T12:00:00Z")
    return {
      tracks: EVENT_TYPES.map((t) => ({ key: t.key, title: t.title, family: t.family, slots: t.hours.map((h) => ({ left: slotStart(h, ref), width: slotWidth(t.duration) })) })),
      rows: scheduleRows(ref),
    }
  }, [day])
  return {
    ready: now !== null,
    clock: now === null ? "" : (Number.isFinite(simulated) ? "Simulazione · " : "Ora del PC · ") + pcClock.format(now),
    states: now === null ? [] : EVENT_TYPES.map((t) => eventState(t, now, pcEvent)),
    marker: now === null ? 0 : dayPosition(now),
    timeline,
    preview,
    setPreview,
    live: () => setPreview(""),
    download: () => {
      const url = URL.createObjectURL(new Blob([eventCalendar(icsStamp(Date.now()))], { type: "text/calendar;charset=utf-8" }))
      const link = document.createElement("a")
      link.href = url
      link.download = "Burnout - Eventi.ics"
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 10_000)
    },
  }
}
