export const DATAJUD_COURTS = [
  { id: 'TST', label: 'Tribunal Superior do Trabalho', city: 'Brasilia', endpoint: 'api_publica_tst', group: 'Superiores' },
  { id: 'TJRJ', label: 'Tribunal de Justica do Rio de Janeiro', city: 'Rio de Janeiro', endpoint: 'api_publica_tjrj', group: 'Tribunais de Justica' },
  { id: 'TJSP', label: 'Tribunal de Justica de Sao Paulo', city: 'Sao Paulo', endpoint: 'api_publica_tjsp', group: 'Tribunais de Justica' },
  { id: 'TJMG', label: 'Tribunal de Justica de Minas Gerais', city: 'Minas Gerais', endpoint: 'api_publica_tjmg', group: 'Tribunais de Justica' },
  { id: 'TRT1', label: 'Tribunal Regional do Trabalho da 1a Regiao', city: 'Rio de Janeiro', endpoint: 'api_publica_trt1', group: 'TRTs' },
  { id: 'TRT2', label: 'Tribunal Regional do Trabalho da 2a Regiao', city: 'Sao Paulo', endpoint: 'api_publica_trt2', group: 'TRTs' },
  { id: 'TRT3', label: 'Tribunal Regional do Trabalho da 3a Regiao', city: 'Minas Gerais', endpoint: 'api_publica_trt3', group: 'TRTs' },
  { id: 'TRT4', label: 'Tribunal Regional do Trabalho da 4a Regiao', city: 'Rio Grande do Sul', endpoint: 'api_publica_trt4', group: 'TRTs' },
  { id: 'TRT5', label: 'Tribunal Regional do Trabalho da 5a Regiao', city: 'Bahia', endpoint: 'api_publica_trt5', group: 'TRTs' },
  { id: 'TRT6', label: 'Tribunal Regional do Trabalho da 6a Regiao', city: 'Pernambuco', endpoint: 'api_publica_trt6', group: 'TRTs' },
  { id: 'TRT7', label: 'Tribunal Regional do Trabalho da 7a Regiao', city: 'Ceara', endpoint: 'api_publica_trt7', group: 'TRTs' },
  { id: 'TRT8', label: 'Tribunal Regional do Trabalho da 8a Regiao', city: 'Para e Amapa', endpoint: 'api_publica_trt8', group: 'TRTs' },
  { id: 'TRT9', label: 'Tribunal Regional do Trabalho da 9a Regiao', city: 'Parana', endpoint: 'api_publica_trt9', group: 'TRTs' },
  { id: 'TRT10', label: 'Tribunal Regional do Trabalho da 10a Regiao', city: 'DF e Tocantins', endpoint: 'api_publica_trt10', group: 'TRTs' },
  { id: 'TRT11', label: 'Tribunal Regional do Trabalho da 11a Regiao', city: 'Amazonas e Roraima', endpoint: 'api_publica_trt11', group: 'TRTs' },
  { id: 'TRT12', label: 'Tribunal Regional do Trabalho da 12a Regiao', city: 'Santa Catarina', endpoint: 'api_publica_trt12', group: 'TRTs' },
  { id: 'TRT13', label: 'Tribunal Regional do Trabalho da 13a Regiao', city: 'Paraiba', endpoint: 'api_publica_trt13', group: 'TRTs' },
  { id: 'TRT14', label: 'Tribunal Regional do Trabalho da 14a Regiao', city: 'Rondonia e Acre', endpoint: 'api_publica_trt14', group: 'TRTs' },
  { id: 'TRT15', label: 'Tribunal Regional do Trabalho da 15a Regiao', city: 'Campinas', endpoint: 'api_publica_trt15', group: 'TRTs' },
  { id: 'TRT16', label: 'Tribunal Regional do Trabalho da 16a Regiao', city: 'Maranhao', endpoint: 'api_publica_trt16', group: 'TRTs' },
  { id: 'TRT17', label: 'Tribunal Regional do Trabalho da 17a Regiao', city: 'Espirito Santo', endpoint: 'api_publica_trt17', group: 'TRTs' },
  { id: 'TRT18', label: 'Tribunal Regional do Trabalho da 18a Regiao', city: 'Goias', endpoint: 'api_publica_trt18', group: 'TRTs' },
  { id: 'TRT19', label: 'Tribunal Regional do Trabalho da 19a Regiao', city: 'Alagoas', endpoint: 'api_publica_trt19', group: 'TRTs' },
  { id: 'TRT20', label: 'Tribunal Regional do Trabalho da 20a Regiao', city: 'Sergipe', endpoint: 'api_publica_trt20', group: 'TRTs' },
  { id: 'TRT21', label: 'Tribunal Regional do Trabalho da 21a Regiao', city: 'Rio Grande do Norte', endpoint: 'api_publica_trt21', group: 'TRTs' },
  { id: 'TRT22', label: 'Tribunal Regional do Trabalho da 22a Regiao', city: 'Piaui', endpoint: 'api_publica_trt22', group: 'TRTs' },
  { id: 'TRT23', label: 'Tribunal Regional do Trabalho da 23a Regiao', city: 'Mato Grosso', endpoint: 'api_publica_trt23', group: 'TRTs' },
  { id: 'TRT24', label: 'Tribunal Regional do Trabalho da 24a Regiao', city: 'Mato Grosso do Sul', endpoint: 'api_publica_trt24', group: 'TRTs' },
] as const

export type DataJudTribunalId = (typeof DATAJUD_COURTS)[number]['id']

export const DATAJUD_TRIBUNAL_IDS = DATAJUD_COURTS.map((court) => court.id) as DataJudTribunalId[]

export const DEFAULT_DATAJUD_TRIBUNALS: DataJudTribunalId[] = ['TRT1', 'TRT2', 'TRT3']

export function isDataJudTribunalId(value: string): value is DataJudTribunalId {
  return DATAJUD_TRIBUNAL_IDS.includes(value as DataJudTribunalId)
}
