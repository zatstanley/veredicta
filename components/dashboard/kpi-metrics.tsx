"use client"

import {
  Database,
  Target,
  Timer,
  AlertTriangle,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import type { DashboardFilters } from "./types"

const metricTemplates = [
  {
    id: "processes",
    label: "Processos monitorados",
    icon: Database,
    color: "text-primary",
    bgColor: "bg-primary/15",
    glowColor: "shadow-primary/20",
    type: "count",
    direction: "up",
  },
  {
    id: "leadTime",
    label: "Lead time médio",
    icon: Timer,
    color: "text-status-review",
    bgColor: "bg-status-review/15",
    glowColor: "shadow-status-review/20",
    type: "days",
    direction: "down",
  },
  {
    id: "successRate",
    label: "Taxa de êxito",
    icon: Target,
    color: "text-status-active",
    bgColor: "bg-status-active/15",
    glowColor: "shadow-status-active/20",
    type: "percent",
    direction: "up",
  },
  {
    id: "risk",
    label: "Prazos em risco",
    icon: AlertTriangle,
    color: "text-urgent-high",
    bgColor: "bg-urgent-high/15",
    glowColor: "shadow-urgent-high/20",
    type: "count",
    direction: "down",
  },
  {
    id: "cost",
    label: "Custo médio por caso",
    icon: Wallet,
    color: "text-accent",
    bgColor: "bg-accent/15",
    glowColor: "shadow-accent/20",
    type: "currency",
    direction: "down",
  },
  {
    id: "productivity",
    label: "Índice de produtividade",
    icon: TrendingUp,
    color: "text-chart-3",
    bgColor: "bg-chart-3/15",
    glowColor: "shadow-chart-3/20",
    type: "count",
    direction: "up",
  },
]

const baseByArea = {
  Empresarial: {
    processes: 1284,
    leadTime: 12.4,
    successRate: 68.2,
    risk: 32,
    cost: 3400,
    productivity: 128,
  },
  Trabalhista: {
    processes: 970,
    leadTime: 14.1,
    successRate: 61.4,
    risk: 46,
    cost: 2800,
    productivity: 114,
  },
  Cível: {
    processes: 1102,
    leadTime: 13.2,
    successRate: 65.8,
    risk: 38,
    cost: 3100,
    productivity: 120,
  },
  Tributário: {
    processes: 640,
    leadTime: 16.8,
    successRate: 59.2,
    risk: 28,
    cost: 4200,
    productivity: 98,
  },
  Consumidor: {
    processes: 880,
    leadTime: 11.6,
    successRate: 63.5,
    risk: 40,
    cost: 2600,
    productivity: 132,
  },
}

const periodFactor: Record<DashboardFilters["period"], number> = {
  "7 dias": 0.28,
  "30 dias": 1,
  "90 dias": 2.4,
  "12 meses": 6.8,
}

const periodLabel: Record<DashboardFilters["period"], string> = {
  "7 dias": "últimos 7 dias",
  "30 dias": "últimos 30 dias",
  "90 dias": "últimos 90 dias",
  "12 meses": "últimos 12 meses",
}

const periodAdjustments = {
  percent: {
    "7 dias": -0.8,
    "30 dias": 0,
    "90 dias": 1.2,
    "12 meses": 2.5,
  },
  days: {
    "7 dias": 0.4,
    "30 dias": 0,
    "90 dias": -0.5,
    "12 meses": -0.9,
  },
  cost: {
    "7 dias": 1.02,
    "30 dias": 1,
    "90 dias": 0.98,
    "12 meses": 0.92,
  },
}

const viewAdjustments = {
  Operacional: {
    success: -1.2,
    lead: 0.6,
    cost: 0.96,
    productivity: 0.98,
    volume: 1,
  },
  Estratégico: {
    success: 2.6,
    lead: -0.7,
    cost: 1.08,
    productivity: 1.12,
    volume: 1.08,
  },
}

const changeBase = {
  processes: 4.1,
  leadTime: 0.8,
  successRate: 3.1,
  risk: 5,
  cost: 4.2,
  productivity: 9,
}

const changeFactorByArea = {
  Empresarial: 1,
  Trabalhista: 0.9,
  Cível: 0.95,
  Tributário: 1.15,
  Consumidor: 1.05,
}

const formatNumber = new Intl.NumberFormat("pt-BR")

const formatCompactCurrency = (value: number) => {
  if (value >= 1000) {
    const formatted = (value / 1000).toFixed(1).replace(".", ",")
    return `R$ ${formatted}k`
  }
  return `R$ ${formatNumber.format(value)}`
}

const formatMetricValue = (value: number, type: string) => {
  if (type === "percent") {
    return `${value.toFixed(1).replace(".", ",")}%`
  }
  if (type === "days") {
    return `${value.toFixed(1).replace(".", ",")}d`
  }
  if (type === "currency") {
    return formatCompactCurrency(value)
  }
  return formatNumber.format(Math.round(value))
}

type MetricOutput = {
  id: string
  label: string
  value: string
  change: string
  changeLabel: string
  changeType: "positive" | "negative"
  direction: "up" | "down"
  icon: typeof Database
  color: string
  bgColor: string
  glowColor: string
  trend: number[]
  trendColor: string
}

const trendSeries: Record<string, number[]> = {
  processes: [32, 40, 36, 48, 44, 58, 52, 60],
  leadTime: [58, 54, 49, 46, 44, 42, 40, 38],
  successRate: [40, 44, 48, 52, 50, 56, 58, 62],
  risk: [55, 50, 48, 44, 42, 39, 36, 34],
  cost: [48, 46, 44, 42, 40, 39, 38, 36],
  productivity: [36, 40, 42, 46, 50, 58, 62, 68],
}

const trendColorById: Record<string, string> = {
  processes: "bg-primary/70",
  leadTime: "bg-status-review/70",
  successRate: "bg-status-active/70",
  risk: "bg-urgent-high/70",
  cost: "bg-accent/70",
  productivity: "bg-chart-3/70",
}

export const getKpiMetrics = (filters: DashboardFilters): MetricOutput[] => {
  const base = baseByArea[filters.area]
  const viewAdjust = viewAdjustments[filters.view]
  const period = filters.period
  const volumeFactor = periodFactor[period] * viewAdjust.volume
  const focusFactor =
    (filters.phase !== "Todas" ? 0.92 : 1) *
    (filters.tribunal !== "Todos" ? 0.88 : 1) *
    (filters.portfolio !== "Todas" ? 1.06 : 1) *
    (filters.owner !== "Todos" ? 0.9 : 1)

  const values = {
    processes: base.processes * volumeFactor * focusFactor,
    leadTime:
      base.leadTime +
      viewAdjust.lead +
      periodAdjustments.days[period] +
      (filters.phase === "Execução" ? 0.3 : 0),
    successRate:
      base.successRate +
      viewAdjust.success +
      periodAdjustments.percent[period] +
      (filters.portfolio === "Estratégica" ? 1.2 : 0),
    risk:
      base.risk *
      volumeFactor *
      focusFactor *
      (filters.view === "Estratégico" ? 0.86 : 1),
    cost:
      base.cost *
      viewAdjust.cost *
      periodAdjustments.cost[period] *
      (filters.portfolio === "Massificada" ? 0.92 : 1),
    productivity: base.productivity * volumeFactor * viewAdjust.productivity * focusFactor,
  }

  return metricTemplates.map((metric) => {
    const metricId = metric.id as keyof typeof values
    const value = formatMetricValue(values[metricId], metric.type)
    const changeValue = changeBase[metricId] * changeFactorByArea[filters.area]
    const changePrefix = metric.direction === "down" ? "-" : "+"
    const change = `${changePrefix}${changeValue.toFixed(1).replace(".", ",")}`

    return {
      id: metric.id,
      label: metric.label,
      value,
      change,
      changeLabel: periodLabel[period],
      changeType: metric.direction === "down" ? "positive" : "positive",
      direction: metric.direction as "up" | "down",
      icon: metric.icon,
      color: metric.color,
      bgColor: metric.bgColor,
      glowColor: metric.glowColor,
      trend: trendSeries[metric.id],
      trendColor: trendColorById[metric.id],
    }
  })
}

export function KPIMetrics({ filters }: { filters: DashboardFilters }) {
  const metrics = getKpiMetrics(filters)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        const maxTrend = Math.max(...metric.trend)

        return (
          <div
            key={metric.id}
            className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-xl ${metric.glowColor} animate-slide-up opacity-0 stagger-${index + 1}`}
          >
            <div className="absolute inset-0 shimmer-bg opacity-0 transition-opacity group-hover:opacity-100" />

            <div className="relative">
              <div className="flex items-start justify-between">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${metric.bgColor} transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                </div>
                <span
                  className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                    metric.changeType === "positive"
                      ? "bg-status-active/15 text-status-active"
                      : "bg-urgent-critical/15 text-urgent-critical"
                  }`}
                >
                  {metric.direction === "up" && (
                    <ArrowUpRight className="h-3 w-3" />
                  )}
                  {metric.direction === "down" && (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {metric.change}
                </span>
              </div>

              <div className="mt-4">
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-3xl font-semibold tabular-nums tracking-tight ${metric.color}`}
                  >
                    {metric.value}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-muted-foreground">
                  {metric.label}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground/70">
                  {metric.changeLabel}
                </p>
              </div>

              <div className="mt-4 flex h-10 items-end gap-1">
                {metric.trend.map((value, trendIndex) => (
                  <span
                    key={`${metric.id}-trend-${trendIndex}`}
                    className={`w-1.5 rounded-full ${metric.trendColor} opacity-60 transition group-hover:opacity-100`}
                    style={{ height: `${(value / maxTrend) * 100}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
