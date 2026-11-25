import Link from "next/link"

const MOCKUPS = [
  ["a", "Almanacco del mercante", "Le rotte come tabella oraria: partenze in riga, destinazioni in colonna, il ricavo migliore coronato. Gli eventi come fasce sulle 24 ore."],
  ["b", "Linee di Auroria", "Ogni carico è una linea dal banco alle destinazioni, la tratta più redditizia accesa in oro. Navigazione laterale, eventi come stato delle linee."],
  ["c", "Bacheca densa", "Moduli piccoli e fitti per il secondo monitor: ricerca globale, filtri a pulsanti, eventi e banchi sempre visibili."],
]

export default function Mockups() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 bg-[#09090b] px-6 py-16 text-zinc-100">
      <h1 className="[font-family:var(--font-display)] text-4xl">Prove di design</h1>
      <ul className="space-y-4">
        {MOCKUPS.map(([id, title, text]) => (
          <li key={id}>
            <Link href={`/mockup/${id}`} className="block rounded-lg border border-zinc-800 p-5 hover:border-amber-200">
              <span className="text-lg text-amber-200">{id.toUpperCase()} · {title}</span>
              <span className="mt-1 block text-sm text-zinc-400">{text}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
