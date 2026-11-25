"use client"
import { usePathname } from "next/navigation"
import { isActiveSection } from "@/components/shell/nav.utils"

/** Dice se una sezione della navigazione corrisponde alla pagina aperta. */
export function useActiveSection() {
  const path = usePathname()
  return (href: string) => isActiveSection(path, href)
}
