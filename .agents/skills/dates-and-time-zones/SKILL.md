---
name: dates-and-time-zones
description: Method for code and SQL that computes days, weeks, nights, shifts or deadlines in a local calendar while servers run in UTC - daylight-saving days, spans across midnight, local wall-clock times without offset, edge-date tests. Use when writing or reviewing date and time logic.
---

# Dates and time zones

Business days happen in a local calendar; servers, databases and CI usually run in UTC. Every bug here comes from mixing the two. The project's zone and the module that owns date math are named in the `domain` section of `AGENTS.md`.

## Rules

1. **One module owns calendar math.** Days, weeks, nights and deadlines are computed there and nowhere else. New code calls it; it does not reimplement it.
2. **Store instants, display and group in the local calendar.** Persist `timestamptz` (or UTC ISO strings); convert to the local zone only to decide "which day" or to display.
3. **Wall-clock times without offset are local.** A time read from an external system or a form ("08:00") belongs to the local zone. Convert it to an instant with the zone name, never by adding a fixed offset.
4. **A day is not 24 hours.** Daylight-saving days last 23 or 25 hours. Never add `86400000` ms or `24h` to move a day; move the calendar date and resolve it again in the zone.
5. **Name the zone, always.** No implicit host zone: no `getDate()`, `getDay()`, `setHours()`, `toDateString()` or `toLocaleString()` without an explicit `timeZone` to decide calendar facts.
6. **Weeks need a definition.** State the first day of the week and whether a span crossing midnight belongs to the start day or is split.

## SQL

- Wall-clock to instant: `(local_ts at time zone 'Zone/Name')` on a `timestamp` without zone.
- Instant to local day: `(ts at time zone 'Zone/Name')::date`, never `ts::date` on a `timestamptz` (that uses the session zone).
- Group by the local day, not by the UTC day.

## Tests

- Run the unit tests in a zone different from both UTC and the business zone (for example `TZ=America/New_York`), so code that relies on the host zone fails.
- Cover both daylight-saving transitions of the current year: the same wall-clock time maps to different UTC hours on the day before and the day after.
- Cover spans across midnight, the last day of the month, the first and last day of the week, and 29 February.
- Assert on instants and on local dates separately; one test per rule above that the change touches.

## Review checklist

- [ ] Calendar facts go through the owning module.
- [ ] No fixed offsets, no `86400000`, no host-zone date methods.
- [ ] SQL converts with the zone name and groups by the local day.
- [ ] Tests run in a third zone and include both transitions and a span across midnight.
