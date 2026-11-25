import type { Metadata } from "next"
import { CharacterBuilder } from "@/components/builder/character-builder"
import { PageHeader } from "@/components/shell/app-shell"
import { builderData } from "@/lib/game-data.utils"

export const metadata: Metadata = { title: "Character Builder" }

export default function BuilderPage() {
  return (
    <>
      <PageHeader title="Character Builder" description="Classe, equipaggiamento, punti attributo e rami abilità. La build resta salvata su questo dispositivo." />
      <div className="px-4 py-6 sm:px-6 lg:px-10">
        <CharacterBuilder data={builderData()} />
      </div>
    </>
  )
}
