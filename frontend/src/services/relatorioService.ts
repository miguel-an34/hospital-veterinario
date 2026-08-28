import { apiRequest } from './apiClient'
import type {
  AgendaDiaria,
  AtendimentoPorProfissional,
  HistoricoClinico,
  HistoricoPorPaciente,
  InternacaoAtiva,
  TipoRelatorio,
} from '../types/Relatorio'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

interface RelatorioFiltros {
  dataInicio?: string
  dataFim?: string
}

function buildQuery({ dataInicio, dataFim }: RelatorioFiltros = {}) {
  const params = new URLSearchParams()
  if (dataInicio) params.set('data_inicio', dataInicio)
  if (dataFim) params.set('data_fim', dataFim)
  const query = params.toString()
  return query ? `?${query}` : ''
}

export const relatorioService = {
  agendaDiaria: () => apiRequest<AgendaDiaria[]>('/relatorios/agenda-diaria'),
  internacoesAtivas: () => apiRequest<InternacaoAtiva[]>('/relatorios/internacoes-ativas'),
  historicoClinico: () => apiRequest<HistoricoClinico[]>('/relatorios/historico-clinico'),
  atendimentos: (filtros: RelatorioFiltros) =>
    apiRequest<AtendimentoPorProfissional[]>(`/api/relatorios/atendimentos${buildQuery(filtros)}`),
  historico: (filtros: RelatorioFiltros) =>
    apiRequest<HistoricoPorPaciente[]>(`/api/relatorios/historico${buildQuery(filtros)}`),
  async exportarCsv(tipo: TipoRelatorio, filtros: RelatorioFiltros) {
    const response = await fetch(`${API_URL}/api/relatorios/${tipo}/csv${buildQuery(filtros)}`)
    if (!response.ok) {
      let mensagem = `A exportação falhou (erro ${response.status}).`
      try {
        const body = await response.json() as { message?: string }
        if (body.message) mensagem = body.message
      } catch {
        // Ignora resposta sem corpo JSON.
      }
      throw new Error(mensagem)
    }
    return response.blob()
  },
}
