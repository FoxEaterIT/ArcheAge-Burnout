import type { Metadata } from "next"
import { Suspense } from "react"
import { CatalogHome } from "@/components/catalog/catalog-home"
import { CatalogResults } from "@/components/catalog/catalog-results"
import { CatalogSearch } from "@/components/catalog/catalog-search"
import { PageHeader } from "@/components/shell/app-shell"
import { SearchFieldFallback } from "@/components/ui/search-field-fallback"
import { isCatalogHome, parseCatalogQuery } from "@/lib/catalog.utils"
import { catalogGroups, categories, featuredGear, rarities, runCatalogSearch } from "@/lib/game-data.utils"

export const metadata: Metadata = { title: "Catalogo di Auroria" }

export default function CatalogoPage({ searchParams }: PageProps<"/catalogo">) {
  return (
    <>
      <PageHeader title="Catalogo di Auroria" description="Armi, materiali, creature, missioni e tutto il resto: ogni voce porta alla sua scheda.">
        <Suspense fallback={<SearchFieldFallback placeholder="Cerca nel catalogo…" />}>
          <CatalogSearch />
        </Suspense>
      </PageHeader>
      <div className="px-4 py-6 sm:px-6 lg:px-10">
        <Suspense fallback={<p className="text-sm text-muted">Carico il catalogo…</p>}>
          <CatalogBody searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  )
}

async function CatalogBody({ searchParams }: Pick<PageProps<"/catalogo">, "searchParams">) {
  const query = parseCatalogQuery(await searchParams)
  return isCatalogHome(query) ? (
    <CatalogHome groups={catalogGroups} featured={featuredGear} />
  ) : (
    <CatalogResults query={query} results={runCatalogSearch(query)} groups={catalogGroups} categories={categories} rarities={rarities} />
  )
}
