export interface Consulta {
  id: number
  dataHora: string
  observacoes: string | null
  status: string
  animalId: number
  animal: string
  veterinarioCpf: string
  veterinario: string
  agendamentoId: number | null
}

export interface ConsultaInput {
  dataHora: string
  observacoes: string
  status: string
  animalId: number
  veterinarioCpf: string
  agendamentoId: number | null
}
