// Guscio dell'app: emblema della gilda e navigazione, contenuto a destra.
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import { ActiveNavLinks, NavLinks } from "./app-nav"
import { LegacyHashRedirect } from "./legacy-hash-redirect"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <LegacyHashRedirect />
      <aside className="sticky top-0 hidden h-dvh w-[92px] shrink-0 flex-col items-center gap-4 border-r border-line bg-surface py-4 md:flex">
        <Link href="/rotte" aria-label="ArcheAge Burnout, vai alle rotte" className="rounded-lg">
          <Image src="/game/emblem.png" alt="Emblema della gilda Burnout" width={60} height={60} unoptimized className="mix-blend-screen" priority />
        </Link>
        <nav aria-label="Sezioni" className="flex flex-col items-center gap-1">
          <Suspense fallback={<NavLinks mode="rail" />}>
            <ActiveNavLinks mode="rail" />
          </Suspense>
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">
        <header className="flex items-center gap-3 border-b border-line px-4 py-2.5 md:hidden">
          <Image src="/game/emblem.png" alt="" width={36} height={36} unoptimized className="mix-blend-screen" />
          <span className="font-display text-lg">ArcheAge Burnout</span>
        </header>
        {children}
        <footer className="mt-auto border-t border-line px-6 py-4 text-xs text-dim lg:px-10">ArcheAge Burnout · Gilda Burnout. Dati e cartografia: RaidDex, 8 novembre 2026. Ricavi base: i prezzi effettivi vanno controllati in gioco.</footer>
      </div>
      <nav aria-label="Sezioni" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <Suspense fallback={<NavLinks mode="bottom" />}>
          <ActiveNavLinks mode="bottom" />
        </Suspense>
      </nav>
    </div>
  )
}

/** Intestazione di pagina: titolo a sinistra, controlli a destra. */
export function PageHeader({ title, description, children }: { title: string; description?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line px-4 pt-6 pb-5 sm:px-6 lg:px-10">
      <div className="min-w-0">
        <h1 className="font-display text-3xl sm:text-4xl">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p> : null}
      </div>
      {children}
    </header>
  )
}
