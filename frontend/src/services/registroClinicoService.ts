import type { RegistroClinico, RegistroClinicoInput } from '../types/RegistroClinico'
import { apiRequest } from './apiClient'

export const registroClinicoService = {
  listar: () => apiRequest<RegistroClinico[]>('/registros-clinicos'),
  buscarPorId: (id: number) => apiRequest<RegistroClinico>(`/registros-clinicos/${id}`),
  criar: (input: RegistroClinicoInput) => apiRequest<RegistroClinico>('/registros-clinicos', { method: 'POST', body: JSON.stringify(input) }),
  atualizar: (id: number, input: RegistroClinicoInput) => apiRequest<RegistroClinico>(`/registros-clinicos/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  excluir: (id: number) => apiRequest<void>(`/registros-clinicos/${id}`, { method: 'DELETE' }),
}
