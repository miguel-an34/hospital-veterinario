export interface Exame {
  id: number
  tipo: string
  resultado: string | null
  observacoes: string | null
  dataSolicitacao: string
  dataResultado: string | null
  consultaId: number
  paciente: string
}

export interface ExameInput {
  tipo: string
  resultado: string | null
  observacoes: string | null
  dataSolicitacao: string
  dataResultado: string | null
  consultaId: number
}
