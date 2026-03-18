"use client"

import { Layers, ArrowDownRight, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DashboardFilters } from "./types"

const baseFunnel = {
  Empresarial: {
    intake: 520,
    triage: 462,
    active: 344,
    decision: 188,
    closed: 124,
  },
  Trabalhista: {
    intake: 610,
    triage: 540,
    active: 410,
    decision: 230,
    closed: 160,
  },
  Cível: {
    intake: 560,
    triage: 500,
    active: 370,
    decision: 210,
    closed: 150,
  },
  Tributário: {
    intake: 320,
    triage: 290,
    active: 214,
    decision: 140,
    closed: 96,
  },
  Consumidor: {
    intake: 740,
    triage: 670,
    active: 520,
    decision: 310,
    closed: 230,
  },
}

const periodFactor: Record<DashboardFilters["period"], number> = {
  "7 dias": 0.3,
  "30 dias": 1,
  "90 dias": 2.5,
  "12 meses": 7.2,
}

const formatNumber = new Intl.NumberFormat("pt-BR")

export function ProcessFunnel({ filters }: { filters: DashboardFilters }) {
  const base = baseFunnel[filters.area]
  const factor = periodFactor[filters.period] * (filters.view === "Estratégico" ? 1.08 : 1)
  const focusFactor =
    (filters.phase !== "Todas" ? 0.75 : 1) *
    (filters.tribunal !== "Todos" ? 0.7 : 1) *
    (filters.portfolio !== "Todas" ? 0.8 : 1) *
    (filters.owner !== "Todos" ? 0.7 : 1)

  const intake = Math.round(base.intake * factor * focusFactor)
  const stages = [
    {
      label: "Entrada",
      value: intake,
      color: "bg-primary",
      description: "Novas demandas",
    },
    {
      label: "Triagem",
      value: Math.round(base.triage * factor * focusFactor),
      color: "bg-status-review",
      description: "Qualificação inicial",
    },
    {
      label: "Execução",
      value: Math.round(base.active * factor * focusFactor),
      color: "bg-status-active",
      description: "Em andamento",
    },
    {
      label: "Decisão",
      value: Math.round(base.decision * factor * focusFactor),
      color: "bg-urgent-high",
      description: "Fase decisória",
    },
    {
      label: "Encerramento",
      value: Math.round(base.closed * factor * focusFactor),
      color: "bg-accent",
      description: "Casos finalizados",
    },
  ]

  const conversion = intake > 0 ? Math.round((stages[4].value / intake) * 100) : 0
  const trendUp = conversion >= 20

  return (
    <Card className="border-border bg-card flex h-full flex-col">
      <CardHeader className="pb-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-1 rounded-xl bg-primary/20 blur-lg" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70">
                <Layers className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-semibold text-foreground">
                Funil processual
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {filters.area} • {filters.period}
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-secondary/60 px-4 py-2 text-right">
            <div className="text-xs font-semibold text-muted-foreground">
              Conversão de encerramento
            </div>
            <div className="flex items-center justify-end gap-1 text-xl font-semibold text-foreground">
              {trendUp ? (
                <ArrowUpRight className="h-4 w-4 text-status-active" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-urgent-high" />
              )}
              {conversion}%
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4 overflow-y-auto">
        {stages.map((stage) => {
          const width = intake > 0 ? (stage.value / intake) * 100 : 0
          return (
            <div key={stage.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-semibold text-foreground">{stage.label}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {stage.description}
                  </span>
                </div>
                <span className="font-semibold text-foreground">
                  {formatNumber.format(stage.value)}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div className={`h-full rounded-full ${stage.color}`} style={{ width: `${width}%` }} />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
