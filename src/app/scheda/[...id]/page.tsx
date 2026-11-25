import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { RecordView } from "@/components/record/record-view"
import { nameOf, hasRecord } from "@/lib/game-data.utils"
import { buildRecord } from "@/lib/record.utils"

// Next passa i segmenti già decodificati.
const recordId = (segments: string[]) => segments.join("/")

export async function generateMetadata({ params }: PageProps<"/scheda/[...id]">): Promise<Metadata> {
  const id = recordId((await params).id)
  return { title: hasRecord(id) ? nameOf(id) : "Scheda non trovata" }
}

export default function SchedaPage({ params }: PageProps<"/scheda/[...id]">) {
  return (
    <Suspense fallback={<p className="px-4 py-6 text-sm text-muted sm:px-6 lg:px-10">Carico la scheda…</p>}>
      <Record params={params} />
    </Suspense>
  )
}

async function Record({ params }: Pick<PageProps<"/scheda/[...id]">, "params">) {
  const record = buildRecord(recordId((await params).id))
  if (!record) notFound()
  return <RecordView record={record} />
}
