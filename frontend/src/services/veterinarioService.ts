import type { Veterinario } from '../types/Veterinario'
import { apiRequest } from './apiClient'

export const veterinarioService = {
  listar: () => apiRequest<Veterinario[]>('/veterinarios'),
}
