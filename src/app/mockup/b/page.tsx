// Mockup B · "Linee di Auroria": ogni carico è una linea che parte dal banco e ferma nelle destinazioni, la più redditizia accesa.
import Image from "next/image"
import { Route, Library, CalendarClock, Swords, Map, Search, ChevronDown } from "lucide-react"
import { AAC, cargoGroups, fmt, gold, ingredients, GameText } from "../_shared"

const ORIGIN = "Seaglass Harbor"
const NAV_ICONS = [Route, Library, CalendarClock, Swords, Map]
const NAV_LABELS = ["Rotte", "Catalogo", "Eventi", "Builder", "Mappa"]
const STATUS = [
  { title: "Crimson Rift · Normal", state: "In corso", detail: "termina tra 00:19:48", tone: "var(--rift)", live: true },
  { title: "Crimson Rift · Hard", state: "Prossima", detail: "tra 00:19:48 · 20:30", tone: "var(--rift)" },
  { title: "Brutal Nightmare · Normal", state: "Prossima", detail: "tra 00:49:48 · 21:00", tone: "var(--nightmare)" },
  { title: "Brutal Nightmare · Hard", state: "Prossima", detail: "tra 01:49:48 · 22:00", tone: "var(--nightmare)" },
]

export default function MockupB() {
  const groups = cargoGroups(ORIGIN).slice(0, 6)
  return (
    <div style={AAC} className="flex min-h-dvh bg-[var(--bg)] text-[var(--ink)] selection:bg-[var(--gold)] selection:text-black">
      <nav aria-label="Sezioni" className="sticky top-0 hidden h-dvh w-[92px] shrink-0 flex-col items-center gap-1 border-r border-[var(--line)] bg-[var(--surface)] py-4 md:flex">
        <Image src="/game/emblem.png" alt="Emblema della gilda Burnout" width={56} height={56} unoptimized className="mb-4 mix-blend-screen" />
        {NAV_LABELS.map((label, i) => {
          const Icon = NAV_ICONS[i]
          return (
            <a key={label} href="#" aria-current={i === 0 ? "page" : undefined} className="flex w-[76px] flex-col items-center gap-1 rounded-lg py-2.5 text-[11px] text-[var(--muted)] hover:bg-[var(--raised)] hover:text-[var(--ink)] aria-[current=page]:bg-[var(--raised)] aria-[current=page]:text-[var(--gold)]">
              <Icon className="size-5" aria-hidden />
              {label}
            </a>
          )
        })}
      </nav>

      <nav aria-label="Sezioni" className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-5 border-t border-[var(--line)] bg-[var(--surface)] md:hidden">
        {NAV_LABELS.map((label, i) => {
          const Icon = NAV_ICONS[i]
          return (
            <a key={label} href="#" aria-current={i === 0 ? "page" : undefined} className="flex flex-col items-center gap-1 py-2 text-[11px] text-[var(--muted)] aria-[current=page]:text-[var(--gold)]">
              <Icon className="size-5" aria-hidden />
              {label}
            </a>
          )
        })}
      </nav>

      <div className="min-w-0 flex-1 pb-16 md:pb-0">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--line)] px-6 pt-6 pb-5 lg:px-10">
          <div>
            <p className="text-sm text-[var(--muted)]">ArcheAge Burnout</p>
            <h1 className="[font-family:var(--font-display)] text-4xl">Rotte commerciali</h1>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 text-sm xl:w-auto">
            <span className="flex w-full items-center gap-2 rounded-md border border-[var(--line-strong)] bg-[var(--surface)] px-3 py-2 sm:w-auto">
              <Search className="size-4 text-[var(--dim)]" aria-hidden />
              <input placeholder="Cosa vuoi ottenere?" className="w-full bg-transparent sm:w-52 outline-none placeholder:text-[var(--dim)]" />
            </span>
            {[["Partenza", ORIGIN], ["Destinazione", "Tutte"], ["Ricompensa", "Tutte"]].map(([label, value]) => (
              <button key={label} className="flex items-center gap-2 rounded-md border border-[var(--line-strong)] bg-[var(--surface)] px-3 py-2 hover:border-[var(--muted)]">
                <span className="text-[var(--dim)]">{label}</span>
                <span>{value}</span>
                <ChevronDown className="size-4 text-[var(--dim)]" aria-hidden />
              </button>
            ))}
          </div>
        </header>

        <div className="grid gap-8 px-6 py-8 lg:px-10 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section aria-label="Carichi" className="grid content-start gap-4 md:grid-cols-2">
            {groups.map((g) => {
              const stops = [...g.routes].sort((a, b) => (gold(b.payout) ?? -1) - (gold(a.payout) ?? -1))
              const best = gold(stops[0].payout)
              return (
                <article key={g.cargo} className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5">
                  <h2 className="text-lg font-medium"><GameText text={g.cargo} size={34} /></h2>
                  <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
                    {ingredients(g.recipe).map((i) => <GameText key={i} text={i} size={16} />)}
                  </p>
                  <ol className="relative mt-5 space-y-3 pl-7 before:absolute before:top-2 before:bottom-2 before:left-[9px] before:w-[3px] before:rounded-full before:bg-[var(--line-strong)]">
                    <li className="relative text-sm text-[var(--muted)]">
                      <span className="absolute top-0.5 -left-7 size-[21px] rounded-full border-[3px] border-[var(--ink-2)] bg-[var(--bg)]" />
                      {g.origin}
                    </li>
                    {stops.map((s, i) => {
                      const value = gold(s.payout)
                      const lit = i === 0 && best !== null
                      return (
                        <li key={s.destination} className="relative flex items-center justify-between gap-3 text-sm">
                          {lit && <span className="absolute -top-[calc(100%+0.75rem)] -left-[19px] h-[calc(100%+1.25rem)] w-[3px] rounded-full bg-[var(--gold)] shadow-[0_0_10px_var(--gold)]" />}
                          <span className={`absolute -left-[23px] size-[13px] rounded-full border-2 ${lit ? "border-[var(--gold)] bg-[var(--gold)] shadow-[0_0_10px_var(--gold)]" : "border-[var(--line-strong)] bg-[var(--bg)]"}`} />
                          <span className={lit ? "text-[var(--gold)]" : "text-[var(--ink-2)]"}>{s.destination}</span>
                          <span className="tabular-nums">
                            {value !== null ? (
                              <span className={lit ? "font-semibold text-[var(--gold)]" : "text-[var(--ink-2)]"}>{fmt(value)} oro</span>
                            ) : (
                              <GameText text={s.payout} size={18} className="text-xs text-[var(--ink-2)]" />
                            )}
                          </span>
                        </li>
                      )
                    })}
                  </ol>
                </article>
              )
            })}
          </section>

          <aside aria-label="Stato degli eventi" className="space-y-3 self-start xl:sticky xl:top-6">
            <h2 className="[font-family:var(--font-display)] text-xl">Eventi di oggi</h2>
            {STATUS.map((e) => (
              <div key={e.title} className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
                <p className="flex items-center gap-2 text-sm"><span className="h-[3px] w-4 rounded-full" style={{ background: e.tone }} />{e.title}</p>
                <p className="mt-1 flex items-center gap-2 text-sm">
                  <span className="font-medium" style={{ color: e.tone }}>{e.live ? "● " : ""}{e.state}</span>
                  <span className="tabular-nums text-[var(--muted)]">{e.detail}</span>
                </p>
              </div>
            ))}
            <p className="text-xs text-[var(--dim)]">Ora italiana. Ricavi base: al costo aggiungi materiali, certificato e noleggio.</p>
          </aside>
        </div>
      </div>
    </div>
  )
}
