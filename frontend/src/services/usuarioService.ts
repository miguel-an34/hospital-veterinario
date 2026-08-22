import type { Usuario, UsuarioInput } from '../types/Usuario'
import { apiRequest } from './apiClient'

export const usuarioService = {
  listar: () => apiRequest<Usuario[]>('/usuarios'),
  buscarPorId: (cpf: string) => apiRequest<Usuario>(`/usuarios/${cpf}`),
  criar: (input: UsuarioInput) => apiRequest<Usuario>('/usuarios', { method: 'POST', body: JSON.stringify(input) }),
  atualizar: (cpf: string, input: UsuarioInput) => apiRequest<Usuario>(`/usuarios/${cpf}`, { method: 'PUT', body: JSON.stringify(input) }),
  excluir: (cpf: string) => apiRequest<void>(`/usuarios/${cpf}`, { method: 'DELETE' }),
}
