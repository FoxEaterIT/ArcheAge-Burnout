"use client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { legacyHashTarget } from "@/components/shell/nav.utils"

/** Chi apre un vecchio link dell'Atlante (`…#/scheda/iron-ore`) arriva alla pagina nuova. */
export function useLegacyHashRedirect() {
  const router = useRouter()
  useEffect(() => {
    const target = legacyHashTarget(window.location.hash)
    if (target) router.replace(target)
  }, [router])
}
