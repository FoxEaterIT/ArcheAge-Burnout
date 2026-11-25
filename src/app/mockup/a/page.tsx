// Mockup A · "Almanacco del mercante": le rotte come tabella oraria, partenze in riga e destinazioni in colonna.
import Image from "next/image"
import { Search, RotateCcw, Crown, CalendarClock } from "lucide-react"
import { AAC, DESTINATIONS, NAV, ORIGINS, cargoGroups, fmt, gold, ingredients, GameText } from "../_shared"

const ORIGIN = "Jubilant Village"
const EVENTS = [
  { title: "Crimson Rift · Normal", hours: [3, 11, 19], duration: 30, tone: "var(--rift)" },
  { title: "Crimson Rift · Hard", hours: [3.5, 11.5, 19.5], duration: 30, tone: "var(--rift)" },
  { title: "Brutal Nightmare · Normal", hours: [4, 12, 20], duration: 60, tone: "var(--nightmare)" },
  { title: "Brutal Nightmare · Hard", hours: [5, 13, 21], duration: 60, tone: "var(--nightmare)" },
]
// Esempio fisso: ore 20:10 in Italia (19:10 UTC), Crimson Rift Normal in corso.
const NOW_ROME = 20 + 10 / 60

export default function MockupA() {
  const groups = cargoGroups(ORIGIN)
  const destinations = DESTINATIONS.filter((d) => d !== ORIGIN)
  return (
    <div style={AAC} className="min-h-dvh bg-[var(--bg)] text-[var(--ink)] selection:bg-[var(--gold)] selection:text-black">
      <header className="sticky top-0 z-10 border-b border-[var(--line)] bg-[color-mix(in_oklab,var(--bg)_88%,transparent)] backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Image src="/game/emblem.png" alt="Emblema della gilda Burnout" width={44} height={44} unoptimized className="mix-blend-screen" />
            <div className="leading-tight">
              <p className="[font-family:var(--font-display)] text-xl tracking-wide">ArcheAge Burnout</p>
              <p className="text-xs text-[var(--muted)]">Gilda Burnout · Auroria</p>
            </div>
          </div>
          <nav aria-label="Sezioni" className="order-last -mx-1 flex w-full gap-1 overflow-x-auto lg:order-none lg:w-auto">
            {NAV.map((item, i) => (
              <a key={item} href="#" aria-current={i === 0 ? "page" : undefined} className="shrink-0 rounded-md px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--ink)] aria-[current=page]:text-[var(--gold)] aria-[current=page]:shadow-[inset_0_-2px_0_var(--gold)]">
                {item}
              </a>
            ))}
          </nav>
          <a href="#" className="ml-auto flex shrink-0 items-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--rift)_45%,transparent)] px-3 py-1.5 text-sm">
            <span className="size-2 animate-pulse rounded-full bg-[var(--rift)]" />
            <span className="hidden sm:inline">Crimson Rift in corso ·</span> <span className="tabular-nums text-[var(--rift)]">00:19:48</span>
          </a>
        </div>
        <div className="mx-auto hidden max-w-[1440px] px-6 pb-3 md:block">
          <div className="grid grid-cols-[170px_1fr] items-center gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
            {EVENTS.map((e) => (
              <div key={e.title} className="contents">
                <span className="truncate">{e.title}</span>
                <div className="relative h-2.5 rounded-sm bg-[repeating-linear-gradient(to_right,var(--surface)_0_calc(4.1666%-1px),var(--line)_calc(4.1666%-1px)_4.1666%)]">
                  {e.hours.map((h) => (
                    <span key={h} className="absolute inset-y-0 rounded-sm" style={{ left: `${((h + 1) / 24) * 100}%`, width: `${(e.duration / 60 / 24) * 100}%`, background: e.tone }} />
                  ))}
                  <span className="absolute -inset-y-1 w-px bg-white shadow-[0_0_6px_white]" style={{ left: `${(NOW_ROME / 24) * 100}%` }} />
                </div>
              </div>
            ))}
            <span />
            <div className="flex justify-between tabular-nums text-[var(--dim)]">
              {["00", "03", "06", "09", "12", "15", "18", "21", "24"].map((h) => <span key={h}>{h}</span>)}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="space-y-5">
          <h1 className="[font-family:var(--font-display)] text-3xl">Rotte commerciali</h1>
          <label className="block space-y-1.5 text-sm">
            <span className="text-[var(--ink-2)]">Cosa vuoi ottenere?</span>
            <span className="flex items-center gap-2 rounded-md border border-[var(--line-strong)] bg-[var(--surface)] px-3 py-2 focus-within:border-[var(--gold)]">
              <Search className="size-4 text-[var(--dim)]" aria-hidden />
              <input placeholder="Es. Standard Additive" className="w-full bg-transparent outline-none placeholder:text-[var(--dim)]" />
            </span>
          </label>
          <fieldset className="space-y-1.5 text-sm">
            <legend className="mb-1.5 text-[var(--ink-2)]">Banco di partenza</legend>
            {ORIGINS.map((o) => (
              <label key={o} className="flex items-center justify-between rounded-md px-3 py-1.5 has-checked:bg-[var(--raised)] has-checked:text-[var(--gold)]">
                <span className="flex items-center gap-2">
                  <input type="radio" name="origin" defaultChecked={o === ORIGIN} className="accent-[var(--gold-strong)]" />
                  {o}
                </span>
                <span className="tabular-nums text-xs text-[var(--dim)]">{cargoGroups(o).length}</span>
              </label>
            ))}
          </fieldset>
          <fieldset className="text-sm">
            <legend className="mb-1.5 text-[var(--ink-2)]">Ricompensa</legend>
            <div className="grid grid-cols-3 rounded-md border border-[var(--line-strong)] p-0.5">
              {["Tutte", "Oggetti", "Oro"].map((k, i) => (
                <button key={k} aria-pressed={i === 0} className="rounded px-2 py-1.5 text-[var(--muted)] aria-pressed:bg-[var(--raised)] aria-pressed:text-[var(--ink)]">{k}</button>
              ))}
            </div>
          </fieldset>
          <button className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--ink)]"><RotateCcw className="size-4" aria-hidden />Azzera filtri</button>
        </aside>

        <section aria-labelledby="almanac" className="min-w-0">
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <h2 id="almanac" className="[font-family:var(--font-display)] text-2xl">Partenza da {ORIGIN}</h2>
            <p className="text-sm text-[var(--muted)]"><span className="tabular-nums text-[var(--ink-2)]">{groups.length * 5}</span> tratte su 360 · ricavo per collo</p>
          </div>
          <div className="overflow-x-auto rounded-lg border border-[var(--line)] bg-[var(--surface)]">
            <table className="w-full min-w-[980px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--line-strong)] text-left">
                  <th scope="col" className="sticky left-0 bg-[var(--surface)] px-4 py-3 font-medium text-[var(--muted)]">Carico e preparazione</th>
                  {destinations.map((d) => (
                    <th key={d} scope="col" className="px-3 py-3 [font-family:var(--font-display)] text-[15px] font-normal text-[var(--gold)]">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groups.slice(0, 8).map((g) => {
                  const best = Math.max(...g.routes.map((r) => gold(r.payout) ?? 0))
                  return (
                    <tr key={g.cargo} className="border-b border-[var(--line)] align-top last:border-0 hover:bg-[var(--raised)]">
                      <th scope="row" className="sticky left-0 bg-inherit px-4 py-3 text-left font-normal">
                        <GameText text={g.cargo} size={28} className="font-medium text-[var(--ink)]" />
                        <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
                          {ingredients(g.recipe).map((i) => <GameText key={i} text={i} size={16} />)}
                        </p>
                      </th>
                      {destinations.map((d) => {
                        const r = g.routes.find((x) => x.destination === d)
                        if (!r) return <td key={d} className="px-3 py-3 text-[var(--dim)]">—</td>
                        const value = gold(r.payout)
                        const top = value !== null && value === best && best > 0
                        return (
                          <td key={d} className="px-3 py-3 tabular-nums">
                            {value !== null ? (
                              <span className={top ? "inline-flex items-center gap-1 font-semibold text-[var(--gold-strong)]" : "text-[var(--ink-2)]"}>
                                {top && <Crown className="size-3.5" aria-label="Ricavo migliore" />}
                                {fmt(value)} <span className="text-xs font-normal text-[var(--dim)]">oro</span>
                              </span>
                            ) : (
                              <GameText text={r.payout} size={20} className="text-xs text-[var(--ink-2)]" />
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 flex items-center gap-2 text-xs text-[var(--dim)]"><CalendarClock className="size-3.5" aria-hidden />Ricavi base. Al costo aggiungi materiali, certificato e noleggio. Dati RaidDex · 8 novembre 2026.</p>
        </section>
      </main>
    </div>
  )
}
