import type { Tutor, TutorInput, TutorSummary } from '../types/Tutor'
import { apiRequest } from './apiClient'

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true'

const tutoresMock: TutorSummary[] = [
  { cpf: '03627951859', nome: 'Marina Almeida', email: 'marina@example.com' },
  { cpf: '85167290449', nome: 'Rafael Santos', email: 'rafael@example.com' },
  { cpf: '83906514242', nome: 'Beatriz Costa', email: 'beatriz@example.com' },
  { cpf: '72615483919', nome: 'Carlos Oliveira', email: 'carlos@example.com' },
  { cpf: '83412069515', nome: 'Ana Paula Lima', email: 'ana@example.com' },
  { cpf: '89457361075', nome: 'João Ferreira', email: 'joao@example.com' },
]

function mockCompleto(): Tutor[] {
  return tutoresMock.map((tutor) => ({
    ...tutor,
    dataCadastro: '',
    enderecoRua: 'Rua de exemplo',
    enderecoNumero: '100',
    enderecoBairro: 'Centro',
    enderecoCidade: 'Recife',
    enderecoCep: '50000000',
    telefones: ['81999999999'],
  }))
}

export const tutorService = {
  async listar(): Promise<TutorSummary[]> {
    if (USE_MOCK_API) return tutoresMock
    return apiRequest<TutorSummary[]>('/tutores')
  },

  async listarCompleto(): Promise<Tutor[]> {
    if (USE_MOCK_API) return mockCompleto()
    const summaries = await apiRequest<TutorSummary[]>('/tutores')
    return Promise.all(summaries.map(({ cpf }) => apiRequest<Tutor>(`/tutores/${cpf}`)))
  },

  buscarPorId(cpf: string): Promise<Tutor> {
    if (USE_MOCK_API) {
      const tutor = mockCompleto().find((item) => item.cpf === cpf)
      return tutor ? Promise.resolve(tutor) : Promise.reject(new Error('Tutor não encontrado.'))
    }
    return apiRequest<Tutor>(`/tutores/${cpf}`)
  },

  criar(input: TutorInput): Promise<Tutor> {
    return apiRequest<Tutor>('/tutores', { method: 'POST', body: JSON.stringify(input) })
  },

  atualizar(cpf: string, input: TutorInput): Promise<Tutor> {
    return apiRequest<Tutor>(`/tutores/${cpf}`, { method: 'PUT', body: JSON.stringify(input) })
  },

  excluir(cpf: string): Promise<void> {
    return apiRequest<void>(`/tutores/${cpf}`, { method: 'DELETE' })
  },
}
