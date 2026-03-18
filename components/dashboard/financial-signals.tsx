"use client"

import { PiggyBank, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DashboardFilters } from "./types"

const baseFinance = {
  Empresarial: { exposure: 120, recovered: 42, cost: 8.4, roi: 2.6 },
  Trabalhista: { exposure: 68, recovered: 18, cost: 6.2, roi: 1.9 },
  Cível: { exposure: 84, recovered: 26, cost: 7.1, roi: 2.1 },
  Tributário: { exposure: 140, recovered: 55, cost: 11.6, roi: 2.9 },
  Consumidor: { exposure: 52, recovered: 15, cost: 4.8, roi: 1.6 },
}

const periodFactor: Record<DashboardFilters["period"], number> = {
  "7 dias": 0.22,
  "30 dias": 1,
  "90 dias": 2.6,
  "12 meses": 7.8,
}

const portfolioFactor: Record<DashboardFilters["portfolio"], number> = {
  Todas: 1,
  Corporate: 1.2,
  Massificada: 0.8,
  Recuperação: 1.1,
  Estratégica: 1.35,
}

const formatMoney = (value: number) => {
  if (value >= 100) {
    return `R$ ${value.toFixed(0)} mi`
  }
  return `R$ ${value.toFixed(1).replace(".", ",")} mi`
}

export function FinancialSignals({ filters }: { filters: DashboardFilters }) {
  const base = baseFinance[filters.area]
  const factor = periodFactor[filters.period] * (filters.view === "Estratégico" ? 1.12 : 1)
  const portfolioBoost = portfolioFactor[filters.portfolio]
  const tribunalBoost = filters.tribunal === "Todos" ? 1 : 0.82
  const ownerBoost = filters.owner === "Todos" ? 1 : 0.92

  const exposure = base.exposure * factor * portfolioBoost * tribunalBoost * ownerBoost
  const recovered = base.recovered * factor * portfolioBoost * tribunalBoost * ownerBoost
  const cost =
    base.cost *
    factor *
    (filters.view === "Estratégico" ? 1.05 : 0.96) *
    (filters.phase === "Decisão" ? 1.08 : 1)
  const roi =
    base.roi +
    (filters.view === "Estratégico" ? 0.3 : -0.1) +
    (filters.portfolio === "Estratégica" ? 0.4 : 0)

  const delta = filters.view === "Estratégico" ? 6.2 : 3.4
  const trendUp = recovered / exposure >= 0.32

  return (
    <Card className="border-border bg-card flex h-full flex-col">
      <CardHeader className="pb-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-1 rounded-xl bg-accent/30 blur-lg" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent/70">
              <PiggyBank className="h-6 w-6 text-accent-foreground" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold text-foreground">
              Sinais financeiros
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Exposição, recuperação e ROI
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4 overflow-y-auto">
        <div className="rounded-xl border border-border bg-secondary/30 p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Exposição total</span>
            <span className="text-lg font-semibold text-foreground">
              {formatMoney(exposure)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
            <span>Recuperado</span>
            <span className="text-lg font-semibold text-foreground">
              {formatMoney(recovered)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
            <span>Custo jurídico</span>
            <span className="text-lg font-semibold text-foreground">
              {formatMoney(cost)}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background/60 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-muted-foreground">ROI estimado</p>
              <p className="text-2xl font-semibold text-foreground">{roi.toFixed(1)}x</p>
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-status-active">
              {trendUp ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              +{delta}%
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Projeção baseada em {filters.period} • {filters.view}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
