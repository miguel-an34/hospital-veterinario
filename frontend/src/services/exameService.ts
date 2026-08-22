import type { Exame, ExameInput } from '../types/Exame'
import { apiRequest } from './apiClient'

export const exameService = {
  listar: () => apiRequest<Exame[]>('/exames'),
  buscarPorId: (id: number) => apiRequest<Exame>(`/exames/${id}`),
  criar: (input: ExameInput) => apiRequest<Exame>('/exames', { method: 'POST', body: JSON.stringify(input) }),
  atualizar: (id: number, input: ExameInput) => apiRequest<Exame>(`/exames/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  excluir: (id: number) => apiRequest<void>(`/exames/${id}`, { method: 'DELETE' }),
}
