"use client"

import {
  AlertTriangle,
  Timer,
  ShieldAlert,
  ShieldCheck,
  Clock,
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

const deadlineRisks: {
  id: number
  title: string
  client: string
  dueDate: string
  timeLeft: string
  risk: string
  score: number
  progress: number
  processNumber: string
  owner: DataOwner
  action: string
  area: DataArea
  period: DataPeriod
  view: DataView
  phase: DataPhase
  tribunal: DataTribunal
  portfolio: DataPortfolio
}[] = [
  {
    id: 1,
    title: "Contestação - Ação Civil Pública",
    client: "Grupo Lira",
    dueDate: "Hoje, 16:00",
    timeLeft: "3h",
    risk: "critical",
    score: 92,
    progress: 88,
    processNumber: "0001234-56.2024.8.26.0100",
    owner: "Equipe Cível",
    action: "Revisar minuta final",
    area: "Cível",
    period: "7 dias",
    view: "Operacional",
    phase: "Execução",
    tribunal: "TJSP",
    portfolio: "Corporate",
  },
  {
    id: 2,
    title: "Recurso de apelação",
    client: "Comércio Beta S.A.",
    dueDate: "Amanhã, 18:00",
    timeLeft: "1d",
    risk: "high",
    score: 78,
    progress: 66,
    processNumber: "0009876-21.2024.8.26.0100",
    owner: "Núcleo de Recursos",
    action: "Validar fundamentação",
    area: "Empresarial",
    period: "7 dias",
    view: "Operacional",
    phase: "Decisão",
    tribunal: "STJ",
    portfolio: "Corporate",
  },
  {
    id: 3,
    title: "Manifestação - Agravo",
    client: "Indústria Gamma",
    dueDate: "19/03/2026",
    timeLeft: "2d",
    risk: "medium",
    score: 56,
    progress: 42,
    processNumber: "0005555-55.2024.8.26.0100",
    owner: "Dr. Pedro Santos",
    action: "Ajustar anexos",
    area: "Trabalhista",
    period: "30 dias",
    view: "Operacional",
    phase: "Execução",
    tribunal: "TRT-2",
    portfolio: "Massificada",
  },
  {
    id: 4,
    title: "Petição de habilitação",
    client: "Grupo Delta",
    dueDate: "21/03/2026",
    timeLeft: "4d",
    risk: "low",
    score: 32,
    progress: 22,
    processNumber: "0007777-77.2024.8.26.0100",
    owner: "Backoffice",
    action: "Conferir documentos",
    area: "Empresarial",
    period: "30 dias",
    view: "Operacional",
    phase: "Triagem",
    tribunal: "TJSP",
    portfolio: "Massificada",
  },
  {
    id: 5,
    title: "Fechamento de parecer tributário",
    client: "Holding Verde",
    dueDate: "28/03/2026",
    timeLeft: "9d",
    risk: "medium",
    score: 61,
    progress: 54,
    processNumber: "0002222-33.2024.8.26.0100",
    owner: "Time Tributário",
    action: "Validar anexos",
    area: "Tributário",
    period: "90 dias",
    view: "Estratégico",
    phase: "Decisão",
    tribunal: "CARF",
    portfolio: "Estratégica",
  },
  {
    id: 6,
    title: "Acordo em ações de consumo",
    client: "Rede Varejo Norte",
    dueDate: "15/04/2026",
    timeLeft: "28d",
    risk: "high",
    score: 74,
    progress: 38,
    processNumber: "0009999-44.2024.8.26.0100",
    owner: "Equipe Consumidor",
    action: "Alinhar proposta",
    area: "Consumidor",
    period: "90 dias",
    view: "Estratégico",
    phase: "Execução",
    tribunal: "JEC-SP",
    portfolio: "Massificada",
  },
]

const getRiskConfig = (risk: string) => {
  switch (risk) {
    case "critical":
      return {
        icon: ShieldAlert,
        bg: "bg-urgent-critical",
        bgLight: "bg-urgent-critical/15",
        text: "text-urgent-critical",
        border: "border-urgent-critical/40",
        label: "CRÍTICO",
        glow: "shadow-urgent-critical/30",
      }
    case "high":
      return {
        icon: AlertTriangle,
        bg: "bg-urgent-high",
        bgLight: "bg-urgent-high/15",
        text: "text-urgent-high",
        border: "border-urgent-high/40",
        label: "ALTO",
        glow: "shadow-urgent-high/20",
      }
    case "medium":
      return {
        icon: Timer,
        bg: "bg-urgent-medium",
        bgLight: "bg-urgent-medium/15",
        text: "text-urgent-medium",
        border: "border-urgent-medium/40",
        label: "MÉDIO",
        glow: "shadow-urgent-medium/20",
      }
    case "low":
      return {
        icon: ShieldCheck,
        bg: "bg-urgent-low",
        bgLight: "bg-urgent-low/15",
        text: "text-urgent-low",
        border: "border-urgent-low/40",
        label: "BAIXO",
        glow: "shadow-urgent-low/20",
      }
    default:
      return {
        icon: Clock,
        bg: "bg-muted",
        bgLight: "bg-muted/50",
        text: "text-muted-foreground",
        border: "border-border",
        label: "NORMAL",
        glow: "",
      }
  }
}

export function DeadlineAlerts({ filters }: { filters: DashboardFilters }) {
  const filtered = deadlineRisks.filter(
    (deadline) =>
      isAreaMatch(deadline.area, filters.area) &&
      isViewMatch(deadline.view, filters.view) &&
      isPeriodInRange(deadline.period, filters.period) &&
      isPhaseMatch(deadline.phase, filters.phase) &&
      isTribunalMatch(deadline.tribunal, filters.tribunal) &&
      isPortfolioMatch(deadline.portfolio, filters.portfolio) &&
      isOwnerMatch(deadline.owner, filters.owner)
  )

  const criticalCount = filtered.filter(
    (d) => d.risk === "critical" || d.risk === "high"
  ).length

  return (
    <Card className="border-border bg-card flex h-full flex-col">
      <CardHeader className="pb-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-1 rounded-xl bg-urgent-critical/30 blur-lg" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-urgent-critical to-urgent-high">
                <AlertTriangle className="h-6 w-6 text-foreground" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-semibold text-foreground">
                Radar de prazos
              </CardTitle>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-urgent-critical/20 text-xs font-bold text-urgent-critical">
                  {criticalCount}
                </span>
                riscos elevados
              </p>
            </div>
          </div>

          <div className="hidden flex-wrap gap-2 lg:flex">
            {["critical", "high", "medium", "low"].map((level) => {
              const config = getRiskConfig(level)
              return (
                <span
                  key={level}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${config.bgLight} ${config.text}`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${config.bg}`} />
                  {config.label}
                </span>
              )
            })}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
            Nenhum prazo crítico encontrado para os filtros atuais.
          </div>
        )}
        {filtered.map((deadline, index) => {
          const config = getRiskConfig(deadline.risk)
          const Icon = config.icon

          return (
            <div
              key={deadline.id}
              className={`group relative overflow-hidden rounded-xl border bg-secondary/30 transition-all duration-300 hover:bg-secondary/60 animate-slide-up opacity-0 stagger-${index + 1} ${config.border} ${config.glow}`}
            >
              <div className={`absolute left-0 top-0 h-full w-1.5 ${config.bg}`} />

              <div className="flex items-center gap-4 p-4 pl-5">
                <div
                  className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${config.bgLight}`}
                >
                  <Icon className={`relative h-7 w-7 ${config.text}`} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ${config.bgLight} ${config.text}`}
                    >
                      {config.label}
                    </span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {deadline.owner}
                    </span>
                    <span className="rounded-full bg-background/60 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                      Score {deadline.score}
                    </span>
                  </div>
                  <h3 className="mt-1.5 truncate text-lg font-semibold text-foreground">
                    {deadline.title}
                  </h3>
                  <div className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{deadline.client}</span>
                    <span className="text-border">|</span>
                    <span className="font-mono text-xs">{deadline.processNumber}</span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Próxima ação: <span className="font-semibold text-foreground">{deadline.action}</span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <div className={`text-3xl font-semibold tabular-nums ${config.text}`}>
                    {deadline.timeLeft}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {deadline.dueDate}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-4">
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Janela de SLA</span>
                  <span className="font-semibold text-foreground">{deadline.progress}% consumido</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${config.bg}`}
                    style={{ width: `${deadline.progress}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
