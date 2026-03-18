import type {
  DataArea,
  DataPeriod,
  DataView,
  DashboardFilters,
  DataPhase,
  DataTribunal,
  DataPortfolio,
  DataOwner,
} from "./types"

export const periodOrder: Record<DataPeriod, number> = {
  "7 dias": 1,
  "30 dias": 2,
  "90 dias": 3,
  "12 meses": 4,
}

export const isPeriodInRange = (
  itemPeriod: DataPeriod,
  activePeriod: DashboardFilters["period"]
) => periodOrder[itemPeriod] <= periodOrder[activePeriod]

export const isAreaMatch = (
  itemArea: DataArea,
  activeArea: DashboardFilters["area"]
) => itemArea === "Todas" || itemArea === activeArea

export const isViewMatch = (
  itemView: DataView,
  activeView: DashboardFilters["view"]
) => itemView === "Ambas" || itemView === activeView

export const isPhaseMatch = (
  itemPhase: DataPhase,
  activePhase: DashboardFilters["phase"]
) => activePhase === "Todas" || itemPhase === activePhase

export const isTribunalMatch = (
  itemTribunal: DataTribunal,
  activeTribunal: DashboardFilters["tribunal"]
) => activeTribunal === "Todos" || itemTribunal === activeTribunal

export const isPortfolioMatch = (
  itemPortfolio: DataPortfolio,
  activePortfolio: DashboardFilters["portfolio"]
) => activePortfolio === "Todas" || itemPortfolio === activePortfolio

export const isOwnerMatch = (
  itemOwner: DataOwner,
  activeOwner: DashboardFilters["owner"]
) => activeOwner === "Todos" || itemOwner === activeOwner