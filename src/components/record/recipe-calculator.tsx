"use client"
// Calcolatore di una ricetta: livello, pezzi desiderati, ingredienti e catena di produzione.
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useRecipeCalculator } from "@/hooks/use-recipe-calculator"
import type { CraftChain } from "@/lib/game.types"
import type { EntryLink as Entry, RecipeModel } from "@/lib/record.types"
import { fmt } from "@/lib/text.utils"
import { EntryLink } from "./entry-link"

const PRESETS = [1, 2, 3]

export function RecipeCalculator({ recipe }: { recipe: RecipeModel }) {
  const { tierIndex, setTierIndex, pieces, setPieces, plan, valid, chain } = useRecipeCalculator(recipe)
  const entry = (id: string) => recipe.entries[id] ?? { id, name: id, art: null, href: null }
  return (
    <div className="space-y-4 rounded-xl border border-line bg-bg p-4">
      <h3 className="font-display text-lg">{recipe.title}</h3>
      {recipe.note ? <p className="text-sm text-muted">{recipe.note}</p> : null}
      {recipe.meta ? <p className="text-sm text-ink-2">{recipe.meta}</p> : null}
      <div className="flex flex-wrap items-end gap-3">
        {recipe.tiers.length > 1 ? (
          <div className="grid gap-1.5">
            <Label htmlFor={recipe.key + "-tier"}>Livello della ricetta</Label>
            <select id={recipe.key + "-tier"} value={tierIndex} onChange={(e) => setTierIndex(Number(e.target.value))} className="h-9 rounded-lg border border-input bg-input/30 px-2.5 text-sm">
              {recipe.tiers.map((t, i) => <option key={i} value={i}>{t[0] || `Variante ${i + 1}`}</option>)}
            </select>
          </div>
        ) : null}
        {plan.calculable ? (
          <>
            <div className="grid gap-1.5">
              <Label htmlFor={recipe.key + "-qty"}>Pezzi desiderati</Label>
              <Input id={recipe.key + "-qty"} type="number" min={1} max={1000000} step={1} inputMode="numeric" value={pieces} onChange={(e) => setPieces(e.target.value)} className="h-9 w-32 tabular-nums" />
            </div>
            {PRESETS.map((n) => (
              <Button key={n} variant="outline" className="h-9 min-w-9" aria-label={`Calcola per ${n} pezzi`} onClick={() => setPieces(String(n))}>{n}</Button>
            ))}
          </>
        ) : null}
      </div>
      {!valid ? (
        <p role="alert" className="text-sm text-loss">Inserisci un numero intero da 1 a 1.000.000.</p>
      ) : (
        <>
          <p className="text-sm text-ink-2">
            {plan.calculable
              ? [
                  `${fmt(plan.batches)} ${plan.batches === 1 ? "lavorazione" : "lavorazioni"}`,
                  `${fmt(plan.produced)} ${plan.produced === 1 ? "pezzo prodotto" : "pezzi prodotti"}`,
                  plan.surplus > 0 ? `${fmt(plan.surplus)} in eccedenza` : null,
                  plan.gold !== null ? `${fmt(plan.gold)} oro` : null,
                ].filter(Boolean).join(" · ")
              : "Dosi per lavorazione non disponibili per questa ricetta."}
          </p>
          {plan.materials.length ? (
            <ul className="grid gap-1.5 sm:grid-cols-[repeat(auto-fill,minmax(230px,1fr))]">
              {plan.materials.map((m) => (
                <li key={m.id} className="rounded-lg border border-line bg-surface px-3 py-2 text-sm">
                  <EntryLink entry={entry(m.id)} label={m.count !== null ? `${fmt(m.count)} × ${m.label}` : m.label} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">Quantità degli ingredienti non disponibili per questa variante.</p>
          )}
          {chain ? <CraftChainView chain={chain} entry={entry} /> : null}
        </>
      )}
    </div>
  )
}

function CraftChainView({ chain, entry }: { chain: CraftChain; entry: (id: string) => Entry }) {
  if (chain.cycle) return <p className="text-sm text-muted">Il catalogo contiene un ciclo tra queste ricette. Totali non disponibili.</p>
  return (
    <div className="space-y-3">
      <h4 className="font-display text-base">Catena di produzione</h4>
      <p className="text-xs text-muted">Per gli intermedi viene usata la prima variante con dosi disponibili.</p>
      <ol className="relative space-y-3 pl-7 before:absolute before:top-3 before:bottom-3 before:left-[9px] before:w-[3px] before:rounded-full before:bg-line-strong">
        {chain.steps.map((step, i) => (
          <li key={step.id} className="relative rounded-lg border border-line bg-surface p-3">
            <span aria-hidden className={i === chain.steps.length - 1 ? "absolute top-4 -left-[23px] size-[13px] rounded-full border-2 border-gold bg-gold shadow-[0_0_10px_var(--gold)]" : "absolute top-4 -left-[23px] size-[13px] rounded-full border-2 border-line-strong bg-bg"} />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium"><EntryLink entry={entry(step.id)} label={`${fmt(step.needed)} × ${entry(step.id).name}`} /></span>
              <span className="text-xs text-muted">{[step.level, `${fmt(step.batches)} ${step.batches === 1 ? "lavorazione" : "lavorazioni"}`].filter(Boolean).join(" · ")}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line pt-2 text-sm text-ink-2">
              <span className="sr-only">Ingredienti:</span>
              {step.parts.map((p) => <EntryLink key={p.id} entry={entry(p.id)} label={`${fmt(p.count)} × ${entry(p.id).name}`} size={22} />)}
            </div>
          </li>
        ))}
      </ol>
      <h4 className="font-display text-base">Materiali da procurare</h4>
      <ul className="grid gap-1.5 sm:grid-cols-[repeat(auto-fill,minmax(230px,1fr))]">
        {chain.raw.map((m) => (
          <li key={m.id} className="rounded-lg border border-line bg-surface px-3 py-2 text-sm"><EntryLink entry={entry(m.id)} label={`${fmt(m.count)} × ${entry(m.id).name}`} /></li>
        ))}
      </ul>
      <p className="text-sm text-ink-2">Oro delle lavorazioni con costo noto · <span className="tabular-nums text-gold">{fmt(chain.gold)}</span></p>
    </div>
  )
}
