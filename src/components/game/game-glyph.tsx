// Glifo bianco dell'interfaccia di gioco usato come maschera: prende il colore del testo (oro quando attivo).
import { cn } from "cn"

export function GameGlyph({ src, className }: { src: string; className?: string }) {
  return <span aria-hidden className={cn("inline-block size-6 shrink-0 bg-current", className)} style={{ mask: `url(${src}) center / contain no-repeat`, WebkitMask: `url(${src}) center / contain no-repeat` }} />
}
