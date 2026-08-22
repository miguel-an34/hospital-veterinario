export interface TutorSummary {
  cpf: string
  nome: string
  email: string
}

export interface Tutor extends TutorSummary {
  dataCadastro: string
  enderecoRua: string
  enderecoNumero: string
  enderecoBairro: string
  enderecoCidade: string
  enderecoCep: string
  telefones: string[]
}

export interface TutorInput {
  cpf: string
  nome: string
  email: string
  senha: string
  enderecoRua: string
  enderecoNumero: string
  enderecoBairro: string
  enderecoCidade: string
  enderecoCep: string
  telefones: string[]
}
