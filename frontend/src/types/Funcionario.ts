export interface Funcionario {
  cpf: string
  nome: string
  email: string
  dataCadastro: string
  enderecoRua: string
  enderecoNumero: string
  enderecoBairro: string
  enderecoCidade: string
  enderecoCep: string
  telefones: string[]
  matricula: string
  cargo: string
  salario: number
  dataAdmissao: string
  veterinario: boolean
  crmv: string | null
  especialidade: string | null
}

export interface FuncionarioInput {
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
  matricula: string
  cargo: string
  salario: number
  dataAdmissao: string
  veterinario: boolean
  crmv: string
  especialidade: string
}
