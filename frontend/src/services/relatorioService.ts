import { apiRequest } from './apiClient'
import type { AgendaDiaria, HistoricoClinico, InternacaoAtiva } from '../types/Relatorio'

export const relatorioService = {
  agendaDiaria: () => apiRequest<AgendaDiaria[]>('/relatorios/agenda-diaria'),
  internacoesAtivas: () => apiRequest<InternacaoAtiva[]>('/relatorios/internacoes-ativas'),
  historicoClinico: () => apiRequest<HistoricoClinico[]>('/relatorios/historico-clinico'),
}