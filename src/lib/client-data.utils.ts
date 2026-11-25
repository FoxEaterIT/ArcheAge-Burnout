// Dati di gioco piccoli che servono anche nel browser (icone dei commerci, collegamenti, indice delle tile).
// I JSON grandi restano in game-data.utils.ts, solo lato server.
import iconsJson from "@/data/generated/trade-icons.json"
import linksJson from "@/data/generated/trade-links.json"
import mapIndexJson from "@/data/generated/map-index.json"

export const TRADE_ICONS = iconsJson as Record<string, string>
export const TRADE_LINKS = linksJson as Record<string, string>
export const MAP_INDEX = mapIndexJson as Record<string, number[]>
