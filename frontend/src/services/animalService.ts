import type { Animal, AnimalInput, SexoAnimal } from '../types/Animal'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true'
const STORAGE_KEY = 'vetcare.animais'
const MOCK_DELAY = 250

const animaisIniciais: Animal[] = [
  {
    id: 1,
    nome: 'Luna',
    especie: 'Cão',
    raca: 'Golden Retriever',
    sexo: 'F',
    dataNascimento: '2020-03-12',
    peso: 28.4,
    tutorCpf: '03627951859',
    tutor: 'Marina Almeida',
  },
  {
    id: 2,
    nome: 'Theo',
    especie: 'Gato',
    raca: 'Siamês',
    sexo: 'M',
    dataNascimento: '2021-08-05',
    peso: 4.8,
    tutorCpf: '85167290449',
    tutor: 'Rafael Santos',
  },
  {
    id: 3,
    nome: 'Pipoca',
    especie: 'Cão',
    raca: 'Shih-tzu',
    sexo: 'F',
    dataNascimento: '2019-11-23',
    peso: 6.2,
    tutorCpf: '83906514242',
    tutor: 'Beatriz Costa',
  },
  {
    id: 4,
    nome: 'Nino',
    especie: 'Gato',
    raca: 'Sem raça definida',
    sexo: 'M',
    dataNascimento: '2022-01-17',
    peso: 5.1,
    tutorCpf: '72615483919',
    tutor: 'Carlos Oliveira',
  },
  {
    id: 5,
    nome: 'Mel',
    especie: 'Cão',
    raca: 'Beagle',
    sexo: 'F',
    dataNascimento: '2018-06-30',
    peso: 11.7,
    tutorCpf: '83412069515',
    tutor: 'Ana Paula Lima',
  },
  {
    id: 6,
    nome: 'Chico',
    especie: 'Ave',
    raca: 'Calopsita',
    sexo: 'M',
    dataNascimento: '2023-02-10',
    peso: 0.09,
    tutorCpf: '89457361075',
    tutor: 'João Ferreira',
  },
]

interface AnimalApiResponse {
  id?: number
  id_animal?: number
  nome: string
  especie: string
  raca?: string | null
  sexo: SexoAnimal
  dataNascimento?: string | null
  data_nascimento?: string | null
  peso?: number | string | null
  tutor?: string | null
  tutor_nome?: string | null
  tutorCpf?: string | null
  tutor_cpf?: string | null
}

const wait = () => new Promise((resolve) => setTimeout(resolve, MOCK_DELAY))

function readMockData(): Animal[] {
  const stored = localStorage.getItem(STORAGE_KEY)

  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(animaisIniciais))
    return [...animaisIniciais]
  }

  try {
    return (JSON.parse(stored) as Animal[]).map((animal) => ({
      ...animal,
      tutorCpf: animal.tutorCpf
        ?? animaisIniciais.find((initial) => initial.tutor === animal.tutor)?.tutorCpf
        ?? '',
    }))
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(animaisIniciais))
    return [...animaisIniciais]
  }
}

function writeMockData(animais: Animal[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(animais))
}

function normalizeAnimal(animal: AnimalApiResponse): Animal {
  const id = animal.id ?? animal.id_animal

  if (id === undefined) {
    throw new Error('A resposta da API não contém o identificador do animal.')
  }

  return {
    id,
    nome: animal.nome,
    especie: animal.especie,
    raca: animal.raca ?? '',
    sexo: animal.sexo,
    dataNascimento: animal.dataNascimento ?? animal.data_nascimento ?? '',
    peso: Number(animal.peso ?? 0),
    tutorCpf: animal.tutorCpf ?? animal.tutor_cpf ?? '',
    tutor: animal.tutor ?? animal.tutor_nome ?? 'Tutor não informado',
  }
}

function toApiPayload(animal: AnimalInput) {
  return {
    nome: animal.nome,
    especie: animal.especie,
    raca: animal.raca || null,
    sexo: animal.sexo,
    data_nascimento: animal.dataNascimento || null,
    peso: animal.peso,
    tutor_cpf: animal.tutorCpf,
  }
}

async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está ativo.')
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string } | null
    throw new Error(body?.message ?? `A operação falhou (erro ${response.status}).`)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const animalService = {
  async listar(): Promise<Animal[]> {
    if (USE_MOCK_API) {
      await wait()
      return readMockData()
    }

    const data = await apiRequest<AnimalApiResponse[]>('/animais')
    return data.map(normalizeAnimal)
  },

  async buscarPorId(id: number): Promise<Animal> {
    if (USE_MOCK_API) {
      await wait()
      const animal = readMockData().find((item) => item.id === id)
      if (!animal) throw new Error('Animal não encontrado.')
      return animal
    }

    return normalizeAnimal(await apiRequest<AnimalApiResponse>(`/animais/${id}`))
  },

  async criar(input: AnimalInput): Promise<Animal> {
    if (USE_MOCK_API) {
      await wait()
      const animais = readMockData()
      const novoAnimal: Animal = {
        ...input,
        id: animais.reduce((maior, animal) => Math.max(maior, animal.id), 0) + 1,
        tutor: animaisIniciais.find((animal) => animal.tutorCpf === input.tutorCpf)?.tutor ?? 'Tutor selecionado',
      }
      writeMockData([...animais, novoAnimal])
      return novoAnimal
    }

    const data = await apiRequest<AnimalApiResponse>('/animais', {
      method: 'POST',
      body: JSON.stringify(toApiPayload(input)),
    })
    return normalizeAnimal(data)
  },

  async atualizar(id: number, input: AnimalInput): Promise<Animal> {
    if (USE_MOCK_API) {
      await wait()
      const animais = readMockData()
      const index = animais.findIndex((animal) => animal.id === id)
      if (index === -1) throw new Error('Animal não encontrado.')

      const animalAtualizado: Animal = {
        ...input,
        id,
        tutor: animaisIniciais.find((animal) => animal.tutorCpf === input.tutorCpf)?.tutor ?? animais[index].tutor,
      }
      animais[index] = animalAtualizado
      writeMockData(animais)
      return animalAtualizado
    }

    const data = await apiRequest<AnimalApiResponse>(`/animais/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toApiPayload(input)),
    })
    return normalizeAnimal(data)
  },

  async excluir(id: number): Promise<void> {
    if (USE_MOCK_API) {
      await wait()
      const animais = readMockData()
      if (!animais.some((animal) => animal.id === id)) {
        throw new Error('Animal não encontrado.')
      }
      writeMockData(animais.filter((animal) => animal.id !== id))
      return
    }

    await apiRequest<void>(`/animais/${id}`, { method: 'DELETE' })
  },
}
