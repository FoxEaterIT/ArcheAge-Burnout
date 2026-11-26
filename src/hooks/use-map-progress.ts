"use client"
import { useEffect, useState } from "react"
import { HIDE_DONE_KEY, PROGRESS_KEY, parseDone } from "@/lib/map-explorer.utils"
import { readStored, writeStored } from "@/lib/storage.utils"

/** Punti raccolti, salvati in questo browser: si segnano dalla scheda del punto e si possono nascondere. */
export function useMapProgress() {
  const [done, setDone] = useState<Set<string>>(() => new Set())
  const [hideDone, setHideDone] = useState(false)

  // Il localStorage si legge dopo il montaggio, così server e client disegnano lo stesso HTML.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lettura una tantum dal localStorage
    setDone(parseDone(readStored(PROGRESS_KEY)))
    setHideDone(readStored(HIDE_DONE_KEY) === true)
  }, [])

  const save = (next: Set<string>) => {
    setDone(next)
    writeStored(PROGRESS_KEY, [...next])
  }

  return {
    done,
    hideDone,
    setHideDone: (value: boolean) => {
      setHideDone(value)
      writeStored(HIDE_DONE_KEY, value)
    },
    toggle: (id: string) => {
      const next = new Set(done)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      save(next)
    },
    clearLayer: (layerId: string) => save(new Set([...done].filter((id) => !id.startsWith(layerId + ":")))),
  }
}
