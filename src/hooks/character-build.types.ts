// Tipo dello stato del Character Builder accanto al suo hook: lib/ non dipende da hooks/.
import type { useCharacterBuild } from "./use-character-build"

/** Stato e azioni del Character Builder, come li restituisce `useCharacterBuild`. */
export type CharacterBuild = ReturnType<typeof useCharacterBuild>
