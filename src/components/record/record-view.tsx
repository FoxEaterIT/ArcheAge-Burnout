// Scheda: colonna laterale con arte, dati e mappa; a destra utilizzi, bottino, produzione, smontaggio e tratte.
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { GameIcon } from "@/components/game/game-icon"
import { GameText } from "@/components/game/game-text"
import { WorldMapLazy } from "@/components/map/world-map-lazy"
import { RouteLine } from "@/components/trade/route-line"
import type { RecordModel } from "@/lib/record.types"
import { EntryGrid, EntryLink, Section } from "./entry-link"
import { ItemPositions } from "./item-positions"
import { RecipeCalculator } from "./recipe-calculator"

export function RecordView({ record: r }: { record: RecordModel }) {
  return (
    <article className="space-y-6 px-4 py-6 sm:px-6 lg:px-10">
      <Link href="/catalogo" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-gold"><ArrowLeft aria-hidden className="size-4" />Catalogo</Link>
      <header className="flex items-center gap-4">
        <GameIcon src={r.art} size={72} />
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">{r.name}</h1>
          <p className="text-sm text-muted">{[r.category, r.itemLine].filter(Boolean).join(" · ")}</p>
        </div>
      </header>
      {r.shortcuts.length > 1 ? (
        <nav aria-label="Vai a una sezione della scheda" className="flex flex-wrap gap-2">
          {r.shortcuts.map((s) => <a key={s.id} href={"#" + s.id} className="rounded-lg border border-line-strong px-3 py-1.5 text-sm hover:border-gold hover:text-gold">{s.label}</a>)}
        </nav>
      ) : null}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.8fr)]">
        <aside className="min-w-0 space-y-4 rounded-xl border border-line bg-surface p-5 lg:sticky lg:top-6" id="mappa">
          {r.positions ? (
            <>
              <h2 className="font-display text-xl text-gold">Dove trovarlo sulla mappa</h2>
              <ItemPositions section={r.positions} />
            </>
          ) : null}
          {r.positionsStatus ? (
            <>
              <h2 className="font-display text-xl text-gold">Dove trovarlo sulla mappa</h2>
              <p className="text-sm text-ink-2">{r.positionsStatus}</p>
            </>
          ) : null}
          {r.mapPoint ? (
            <>
              <h2 className="font-display text-xl text-gold">Mappa di Auroria</h2>
              <WorldMapLazy point={r.mapPoint} name={r.name} />
            </>
          ) : null}
          {!r.positions && !r.positionsStatus && !r.mapPoint ? <p className="text-sm text-muted">Nessuna posizione sulla mappa per questa voce.</p> : null}
        </aside>
        <div className="min-w-0 space-y-6 rounded-xl border border-line bg-surface p-5">
          {r.uses ? (
            <Section id="utilizzi" title="A cosa serve">
              {r.uses.lines.map((line) => <p key={line} className="text-sm text-ink-2">{line}</p>)}
              {r.uses.groups.map((g) => (
                <details key={g.title} open={g.open} className="space-y-2">
                  <summary className="cursor-pointer text-sm font-medium hover:text-gold">{g.title} ({g.items.length})</summary>
                  <div className="pt-2"><EntryGrid items={g.items} /></div>
                </details>
              ))}
              {r.uses.empty ? <p className="text-sm text-muted">Nessun utilizzo collegato a una ricetta, missione o altro oggetto nelle fonti consultate.</p> : null}
            </Section>
          ) : null}
          {r.lunastone ? (
            <Section title="Possibili statistiche al drop">
              {r.lunastone === "unknown" ? (
                <p className="text-sm text-muted">Intervallo al drop ancora da verificare.</p>
              ) : (
                <ul className="space-y-1 text-sm">{r.lunastone.map((l) => <li key={l.stat}>{l.stat} · <strong className="tabular-nums text-gold">{l.range}</strong></li>)}</ul>
              )}
            </Section>
          ) : null}
          {r.catalogTexts.length ? <div className="space-y-2">{r.catalogTexts.map((t) => <p key={t} className="text-sm text-ink-2">{t}</p>)}</div> : null}
          {r.droppedBy.length ? (
            <details className="space-y-2">
              <summary className="cursor-pointer text-sm font-medium hover:text-gold">Boss e mob che lo rilasciano ({r.droppedBy.length})</summary>
              <div className="pt-2"><EntryGrid items={r.droppedBy} /></div>
            </details>
          ) : null}
          {r.loot.length ? <Section title="Bottino"><EntryGrid items={r.loot} /></Section> : null}
          {r.cargo ? (
            <Section title={"Preparazione a " + r.cargo.origin}>
              <p className="text-sm"><GameText text={r.cargo.recipe} size={20} /></p>
              {r.cargo.deliveryOnly ? (
                <p className="text-sm text-muted">Puoi consegnare i pacchi già posseduti.</p>
              ) : (
                <p className="text-sm text-muted">Totale per 7 pacchi: {r.cargo.batch.map((b) => <GameText key={b} text={b} size={18} className="mr-3" />)}</p>
              )}
              <div className="max-w-md"><RouteLine origin={r.cargo.origin} stops={r.cargo.stops} /></div>
            </Section>
          ) : null}
          {r.salvageYields.length ? (
            <Section id={r.salvage ? undefined : "smontaggio"} title="Materiali per i pacchi ottenibili dallo smontaggio"><EntryGrid items={r.salvageYields} /></Section>
          ) : null}
          {r.description ? <Section title="Descrizione"><p className="max-w-[70ch] text-sm text-ink-2">{r.description}</p></Section> : null}
          {r.salvage ? (
            <Section id="smontaggio" title="Oggetti da smontare">
              {r.salvage === "none" ? (
                <p className="text-sm text-muted">Nessun oggetto da smontare documentato nel catalogo per questo materiale.</p>
              ) : (
                <ul className="grid gap-1.5 sm:grid-cols-[repeat(auto-fill,minmax(230px,1fr))]">
                  {r.salvage.items.map((s) => (
                    <li key={s.gear.id} className="rounded-lg border border-line bg-bg px-3 py-2 text-sm">
                      <EntryLink entry={s.gear} />
                      <span className="mt-0.5 block pl-9 text-xs text-muted">→ {s.quantity} × {r.name} ({s.chance}%)</span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          ) : null}
          {r.recipes.length ? (
            <Section id="produzione" title="Produzione">
              {r.recipes.map((recipe) => <RecipeCalculator key={recipe.key} recipe={recipe} />)}
            </Section>
          ) : null}
          {r.status ? <p className="text-sm text-muted">{r.status}</p> : null}
          {r.notes.length ? <div className="space-y-1">{r.notes.map((n) => <p key={n} className="text-sm text-ink-2"><GameText text={n} size={18} /></p>)}</div> : null}
          {r.rewardRoutes.length ? (
            <Section id="tratte" title="Tratte che danno questo materiale">
              <ul className="space-y-1.5 text-sm">{r.rewardRoutes.map((t) => <li key={t}><GameText text={t} size={18} /></li>)}</ul>
            </Section>
          ) : null}
        </div>
      </div>
    </article>
  )
}
