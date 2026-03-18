"use client"

import {
  Bot,
  Sparkles,
  Gavel,
  FileText,
  Users,
  AlertTriangle,
  Clock,
  Workflow,
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

const timelineItems: {
  id: number
  time: string
  duration: string
  title: string
  description: string
  process: string
  area: DataArea
  owner: DataOwner
  type: string
  period: DataPeriod
  view: DataView
  impact: "Baixo" | "Médio" | "Alto" | "Crítico"
  phase: DataPhase
  tribunal: DataTribunal
  portfolio: DataPortfolio
}[] = [
  {
    id: 1,
    time: "08:05",
    duration: "4m",
    title: "Triagem automática de intimações",
    description: "PJe + e-SAJ com classificação por risco",
    process: "Lote 128",
    area: "Todas",
    owner: "Atlas Bot",
    type: "automation",
    period: "7 dias",
    view: "Operacional",
    impact: "Baixo",
    phase: "Triagem",
    tribunal: "TJSP",
    portfolio: "Massificada",
  },
  {
    id: 2,
    time: "09:20",
    duration: "18m",
    title: "Análise de jurisprudência aplicada",
    description: "Modelagem de probabilidades para recurso",
    process: "0004321-12.2024.8.26.0100",
    area: "Cível",
    owner: "Núcleo de Inteligência",
    type: "analysis",
    period: "7 dias",
    view: "Estratégico",
    impact: "Alto",
    phase: "Decisão",
    tribunal: "TJSP",
    portfolio: "Corporate",
  },
  {
    id: 3,
    time: "10:45",
    duration: "1h",
    title: "Audiência de instrução",
    description: "Preparação de roteiro e evidências",
    process: "0012345-77.2024.8.26.0100",
    area: "Trabalhista",
    owner: "Dra. Ana Martins",
    type: "hearing",
    period: "7 dias",
    view: "Operacional",
    impact: "Crítico",
    phase: "Execução",
    tribunal: "TRT-2",
    portfolio: "Massificada",
  },
  {
    id: 4,
    time: "13:30",
    duration: "35m",
    title: "Petição protocolada",
    description: "Atualização automática do fluxo",
    process: "0009988-11.2024.8.26.0100",
    area: "Empresarial",
    owner: "Equipe Operações",
    type: "workflow",
    period: "7 dias",
    view: "Operacional",
    impact: "Médio",
    phase: "Execução",
    tribunal: "TJSP",
    portfolio: "Corporate",
  },
  {
    id: 5,
    time: "15:10",
    duration: "25m",
    title: "Prazo crítico confirmado",
    description: "Validação final e envio ao cliente",
    process: "0098765-43.2024.8.26.0100",
    area: "Tributário",
    owner: "Dr. Pedro Santos",
    type: "deadline",
    period: "7 dias",
    view: "Operacional",
    impact: "Crítico",
    phase: "Execução",
    tribunal: "CARF",
    portfolio: "Estratégica",
  },
  {
    id: 6,
    time: "16:40",
    duration: "40m",
    title: "Reunião de estratégia",
    description: "Plano de ação para acordo",
    process: "0022334-98.2024.8.26.0100",
    area: "Consumidor",
    owner: "Dra. Maria Costa",
    type: "meeting",
    period: "7 dias",
    view: "Estratégico",
    impact: "Médio",
    phase: "Execução",
    tribunal: "JEC-SP",
    portfolio: "Massificada",
  },
  {
    id: 7,
    time: "09:10",
    duration: "30m",
    title: "Consolidação de relatórios semanais",
    description: "Padronização de métricas de SLA",
    process: "Relatório de performance",
    area: "Todas",
    owner: "Backoffice",
    type: "workflow",
    period: "30 dias",
    view: "Operacional",
    impact: "Baixo",
    phase: "Triagem",
    tribunal: "TJSP",
    portfolio: "Corporate",
  },
  {
    id: 8,
    time: "11:00",
    duration: "15m",
    title: "Automação de auditoria",
    description: "Checagem de dados inconsistentes",
    process: "Lote 124",
    area: "Todas",
    owner: "Atlas Bot",
    type: "automation",
    period: "30 dias",
    view: "Operacional",
    impact: "Médio",
    phase: "Triagem",
    tribunal: "TJSP",
    portfolio: "Massificada",
  },
  {
    id: 9,
    time: "14:25",
    duration: "50m",
    title: "Revisão de peças estratégicas",
    description: "Análise de risco por cluster de juízes",
    process: "0007777-22.2024.8.26.0100",
    area: "Empresarial",
    owner: "Dr. Carlos Silva",
    type: "analysis",
    period: "90 dias",
    view: "Estratégico",
    impact: "Alto",
    phase: "Decisão",
    tribunal: "STJ",
    portfolio: "Estratégica",
  },
  {
    id: 10,
    time: "09:30",
    duration: "2h",
    title: "Mapeamento de carteira anual",
    description: "Reclassificação de risco e valor",
    process: "Painel corporativo",
    area: "Todas",
    owner: "Diretoria",
    type: "analysis",
    period: "12 meses",
    view: "Estratégico",
    impact: "Alto",
    phase: "Encerramento",
    tribunal: "CADE",
    portfolio: "Corporate",
  },
]

const getTypeConfig = (type: string) => {
  switch (type) {
    case "automation":
      return {
        icon: Bot,
        bg: "bg-primary/10",
        text: "text-primary",
        border: "border-primary/30",
        label: "Automação",
        accent: "bg-primary",
      }
    case "analysis":
      return {
        icon: Sparkles,
        bg: "bg-status-review/10",
        text: "text-status-review",
        border: "border-status-review/30",
        label: "Análise",
        accent: "bg-status-review",
      }
    case "hearing":
      return {
        icon: Gavel,
        bg: "bg-urgent-high/10",
        text: "text-urgent-high",
        border: "border-urgent-high/30",
        label: "Audiência",
        accent: "bg-urgent-high",
      }
    case "deadline":
      return {
        icon: AlertTriangle,
        bg: "bg-urgent-critical/10",
        text: "text-urgent-critical",
        border: "border-urgent-critical/30",
        label: "Prazo",
        accent: "bg-urgent-critical",
      }
    case "meeting":
      return {
        icon: Users,
        bg: "bg-status-active/10",
        text: "text-status-active",
        border: "border-status-active/30",
        label: "Reunião",
        accent: "bg-status-active",
      }
    default:
      return {
        icon: FileText,
        bg: "bg-muted",
        text: "text-muted-foreground",
        border: "border-border",
        label: "Registro",
        accent: "bg-muted-foreground",
      }
  }
}

const getImpactColor = (impact: string) => {
  switch (impact) {
    case "Crítico":
      return "text-urgent-critical bg-urgent-critical/15"
    case "Alto":
      return "text-urgent-high bg-urgent-high/15"
    case "Médio":
      return "text-status-review bg-status-review/15"
    default:
      return "text-muted-foreground bg-muted/50"
  }
}

export function AgendaSection({ filters }: { filters: DashboardFilters }) {
  const filtered = timelineItems.filter(
    (item) =>
      isAreaMatch(item.area, filters.area) &&
      isViewMatch(item.view, filters.view) &&
      isPeriodInRange(item.period, filters.period) &&
      isPhaseMatch(item.phase, filters.phase) &&
      isTribunalMatch(item.tribunal, filters.tribunal) &&
      isPortfolioMatch(item.portfolio, filters.portfolio) &&
      isOwnerMatch(item.owner, filters.owner)
  )

  return (
    <Card className="border-border bg-card flex h-full flex-col">
      <CardHeader className="pb-4 shrink-0">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-1 rounded-xl bg-primary/20 blur-lg" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70">
                <Workflow className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-semibold text-foreground">
                Linha do tempo operacional
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {filtered.length} eventos alinhados ao filtro ativo
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-secondary/70 px-2.5 py-1">
              Área: <span className="font-semibold text-foreground">{filters.area}</span>
            </span>
            <span className="rounded-full bg-secondary/70 px-2.5 py-1">
              Período: <span className="font-semibold text-foreground">{filters.period}</span>
            </span>
            <span className="rounded-full bg-secondary/70 px-2.5 py-1">
              Visão: <span className="font-semibold text-foreground">{filters.view}</span>
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
            Nenhum evento encontrado para os filtros atuais.
          </div>
        )}
        {filtered.map((item, index) => {
          const config = getTypeConfig(item.type)
          const Icon = config.icon

          return (
            <div
              key={item.id}
              className={`group relative overflow-hidden rounded-xl border bg-secondary/30 transition-all duration-300 hover:bg-secondary/60 animate-slide-up opacity-0 stagger-${index + 1} ${config.border}`}
            >
              <div className={`absolute left-0 top-0 h-full w-1 ${config.accent}`} />

              <div className="flex items-start gap-4 p-4 pl-5">
                <div className="flex min-w-[90px] flex-col items-center rounded-xl bg-background/60 px-3 py-3">
                  <Clock className="mb-1 h-4 w-4 text-muted-foreground/70" />
                  <span className="font-mono text-2xl font-semibold text-foreground">
                    {item.time}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.duration}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${config.bg} ${config.text} ${config.border}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {config.label}
                    </span>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {item.owner}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getImpactColor(
                        item.impact
                      )}`}
                    >
                      Impacto {item.impact}
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-background/60 px-2.5 py-1">
                      {item.process}
                    </span>
                    <span className="rounded-full bg-background/60 px-2.5 py-1">
                      {item.area}
                    </span>
                    <span className="rounded-full bg-background/60 px-2.5 py-1">
                      {item.tribunal}
                    </span>
                    <span className="rounded-full bg-background/60 px-2.5 py-1">
                      {item.portfolio}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
