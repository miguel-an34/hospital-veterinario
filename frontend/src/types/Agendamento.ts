export interface Agendamento {
  id: number
  data: string
  horario: string
  motivo: string
  tutorCpf: string
  tutor: string
  animalId: number
  animal: string
}

export type AgendamentoInput = Omit<Agendamento, 'id' | 'tutor' | 'animal'>
