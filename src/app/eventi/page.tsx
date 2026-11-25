import type { Metadata } from "next"
import { EventBoard } from "@/components/events/event-board"
import { PageHeader } from "@/components/shell/app-shell"

export const metadata: Metadata = { title: "Orari degli eventi" }

export default function EventiPage() {
  return (
    <>
      <PageHeader title="Orari degli eventi" description="Crimson Rift e Brutal Nightmare: quando aprono, quanto manca, e il calendario da aggiungere al telefono." />
      <div className="px-4 py-6 sm:px-6 lg:px-10">
        <EventBoard />
      </div>
    </>
  )
}
