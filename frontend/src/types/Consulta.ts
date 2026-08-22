export interface Consulta {
  id: number
  observacoes: string | null
  status: string
  animalId: number
  animal: string
  veterinarioCpf: string
  veterinario: string
  agendamentoId: number | null
}

export interface ConsultaInput {
  observacoes: string
  status: string
  animalId: number
  veterinarioCpf: string
  agendamentoId: number | null
}
