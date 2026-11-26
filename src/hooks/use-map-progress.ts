"use client"
import { useCallback, useEffect, useState } from "react"
import { HIDE_DONE_KEY, PROGRESS_KEY, parseDone } from "@/lib/map-explorer.utils"
import { readStored, writeStored } from "@/lib/storage.utils"

/** Punti raccolti, salvati in questo browser: si segnano dalla scheda del punto e si possono nascondere. Azioni stabili. */
export function useMapProgress() {
  const [done, setDone] = useState<Set<string>>(() => new Set())
  const [hideDone, setHide] = useState(false)

  // Il localStorage si legge dopo il montaggio, così server e client disegnano lo stesso HTML.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lettura una tantum dal localStorage
    setDone(parseDone(readStored(PROGRESS_KEY)))
    setHide(readStored(HIDE_DONE_KEY) === true)
  }, [])

  const update = useCallback((change: (current: Set<string>) => Set<string>) => {
    setDone((current) => {
      const next = change(current)
      writeStored(PROGRESS_KEY, [...next])
      return next
    })
  }, [])

  const toggle = useCallback(
    (id: string) =>
      update((current) => {
        const next = new Set(current)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      }),
    [update],
  )
  const clearLayer = useCallback((layerId: string) => update((current) => new Set([...current].filter((id) => !id.startsWith(layerId + ":")))), [update])
  const setHideDone = useCallback((value: boolean) => {
    setHide(value)
    writeStored(HIDE_DONE_KEY, value)
  }, [])

  return { done, hideDone, setHideDone, toggle, clearLayer }
}
