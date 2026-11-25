// Arte di gioco in una cornice scura, come le icone degli oggetti nel client.
import Image from "next/image"
import { cn } from "cn"

export function GameIcon({ src, size = 32, className }: { src: string | null | undefined; size?: number; className?: string }) {
  return (
    <span className={cn("inline-grid shrink-0 place-items-center overflow-hidden rounded-[4px] bg-[linear-gradient(145deg,#2a2a30,#111113)] ring-1 ring-white/12", className)} style={{ width: size, height: size }}>
      {src ? <Image src={src} alt="" width={size} height={size} unoptimized className="size-full object-contain" /> : null}
    </span>
  )
}
