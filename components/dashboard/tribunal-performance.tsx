"use client"

import { Landmark, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type {
  DashboardFilters,
  DataArea,
  DataView,
  DataPeriod,
  DataPhase,
  DataTribunal,
  DataPortfolio,
  DataOwner,
} from "./types"
import {
  isAreaMatch,
  isPeriodInRange,
  isViewMatch,
  isPhaseMatch,
  isTribunalMatch,
  isPortfolioMatch,
  isOwnerMatch,
} from "./filter-utils"

const tribunals: {
  id: number
  name: DataTribunal
  volume: number
  sla: number
  winRate: number
  avgTime: string
  area: DataArea
  period: DataPeriod
  view: DataView
  phase: DataPhase
  portfolio: DataPortfolio
  owner: DataOwner
}[] = [
  {
    id: 1,
    name: "TJSP",
    volume: 320,
    sla: 94,
    winRate: 68,
    avgTime: "4,2m",
    area: "Cível",
    period: "30 dias",
    view: "Operacional",
    phase: "Execução",
    portfolio: "Corporate",
    owner: "Equipe Cível",
  },
  {
    id: 2,
    name: "TRT-2",
    volume: 260,
    sla: 91,
    winRate: 63,
    avgTime: "3,1m",
    area: "Trabalhista",
    period: "30 dias",
    view: "Operacional",
    phase: "Execução",
    portfolio: "Massificada",
    owner: "Dr. Pedro Santos",
  },
  {
    id: 3,
    name: "CADE",
    volume: 42,
    sla: 96,
    winRate: 71,
    avgTime: "6,5m",
    area: "Empresarial",
    period: "90 dias",
    view: "Estratégico",
    phase: "Decisão",
    portfolio: "Estratégica",
    owner: "Diretoria",
  },
  {
    id: 4,
    name: "CARF",
    volume: 88,
    sla: 89,
    winRate: 57,
    avgTime: "7,4m",
    area: "Tributário",
    period: "90 dias",
    view: "Estratégico",
    phase: "Decisão",
    portfolio: "Estratégica",
    owner: "Time Tributário",
  },
  {
    id: 5,
    name: "JEC-SP",
    volume: 410,
    sla: 87,
    winRate: 61,
    avgTime: "2,8m",
    area: "Consumidor",
    period: "30 dias",
    view: "Operacional",
    phase: "Execução",
    portfolio: "Massificada",
    owner: "Equipe Consumidor",
  },
  {
    id: 6,
    name: "STJ",
    volume: 55,
    sla: 93,
    winRate: 66,
    avgTime: "8,2m",
    area: "Empresarial",
    period: "12 meses",
    view: "Estratégico",
    phase: "Decisão",
    portfolio: "Corporate",
    owner: "Dr. Carlos Silva",
  },
]

const formatNumber = new Intl.NumberFormat("pt-BR")

export function TribunalPerformance({ filters }: { filters: DashboardFilters }) {
  const filtered = tribunals.filter(
    (tribunal) =>
      isAreaMatch(tribunal.area, filters.area) &&
      isViewMatch(tribunal.view, filters.view) &&
      isPeriodInRange(tribunal.period, filters.period) &&
      isPhaseMatch(tribunal.phase, filters.phase) &&
      isTribunalMatch(tribunal.name, filters.tribunal) &&
      isPortfolioMatch(tribunal.portfolio, filters.portfolio) &&
      isOwnerMatch(tribunal.owner, filters.owner)
  )
  const avgSla = filtered.length
    ? Math.round(filtered.reduce((sum, t) => sum + t.sla, 0) / filtered.length)
    : 0
  const avgWin = filtered.length
    ? Math.round(
        filtered.reduce((sum, t) => sum + t.winRate, 0) / filtered.length
      )
    : 0

  return (
    <Card className="border-border bg-card flex h-full flex-col">
      <CardHeader className="pb-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-1 rounded-xl bg-status-review/20 blur-lg" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-status-review to-status-review/70">
              <Landmark className="h-6 w-6 text-foreground" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold text-foreground">
              Performance por tribunal
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Eficiência e êxito por instância
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4 overflow-y-auto">
        <div className="rounded-xl border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Leitura rápida</p>
          <p className="mt-1">
            SLA acima de 92% indica boa fluidez processual; abaixo disso exige reforço de prazos.
          </p>
          <p className="mt-1">
            Tempo médio e taxa de êxito ajudam a calibrar alocação de equipe por instância.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            SLA médio {avgSla}% • Êxito médio {avgWin}% • {filtered.length} tribunais monitorados
          </p>
        </div>
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
            Nenhum tribunal disponível para os filtros atuais.
          </div>
        )}
        {filtered.map((tribunal) => (
          <div
            key={`${tribunal.name}-${tribunal.id}`}
            className="rounded-xl border border-border bg-secondary/30 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {tribunal.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Volume {formatNumber.format(tribunal.volume)} processos
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-foreground">
                  {tribunal.winRate}% êxito
                </span>
                <p className="text-xs text-muted-foreground">Tempo médio {tribunal.avgTime}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-status-active" />
              SLA
              <span className="font-semibold text-foreground">{tribunal.sla}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-status-active"
                style={{ width: `${tribunal.sla}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
