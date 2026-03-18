"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import type { DashboardFilters } from "./types"

const baseSeriesByArea = {
  Empresarial: [120, 140, 132, 158, 172, 190],
  Trabalhista: [160, 178, 168, 182, 196, 214],
  Cível: [138, 150, 142, 156, 170, 184],
  Tributário: [82, 90, 88, 94, 102, 110],
  Consumidor: [190, 210, 205, 220, 238, 260],
}

const periodLabels: Record<DashboardFilters["period"], string[]> = {
  "7 dias": ["D-6", "D-5", "D-4", "D-3", "D-2", "D-1"],
  "30 dias": ["S1", "S2", "S3", "S4", "S5", "S6"],
  "90 dias": ["M1", "M2", "M3", "M4", "M5", "M6"],
  "12 meses": ["M7", "M8", "M9", "M10", "M11", "M12"],
}

const periodFactor: Record<DashboardFilters["period"], number> = {
  "7 dias": 0.35,
  "30 dias": 1,
  "90 dias": 1.6,
  "12 meses": 2.4,
}

const chartConfig = {
  volume: { label: "Volume", color: "var(--color-chart-1)" },
  sucesso: { label: "Êxito", color: "var(--color-chart-2)" },
}

export function VolumeTrendChart({ filters }: { filters: DashboardFilters }) {
  const baseSeries = baseSeriesByArea[filters.area]
  const labels = periodLabels[filters.period]
  const factor = periodFactor[filters.period] * (filters.view === "Estratégico" ? 1.12 : 1)
  const focusFactor =
    (filters.phase !== "Todas" ? 0.9 : 1) *
    (filters.tribunal !== "Todos" ? 0.85 : 1) *
    (filters.portfolio !== "Todas" ? 1.05 : 1) *
    (filters.owner !== "Todos" ? 0.92 : 1)

  const data = baseSeries.map((value, index) => ({
    label: labels[index],
    volume: Math.round(value * factor * focusFactor),
    sucesso: Math.round(value * (0.6 + (filters.view === "Estratégico" ? 0.1 : 0)) * focusFactor),
  }))

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-1 rounded-xl bg-primary/20 blur-lg" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold text-foreground">
              Tendência de volume e êxito
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Série temporal baseada em {filters.period} • {filters.area}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <ChartContainer config={chartConfig} className="h-[240px] w-full">
          <AreaChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="fillVolume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-volume)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-volume)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillSucesso" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-sucesso)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--color-sucesso)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis width={36} tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              type="monotone"
              dataKey="volume"
              stroke="var(--color-volume)"
              fill="url(#fillVolume)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="sucesso"
              stroke="var(--color-sucesso)"
              fill="url(#fillSucesso)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
