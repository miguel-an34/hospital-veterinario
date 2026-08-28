export interface HistoricoClinico {
  paciente: string
  especie: string
  dataAtendimento: string
  diagnostico: string
  veterinarioResponsavel: string
}

export interface AtendimentoPorProfissional {
  veterinarioCpf: string
  profissional: string
  ano: number
  mes: number
  quantidadeAtendimentos: number
  faturamentoTotal: number
}

export interface HistoricoPorPaciente {
  idConsulta: number
  idAnimal: number
  paciente: string
  especie: string
  raca: string | null
  sexo: string
  peso: number | null
  dataNascimento: string | null
  tutorCpf: string | null
  tutor: string | null
  veterinarioCpf: string
  veterinario: string
  dataConsulta: string
  status: string
  observacoes: string | null
  diagnostico: string | null
}

export interface InternacaoAtiva {
  leito: string
  paciente: string
  dataEntrada: string
  tutorResponsavel: string
  observacoes: string | null
}

export interface AgendaDiaria {
  horario: string
  motivo: string
  paciente: string
  tutor: string
}

export interface ExameRelatorio {
  idExame: number
  tipo: string
  resultado: string | null
  observacoes: string | null
  dataSolicitacao: string
  dataResultado: string | null
  idConsulta: number
  idAnimal: number
  paciente: string
  veterinario: string
}

export type TipoRelatorio = 'atendimentos' | 'historico' | 'internacoes' | 'exames' | 'agenda-diaria'
