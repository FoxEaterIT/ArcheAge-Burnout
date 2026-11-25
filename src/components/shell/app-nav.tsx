"use client"
// Navigazione principale: barra laterale su desktop, barra in basso su mobile.
// La sezione attiva dipende dall'URL: il componente vive dentro <Suspense>, con le stesse voci senza stato come fallback.
import Link from "next/link"
import { GameGlyph } from "@/components/game/game-glyph"
import { useActiveSection } from "@/hooks/use-active-section"
import { NAV_ITEMS } from "./nav.utils"

type Mode = "rail" | "bottom"

export function NavLinks({ mode, isActive }: { mode: Mode; isActive?: (href: string) => boolean }) {
  return NAV_ITEMS.map((item) => (
    <Link
      key={item.href}
      href={item.href}
      title={item.title}
      aria-current={isActive?.(item.href) ? "page" : undefined}
      className={
        mode === "rail"
          ? "flex w-[76px] flex-col items-center gap-1.5 rounded-lg py-2.5 text-[11px] text-muted transition-colors hover:bg-raised hover:text-ink aria-[current=page]:bg-raised aria-[current=page]:text-gold"
          : "flex flex-col items-center gap-1 py-2 text-[11px] text-muted aria-[current=page]:text-gold"
      }
    >
      <GameGlyph src={item.glyph} className={mode === "rail" ? "size-7" : "size-6"} />
      {item.label}
    </Link>
  ))
}

export function ActiveNavLinks({ mode }: { mode: Mode }) {
  const isActive = useActiveSection()
  return <NavLinks mode={mode} isActive={isActive} />
}
