"use client"
// Navigazione principale: barra laterale su desktop, barra in basso su mobile.
import Link from "next/link"
import { GameGlyph } from "@/components/game/game-glyph"
import { useActiveSection } from "@/hooks/use-active-section"
import { NAV_ITEMS } from "./nav.utils"

export function RailNav() {
  const active = useActiveSection()
  return (
    <nav aria-label="Sezioni" className="flex flex-col items-center gap-1">
      {NAV_ITEMS.map((item) => (
        <Link key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined} title={item.title} className="flex w-[76px] flex-col items-center gap-1.5 rounded-lg py-2.5 text-[11px] text-muted transition-colors hover:bg-raised hover:text-ink aria-[current=page]:bg-raised aria-[current=page]:text-gold">
          <GameGlyph src={item.glyph} className="size-7" />
          {item.label}
        </Link>
      ))}
    </nav>
  )
}

export function BottomNav() {
  const active = useActiveSection()
  return (
    <nav aria-label="Sezioni" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      {NAV_ITEMS.map((item) => (
        <Link key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined} className="flex flex-col items-center gap-1 py-2 text-[11px] text-muted aria-[current=page]:text-gold">
          <GameGlyph src={item.glyph} className="size-6" />
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
