import type { TutorSummary } from '../types/Tutor'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true'

const tutoresMock: TutorSummary[] = [
  { cpf: '03627951859', nome: 'Marina Almeida', email: 'marina@example.com' },
  { cpf: '85167290449', nome: 'Rafael Santos', email: 'rafael@example.com' },
  { cpf: '83906514242', nome: 'Beatriz Costa', email: 'beatriz@example.com' },
  { cpf: '72615483919', nome: 'Carlos Oliveira', email: 'carlos@example.com' },
  { cpf: '83412069515', nome: 'Ana Paula Lima', email: 'ana@example.com' },
  { cpf: '89457361075', nome: 'João Ferreira', email: 'joao@example.com' },
]

export const tutorService = {
  async listar(): Promise<TutorSummary[]> {
    if (USE_MOCK_API) return tutoresMock

    let response: Response
    try {
      response = await fetch(`${API_URL}/tutores`)
    } catch {
      throw new Error('Não foi possível carregar os tutores. Verifique se o backend está ativo.')
    }

    if (!response.ok) throw new Error('Não foi possível carregar os tutores.')
    return response.json() as Promise<TutorSummary[]>
  },
}
