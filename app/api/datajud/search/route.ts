import { NextRequest, NextResponse } from 'next/server'
import { isDataJudConfigured, searchDataJud } from '@/lib/datajud'
import {
  DATAJUD_TRIBUNAL_IDS,
  isDataJudTribunalId,
  type DataJudTribunalId,
} from '@/lib/datajud-courts'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  if (!isDataJudConfigured()) {
    return NextResponse.json(
      { error: 'DataJud nao configurado no servidor.' },
      { status: 500 }
    )
  }

  const payload = await request.json().catch(() => null)
  const query = typeof payload?.query === 'string' ? payload.query.trim() : ''
  const tribunals = Array.isArray(payload?.tribunals)
    ? payload.tribunals.filter((value: unknown): value is DataJudTribunalId => typeof value === 'string' && isDataJudTribunalId(value))
    : DATAJUD_TRIBUNAL_IDS
  const size = typeof payload?.size === 'number' ? payload.size : 8

  if (!query) {
    return NextResponse.json(
      { error: 'Consulta vazia.' },
      { status: 400 }
    )
  }

  try {
    const response = await searchDataJud({ query, tribunals, size })

    return NextResponse.json({
      mode: 'datajud',
      records: response.records,
      errors: response.errors,
      note: 'A API publica do DataJud prioriza metadados processuais e pode nao expor dados de partes.',
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Falha ao consultar o DataJud.',
      },
      { status: 502 }
    )
  }
}
