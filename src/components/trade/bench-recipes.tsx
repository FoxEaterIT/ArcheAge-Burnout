// Ricette per banco di creazione, come la lista in testa all'Atlante.
import { GameText } from "@/components/game/game-text"
import type { Bench } from "@/lib/game.types"

export function BenchRecipes({ benches }: { benches: Bench[] }) {
  return (
    <details className="group rounded-xl border border-line bg-surface">
      <summary className="cursor-pointer px-5 py-4 font-display text-lg select-none hover:text-gold">Ricette per banco di creazione</summary>
      <div className="grid gap-x-8 gap-y-4 border-t border-line px-5 py-4 md:grid-cols-2 xl:grid-cols-3">
        {benches.map((bench) => (
          <section key={bench.name}>
            <h3 className="mb-2 text-sm text-gold">{bench.name} · {bench.recipes.length} ricette</h3>
            <ul className="space-y-1">
              {bench.recipes.map((r) => (
                <li key={r.cargo}>
                  <details>
                    <summary className="cursor-pointer text-sm hover:text-gold"><GameText text={r.cargo} size={20} linked={false} /></summary>
                    <div className="mt-1.5 mb-3 space-y-1 pl-4 text-xs text-muted">
                      <p><GameText text={r.cost} size={16} /></p>
                      <ul className="space-y-1">
                        {r.deliveries.map((d) => <li key={d.destination}>{d.destination} → <GameText text={d.reward} size={16} className="text-ink-2" /></li>)}
                      </ul>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </details>
  )
}
