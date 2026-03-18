export type DashboardFilters = {
  period: "7 dias" | "30 dias" | "90 dias" | "12 meses"
  area: "Empresarial" | "Trabalhista" | "Cível" | "Tributário" | "Consumidor"
  view: "Operacional" | "Estratégico"
  phase: "Todas" | "Triagem" | "Execução" | "Decisão" | "Encerramento"
  tribunal: "Todos" | "TJSP" | "TRT-2" | "STJ" | "CARF" | "JEC-SP" | "CADE"
  portfolio: "Todas" | "Corporate" | "Massificada" | "Recuperação" | "Estratégica"
  owner:
    | "Todos"
    | "Dr. Carlos Silva"
    | "Dra. Ana Martins"
    | "Dr. Pedro Santos"
    | "Dra. Maria Costa"
    | "Dr. João Oliveira"
    | "Atlas Bot"
    | "Núcleo de Inteligência"
    | "Backoffice"
    | "Diretoria"
    | "Equipe Cível"
    | "Equipe Consumidor"
    | "Núcleo de Recursos"
    | "Equipe Operações"
    | "Time Tributário"
}

export type DataArea = DashboardFilters["area"] | "Todas"
export type DataView = DashboardFilters["view"] | "Ambas"
export type DataPeriod = DashboardFilters["period"]
export type DataPhase = DashboardFilters["phase"]
export type DataTribunal = DashboardFilters["tribunal"]
export type DataPortfolio = DashboardFilters["portfolio"]
export type DataOwner = DashboardFilters["owner"]
