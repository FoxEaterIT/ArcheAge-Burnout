"use client"
import { useEffect, useState } from "react"
import { indexLayer } from "@/lib/map-cluster.utils"
import type { LayerBundle } from "@/lib/map-explorer.types"
import type { MapLayerData } from "@/lib/map-layers.types"

// Una richiesta per livello in tutta la sessione: riaccendere un livello non lo riscarica.
const requests = new Map<string, Promise<LayerBundle>>()

function loadLayer(id: string) {
  let request = requests.get(id)
  if (!request) {
    request = fetch(`/mappa/livelli/${encodeURIComponent(id)}`)
      .then((response) => {
        if (!response.ok) throw new Error(`Livello ${id}: ${response.status}`)
        return response.json() as Promise<MapLayerData>
      })
      .then((data) => ({ data, index: indexLayer(data) }))
    // Dopo un errore si può riprovare riaccendendo il livello.
    request.catch(() => requests.delete(id))
    requests.set(id, request)
  }
  return request
}

/** Punti dei livelli accesi, scaricati alla prima accensione e indicizzati per il disegno. */
export function useMapLayerData(ids: string[]) {
  const [bundles, setBundles] = useState<Map<string, LayerBundle>>(() => new Map())
  const [failed, setFailed] = useState<Set<string>>(() => new Set())
  const key = ids.join(",")

  useEffect(() => {
    let live = true
    for (const id of key ? key.split(",") : []) {
      loadLayer(id).then(
        (bundle) => {
          if (!live) return
          setBundles((current) => (current.has(id) ? current : new Map(current).set(id, bundle)))
          setFailed((current) => (current.has(id) ? new Set([...current].filter((f) => f !== id)) : current))
        },
        () => live && setFailed((current) => new Set(current).add(id)),
      )
    }
    return () => {
      live = false
    }
  }, [key])

  return {
    bundles,
    loading: ids.filter((id) => !bundles.has(id) && !failed.has(id)),
    failed: ids.filter((id) => failed.has(id)),
  }
}
