export interface Usuario {
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
  tutor: boolean
  funcionario: boolean
  veterinario: boolean
}

export interface UsuarioInput {
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
