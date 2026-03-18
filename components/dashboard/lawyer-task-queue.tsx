"use client"

import {
  Users,
  Gauge,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Bolt,
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

const squads: {
  id: number
  name: string
  lead: DataOwner
  focus: string
  occupancy: number
  backlog: number
  urgent: number
  sla: number
  area: DataArea
  view: DataView
  period: DataPeriod
  phase: DataPhase
  tribunal: DataTribunal
  portfolio: DataPortfolio
}[] = [
  {
    id: 1,
    name: "Contencioso Estratégico",
    lead: "Dra. Ana Martins",
    focus: "Recursos & precedentes",
    occupancy: 82,
    backlog: 18,
    urgent: 3,
    sla: 96,
    area: "Cível",
    view: "Estratégico",
    period: "90 dias",
    phase: "Decisão",
    tribunal: "STJ",
    portfolio: "Estratégica",
  },
  {
    id: 2,
    name: "Trabalhista Operacional",
    lead: "Dr. Pedro Santos",
    focus: "Audiências e prazos",
    occupancy: 74,
    backlog: 22,
    urgent: 2,
    sla: 92,
    area: "Trabalhista",
    view: "Operacional",
    period: "30 dias",
    phase: "Execução",
    tribunal: "TRT-2",
    portfolio: "Massificada",
  },
  {
    id: 3,
    name: "Consultivo Empresarial",
    lead: "Dr. Carlos Silva",
    focus: "Contratos e compliance",
    occupancy: 63,
    backlog: 14,
    urgent: 1,
    sla: 98,
    area: "Empresarial",
    view: "Estratégico",
    period: "90 dias",
    phase: "Triagem",
    tribunal: "TJSP",
    portfolio: "Corporate",
  },
  {
    id: 4,
    name: "Tributário & Regulatórios",
    lead: "Dra. Maria Costa",
    focus: "Planejamento fiscal",
    occupancy: 69,
    backlog: 11,
    urgent: 1,
    sla: 94,
    area: "Tributário",
    view: "Estratégico",
    period: "90 dias",
    phase: "Decisão",
    tribunal: "CARF",
    portfolio: "Estratégica",
  },
  {
    id: 5,
    name: "Consumidor & Massificado",
    lead: "Dr. João Oliveira",
    focus: "Volume e acordos",
    occupancy: 78,
    backlog: 26,
    urgent: 4,
    sla: 89,
    area: "Consumidor",
    view: "Operacional",
    period: "30 dias",
    phase: "Execução",
    tribunal: "JEC-SP",
    portfolio: "Massificada",
  },
  {
    id: 6,
    name: "Empresarial Operacional",
    lead: "Equipe Operações",
    focus: "Rotinas societárias",
    occupancy: 68,
    backlog: 12,
    urgent: 1,
    sla: 95,
    area: "Empresarial",
    view: "Operacional",
    period: "30 dias",
    phase: "Execução",
    tribunal: "TJSP",
    portfolio: "Corporate",
  },
  {
    id: 7,
    name: "Recuperação Judicial",
    lead: "Núcleo de Inteligência",
    focus: "Plano e credores",
    occupancy: 72,
    backlog: 13,
    urgent: 2,
    sla: 90,
    area: "Empresarial",
    view: "Estratégico",
    period: "12 meses",
    phase: "Encerramento",
    tribunal: "TJSP",
    portfolio: "Recuperação",
  },
  {
    id: 8,
    name: "Antitruste & CADE",
    lead: "Diretoria",
    focus: "Atos de concentração",
    occupancy: 58,
    backlog: 9,
    urgent: 1,
    sla: 97,
    area: "Empresarial",
    view: "Estratégico",
    period: "7 dias",
    phase: "Triagem",
    tribunal: "CADE",
    portfolio: "Corporate",
  },
  {
    id: 9,
    name: "Operações Trabalhistas",
    lead: "Backoffice",
    focus: "Gestão de audiências",
    occupancy: 64,
    backlog: 10,
    urgent: 1,
    sla: 93,
    area: "Trabalhista",
    view: "Operacional",
    period: "12 meses",
    phase: "Encerramento",
    tribunal: "TRT-2",
    portfolio: "Massificada",
  },
  {
    id: 10,
    name: "Consumidor Digital",
    lead: "Equipe Consumidor",
    focus: "Demandas digitais",
    occupancy: 84,
    backlog: 24,
    urgent: 3,
    sla: 88,
    area: "Consumidor",
    view: "Operacional",
    period: "7 dias",
    phase: "Execução",
    tribunal: "JEC-SP",
    portfolio: "Massificada",
  },
  {
    id: 11,
    name: "Cível Automatizado",
    lead: "Atlas Bot",
    focus: "Triagem automática",
    occupancy: 52,
    backlog: 6,
    urgent: 0,
    sla: 99,
    area: "Cível",
    view: "Operacional",
    period: "7 dias",
    phase: "Triagem",
    tribunal: "TJSP",
    portfolio: "Corporate",
  },
  {
    id: 12,
    name: "Recursos Cíveis",
    lead: "Núcleo de Recursos",
    focus: "Apelações e memoriais",
    occupancy: 86,
    backlog: 19,
    urgent: 4,
    sla: 94,
    area: "Cível",
    view: "Estratégico",
    period: "12 meses",
    phase: "Decisão",
    tribunal: "STJ",
    portfolio: "Estratégica",
  },
  {
    id: 13,
    name: "Tributário Contencioso",
    lead: "Time Tributário",
    focus: "Autos de infração",
    occupancy: 76,
    backlog: 16,
    urgent: 2,
    sla: 91,
    area: "Tributário",
    view: "Operacional",
    period: "30 dias",
    phase: "Triagem",
    tribunal: "CARF",
    portfolio: "Corporate",
  },
]

const getOccupancyColor = (occupancy: number) => {
  if (occupancy >= 85) return "text-urgent-high"
  if (occupancy >= 70) return "text-status-review"
  return "text-status-active"
}

const getOccupancyBar = (occupancy: number) => {
  if (occupancy >= 85) return "bg-urgent-high"
  if (occupancy >= 70) return "bg-status-review"
  return "bg-status-active"
}

export function LawyerTaskQueue({ filters }: { filters: DashboardFilters }) {
  const filtered = squads.filter(
    (squad) =>
      isAreaMatch(squad.area, filters.area) &&
      isViewMatch(squad.view, filters.view) &&
      isPeriodInRange(squad.period, filters.period) &&
      isPhaseMatch(squad.phase, filters.phase) &&
      isTribunalMatch(squad.tribunal, filters.tribunal) &&
      isPortfolioMatch(squad.portfolio, filters.portfolio) &&
      isOwnerMatch(squad.lead, filters.owner)
  )

  const avgOccupancy = filtered.length
    ? Math.round(
        filtered.reduce((sum, squad) => sum + squad.occupancy, 0) / filtered.length
      )
    : 0
  const avgSla = filtered.length
    ? Math.round(
        filtered.reduce((sum, squad) => sum + squad.sla, 0) / filtered.length
      )
    : 0

  return (
    <Card className="h-full border-border bg-card flex flex-col">
      <CardHeader className="pb-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-1 rounded-xl bg-primary/20 blur-lg" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70">
              <Users className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold text-foreground">
              Capacidade por squad
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Ocupação média: <span className="font-semibold text-foreground">{avgOccupancy}%</span>
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 rounded-lg bg-secondary/50 p-2 text-xs">
          <span className="flex items-center gap-1.5 text-status-active">
            <Gauge className="h-3.5 w-3.5" />
            Disponível
          </span>
          <span className="flex items-center gap-1.5 text-status-review">
            <TrendingUp className="h-3.5 w-3.5" />
            Alta demanda
          </span>
          <span className="flex items-center gap-1.5 text-urgent-high">
            <AlertTriangle className="h-3.5 w-3.5" />
            Sob pressão
          </span>
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="rounded-full bg-background/60 px-2.5 py-1">
            SLA médio {avgSla}%
          </span>
          <span className="rounded-full bg-background/60 px-2.5 py-1">
            Backlog total {filtered.reduce((sum, s) => sum + s.backlog, 0)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
            Nenhum squad disponível para os filtros atuais.
          </div>
        )}
        {filtered.map((squad, index) => {
          const occupancyColor = getOccupancyColor(squad.occupancy)
          const occupancyBar = getOccupancyBar(squad.occupancy)

          return (
            <div
              key={squad.id}
              className={`group relative overflow-hidden rounded-xl border border-border bg-secondary/30 p-4 transition-all duration-300 hover:border-primary/30 hover:bg-secondary/60 animate-slide-up opacity-0 stagger-${index + 1}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                  {squad.name
                    .split(" ")
                    .map((word) => word[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-base font-semibold text-foreground">
                      {squad.name}
                    </h3>
                    <Bolt className="h-4 w-4 text-accent" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {squad.lead} • {squad.focus}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span className={`text-2xl font-semibold tabular-nums ${occupancyColor}`}>
                    {squad.occupancy}%
                  </span>
                </div>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${occupancyBar}`}
                  style={{ width: `${squad.occupancy}%` }}
                />
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-status-active">
                    <CheckCircle2 className="h-4 w-4" />
                    SLA {squad.sla}%
                  </span>
                  <span className="flex items-center gap-1.5 text-status-review">
                    <Clock className="h-4 w-4" />
                    Backlog {squad.backlog}
                  </span>
                  {squad.urgent > 0 && (
                    <span className="flex items-center gap-1.5 text-urgent-high">
                      <AlertTriangle className="h-4 w-4" />
                      Urgentes {squad.urgent}
                    </span>
                  )}
                </div>
                <span className="rounded-full bg-background/60 px-2.5 py-1 text-xs text-muted-foreground">
                  Ocupação ideal 70%
                </span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
