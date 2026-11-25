// Scelta della classe: le quattro classi con le loro armi.
import { cn } from "cn"
import { GameIcon } from "@/components/game/game-icon"
import type { CharacterBuild } from "@/hooks/character-build.types"
import type { BuilderData } from "@/lib/builder.types"
import { CLASSES, CLASS_NAMES } from "@/lib/builder.utils"

export function ClassPicker({ cb, art }: { cb: CharacterBuild; art: BuilderData["classArt"] }) {
  return (
    <section aria-labelledby="choose-class" className="space-y-3">
      <h2 id="choose-class" className="font-display text-2xl">Scegli la classe della build</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {CLASS_NAMES.map((name) => (
          <button key={name} type="button" aria-pressed={cb.build.archetype === name} onClick={() => cb.chooseClass(name)} className={cn("flex flex-col items-start gap-3 rounded-xl border border-line bg-surface p-5 text-left hover:border-gold aria-pressed:border-gold aria-pressed:bg-raised")}>
            <GameIcon src={art[name]} size={60} />
            <span className="font-display text-2xl">{name}</span>
            <span className="text-sm text-muted">{CLASSES[name].join(" / ")}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
