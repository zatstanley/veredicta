import { DATAJUD_COURTS, type DataJudTribunalId } from '@/lib/datajud-courts'

export interface DataJudProcessRecord {
  numero: string
  classe: string
  data: string
  orgao: string
  tribunal: DataJudTribunalId
  partes: string[]
  assuntos: string[]
  baseScore?: number
}

const DEFAULT_DATAJUD_API_URL = 'https://api-publica.datajud.cnj.jus.br'

const DATAJUD_TRIBUNAL_ALIASES: Record<DataJudTribunalId, string> = Object.fromEntries(
  DATAJUD_COURTS.map((court) => [court.id, court.endpoint])
) as Record<DataJudTribunalId, string>

const STOP_WORDS = new Set([
  'a',
  'ao',
  'aos',
  'as',
  'busca',
  'buscar',
  'busque',
  'com',
  'contra',
  'da',
  'das',
  'de',
  'do',
  'dos',
  'e',
  'em',
  'encontre',
  'na',
  'nas',
  'no',
  'nos',
  'o',
  'os',
  'ou',
  'para',
  'pesquise',
  'por',
  'procure',
  'processo',
  'processos',
  'quero',
])

function normalizeText(value: string) {
  return value
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function uniqueList(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()))).filter(Boolean)
}

export function extractProcessNumber(query: string) {
  const digits = query.replace(/\D/g, '')
  if (digits.length < 20) return null
  return digits.slice(0, 20)
}

function formatProcessNumber(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.length !== 20) return value
  return `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9, 13)}.${digits.slice(13, 14)}.${digits.slice(14, 16)}.${digits.slice(16, 20)}`
}

function coerceDate(value: unknown) {
  if (typeof value !== 'string' || !value) return new Date().toISOString().slice(0, 10)
  return value.slice(0, 10)
}

function tokenizeQuery(query: string) {
  return uniqueList(
    normalizeText(query)
      .split(' ')
      .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
  ).slice(0, 8)
}

function buildSearchBody(query: string, size: number) {
  const numeroProcesso = extractProcessNumber(query)

  if (numeroProcesso) {
    return {
      size,
      track_total_hits: true,
      sort: [{ dataAjuizamento: { order: 'desc', unmapped_type: 'date' } }],
      query: {
        bool: {
          filter: [{ term: { numeroProcesso } }],
        },
      },
    }
  }

  const fields = [
    'numeroProcesso^8',
    'classe.nome^6',
    'assuntos.nome^4',
    'orgaoJulgador.nome^3',
    'movimentos.nome^2',
    'sistema.nome',
  ]

  const should = [
    {
      multi_match: {
        query,
        fields,
        type: 'best_fields',
        operator: 'and',
        fuzziness: 'AUTO',
      },
    },
    ...tokenizeQuery(query).map((term) => ({
      multi_match: {
        query: term,
        fields,
        type: 'best_fields',
        fuzziness: 'AUTO',
      },
    })),
  ]

  return {
    size,
    track_total_hits: true,
    sort: [
      { _score: 'desc' },
      { dataAjuizamento: { order: 'desc', unmapped_type: 'date' } },
    ],
    query: {
      bool: {
        minimum_should_match: 1,
        should,
      },
    },
  }
}

function getDataJudConfig() {
  const apiKey = process.env.DATAJUD_API_KEY?.trim()
  const apiUrl = (process.env.DATAJUD_API_URL?.trim() || DEFAULT_DATAJUD_API_URL).replace(/\/+$/, '')
  return { apiKey, apiUrl }
}

function withTimeoutSignal(timeoutMs: number) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeoutId),
  }
}

