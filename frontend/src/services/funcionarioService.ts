import type { Funcionario, FuncionarioInput } from '../types/Funcionario'
import { apiRequest } from './apiClient'

export const funcionarioService = {
  listar: () => apiRequest<Funcionario[]>('/funcionarios'),
  buscarPorId: (cpf: string) => apiRequest<Funcionario>(`/funcionarios/${cpf}`),
  criar: (input: FuncionarioInput) => apiRequest<Funcionario>('/funcionarios', {
    method: 'POST', body: JSON.stringify(input),
  }),
  atualizar: (cpf: string, input: FuncionarioInput) => apiRequest<Funcionario>(`/funcionarios/${cpf}`, {
    method: 'PUT', body: JSON.stringify(input),
  }),
  excluir: (cpf: string) => apiRequest<void>(`/funcionarios/${cpf}`, { method: 'DELETE' }),
}
