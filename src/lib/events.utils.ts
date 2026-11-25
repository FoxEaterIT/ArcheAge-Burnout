// Eventi di Auroria: aperture giornaliere in UTC, mostrate in ora italiana e nell'ora del PC, come nell'originale.
import type { EventState, EventType } from "./game.types"

const HOUR = 3_600_000
const MINUTE = 60_000

export const EVENT_TYPES: EventType[] = [
  { key: "rift", title: "Crimson Rift · Normal", hours: [3, 11, 19], duration: 30, family: "rift" },
  { key: "rift-hard", title: "Crimson Rift · Hard", hours: [3.5, 11.5, 19.5], duration: 30, family: "rift" },
  { key: "nightmare", title: "Brutal Nightmare · Normal", hours: [4, 12, 20], duration: 60, family: "nightmare" },
  { key: "nightmare-hard", title: "Brutal Nightmare · Hard", hours: [5, 13, 21], duration: 60, family: "nightmare" },
]

const romeHour = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Rome", hour: "2-digit", hourCycle: "h23" })
const romeClock = new Intl.DateTimeFormat("it-IT", { timeZone: "Europe/Rome", hourCycle: "h23", hour: "2-digit", minute: "2-digit" })

/** Inizio dell'apertura delle `hour` UTC nello stesso giorno UTC di `now`. */
export function eventStart(hour: number, now: number) {
  const d = new Date(now)
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), Math.floor(hour), Math.round((hour % 1) * 60))
}

export const countdown = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map((n) => String(n).padStart(2, "0")).join(":")
}

export function eventWindow(hour: number, now: number, duration: number) {
  const start = eventStart(hour, now)
  return romeClock.format(start) + "–" + romeClock.format(start + duration * MINUTE)
}

/** Stato di un evento a `now`: in corso (con fine) o prossima apertura, cercando da ieri a dopodomani. */
export function eventState(type: EventType, now: number, localFormat: Intl.DateTimeFormat): EventState {
  const windows = [-1, 0, 1, 2].flatMap((day) => type.hours.map((h) => eventStart(h, now) + day * 24 * HOUR))
  const active = windows.find((t) => t <= now && now < t + type.duration * MINUTE)
  const start = active ?? windows.find((t) => t > now)!
  const end = start + type.duration * MINUTE
  return {
    key: type.key,
    title: type.title,
    family: type.family,
    active: active !== undefined,
    status: active !== undefined ? "In corso · termina tra" : "Prossima apertura tra",
    countdown: countdown((active !== undefined ? end : start) - now),
    local: "Ora locale: " + localFormat.format(start) + " → " + localFormat.format(end),
    note: `Tre aperture al giorno · durata ${type.duration} minuti.`,
  }
}

/** Posizione (0–1) sulla giornata italiana: per le fasce della timeline e per la linea dell'ora. */
export const slotStart = (hour: number, now: number) => (Number(romeHour.format(eventStart(hour, now))) + (hour % 1)) / 24
export const slotWidth = (duration: number) => duration / 60 / 24
export function dayPosition(now: number) {
  const [h, m] = romeClock.format(now).split(":").map(Number)
  return (h + m / 60) / 24
}

export const scheduleRows = (now: number) => [0, 1, 2].map((i) => EVENT_TYPES.map((t) => eventWindow(t.hours[i], now, t.duration)))

/** Calendario .ics: un evento giornaliero per ogni apertura, con avviso 10 minuti prima. */
export function eventCalendar(stamp: string) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Burnout//Eventi di Auroria//IT", "CALSCALE:GREGORIAN"]
  for (const { key, title, hours, duration } of EVENT_TYPES) {
    for (const hour of hours) {
      const time = String(Math.floor(hour)).padStart(2, "0") + String(Math.round((hour % 1) * 60)).padStart(2, "0") + "00"
      lines.push(
        "BEGIN:VEVENT", `UID:${key}-utc-20261125-${time}@burnout.local`, "DTSTAMP:" + stamp,
        `DTSTART:20261125T${time}Z`, `DURATION:PT${duration}M`, "RRULE:FREQ=DAILY", "SUMMARY:" + title, "TRANSP:TRANSPARENT",
        "BEGIN:VALARM", "ACTION:DISPLAY", "TRIGGER:-PT10M", `DESCRIPTION:${title} tra 10 minuti`, "END:VALARM", "END:VEVENT",
      )
    }
  }
  return lines.concat("END:VCALENDAR", "").join("\r\n")
}

export const icsStamp = (now: number) => new Date(now).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
