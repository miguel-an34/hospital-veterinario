import type { Consulta, ConsultaInput } from '../types/Consulta'
import { apiRequest } from './apiClient'

export const consultaService = {
  listar: () => apiRequest<Consulta[]>('/consultas'),
  buscarPorId: (id: number) => apiRequest<Consulta>(`/consultas/${id}`),
  criar: (input: ConsultaInput) => apiRequest<Consulta>('/consultas', { method: 'POST', body: JSON.stringify(input) }),
  atualizar: (id: number, input: ConsultaInput) => apiRequest<Consulta>(`/consultas/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  excluir: (id: number) => apiRequest<void>(`/consultas/${id}`, { method: 'DELETE' }),
}