function mapHitToRecord(hit: any, tribunal: DataJudTribunalId): DataJudProcessRecord | null {
  const source = hit?._source
  if (!source) return null

  const numeroRaw = typeof source.numeroProcesso === 'string' ? source.numeroProcesso : ''
  const classe =
    source.classe?.nome ||
    (source.classe?.codigo ? `Classe ${source.classe.codigo}` : '') ||
    'Classe nao informada'

  const orgao =
    source.orgaoJulgador?.nome ||
    'Orgao julgador nao informado'

  const assuntos = Array.isArray(source.assuntos)
    ? source.assuntos
        .map((item: any) => (typeof item === 'string' ? item : item?.nome))
        .filter(Boolean)
        .slice(0, 5)
    : []

  const movimentos = Array.isArray(source.movimentos)
    ? source.movimentos
        .map((item: any) => item?.nome)
        .filter(Boolean)
        .slice(0, 3)
    : []

  return {
    numero: formatProcessNumber(numeroRaw || hit?._id || ''),
    classe,
    data: coerceDate(source.dataAjuizamento || source['@timestamp']),
    orgao,
    tribunal,
    assuntos,
    partes: uniqueList([
      numeroRaw,
      formatProcessNumber(numeroRaw),
      classe,
      orgao,
      source.sistema?.nome || '',
      ...assuntos,
      ...movimentos,
    ]),
    baseScore: typeof hit?._score === 'number' ? hit._score : undefined,
  }
}

export function isDataJudConfigured() {
  return Boolean(getDataJudConfig().apiKey)
}

export async function searchDataJud(input: {
  query: string
  tribunals: DataJudTribunalId[]
  size?: number
}) {
  const { apiKey, apiUrl } = getDataJudConfig()

  if (!apiKey) {
    throw new Error('DATAJUD_API_KEY nao configurada.')
  }

  const tribunals = input.tribunals.length
    ? input.tribunals
    : (Object.keys(DATAJUD_TRIBUNAL_ALIASES) as DataJudTribunalId[])
  const size = Math.min(Math.max(input.size ?? 8, 1), 20)
  const body = buildSearchBody(input.query, size)

  const responses = await Promise.all(
    tribunals.map(async (tribunal) => {
      const endpoint = `${apiUrl}/${DATAJUD_TRIBUNAL_ALIASES[tribunal]}/_search`
      const requestTimeout = withTimeoutSignal(12000)

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `APIKey ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
          cache: 'no-store',
          signal: requestTimeout.signal,
        })

        const payload = await response.json().catch(() => null)

        if (!response.ok) {
          return {
            tribunal,
            records: [] as DataJudProcessRecord[],
            error: payload?.detail || payload?.message || `HTTP ${response.status}`,
          }
        }

        const hits = Array.isArray(payload?.hits?.hits) ? payload.hits.hits : []

        return {
          tribunal,
          records: hits
            .map((hit: any) => mapHitToRecord(hit, tribunal))
            .filter(Boolean) as DataJudProcessRecord[],
          error: null as string | null,
        }
      } catch (error) {
        return {
          tribunal,
          records: [] as DataJudProcessRecord[],
          error: error instanceof Error ? error.message : 'Falha desconhecida ao consultar DataJud.',
        }
      } finally {
        requestTimeout.clear()
      }
    })
  )

  const records = uniqueList(
    responses.flatMap((response) => response.records.map((record) => record.numero || `${record.tribunal}-${record.classe}`))
  ).map((uniqueKey) =>
    responses.flatMap((response) => response.records).find((record) => (record.numero || `${record.tribunal}-${record.classe}`) === uniqueKey)
  ).filter(Boolean) as DataJudProcessRecord[]

  if (!records.length && responses.every((response) => response.error)) {
    throw new Error(responses.map((response) => `${response.tribunal}: ${response.error}`).join(' | '))
  }

  return {
    records: records.sort((left, right) => {
      const byScore = (right.baseScore ?? 0) - (left.baseScore ?? 0)
      if (byScore !== 0) return byScore
      return right.data.localeCompare(left.data)
    }),
    errors: responses.filter((response) => response.error).map((response) => `${response.tribunal}: ${response.error}`),
  }
}
