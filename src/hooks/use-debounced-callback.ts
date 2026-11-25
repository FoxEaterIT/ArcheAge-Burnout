"use client"
import { useEffect, useRef } from "react"

/** Richiama `callback` solo dopo `delay` ms senza nuove chiamate; `cancel` scarta l'attesa, che si annulla anche allo smontaggio. */
export function useDebouncedCallback<A extends unknown[]>(callback: (...args: A) => void, delay: number) {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const latest = useRef(callback)
  useEffect(() => {
    latest.current = callback
  })
  useEffect(() => () => clearTimeout(timer.current), [])
  const run = (...args: A) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => latest.current(...args), delay)
  }
  const cancel = () => clearTimeout(timer.current)
  return { run, cancel }
}
