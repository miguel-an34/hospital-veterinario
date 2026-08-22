import type { Agendamento, AgendamentoInput } from '../types/Agendamento'
import { apiRequest } from './apiClient'

export const agendamentoService = {
  listar: () => apiRequest<Agendamento[]>('/agendamentos'),
  buscarPorId: (id: number) => apiRequest<Agendamento>(`/agendamentos/${id}`),
  criar: (input: AgendamentoInput) => apiRequest<Agendamento>('/agendamentos', { method: 'POST', body: JSON.stringify(input) }),
  atualizar: (id: number, input: AgendamentoInput) => apiRequest<Agendamento>(`/agendamentos/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  excluir: (id: number) => apiRequest<void>(`/agendamentos/${id}`, { method: 'DELETE' }),
}
