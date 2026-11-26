"use client"
import { useEffect, useRef } from "react"

/** Porta il fuoco sull'elemento quando `when` è vero e cambia `key`: per la scheda di un punto scelto da tastiera. */
export function useFocusWhen<T extends HTMLElement>(when: boolean, key: string) {
  const ref = useRef<T>(null)
  useEffect(() => {
    if (when) ref.current?.focus()
  }, [when, key])
  return ref
}
