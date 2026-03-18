"use client"

import {
  Briefcase,
  ArrowUpRight,
  AlertTriangle,
  Clock,
  TrendingUp,
  Calendar,
  ChevronRight,
} from "lucide-react"
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

const portfolio: {
  id: number
  title: string
  client: string
  processNumber: string
  status: string
  nextAction: string
  nextDate: string
  valueLabel: string
  value: number
  probability: number
  owner: DataOwner
  score: number
  area: DataArea
  period: DataPeriod
  view: DataView
  phase: DataPhase
  tribunal: DataTribunal
  portfolio: DataPortfolio
}[] = [
  {
    id: 1,
    title: "Recuperação Judicial",
    client: "Indústrias Unidas S.A.",
    processNumber: "1234567-89.2024",
    status: "high",
    nextAction: "Assembleia de credores",
    nextDate: "20/03/2026",
    valueLabel: "R$ 45 mi",
    value: 45,
    probability: 58,
    owner: "Dr. Carlos Silva",
    score: 86,
    area: "Empresarial",
    period: "30 dias",
    view: "Estratégico",
    phase: "Decisão",
    tribunal: "STJ",
    portfolio: "Estratégica",
  },
  {
    id: 2,
    title: "Disputa Societária",
    client: "Grupo Empresarial XYZ",
    processNumber: "9876543-21.2024",
    status: "medium",
    nextAction: "Perícia contábil",
    nextDate: "22/03/2026",
    valueLabel: "R$ 12 mi",
    value: 12,
    probability: 64,
    owner: "Dra. Ana Martins",
    score: 72,
    area: "Empresarial",
    period: "30 dias",
    view: "Operacional",
    phase: "Execução",
    tribunal: "TJSP",
    portfolio: "Corporate",
  },
  {
    id: 3,
    title: "Ação Trabalhista Coletiva",
    client: "Construtora ABC",
    processNumber: "5555555-55.2024",
    status: "high",
    nextAction: "Audiência de instrução",
    nextDate: "25/03/2026",
    valueLabel: "R$ 8 mi",
    value: 8,
    probability: 42,
    owner: "Dr. Pedro Santos",
    score: 69,
    area: "Trabalhista",
    period: "90 dias",
    view: "Operacional",
    phase: "Execução",
    tribunal: "TRT-2",
    portfolio: "Massificada",
  },
  {
    id: 4,
    title: "Fusão Empresarial",
    client: "Tech Corp + Inovação",
    processNumber: "7777777-77.2024",
    status: "low",
    nextAction: "Aprovação CADE",
    nextDate: "30/03/2026",
    valueLabel: "R$ 120 mi",
    value: 120,
    probability: 81,
    owner: "Dra. Maria Costa",
    score: 91,
    area: "Empresarial",
    period: "12 meses",
    view: "Estratégico",
    phase: "Decisão",
    tribunal: "CADE",
    portfolio: "Estratégica",
  },
  {
    id: 5,
    title: "Carteira de crédito tributário",
    client: "Grupo Sideral",
    processNumber: "8888888-99.2024",
    status: "medium",
    nextAction: "Atualizar laudos",
    nextDate: "05/04/2026",
    valueLabel: "R$ 18 mi",
    value: 18,
    probability: 54,
    owner: "Dra. Maria Costa",
    score: 77,
    area: "Tributário",
    period: "90 dias",
    view: "Estratégico",
    phase: "Decisão",
    tribunal: "CARF",
    portfolio: "Estratégica",
  },
  {
    id: 6,
    title: "Ação coletiva consumidor",
    client: "Rede Varejo Norte",
    processNumber: "6666666-00.2024",
    status: "high",
    nextAction: "Negociação de acordo",
    nextDate: "10/04/2026",
    valueLabel: "R$ 6 mi",
    value: 6,
    probability: 48,
    owner: "Dr. João Oliveira",
    score: 65,
    area: "Consumidor",
    period: "90 dias",
    view: "Operacional",
    phase: "Execução",
    tribunal: "JEC-SP",
    portfolio: "Massificada",
  },
]

