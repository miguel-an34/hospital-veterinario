export interface HistoricoClinico {
  paciente: string
  especie: string
  dataAtendimento: string
  diagnostico: string
  veterinarioResponsavel: string
}

export interface InternacaoAtiva {
  leito: string
  paciente: string
  dataEntrada: string
  tutorResponsavel: string
  observacoes: string
}

export interface AgendaDiaria {
  horario: string
  motivo: string
  paciente: string
  tutor: string
}