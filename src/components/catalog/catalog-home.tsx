// Home del catalogo: esplora per categoria e vetrina dell'equipaggiamento leggendario.
import Link from "next/link"
import { GameIcon } from "@/components/game/game-icon"
import { catalogHref } from "@/lib/catalog.utils"
import type { CatalogRow, CatalogTypeLink } from "@/lib/game.types"
import { recordHref } from "@/lib/trade.utils"

export function CatalogHome({ groups, featured }: { groups: [string, CatalogTypeLink[]][]; featured: CatalogRow[] }) {
  return (
    <div className="space-y-10">
      <section aria-labelledby="explore">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 id="explore" className="font-display text-2xl">Esplora per categoria</h2>
          <Link href={catalogHref({ tutte: "1" })} className="text-sm text-gold hover:underline">Vedi tutto</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {groups.map(([title, types]) => (
            <section key={title} className="rounded-xl border border-line bg-surface p-4">
              <h3 className="mb-2 font-display text-lg text-gold">{title}</h3>
              <ul>
                {types.map((t) => (
                  <li key={t.type}>
                    <Link href={catalogHref({ tipo: t.type })} className="flex items-center gap-2.5 rounded-md px-1.5 py-1.5 text-sm hover:bg-raised hover:text-gold">
                      <GameIcon src={t.art} size={26} />
                      <span className="flex-1">{t.type}</span>
                      <span className="tabular-nums text-xs text-dim">{t.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>
      <section aria-labelledby="legendary">
        <h2 id="legendary" className="mb-4 font-display text-2xl">Equipaggiamento leggendario</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9">
          {featured.map((item) => (
            <li key={item.id}>
              <Link href={recordHref(item.id)} className="flex h-full flex-col gap-2 rounded-xl border border-line bg-surface p-3 hover:border-gold">
                <GameIcon src={item.art} size={48} />
                <span className="text-sm text-gold">{item.name}</span>
                <span className="text-xs text-muted">{item.type}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
