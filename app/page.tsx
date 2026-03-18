"use client"

import { useMemo, useState } from "react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { DashboardHeader } from "@/components/dashboard/header"
import { AgendaSection } from "@/components/dashboard/agenda-section"
import { DeadlineAlerts } from "@/components/dashboard/deadline-alerts"
import { LawyerTaskQueue } from "@/components/dashboard/lawyer-task-queue"
import { PriorityCases } from "@/components/dashboard/priority-cases"
import { getKpiMetrics, KPIMetrics } from "@/components/dashboard/kpi-metrics"
import { AnnouncementsTicker } from "@/components/dashboard/announcements-ticker"
import { VolumeTrendChart } from "@/components/dashboard/volume-trend-chart"
import { ProcessFunnel } from "@/components/dashboard/process-funnel"
import { TribunalPerformance } from "@/components/dashboard/tribunal-performance"
import { FinancialSignals } from "@/components/dashboard/financial-signals"
import type { DashboardFilters } from "@/components/dashboard/types"

export default function Dashboard() {
  const [filters, setFilters] = useState<DashboardFilters>({
    period: "30 dias",
    area: "Empresarial",
    view: "Operacional",
    phase: "Todas",
    tribunal: "Todos",
    portfolio: "Todas",
    owner: "Todos",
  })
  const [isExporting, setIsExporting] = useState(false)

  const metricsForExport = useMemo(() => getKpiMetrics(filters), [filters])

  const escapeCsv = (value: string) => {
    if (value === null || value === undefined) return ""
    const raw = String(value)
    const needsQuotes = /[;"\n\r]/.test(raw)
    const escaped = raw.replace(/"/g, '""')
    return needsQuotes ? `"${escaped}"` : escaped
  }

  const buildMetadataRows = () => [
    ["Relatório", "Veredicta | Legal Analytics"],
    ["Gerado em", new Date().toLocaleString("pt-BR")],
    ["Área", filters.area],
    ["Período", filters.period],
    ["Visão", filters.view],
    ["Fase", filters.phase],
    ["Tribunal", filters.tribunal],
    ["Carteira", filters.portfolio],
    ["Responsável", filters.owner],
  ]

  const handleExportCsv = () => {
    const metadataRows = buildMetadataRows().map((row) =>
      row.map(escapeCsv).join(";")
    )
    const kpiHeader = [
      "Métrica",
      "Valor",
      "Variação",
      "Período",
      "Área",
      "Visão",
      "Fase",
      "Tribunal",
      "Carteira",
      "Responsável",
    ]

    const kpiRows = metricsForExport.map((metric) =>
      [
        metric.label,
        metric.value,
        metric.change,
        metric.changeLabel,
        filters.area,
        filters.view,
        filters.phase,
        filters.tribunal,
        filters.portfolio,
        filters.owner,
      ]
        .map(escapeCsv)
        .join(";")
    )

    const csvContent = [
      "\uFEFFsep=;",
      ...metadataRows,
      "",
      kpiHeader.map(escapeCsv).join(";"),
      ...kpiRows,
    ].join("\r\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `relatorio-${filters.area}-${filters.period}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleExportExcel = () => {
    const metadataRows = buildMetadataRows()
    const kpiRows = metricsForExport.map((metric) => [
      metric.label,
      metric.value,
      metric.change,
      metric.changeLabel,
      filters.area,
      filters.view,
      filters.phase,
      filters.tribunal,
      filters.portfolio,
      filters.owner,
    ])

    const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: "Segoe UI", Arial, sans-serif; color: #0f172a; }
      .title { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
      .subtitle { font-size: 12px; color: #64748b; margin-bottom: 16px; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 16px; }
      th, td { border: 1px solid #e2e8f0; padding: 8px 10px; font-size: 12px; }
      th { background: #0f172a; color: #f8fafc; text-align: left; }
      .section { background: #f1f5f9; font-weight: 600; }
    </style>
  </head>
  <body>
    <div class="title">Relatório de Indicadores Jurídicos</div>
    <div class="subtitle">Veredicta • Plataforma de Análise de Dados</div>
    <table>
      <tr class="section"><td colspan="2">Contexto do relatório</td></tr>
      ${metadataRows
        .map(
          (row) =>
            `<tr><td>${row[0]}</td><td>${row[1]}</td></tr>`
        )
        .join("")}
    </table>
    <table>
      <tr>
        <th>Métrica</th>
        <th>Valor</th>
        <th>Variação</th>
        <th>Período</th>
        <th>Área</th>
        <th>Visão</th>
        <th>Fase</th>
        <th>Tribunal</th>
        <th>Carteira</th>
        <th>Responsável</th>
      </tr>
      ${kpiRows
        .map(
          (row) =>
            `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`
        )
        .join("")}
    </table>
  </body>
</html>`

    const blob = new Blob(["\uFEFF", html], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `relatorio-${filters.area}-${filters.period}.xls`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleExportPdf = async () => {
    const element = document.getElementById("dashboard-canvas")
    if (!element) return

    try {
      setIsExporting(true)
      const canvas = await html2canvas(element, { scale: 2, useCORS: true })
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      })
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height)
      pdf.save(`snapshot-${filters.area}-${filters.period}.pdf`)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div
      id="dashboard-canvas"
      className="app-shell flex h-screen flex-col overflow-hidden text-foreground"
    >
      <DashboardHeader
        filters={filters}
        onChange={setFilters}
        onExportCsv={handleExportCsv}
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        isExporting={isExporting}
      />

      <main className="flex-1 overflow-y-auto px-6 pb-24 pt-4">
        <section className="mb-4">
          <KPIMetrics filters={filters} />
        </section>

        <section className="mb-4">
          <VolumeTrendChart filters={filters} />
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <div className="min-h-0 xl:col-span-5 xl:h-[520px]">
            <AgendaSection filters={filters} />
          </div>
          <div className="min-h-0 xl:col-span-4 xl:h-[520px]">
            <DeadlineAlerts filters={filters} />
          </div>
          <div className="min-h-0 xl:col-span-3 xl:h-[520px]">
            <LawyerTaskQueue filters={filters} />
          </div>
        </section>

        <section className="mt-4 xl:h-[560px]">
          <PriorityCases filters={filters} />
        </section>

        <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
          <div className="xl:col-span-5 xl:h-[420px]">
            <ProcessFunnel filters={filters} />
          </div>
          <div className="xl:col-span-4 xl:h-[420px]">
            <TribunalPerformance filters={filters} />
          </div>
          <div className="xl:col-span-3 xl:h-[420px]">
            <FinancialSignals filters={filters} />
          </div>
        </section>
      </main>

      <AnnouncementsTicker />
    </div>
  )
}
