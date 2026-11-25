// Campo di ricerca nel guscio statico, finché quello vero (che legge l'URL) non è pronto: evita il salto della pagina.
import { Search } from "lucide-react"
import { Input } from "./input"

export function SearchFieldFallback({ label, placeholder }: { label?: string; placeholder: string }) {
  return (
    <div className="grid w-full gap-1.5 lg:max-w-xl">
      {label ? <span className="text-sm font-medium">{label}</span> : null}
      <div className="relative">
        <Search aria-hidden className="pointer-events-none absolute top-3 left-3 size-4 text-dim" />
        <Input disabled aria-label={label ?? placeholder} placeholder={placeholder} className="h-10 pl-9 text-base" />
      </div>
    </div>
  )
}
