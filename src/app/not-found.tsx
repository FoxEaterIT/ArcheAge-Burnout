import Link from "next/link"

export default function NotFound() {
  return (
    <div className="space-y-4 px-4 py-16 sm:px-6 lg:px-10">
      <h1 className="font-display text-4xl">Questa pagina non c’è</h1>
      <p className="max-w-xl text-muted">La voce che cerchi non è nel catalogo, oppure il link è cambiato. Cercala nel catalogo o torna alle rotte.</p>
      <div className="flex gap-4 text-sm">
        <Link href="/catalogo" className="text-gold hover:underline">Apri il catalogo</Link>
        <Link href="/rotte" className="text-gold hover:underline">Rotte commerciali</Link>
      </div>
    </div>
  )
}
