export type SexoAnimal = 'M' | 'F'

export interface Animal {
  id: number
  nome: string
  especie: string
  raca: string
  sexo: SexoAnimal
  dataNascimento: string
  peso: number
  tutorCpf: string
  tutor: string
}

export type AnimalInput = Omit<Animal, 'id' | 'tutor'>
