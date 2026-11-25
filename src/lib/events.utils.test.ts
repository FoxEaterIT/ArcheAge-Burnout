import { describe, expect, it } from "vitest"
import { EVENT_TYPES, countdown, dayPosition, eventCalendar, eventState, eventWindow, scheduleRows } from "./events.utils"

const utc = new Intl.DateTimeFormat("it-IT", { timeZone: "UTC", weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
const at = (iso: string) => Date.parse(iso)

describe("eventi", () => {
  it("in inverno l'apertura delle 19 UTC è alle 20 in Italia", () => {
    expect(eventWindow(19, at("2026-11-25T12:00:00Z"), 30)).toBe("20:00–20:30")
  })
  it("in estate è alle 21 (ora legale)", () => {
    expect(eventWindow(19, at("2026-07-01T12:00:00Z"), 30)).toBe("21:00–21:30")
  })
  it("riconosce un evento in corso e conta alla fine", () => {
    const s = eventState(EVENT_TYPES[0], at("2026-11-25T19:10:12Z"), utc)
    expect(s).toMatchObject({ active: true, status: "In corso · termina tra", countdown: "00:19:48" })
  })
  it("dopo l'ultima apertura del giorno punta a quella di domani", () => {
    const s = eventState(EVENT_TYPES[3], at("2026-11-25T23:00:00Z"), utc)
    expect(s.active).toBe(false)
    expect(s.countdown).toBe("06:00:00")
  })
  it("countdown e posizione nella giornata italiana", () => {
    expect(countdown(3_661_000)).toBe("01:01:01")
    expect(dayPosition(at("2026-11-25T11:00:00Z"))).toBe(0.5)
  })
  it("tabella e calendario", () => {
    expect(scheduleRows(at("2026-11-25T00:00:00Z"))[0][0]).toBe("04:00–04:30")
    const ics = eventCalendar("20261125T000000Z")
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(12)
    expect(ics).toContain("DTSTART:20261125T033000Z")
  })
})
