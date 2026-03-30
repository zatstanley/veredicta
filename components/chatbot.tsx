'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Bot,
  Database,
  FileSearch,
  Filter,
  History,
  LoaderCircle,
  Search,
  SendHorizontal,
  Settings,
  X,
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import {
  DATAJUD_COURTS,
  DEFAULT_DATAJUD_TRIBUNALS,
  type DataJudTribunalId,
} from '@/lib/datajud-courts'

// ─── Types ──────────────────────────────────────────────────────────────────

type TribunalId = DataJudTribunalId
type PipelineStatus = 'pending' | 'running' | 'complete'
type SidebarTab = 'busca' | 'historico' | 'filtros' | 'configuracoes'
type SearchMode = 'sample' | 'datajud'

interface Message {
  id: string
  text: string
  sender: 'user' | 'assistant'
  timestamp: string
}

interface ProcessRecord {
  numero: string
  classe: string
  data: string
  orgao: string
  tribunal: TribunalId
  partes: string[]
  assuntos: string[]
  baseScore?: number
}

interface EntityDetail {
  label: string
  variations: string[]
}

interface MatchDetail {
  entity: string
  party: string
  score: number
}

interface ProcessMatch extends ProcessRecord {
  matchScore: number
  matchedParties: MatchDetail[]
}

interface SearchBase {
  query: string
  entities: string[]
  createdAt: string
}

interface SearchStats {
  total: number
  crossMatches: number
  confidence: number
}

interface SearchReport {
  base: SearchBase
  entities: EntityDetail[]
  matches: ProcessMatch[]
  sources: string[]
  stats: SearchStats
  mode: SearchMode
}

interface PipelineStep {
  id: string
  label: string
  detail: string
  status: PipelineStatus
}

