"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import {
  Sparkles,
  Search,
  SlidersHorizontal,
  Database,
  ShieldCheck,
  Activity,
  ChevronDown,
  FileDown,
  LoaderCircle,
} from "lucide-react"
import type { DashboardFilters } from "./types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const periods: DashboardFilters["period"][] = [
  "7 dias",
  "30 dias",
  "90 dias",
  "12 meses",
]
const areas: DashboardFilters["area"][] = [
  "Empresarial",
  "Trabalhista",
  "Cível",
  "Tributário",
  "Consumidor",
]
const views: DashboardFilters["view"][] = ["Operacional", "Estratégico"]
const phases: DashboardFilters["phase"][] = [
  "Todas",
  "Triagem",
  "Execução",
  "Decisão",
  "Encerramento",
]
const tribunals: DashboardFilters["tribunal"][] = [
  "Todos",
  "TJSP",
  "TRT-2",
  "STJ",
  "CARF",
  "JEC-SP",
  "CADE",
]
const portfolios: DashboardFilters["portfolio"][] = [
  "Todas",
  "Corporate",
  "Massificada",
  "Recuperação",
  "Estratégica",
]
const owners: DashboardFilters["owner"][] = [
  "Todos",
  "Dr. Carlos Silva",
  "Dra. Ana Martins",
  "Dr. Pedro Santos",
  "Dra. Maria Costa",
  "Dr. João Oliveira",
  "Atlas Bot",
  "Núcleo de Inteligência",
  "Backoffice",
  "Diretoria",
  "Equipe Cível",
  "Equipe Consumidor",
  "Núcleo de Recursos",
  "Equipe Operações",
  "Time Tributário",
]

type DashboardHeaderProps = {
  filters: DashboardFilters
  onChange: (next: DashboardFilters) => void
  onExportCsv: () => void
  onExportExcel: () => void
  onExportPdf: () => void
  isExporting?: boolean
}

