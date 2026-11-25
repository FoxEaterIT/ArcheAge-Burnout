// Mockup C · "Bacheca densa": tanti moduli piccoli e fitti, tutto a colpo d'occhio su un secondo monitor.
import Image from "next/image"
import { Search, Timer } from "lucide-react"
import { AAC, NAV, ORIGINS, cargoGroups, fmt, gold, ingredients, GameText } from "../_shared"

export default function MockupC() {
  const all = cargoGroups()
  const modules = ORIGINS.flatMap((o) => all.filter((g) => g.origin === o).slice(0, 2))
  return (
    <div style={AAC} className="min-h-dvh bg-[var(--bg)] text-[13px] leading-snug text-[var(--ink)] selection:bg-[var(--gold)] selection:text-black">
      <header className="border-b border-[var(--line-strong)] bg-[var(--surface)]">
        <div className="flex items-center gap-4 px-4 py-2">
          <Image src="/game/emblem.png" alt="Emblema della gilda Burnout" width={32} height={32} unoptimized className="mix-blend-screen" />
          <span className="[font-family:var(--font-display)] text-lg">ArcheAge Burnout</span>
          <span className="flex flex-1 items-center gap-2 rounded border border-[var(--line-strong)] bg-[var(--bg)] px-2.5 py-1.5 lg:max-w-xl">
            <Search className="size-4 text-[var(--dim)]" aria-hidden />
            <input placeholder="Cerca carichi, materiali, oggetti, luoghi…" className="w-full bg-transparent outline-none placeholder:text-[var(--dim)]" />
            <kbd className="rounded border border-[var(--line-strong)] px-1.5 text-[11px] text-[var(--dim)]">/</kbd>
          </span>
          <span className="ml-auto hidden items-center gap-1.5 text-[var(--muted)] md:flex"><Timer className="size-4 text-[var(--rift)]" aria-hidden />Crimson Rift <b className="tabular-nums font-semibold text-[var(--rift)]">00:19:48</b></span>
        </div>
        <nav aria-label="Sezioni" className="flex gap-px overflow-x-auto border-t border-[var(--line)] px-4">
          {NAV.map((item, i) => (
            <a key={item} href="#" aria-current={i === 0 ? "page" : undefined} className="whitespace-nowrap px-3 py-2 text-[var(--muted)] hover:text-[var(--ink)] aria-[current=page]:bg-[var(--bg)] aria-[current=page]:text-[var(--gold)] aria-[current=page]:shadow-[inset_0_2px_0_var(--gold)]">{item}</a>
          ))}
        </nav>
      </header>

      <div className="flex flex-wrap items-center gap-1.5 border-b border-[var(--line)] px-4 py-2">
        <span className="mr-1 text-[var(--dim)]">Banco</span>
        <button aria-pressed className="rounded-sm px-2 py-1 aria-pressed:bg-[var(--gold)] aria-pressed:text-black">Tutti · 360</button>
        {ORIGINS.map((o) => (
          <button key={o} className="rounded-sm border border-[var(--line-strong)] px-2 py-1 text-[var(--ink-2)] hover:border-[var(--muted)]">{o}</button>
        ))}
        <span className="ml-auto text-[var(--dim)]">Ricompensa</span>
        {["Tutte", "Oggetti", "Oro"].map((k, i) => (
          <button key={k} aria-pressed={i === 0} className="rounded-sm px-2 py-1 text-[var(--ink-2)] aria-pressed:bg-[var(--raised)] aria-pressed:text-[var(--ink)]">{k}</button>
        ))}
      </div>

      <main className="grid grid-cols-1 gap-px bg-[var(--line)] sm:grid-cols-2 xl:grid-cols-4">
        <section className="bg-[var(--bg)] p-3 xl:row-span-2">
          <h2 className="mb-2 inline-block rounded-sm bg-[var(--copper)] px-1.5 py-0.5 text-[11px] font-semibold text-white">Eventi · ora italiana</h2>
          {[["Crimson Rift · Normal", "in corso", "00:19:48", "var(--rift)"], ["Crimson Rift · Hard", "apre", "00:19:48", "var(--rift)"], ["Brutal Nightmare · Normal", "apre", "00:49:48", "var(--nightmare)"], ["Brutal Nightmare · Hard", "apre", "01:49:48", "var(--nightmare)"]].map(([t, s, c, tone]) => (
            <div key={t} className="flex items-baseline justify-between border-b border-[var(--line)] py-2 last:border-0">
              <span>{t}<span className="ml-1.5 text-[11px]" style={{ color: tone }}>{s}</span></span>
              <b className="text-base font-semibold tabular-nums" style={{ color: tone }}>{c}</b>
            </div>
          ))}
          <h2 className="mt-4 mb-2 inline-block rounded-sm bg-[var(--copper)] px-1.5 py-0.5 text-[11px] font-semibold text-white">Ricette per banco</h2>
          {ORIGINS.map((o) => (
            <div key={o} className="flex justify-between py-1 text-[var(--ink-2)]"><span>{o}</span><span className="tabular-nums text-[var(--dim)]">{cargoGroups(o).length} carichi</span></div>
          ))}
        </section>
        {modules.map((g) => {
          const best = Math.max(...g.routes.map((r) => gold(r.payout) ?? 0))
          return (
            <article key={g.origin + g.cargo} className="bg-[var(--bg)] p-3 hover:bg-[var(--surface)]">
              <p className="mb-1.5 inline-block rounded-sm bg-[var(--raised)] px-1.5 py-0.5 text-[11px] text-[var(--muted)]">{g.origin}</p>
              <h3 className="font-semibold"><GameText text={g.cargo} size={26} /></h3>
              <p className="mt-1 text-[11px] text-[var(--muted)]">{ingredients(g.recipe).join(" · ")}</p>
              <table className="mt-2 w-full">
                <tbody>
                  {g.routes.map((r) => {
                    const v = gold(r.payout)
                    return (
                      <tr key={r.destination} className="border-t border-[var(--line)]">
                        <td className="py-1 text-[var(--ink-2)]">{r.destination}</td>
                        <td className={`py-1 text-right tabular-nums ${v !== null && v === best && best > 0 ? "font-semibold text-[var(--gold-strong)]" : ""}`}>
                          {v !== null ? fmt(v) : <GameText text={r.payout} size={16} className="text-[12px]" />}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </article>
          )
        })}
      </main>
      <p className="px-4 py-3 text-[11px] text-[var(--dim)]">Ricavi base per collo. Dati RaidDex · 8 novembre 2026.</p>
    </div>
  )
}
