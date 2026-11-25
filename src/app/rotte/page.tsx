import type { Metadata } from "next"
import { PageHeader } from "@/components/shell/app-shell"
import { BenchRecipes } from "@/components/trade/bench-recipes"
import { TradeRoutes } from "@/components/trade/trade-routes"
import { benches, cargoRecordIds, tradeRoutes } from "@/lib/game-data.utils"
import { placeOptions, rewardOptions } from "@/lib/trade.utils"

export const metadata: Metadata = { title: "Rotte commerciali" }

export default function RottePage() {
  return (
    <>
      <PageHeader title="Rotte commerciali" description="Quale pacco preparare, dove portarlo e quanto rende. Ricavi base per collo." />
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-10">
        <BenchRecipes benches={benches} />
        <TradeRoutes routes={tradeRoutes} rewards={rewardOptions(tradeRoutes)} origins={placeOptions(tradeRoutes, "origin")} destinations={placeOptions(tradeRoutes, "destination")} cargoIds={cargoRecordIds} />
      </div>
    </>
  )
}