export function DashboardHeader({
  filters,
  onChange,
  onExportCsv,
  onExportExcel,
  onExportPdf,
  isExporting = false,
}: DashboardHeaderProps) {
  const [time, setTime] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTime(new Date())
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    const seconds = String(date.getSeconds()).padStart(2, "0")
    return { hours, minutes, seconds }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  const timeDisplay = mounted && time ? formatTime(time) : null
  const updateFilter = <K extends keyof DashboardFilters>(
    key: K,
    value: DashboardFilters[K]
  ) => onChange({ ...filters, [key]: value })

  return (
    <header className="relative shrink-0 overflow-hidden border-b border-border bg-card/80 backdrop-blur">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />

      <div className="relative px-6 py-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="absolute -inset-1.5 rounded-2xl bg-primary/20 blur-lg animate-glow-pulse" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg shadow-primary/30">
                <Image
                  src="/iconveredicta.png"
                  alt="Veredicta"
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                  priority
                />
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  Veredicta
                </h1>
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  Legal Intelligence
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Plataforma interativa de análise processual e rotina jurídica
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-secondary/70 px-2.5 py-1 text-muted-foreground">
                  Jurimetria ativa
                </span>
                <span className="rounded-full bg-secondary/70 px-2.5 py-1 text-muted-foreground">
                  12 fontes conectadas
                </span>
                <span className="rounded-full bg-secondary/70 px-2.5 py-1 text-muted-foreground">
                  SLA 97,4%
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-status-active/30 bg-status-active/10 px-4 py-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-active opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-status-active" />
              </span>
              <span className="text-xs font-semibold tracking-wide text-status-active">
                DADOS AO VIVO
              </span>
              <Activity className="h-3.5 w-3.5 text-status-active" />
            </div>

            <div className="rounded-2xl border border-border bg-secondary/60 px-4 py-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Database className="h-4 w-4 text-primary" />
                Base sincronizada
              </div>
              <p className="text-sm font-semibold text-foreground">
                {filters.period === "7 dias" ? "últimas 6h" : "últimas 24h"}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background/60 px-4 py-2 text-right">
              <div className="flex items-baseline gap-1 font-mono">
                {timeDisplay ? (
                  <>
                    <span className="text-3xl font-semibold tabular-nums text-foreground">
                      {timeDisplay.hours}
                    </span>
                    <span className="text-2xl font-semibold text-primary">:</span>
                    <span className="text-3xl font-semibold tabular-nums text-foreground">
                      {timeDisplay.minutes}
                    </span>
                    <span className="ml-1 text-lg font-medium tabular-nums text-muted-foreground">
                      {timeDisplay.seconds}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-semibold tabular-nums text-muted-foreground">
                    --:--
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {mounted && time ? `Atualizado em ${formatDate(time)}` : "Carregando..."}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 rounded-full border border-border bg-secondary/70 px-4 py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="h-4 w-4" />
                  )}
                  {isExporting ? "Exportando..." : "Exportar"}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Relatórios</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onExportExcel}>
                  Excel formatado (.xls)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExportPdf} disabled={isExporting}>
                  Snapshot PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExportCsv}>
                  Exportar CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/70 px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              aria-label="Buscar processo"
              placeholder="Buscar processo, cliente ou número CNJ"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button className="flex items-center gap-2 rounded-full border border-border bg-secondary/70 px-3 py-1 text-xs font-semibold text-muted-foreground transition hover:text-foreground">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filtros
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-secondary/50 p-2">
            {periods.map((period) => (
              <button
                key={period}
                onClick={() => updateFilter("period", period)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  filters.period === period
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-secondary/50 p-2">
            {areas.map((area) => (
              <button
                key={area}
                onClick={() => updateFilter("area", area)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  filters.area === area
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border bg-secondary/50 p-3">
            <p className="mb-2 text-xs text-muted-foreground">Fase processual</p>
            <Select
              value={filters.phase}
              onValueChange={(value) =>
                updateFilter("phase", value as DashboardFilters["phase"])
              }
            >
              <SelectTrigger className="w-full bg-background/60">
                <SelectValue placeholder="Selecionar fase" />
              </SelectTrigger>
              <SelectContent>
                {phases.map((phase) => (
                  <SelectItem key={phase} value={phase}>
                    {phase}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-2xl border border-border bg-secondary/50 p-3">
            <p className="mb-2 text-xs text-muted-foreground">Tribunal</p>
            <Select
              value={filters.tribunal}
              onValueChange={(value) =>
                updateFilter("tribunal", value as DashboardFilters["tribunal"])
              }
            >
              <SelectTrigger className="w-full bg-background/60">
                <SelectValue placeholder="Selecionar tribunal" />
              </SelectTrigger>
              <SelectContent>
                {tribunals.map((tribunal) => (
                  <SelectItem key={tribunal} value={tribunal}>
                    {tribunal}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-2xl border border-border bg-secondary/50 p-3">
            <p className="mb-2 text-xs text-muted-foreground">Carteira</p>
            <Select
              value={filters.portfolio}
              onValueChange={(value) =>
                updateFilter("portfolio", value as DashboardFilters["portfolio"])
              }
            >
              <SelectTrigger className="w-full bg-background/60">
                <SelectValue placeholder="Selecionar carteira" />
              </SelectTrigger>
              <SelectContent>
                {portfolios.map((portfolio) => (
                  <SelectItem key={portfolio} value={portfolio}>
                    {portfolio}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-2xl border border-border bg-secondary/50 p-3">
            <p className="mb-2 text-xs text-muted-foreground">Responsável</p>
            <Select
              value={filters.owner}
              onValueChange={(value) =>
                updateFilter("owner", value as DashboardFilters["owner"])
              }
            >
              <SelectTrigger className="w-full bg-background/60">
                <SelectValue placeholder="Selecionar responsável" />
              </SelectTrigger>
              <SelectContent>
                {owners.map((owner) => (
                  <SelectItem key={owner} value={owner}>
                    {owner}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-secondary/70 px-3 py-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            14 insights ativos
          </div>
          <div className="flex items-center gap-2 rounded-full bg-secondary/70 px-3 py-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-status-active" />
            Compliance 99,2%
          </div>
          <div className="flex items-center gap-2 rounded-full bg-secondary/70 px-3 py-1.5 text-xs text-muted-foreground">
            Origem de dados
            <span className="font-semibold text-foreground">PJe • e-SAJ • Eproc</span>
          </div>
          <div className="ml-0 flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs text-muted-foreground lg:ml-auto">
            <span className="font-semibold text-foreground">Visão</span>
            {views.map((view) => (
              <button
                key={view}
                onClick={() => updateFilter("view", view)}
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition ${
                  filters.view === view
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {view}
              </button>
            ))}
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </header>
  )
}