interface Filters {
  tribunals: Record<TribunalId, boolean>
  fuzzy: boolean
  expand: boolean
  crossMatch: boolean
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TRIBUNALS: { id: TribunalId; label: string; city: string; group: string }[] = [...DATAJUD_COURTS]

const BASE_SOURCES = ['DataJud', 'Jurisprudência consolidada', 'CNJ - Metadados']

const SUGGESTIONS = [
  'Processos de João Silva e XY Construções',
  'Maria Costa contra Grupo Horizonte',
  'Clínica Santa Rita e José Almeida',
  'Alfa Logística e Pedro Nunes no TRT2',
]

const DEFAULT_TRIBUNAL_FILTERS = Object.fromEntries(
  TRIBUNALS.map((tribunal) => [tribunal.id, DEFAULT_DATAJUD_TRIBUNALS.includes(tribunal.id)])
) as Record<TribunalId, boolean>

const LEGAL_SUFFIXES = ['ltda', 'ltda.', 'sa', 's.a.', 'eireli', 'me', 'mei', 's/s']
const escapeRegex = (v: string) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const LEGAL_SUFFIX_PATTERN = LEGAL_SUFFIXES.map(escapeRegex).join('|')

const PIPELINE_TEMPLATE: PipelineStep[] = [
  { id: 'extract', label: 'Extração de entidades', detail: 'Pessoas, empresas e variantes', status: 'pending' },
  { id: 'normalize', label: 'Normalização', detail: 'Acentos, abreviações e similaridade', status: 'pending' },
  { id: 'query', label: 'Consulta multi-tribunais', detail: 'TST, TJs e TRTs selecionados via DataJud', status: 'pending' },
  { id: 'cross', label: 'Cruzamento de partes', detail: 'Termos no mesmo processo', status: 'pending' },
  { id: 'rank', label: 'Rankeamento', detail: 'Priorização por confiança', status: 'pending' },
]

const SAMPLE_PROCESSES: ProcessRecord[] = [
  {
    numero: '0100123-45.2023.5.01.0001',
    classe: 'Ação Trabalhista - Rito Ordinário',
    data: '2024-11-12',
    orgao: '1ª Vara do Trabalho do Rio de Janeiro',
    tribunal: 'TRT1',
    partes: ['João Silva', 'XY Construções Ltda.', 'Caixa Econômica Federal'],
    assuntos: ['rescisão indireta', 'FGTS', 'verbas rescisórias'],
  },
  {
    numero: '1000789-22.2022.5.02.0031',
    classe: 'Reclamação Trabalhista',
    data: '2023-09-02',
    orgao: '31ª Vara do Trabalho de São Paulo',
    tribunal: 'TRT2',
    partes: ['Joao da Silva', 'XY Construcoes', 'Banco Alfa'],
    assuntos: ['horas extras', 'adicional noturno'],
  },
  {
    numero: '0012345-67.2021.5.03.0103',
    classe: 'Cumprimento de Sentença',
    data: '2022-02-14',
    orgao: '3ª Vara do Trabalho de Belo Horizonte',
    tribunal: 'TRT3',
    partes: ['João Carlos Silva', 'Construtora XY Ltda.', 'INSS'],
    assuntos: ['execução', 'cálculos'],
  },
  {
    numero: '0100456-88.2024.5.01.0042',
    classe: 'Execução Trabalhista',
    data: '2025-01-20',
    orgao: '42ª Vara do Trabalho do Rio de Janeiro',
    tribunal: 'TRT1',
    partes: ['XY Construções Ltda.', 'Maria de Lourdes', 'Fazenda Nacional'],
    assuntos: ['penhora', 'honorários'],
  },
  {
    numero: '1001122-90.2023.5.02.0017',
    classe: 'Ação Civil Coletiva',
    data: '2024-06-03',
    orgao: '17ª Vara do Trabalho de São Paulo',
    tribunal: 'TRT2',
    partes: ['José Almeida', 'Clínica Santa Rita'],
    assuntos: ['responsabilidade subsidiária', 'adicional de insalubridade'],
  },
  {
    numero: '0017788-12.2022.5.03.0180',
    classe: 'Reclamação Trabalhista',
    data: '2023-11-29',
    orgao: '18ª Vara do Trabalho de Contagem',
    tribunal: 'TRT3',
    partes: ['Pedro Nunes', 'Alfa Logística S.A.'],
    assuntos: ['equiparação salarial', 'vale-transporte'],
  },
  {
    numero: '0100999-31.2020.5.01.0020',
    classe: 'Reclamação Trabalhista',
    data: '2021-07-10',
    orgao: '20ª Vara do Trabalho do Rio de Janeiro',
    tribunal: 'TRT1',
    partes: ['João Silva', 'Empresa Horizonte Ltda.'],
    assuntos: ['aviso prévio', 'multa do artigo 477'],
  },
]

// ─── Utilities ───────────────────────────────────────────────────────────────

const normalizeText = (v: string) =>
  v.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()

const tokenize = (v: string) => normalizeText(v).split(' ').filter(Boolean)
const extractProcessNumber = (query: string) => {
  const digits = query.replace(/\D/g, '')
  if (digits.length < 20) return null
  return digits.slice(0, 20)
}

const levenshtein = (a: string, b: string): number => {
  if (!a) return b.length
  if (!b) return a.length
  const m = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      m[i][j] = a[i-1] === b[j-1] ? m[i-1][j-1] : 1 + Math.min(m[i-1][j], m[i][j-1], m[i-1][j-1])
  return m[a.length][b.length]
}

const similarityScore = (a: string, b: string) => {
  const na = normalizeText(a), nb = normalizeText(b)
  if (!na || !nb) return 0
  if (na === nb) return 1
  if (na.includes(nb) || nb.includes(na)) return 0.95
  const d = levenshtein(na, nb)
  return 1 - d / Math.max(na.length, nb.length)
}

const tokenScore = (a: string, b: string) => {
  const tokens = tokenize(a), nb = normalizeText(b)
  if (!tokens.length || !nb) return 0
  return tokens.filter(t => nb.includes(t)).length / tokens.length
}

const fuzzyScore = (a: string, b: string) => Math.max(tokenScore(a, b), similarityScore(a, b))
const exactScore = (a: string, b: string) => {
  const na = normalizeText(a), nb = normalizeText(b)
  return nb.includes(na) ? 1 : 0
}

const uniqueList = (items: string[]) => Array.from(new Set(items.map(i => i.trim()))).filter(Boolean)

const extractEntities = (query: string): string[] => {
  if (!query.trim()) return []
  const quoted = Array.from(query.matchAll(/"([^"]+)"|'([^']+)'/g)).map(m => m[1] || m[2])
  if (quoted.length) return uniqueList(quoted).slice(0, 3)

  let cleaned = query
    .replace(/[""]/g, '"')
    .replace(/\b(busque|buscar|procure|localize|encontre|pesquise)\b/gi, '')
    .replace(/\b(processos?|ações?|processo|ação|judiciais?)\b/gi, '')
    .replace(/\b(vinculados?|relacionados?|mesmo|mesma)\b/gi, '')
    .replace(/\s{2,}/g, ' ').trim()

  const separators = [' contra ', ' versus ', ' vs ', ' x ', ' e ', ' & ', ',', ';']
  let parts = [cleaned]
  separators.forEach(sep => {
    parts = parts.flatMap(p => p.split(new RegExp(sep, 'i')).map(v => v.trim()))
  })

  const cleanParts = parts
    .map(p => p.replace(/^[^A-Za-zÀ-ÿ0-9]+/, '').replace(/[^A-Za-zÀ-ÿ0-9]+$/, '').trim())
    .filter(p => p.length > 2)

  const unique = uniqueList(cleanParts)
  if (unique.length >= 2) return unique.slice(0, 3)

  const caps = Array.from(query.matchAll(/[A-ZÀ-Ý][A-Za-zÀ-ÿ]+(?:\s+[A-ZÀ-Ý][A-Za-zÀ-ÿ]+)+/g)).map(m => m[0])
  const capsUnique = uniqueList(caps)
  if (capsUnique.length) return capsUnique.slice(0, 3)
  return unique
}

const buildVariations = (v: string): string[] => {
  const clean = v.replace(/\s+/g, ' ').trim()
  const variations = new Set<string>([clean])
  const withoutSuffix = clean.replace(new RegExp(`\\b(${LEGAL_SUFFIX_PATTERN})\\b`, 'gi'), '').replace(/\s{2,}/g, ' ').trim()
  if (withoutSuffix && withoutSuffix !== clean) variations.add(withoutSuffix)
  const parts = clean.split(' ').filter(Boolean)
  if (parts.length >= 2) variations.add(`${parts[0]} ${parts[parts.length - 1]}`)
  if (parts.length >= 3) variations.add(`${parts[0]} ${parts[1]}`)
  return Array.from(variations).slice(0, 4)
}

const formatDate = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR')

const createPipeline = (): PipelineStep[] => PIPELINE_TEMPLATE.map(s => ({ ...s, status: 'pending' }))

const buildSources = (ids: TribunalId[], mode: SearchMode) => [
  ...(mode === 'datajud'
    ? ['DataJud - API publica', 'Metadados processuais']
    : BASE_SOURCES),
  ...ids.map(id => TRIBUNALS.find(t => t.id === id)?.label ?? id),
]

const computeReport = (
  base: SearchBase,
  filters: Filters,
  records: ProcessRecord[] = SAMPLE_PROCESSES,
  mode: SearchMode = 'sample'
): SearchReport => {
  const entities = base.entities.map(e => ({
    label: e,
    variations: filters.expand ? buildVariations(e) : [e],
  }))

  const activeTribunals = (Object.entries(filters.tribunals) as [TribunalId, boolean][])
    .filter(([, v]) => v).map(([id]) => id)

  const candidates = records.filter(p => activeTribunals.includes(p.tribunal))
  const threshold = mode === 'datajud' ? 0.24 : filters.fuzzy ? 0.72 : 0.96
  const anyMatches: ProcessMatch[] = []
  const selectedMatches: ProcessMatch[] = []

  candidates.forEach(proc => {
    const searchableTerms = proc.partes.length
      ? proc.partes
      : [proc.numero, proc.classe, proc.orgao, ...proc.assuntos]

    const matchedParties: MatchDetail[] = entities.map(entity => {
      let bestScore = 0, bestParty = ''
      searchableTerms.forEach(party => {
        const score = Math.max(...entity.variations.map(v => filters.fuzzy ? fuzzyScore(v, party) : exactScore(v, party)))
        if (score > bestScore) { bestScore = score; bestParty = party }
      })
      return { entity: entity.label, party: bestParty, score: bestScore }
    })

    const avg = matchedParties.reduce((s, m) => s + m.score, 0) / Math.max(matchedParties.length, 1)
    const baseScore = Math.min((proc.baseScore ?? 0) / 20, 1)
    const matchScore = mode === 'datajud'
      ? Math.max(avg, baseScore)
      : avg
    const hasAny = matchedParties.some(m => m.score >= threshold) || (mode === 'datajud' && (proc.baseScore ?? 0) > 0)
    const hasAll = mode === 'datajud'
      ? matchedParties.every(m => m.score >= 0.14) || (matchedParties.length === 1 && hasAny)
      : matchedParties.every(m => m.score >= threshold)
    const payload = { ...proc, matchScore, matchedParties }

    if (hasAny) anyMatches.push(payload)
    if (filters.crossMatch ? hasAll : hasAny) selectedMatches.push(payload)
  })

  const sorted = selectedMatches.sort((a, b) =>
    b.matchScore !== a.matchScore ? b.matchScore - a.matchScore : new Date(b.data).getTime() - new Date(a.data).getTime()
  )

  const confidence = sorted.length
    ? Math.round((sorted.reduce((s, m) => s + m.matchScore, 0) / sorted.length) * 100)
    : 0

  return {
    base, entities, matches: sorted,
    sources: buildSources(activeTribunals, mode),
    stats: { total: anyMatches.length, crossMatches: sorted.length, confidence },
    mode,
  }
}

const buildSummary = (report: SearchReport): string => {
  if (!report.matches.length && report.mode === 'datajud')
    return `Nao encontrei processos na API publica do DataJud para "${report.base.query}". Essa API trabalha principalmente com metadados processuais e pode nao expor dados de partes.`

  if (!report.matches.length)
    return `Não encontrei processos com ${report.base.entities.join(' e ')} nos filtros atuais. Tente ajustar os tribunais ou desativar o cruzamento simultâneo.`

  const counts = report.matches.reduce<Record<string, number>>((acc, m) => {
    acc[m.tribunal] = (acc[m.tribunal] || 0) + 1
    return acc
  }, {})

  const summary = Object.entries(counts).map(([t, n]) => `${n} em ${t}`).join(', ')
  if (report.mode === 'datajud')
    return `Encontrei **${report.matches.length} processos** na API publica do DataJud para a consulta **${report.base.query}**. ${summary}. Confianca media de **${report.stats.confidence}%**.`
  return `Encontrei **${report.matches.length} processos** com ${report.base.entities.join(' e ')}. ${summary}. Confiança média de **${report.stats.confidence}%**.`
}

// ─── Sidebar Nav ─────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'busca' as SidebarTab, icon: Search, label: 'Busca' },
  { id: 'historico' as SidebarTab, icon: History, label: 'Histórico' },
  { id: 'filtros' as SidebarTab, icon: Filter, label: 'Filtros' },
  { id: 'configuracoes' as SidebarTab, icon: Settings, label: 'Config.' },
]

