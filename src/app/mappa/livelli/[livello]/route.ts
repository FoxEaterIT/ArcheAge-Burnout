// Punti di un livello della mappa: un JSON statico per livello, generato al build e scaricato solo quando il livello si accende.
// Un id sconosciuto risponde 404 (con Cache Components `dynamicParams` non si usa).
import { mapLayers } from "@/lib/game-data.utils"

export function generateStaticParams() {
  return mapLayers().groups.flatMap((g) => g.layers.map((l) => ({ livello: l.id })))
}

export async function GET(_request: Request, { params }: RouteContext<"/mappa/livelli/[livello]">) {
  const { livello } = await params
  const layer = mapLayers().data.get(livello)
  if (!layer) return Response.json({ error: "Livello sconosciuto" }, { status: 404 })
  // I dati cambiano solo con una nuova build: il browser tiene il livello per un giorno.
  return Response.json(layer, { headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } })
}
