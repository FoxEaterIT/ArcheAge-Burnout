"use client"
// Select del tema (Radix via shadcn) con le opzioni come elenco: sostituisce le select native non stilizzabili.
import { cn } from "cn"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

type Option = { value: string; label: string; disabled?: boolean }

export function GameSelect({ id, value, onChange, options, label, className }: { id?: string; value: string; onChange: (value: string) => void; options: Option[]; label?: string; className?: string }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} aria-label={label} className={cn("w-full data-[size=default]:h-9", className)}><SelectValue /></SelectTrigger>
      <SelectContent className="max-h-80">
        {options.map((o) => <SelectItem key={o.value} value={o.value} disabled={o.disabled}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}
