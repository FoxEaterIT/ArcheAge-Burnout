// Testo con le icone dei commerci davanti ai nomi riconosciuti; i nomi con una scheda diventano link.
import Link from "next/link"
import { cn } from "cn"
import { segmentText } from "@/lib/trade.utils"
import { GameIcon } from "./game-icon"

export function GameText({ text, size = 22, className, linked = true }: { text: string; size?: number; className?: string; linked?: boolean }) {
  return (
    <span className={className}>
      {segmentText(text).map((part, i) => {
        if (typeof part === "string") return part
        const body = (
          <>
            <GameIcon src={part.icon} size={size} />
            {part.name}
          </>
        )
        return linked && part.href ? (
          <Link key={i} href={part.href} className={cn("inline-flex items-center gap-1.5 align-middle decoration-dim decoration-dotted underline-offset-4 hover:text-gold hover:underline")}>{body}</Link>
        ) : (
          <span key={i} className="inline-flex items-center gap-1.5 align-middle">{body}</span>
        )
      })}
    </span>
  )
}
