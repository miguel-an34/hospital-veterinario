export interface RegistroClinico {
  id: number
  descricao: string
  dataRegistro: string
  consultaId: number
  paciente: string
}

export type RegistroClinicoInput = Omit<RegistroClinico, 'id' | 'paciente'>
