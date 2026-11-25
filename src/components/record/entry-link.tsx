// Voce collegata: icona di gioco, nome che porta alla scheda, nota (quantità, probabilità).
import Link from "next/link"
import { GameIcon } from "@/components/game/game-icon"
import type { EntryLink as Entry } from "@/lib/record.types"

export function EntryLink({ entry, label, size = 28 }: { entry: Entry; label?: string; size?: number }) {
  const body = (
    <>
      <GameIcon src={entry.art} size={size} />
      <span className="min-w-0 [overflow-wrap:anywhere]">{label ?? entry.name}</span>
    </>
  )
  return entry.href ? (
    <Link href={entry.href} className="inline-flex items-center gap-2 text-left hover:text-gold">{body}</Link>
  ) : (
    <span className="inline-flex items-center gap-2">{body}</span>
  )
}

export function EntryGrid({ items }: { items: (Entry & { note?: string })[] }) {
  return (
    <ul className="grid gap-1.5 sm:grid-cols-[repeat(auto-fill,minmax(230px,1fr))]">
      {items.map((item, i) => (
        <li key={item.id + i} className="rounded-lg border border-line bg-bg px-3 py-2 text-sm">
          <EntryLink entry={item} />
          {item.note ? <span className="mt-0.5 block pl-9 text-xs text-muted">{item.note}</span> : null}
        </li>
      ))}
    </ul>
  )
}

export function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id ? id + "-title" : undefined} className="scroll-mt-6 space-y-3 border-t border-line pt-5 first:border-0 first:pt-0" id={id}>
      <h2 id={id ? id + "-title" : undefined} className="font-display text-xl text-gold">{title}</h2>
      {children}
    </section>
  )
}