const getStatusConfig = (status: string) => {
  switch (status) {
    case "high":
      return {
        icon: AlertTriangle,
        bg: "bg-urgent-high/15",
        text: "text-urgent-high",
        border: "border-urgent-high/30",
        label: "Alto risco",
        progressBg: "bg-urgent-high",
        glow: "shadow-urgent-high/20",
      }
    case "medium":
      return {
        icon: Clock,
        bg: "bg-status-review/15",
        text: "text-status-review",
        border: "border-status-review/30",
        label: "Risco moderado",
        progressBg: "bg-status-review",
        glow: "shadow-status-review/20",
      }
    case "low":
      return {
        icon: ArrowUpRight,
        bg: "bg-status-active/15",
        text: "text-status-active",
        border: "border-status-active/30",
        label: "Risco controlado",
        progressBg: "bg-status-active",
        glow: "shadow-status-active/20",
      }
    default:
      return {
        icon: Clock,
        bg: "bg-muted",
        text: "text-muted-foreground",
        border: "border-border",
        label: "Indefinido",
        progressBg: "bg-muted-foreground",
        glow: "",
      }
  }
}

export function PriorityCases({ filters }: { filters: DashboardFilters }) {
  const filtered = portfolio.filter(
    (caseItem) =>
      isAreaMatch(caseItem.area, filters.area) &&
      isViewMatch(caseItem.view, filters.view) &&
      isPeriodInRange(caseItem.period, filters.period) &&
      isPhaseMatch(caseItem.phase, filters.phase) &&
      isTribunalMatch(caseItem.tribunal, filters.tribunal) &&
      isPortfolioMatch(caseItem.portfolio, filters.portfolio) &&
      isOwnerMatch(caseItem.owner, filters.owner)
  )

  const totalValue = filtered.reduce((sum, c) => sum + c.value, 0)
  const avgProbability = filtered.length
    ? Math.round(
        filtered.reduce((sum, c) => sum + c.probability, 0) / filtered.length
      )
    : 0
  const avgScore = filtered.length
    ? Math.round(filtered.reduce((sum, c) => sum + c.score, 0) / filtered.length)
    : 0
  const statusCounts = filtered.reduce(
    (acc, item) => {
      acc[item.status as "high" | "medium" | "low"] += 1
      return acc
    },
    { high: 0, medium: 0, low: 0 }
  )
  const showSidePanel = filtered.length > 0 && filtered.length % 2 === 1
  const parseDate = (value: string) => {
    const [day, month, year] = value.split("/").map((part) => Number(part))
    return new Date(year, month - 1, day)
  }
  const upcoming = [...filtered]
    .sort((a, b) => parseDate(a.nextDate).getTime() - parseDate(b.nextDate).getTime())
    .slice(0, 3)
  const topExposure =
    filtered.length > 0
      ? filtered.reduce((max, item) => (item.value > max.value ? item : max))
      : null
  const totalStatus = statusCounts.high + statusCounts.medium + statusCounts.low
  const highPercent = totalStatus ? Math.round((statusCounts.high / totalStatus) * 100) : 0
  const mediumPercent = totalStatus
    ? Math.round((statusCounts.medium / totalStatus) * 100)
    : 0
  const lowPercent = Math.max(0, 100 - highPercent - mediumPercent)

  return (
    <Card className="border-border bg-card flex h-full flex-col">
      <CardHeader className="pb-4 shrink-0">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1.8fr_1fr] lg:items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-1 rounded-xl bg-status-review/20 blur-lg" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-status-review to-status-review/70">
                <Briefcase className="h-6 w-6 text-foreground" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-semibold text-foreground">
                Matriz de valor e risco
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {filtered.length} casos estratégicos monitorados
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-border/60 bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Resumo executivo
            </p>
            {filtered.length === 0 ? (
              <p className="mt-1">
                Nenhum caso atende aos filtros atuais. Ajuste o recorte para ampliar a
                amostra.
              </p>
            ) : (
              <>
                <p className="mt-1">
                  Foco atual:{" "}
                  <span className="font-semibold text-foreground">
                    {filters.portfolio}
                  </span>{" "}
                  • Visão{" "}
                  <span className="font-semibold text-foreground">{filters.view}</span>.
                </p>
                <p className="mt-1">
                  Sugestão: priorizar casos com score acima de 80 e risco alto para
                  reduzir exposição.
                </p>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <div className="rounded-xl bg-status-active/10 px-4 py-2 text-right">
              <div className="flex items-center gap-1.5 text-status-active">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-semibold">VALOR TOTAL</span>
              </div>
              <span className="text-2xl font-semibold text-foreground">
                R$ {totalValue} mi
              </span>
            </div>
            <div className="rounded-xl bg-secondary/60 px-4 py-2 text-right">
              <div className="text-xs font-semibold text-muted-foreground">
                Probabilidade média
              </div>
              <span className="text-2xl font-semibold text-foreground">
                {avgProbability}%
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
            Nenhum caso estratégico disponível para os filtros atuais.
          </div>
        )}
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((caseItem, index) => {
            const config = getStatusConfig(caseItem.status)
            const Icon = config.icon

            return (
              <div
                key={caseItem.id}
                className={`group relative overflow-hidden rounded-xl border bg-secondary/30 transition-all duration-300 hover:bg-secondary/60 hover:shadow-lg animate-slide-up opacity-0 stagger-${index + 1} ${config.border} ${config.glow}`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110 ${config.bg}`}
                      >
                        <Icon className={`h-5 w-5 ${config.text}`} />
                      </div>
                      <div>
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${config.bg} ${config.text}`}
                        >
                          {config.label}
                        </span>
                        <h3 className="mt-1 text-lg font-semibold text-foreground">
                          {caseItem.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {caseItem.client}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {caseItem.processNumber}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-semibold text-foreground">
                        {caseItem.valueLabel}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {caseItem.owner}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Probabilidade de êxito
                      </span>
                      <span className={`font-semibold tabular-nums ${config.text}`}>
                        {caseItem.probability}%
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${config.progressBg}`}
                        style={{ width: `${caseItem.probability}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-lg bg-background/50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
                        <ChevronRight className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Próximo marco
                        </span>
                        <p className="text-sm font-semibold text-primary">
                          {caseItem.nextAction}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        {caseItem.nextDate}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Score de priorização</span>
                    <span className="rounded-full bg-secondary/70 px-2.5 py-0.5 text-sm font-semibold text-foreground">
                      {caseItem.score}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
          {showSidePanel && (
            <div className="rounded-xl border border-border bg-secondary/20 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Radar tático</p>
                <span className="text-xs text-muted-foreground">
                  Score médio {avgScore}
                </span>
              </div>

              <div className="mt-3 space-y-3">
                <div className="rounded-lg bg-background/60 p-3">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Distribuição de risco
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5 text-urgent-high">
                      <span className="h-2 w-2 rounded-full bg-urgent-high" />
                      Alto {statusCounts.high}
                    </span>
                    <span className="flex items-center gap-1.5 text-status-review">
                      <span className="h-2 w-2 rounded-full bg-status-review" />
                      Moderado {statusCounts.medium}
                    </span>
                    <span className="flex items-center gap-1.5 text-status-active">
                      <span className="h-2 w-2 rounded-full bg-status-active" />
                      Controlado {statusCounts.low}
                    </span>
                  </div>
                  <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-urgent-high"
                      style={{ width: `${highPercent}%` }}
                    />
                    <div
                      className="h-full bg-status-review"
                      style={{ width: `${mediumPercent}%` }}
                    />
                    <div
                      className="h-full bg-status-active"
                      style={{ width: `${lowPercent}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-lg bg-background/60 p-3">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Próximos marcos
                  </p>
                  <div className="mt-2 space-y-2 text-sm">
                    {upcoming.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {item.nextAction}
                          </p>
                          <p className="text-xs text-muted-foreground">{item.title}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {item.nextDate}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {topExposure && (
                  <div className="rounded-lg bg-background/60 p-3">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Maior exposição financeira
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {topExposure.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {topExposure.client} • {topExposure.owner}
                        </p>
                      </div>
                      <div className="text-right text-sm font-semibold text-foreground">
                        R$ {topExposure.value} mi
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