// ─── Component ───────────────────────────────────────────────────────────────

export function Chatbot() {
  const welcome = 'Olá! Descreva sua consulta em linguagem natural — informe pessoas, empresas ou ambas e eu cruzo as partes em múltiplos tribunais.'

  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', text: welcome, sender: 'assistant', timestamp: new Date().toLocaleTimeString('pt-BR') },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [pipeline, setPipeline] = useState<PipelineStep[]>(createPipeline())
  const [searchBase, setSearchBase] = useState<SearchBase | null>(null)
  const [searchRecords, setSearchRecords] = useState<ProcessRecord[]>(SAMPLE_PROCESSES)
  const [searchMode, setSearchMode] = useState<SearchMode>('sample')
  const [activeTab, setActiveTab] = useState<SidebarTab>('busca')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [filters, setFilters] = useState<Filters>({
    tribunals: DEFAULT_TRIBUNAL_FILTERS,
    fuzzy: true,
    expand: true,
    crossMatch: true,
  })

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const searchIdRef = useRef(0)
  const endRef = useRef<HTMLDivElement>(null)

  const activeTribunalIds = useMemo(
    () => (Object.entries(filters.tribunals) as [TribunalId, boolean][])
      .filter(([, value]) => value)
      .map(([id]) => id),
    [filters.tribunals]
  )

  const activeTribunalSummary = useMemo(() => {
    if (!activeTribunalIds.length) return 'Nenhum tribunal selecionado'
    if (activeTribunalIds.length <= 5) return activeTribunalIds.join(', ')
    return `${activeTribunalIds.slice(0, 5).join(', ')} +${activeTribunalIds.length - 5}`
  }, [activeTribunalIds])

  const tribunalGroups = useMemo(() => {
    return Object.entries(
      TRIBUNALS.reduce<Record<string, typeof TRIBUNALS>>((acc, tribunal) => {
        if (!acc[tribunal.group]) acc[tribunal.group] = []
        acc[tribunal.group].push(tribunal)
        return acc
      }, {})
    )
  }, [])

  const report = useMemo(
    () => (searchBase ? computeReport(searchBase, filters, searchRecords, searchMode) : null),
    [searchBase, filters, searchRecords, searchMode],
  )

  const pipelineProgress = useMemo(() => {
    const done = pipeline.filter(s => s.status === 'complete').length
    return Math.round((done / pipeline.length) * 100)
  }, [pipeline])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const updatePipeline = (stepId: string, status: PipelineStatus) =>
    setPipeline(prev => prev.map(s => s.id === stepId ? { ...s, status } : s))

  const runPipeline = async (currentId: number) => {
    setPipeline(createPipeline())
    for (const stepId of ['extract', 'normalize', 'query', 'cross', 'rank']) {
      if (searchIdRef.current !== currentId) return
      updatePipeline(stepId, 'running')
      await new Promise(r => setTimeout(r, 380))
      if (searchIdRef.current !== currentId) return
      updatePipeline(stepId, 'complete')
    }
  }

  const handleSend = async () => {
    const query = input.trim()
    if (!query || isLoading) return

    setMessages(prev => [...prev, {
      id: `${Date.now()}-user`, text: query, sender: 'user',
      timestamp: new Date().toLocaleTimeString('pt-BR'),
    }])
    setInput('')
    setIsLoading(true)
    setSearchBase(null)
    setSearchRecords(SAMPLE_PROCESSES)
    setSearchMode('sample')

    const searchId = ++searchIdRef.current
    const processNumber = extractProcessNumber(query)
    const entities = processNumber ? [processNumber] : extractEntities(query)

    if (!entities.length) {
      setMessages(prev => [...prev, {
        id: `${Date.now()}-bot`,
        text: 'Preciso de pelo menos um nome de pessoa ou empresa. Informe duas partes para ativar o cruzamento.',
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString('pt-BR'),
      }])
      setIsLoading(false)
      return
    }

    setActiveTab('busca')
    await runPipeline(searchId)
    if (searchIdRef.current !== searchId) return

    const base: SearchBase = { query, entities, createdAt: new Date().toLocaleString('pt-BR') }
    let nextRecords = SAMPLE_PROCESSES
    let nextMode: SearchMode = 'sample'

    try {
      const response = await fetch('/api/datajud/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          tribunals: activeTribunalIds,
          size: 8,
        }),
      })

      if (response.ok) {
        const payload = await response.json()
        if (Array.isArray(payload?.records)) {
          nextRecords = payload.records as ProcessRecord[]
          nextMode = 'datajud'
        }
      }
    } catch {
      nextRecords = SAMPLE_PROCESSES
      nextMode = 'sample'
    }

    setSearchRecords(nextRecords)
    setSearchMode(nextMode)
    setSearchBase(base)

    const computed = computeReport(base, filters, nextRecords, nextMode)
    setMessages(prev => [...prev, {
      id: `${Date.now()}-bot`,
      text: buildSummary(computed),
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString('pt-BR'),
    }])
    setIsLoading(false)
  }

  const handleClear = () => {
    setMessages([{ id: 'welcome', text: welcome, sender: 'assistant', timestamp: new Date().toLocaleTimeString('pt-BR') }])
    setSearchBase(null)
    setSearchRecords(SAMPLE_PROCESSES)
    setSearchMode('sample')
    setPipeline(createPipeline())
    setInput('')
    inputRef.current?.focus()
  }

  const renderMessage = (text: string) => {
    return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  }

  // ─── Sidebar content per tab ─────────────────────────────────────────────

  const renderSidebarContent = () => {
    switch (activeTab) {
      case 'busca':
        return (
          <div className="flex flex-col gap-4 p-4">
            {/* Status */}
            <div className="rounded-xl border border-border/60 bg-background/45 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground/80">Status da busca</span>
                <span className={`text-xs font-medium ${report ? 'text-primary' : isLoading ? 'text-status-pending' : 'text-muted-foreground'}`}>
                  {report ? 'Concluída' : isLoading ? 'Em andamento' : 'Aguardando'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Total', value: report?.stats.total ?? 0 },
                  { label: 'Cruzados', value: report?.stats.crossMatches ?? 0 },
                  { label: 'Confiança', value: `${report?.stats.confidence ?? 0}%` },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg border border-border/60 bg-card/70 p-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                    <p className="mt-1 text-lg font-bold text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Resultados */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground/80">Resultados</span>
                {report && <span className="text-xs text-muted-foreground">{report.matches.length} encontrados</span>}
              </div>

              {!report && (
                <div className="rounded-xl border border-dashed border-border/70 bg-background/35 p-5 text-center">
                  <FileSearch className="mx-auto mb-2 h-8 w-8 text-primary/45" />
                  <p className="text-sm text-muted-foreground">Faça uma consulta para ver os resultados aqui.</p>
                </div>
              )}

              {report && report.matches.length === 0 && (
                <div className="rounded-xl border border-dashed border-border/70 bg-background/35 p-5 text-center">
                  <p className="text-sm text-muted-foreground">Nenhum processo encontrado com os filtros atuais.</p>
                </div>
              )}

              <div className="space-y-2">
                {(report?.matches ?? []).slice(0, 4).map(match => (
                  <div key={match.numero} className="group rounded-xl border border-border/60 bg-background/45 p-3 transition-colors hover:border-primary/25 hover:bg-primary/5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-mono text-[11px] text-primary">{match.numero}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{match.classe}</p>
                      </div>
                      <span className="shrink-0 rounded-md border border-border/60 bg-card/70 px-1.5 py-0.5 text-[10px] font-medium text-foreground/70">{match.tribunal}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{match.orgao}</span>
                      <span>{Math.round(match.matchScore * 100)}%</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {match.matchedParties.map(p => (
                        <span key={p.entity} className="rounded-md border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                          {p.entity}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {(report?.matches.length ?? 0) > 4 && (
                  <p className="text-center text-xs text-muted-foreground">+{(report?.matches.length ?? 0) - 4} resultados adicionais</p>
                )}
              </div>
            </div>

            {/* Pipeline */}
            <div className="rounded-xl border border-border/60 bg-background/45 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground/80">Pipeline</span>
                <span className="text-xs text-muted-foreground">{pipelineProgress}%</span>
              </div>
              <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-border/70">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${pipelineProgress}%` }}
                />
              </div>
              <div className="space-y-1.5">
                {pipeline.map(step => (
                  <div key={step.id} className="flex items-center gap-2.5">
                    {step.status === 'complete' ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                    ) : step.status === 'running' ? (
                      <LoaderCircle className="h-3.5 w-3.5 shrink-0 animate-spin text-status-pending" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                    )}
                    <span className={`text-xs ${step.status === 'complete' ? 'text-foreground/80' : step.status === 'running' ? 'text-status-pending' : 'text-muted-foreground'}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'historico':
        return (
          <div className="flex flex-col gap-3 p-4">
            <span className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground/80">Histórico de consultas</span>
            {searchBase ? (
              <div className="rounded-xl border border-border/60 bg-background/45 p-3">
                <p className="text-sm text-foreground/85">{searchBase.query}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{searchBase.createdAt}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {searchBase.entities.map(e => (
                    <span key={e} className="rounded-md border border-border/60 bg-card/70 px-2 py-0.5 text-[10px] text-foreground/70">{e}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/70 bg-background/35 p-5 text-center">
                <History className="mx-auto mb-2 h-8 w-8 text-primary/45" />
                <p className="text-sm text-muted-foreground">Nenhuma consulta realizada ainda.</p>
              </div>
            )}
          </div>
        )

      case 'filtros':
        return (
          <div className="flex flex-col gap-4 p-4">
            <span className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground/80">Filtros de busca</span>

            <div className="space-y-2">
              {[
                { key: 'fuzzy' as const, label: 'Fuzzy matching', desc: 'Busca por similaridade textual' },
                { key: 'expand' as const, label: 'Expandir variações', desc: 'Gera variantes do nome' },
                { key: 'crossMatch' as const, label: 'Cruzamento simultâneo', desc: 'Todas as partes no mesmo processo' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between rounded-xl border border-border/60 bg-background/45 p-3">
                  <div>
                    <p className="text-sm text-foreground/85">{label}</p>
                    <p className="text-[11px] text-muted-foreground">{desc}</p>
                  </div>
                  <Switch
                    checked={filters[key]}
                    onCheckedChange={checked => setFilters(prev => ({ ...prev, [key]: checked }))}
                  />
                </div>
              ))}
            </div>

            <div>
              <span className="mb-2 block text-[11px] font-semibold tracking-[0.18em] text-muted-foreground/80">Tribunais</span>
              <div className="space-y-3">
                {tribunalGroups.map(([group, items]) => (
                  <div key={group} className="space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
                      {group}
                    </p>
                    <div className="space-y-2">
                      {items.map(t => (
                        <label key={t.id} className="flex cursor-pointer items-center justify-between rounded-xl border border-border/60 bg-background/45 p-3 transition-colors hover:border-primary/25 hover:bg-primary/5">
                          <div className="pr-3">
                            <p className="text-sm font-medium text-foreground/85">{t.id}</p>
                            <p className="text-[11px] text-muted-foreground">{t.label}</p>
                            <p className="text-[11px] text-muted-foreground/80">{t.city}</p>
                          </div>
                          <Checkbox
                            checked={filters.tribunals[t.id]}
                            onCheckedChange={checked => setFilters(prev => ({
                              ...prev,
                              tribunals: { ...prev.tribunals, [t.id]: Boolean(checked) },
                            }))}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="mb-2 block text-[11px] font-semibold tracking-[0.18em] text-muted-foreground/80">Fontes</span>
              <div className="space-y-1.5">
                {BASE_SOURCES.map(s => (
                  <div key={s} className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/45 p-3">
                    <Database className="h-3.5 w-3.5 text-primary" />
                    <span className="text-sm text-foreground/75">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'configuracoes':
        return (
          <div className="flex flex-col gap-4 p-4">
            <span className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground/80">Configurações</span>
            <div className="rounded-xl border border-border/60 bg-background/45 p-4">
              <p className="text-sm font-medium text-foreground/85">Workspace</p>
              <p className="mt-1 text-xs text-muted-foreground">Veredicta — Plataforma Jurídica</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/45 p-4">
              <p className="text-sm font-medium text-foreground/85">Versão</p>
              <p className="mt-1 text-xs text-muted-foreground">v1.0.0 — DataJud integrado</p>
            </div>
          </div>
        )
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen overflow-hidden bg-transparent font-sans">

      {/* ── Narrow icon rail ── */}
      <nav className="flex w-16 shrink-0 flex-col items-center border-r border-border/60 bg-card/80 py-4 backdrop-blur-xl">
        {/* Logo */}
        <div className="relative mb-6">
          <div className="absolute -inset-1 rounded-2xl bg-primary/20 blur-lg" />
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent shadow-lg shadow-primary/20">
            <Image
              src="/iconveredicta.png"
              alt="Veredicta"
              width={24}
              height={24}
              className="h-6 w-6 object-contain"
              priority
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center gap-1">
          {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setSidebarOpen(true) }}
              className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                activeTab === id && sidebarOpen
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-background/80 hover:text-foreground'
              }`}
              title={label}
            >
              <Icon className="h-4 w-4" />
              {activeTab === id && sidebarOpen && (
                <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />
              )}
            </button>
          ))}
        </div>

        {/* Online dot */}
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-background/50">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
        </div>
      </nav>

      {/* ── Expandable sidebar panel ── */}
      <aside
        className={`flex min-h-0 shrink-0 flex-col overflow-hidden border-r border-border/60 bg-card/75 backdrop-blur-xl transition-all duration-300 ${
          sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'
        }`}
      >
        {/* Sidebar header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/60 px-4">
          <span className="text-sm font-semibold text-foreground/85">
            {NAV_ITEMS.find(n => n.id === activeTab)?.label}
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <ScrollArea className="h-full min-h-0 flex-1">
          {renderSidebarContent()}
        </ScrollArea>
      </aside>

      {/* ── Main chat area ── */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/60 bg-card/55 px-6 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-background/80 hover:text-foreground"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-1 rounded-2xl bg-primary/20 blur-lg" />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent shadow-lg shadow-primary/20">
                  <Image
                    src="/iconveredicta.png"
                    alt="Veredicta"
                    width={24}
                    height={24}
                    className="h-6 w-6 object-contain"
                    priority
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-semibold text-foreground">Veredicta</h1>
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    Legal Intelligence
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">Busca processual · {activeTribunalSummary}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-full border-border/70 bg-background/65 text-muted-foreground hover:bg-background hover:text-foreground"
            >
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Voltar ao painel
              </Link>
            </Button>
            <div className="flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              DataJud ativo
            </div>
          </div>
        </header>

        {/* Messages */}
        <ScrollArea className="flex-1 px-6 py-4">
          <div className="mx-auto flex max-w-2xl flex-col gap-4">
            {/* Suggestions (only before first search) */}
            {!searchBase && messages.length <= 1 && (
              <div className="mb-2 grid grid-cols-2 gap-2">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); inputRef.current?.focus() }}
                    disabled={isLoading}
                    className="group rounded-xl border border-border/60 bg-background/45 p-3 text-left text-xs text-muted-foreground transition-all hover:border-primary/25 hover:bg-primary/5 hover:text-foreground disabled:pointer-events-none"
                  >
                    <Search className="mb-1.5 h-3 w-3 text-primary/70" />
                    {s}
                  </button>
                ))}
              </div>
            )}

            {messages.map(msg => {
              const isUser = msg.sender === 'user'
              return (
                <div key={msg.id} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-xs font-semibold ${
                    isUser
                      ? 'border-border/60 bg-card/80 text-foreground/70'
                      : 'border-primary/20 bg-primary/10 text-primary'
                  }`}>
                    {isUser ? 'VC' : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    isUser
                      ? 'rounded-tr-sm border border-border/60 bg-card/80 text-foreground/85'
                      : 'rounded-tl-sm border border-border/60 bg-background/55 text-foreground/85'
                  }`}>
                    <p
                      className="text-sm leading-6"
                      dangerouslySetInnerHTML={{ __html: renderMessage(msg.text) }}
                    />
                    <p className="mt-1.5 text-[10px] text-muted-foreground/80">{msg.timestamp}</p>
                  </div>
                </div>
              )
            })}

            {isLoading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-2xl rounded-tl-sm border border-border/60 bg-background/55 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin text-primary" />
                    Consultando tribunais...
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="shrink-0 border-t border-border/60 bg-card/65 p-4 backdrop-blur-xl">
          <div className="mx-auto max-w-2xl">
            <div className="relative rounded-2xl border border-border/70 bg-background/55 shadow-[0_18px_55px_rgba(4,12,24,0.24)] transition-colors focus-within:border-primary/35 focus-within:ring-1 focus-within:ring-primary/15">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    void handleSend()
                  }
                }}
                placeholder="Descreva a consulta — ex: João Silva contra XY Construções no TRT2"
                disabled={isLoading}
                rows={2}
                className="w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-sm leading-6 text-foreground/85 outline-none placeholder:text-muted-foreground/80 disabled:opacity-50"
              />
              <div className="flex items-center justify-between border-t border-border/60 px-3 py-2">
                <p className="text-[11px] text-muted-foreground">Enter para enviar · Shift+Enter para nova linha</p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    disabled={isLoading}
                    className="h-7 rounded-lg px-3 text-xs text-muted-foreground hover:bg-background/80 hover:text-foreground"
                  >
                    Limpar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => void handleSend()}
                    disabled={isLoading || !input.trim()}
                    className="h-7 gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
                  >
                    <SendHorizontal className="h-3.5 w-3.5" />
                    Pesquisar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
