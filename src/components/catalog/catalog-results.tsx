// Risultati del catalogo: categorie a lato, filtri, tabella e pagine.
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "cn"
import { GameIcon } from "@/components/game/game-icon"
import { catalogHref, queryParams } from "@/lib/catalog.utils"
import type { CatalogQuery, CatalogResults as Results, CatalogTypeLink } from "@/lib/game.types"
import { recordHref } from "@/lib/trade.utils"
import { CatalogFilters } from "./catalog-filters"

type Props = { query: CatalogQuery; results: Results; groups: [string, CatalogTypeLink[]][]; categories: string[]; rarities: string[] }

export function CatalogResults({ query, results, groups, categories, rarities }: Props) {
  const base = queryParams(query)
  return (
    <div className="grid gap-8 lg:grid-cols-[210px_minmax(0,1fr)]">
      <nav aria-label="Categorie" className="hidden space-y-4 lg:block">
        <Link href="/catalogo" className="text-sm text-muted hover:text-gold">← Tutte le categorie</Link>
        {groups.map(([title, types]) => (
          <section key={title}>
            <h2 className="mb-1 text-xs font-semibold tracking-wide text-dim uppercase">{title}</h2>
            {types.map((t) => (
              <Link key={t.type} href={catalogHref({ tipo: t.type })} aria-current={query.type === t.type ? "page" : undefined} className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-ink-2 hover:text-gold aria-[current=page]:bg-raised aria-[current=page]:text-gold">
                <GameIcon src={t.art} size={20} />{t.type}
              </Link>
            ))}
          </section>
        ))}
      </nav>
      <div className="min-w-0 space-y-4">
        <Link href="/catalogo" className="text-sm text-muted hover:text-gold lg:hidden">← Tutte le categorie</Link>
        <h2 className="font-display text-2xl">{query.type || "Tutte le voci"}</h2>
        <CatalogFilters categories={categories} rarities={rarities} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p aria-live="polite" className="text-sm text-muted">{results.total ? `${results.total} voci · Pagina ${results.page + 1} di ${results.pages}` : "Nessun risultato"}</p>
          <div className="flex gap-2">
            <PageLink href={catalogHref({ ...base, pagina: results.page > 1 ? String(results.page) : "" })} disabled={results.page === 0} label="Precedente"><ChevronLeft aria-hidden className="size-4" />Precedente</PageLink>
            <PageLink href={catalogHref({ ...base, pagina: String(results.page + 2) })} disabled={results.page + 1 >= results.pages} label="Successiva">Successiva<ChevronRight aria-hidden className="size-4" /></PageLink>
          </div>
        </div>
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-line-strong text-left text-muted">
                <th scope="col" className="px-4 py-2.5 font-medium">Nome</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Tipo</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Rarità</th>
                <th scope="col" className="px-3 py-2.5 text-right font-medium">Livello</th>
              </tr>
            </thead>
            <tbody>
              {results.rows.map((row) => (
                <tr key={row.id} className="border-b border-line last:border-0 hover:bg-raised">
                  <td className="px-4 py-2">
                    <Link href={recordHref(row.id)} className="flex items-center gap-3 hover:text-gold">
                      <GameIcon src={row.art} size={32} />
                      <span>
                        {row.name}
                        <span className="block text-xs text-dim">{row.category}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-ink-2">{row.type}</td>
                  <td className="px-3 py-2 text-ink-2">{row.rarity || "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-ink-2">{row.level || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function PageLink({ href, disabled, label, children }: { href: string; disabled: boolean; label: string; children: React.ReactNode }) {
  return disabled ? (
    <span aria-disabled className="inline-flex h-8 items-center gap-1 rounded-lg border border-line px-3 text-sm text-dim">{children}</span>
  ) : (
    <Link href={href} aria-label={`Pagina ${label.toLowerCase()}`} scroll={false} className={cn("inline-flex h-8 items-center gap-1 rounded-lg border border-line-strong px-3 text-sm hover:border-gold hover:text-gold")}>{children}</Link>
  )
}
