import { CrudPage, type FormValues } from '../components/CrudPage'
import { usuarioService } from '../services/usuarioService'
import type { Usuario, UsuarioInput } from '../types/Usuario'
import { formatarData } from '../utils/formatters'

const emptyValues: FormValues = {
  cpf: '', nome: '', email: '', senha: '', enderecoRua: '', enderecoNumero: '',
  enderecoBairro: '', enderecoCidade: '', enderecoCep: '', telefones: '',
}

const fields = [
  { name: 'cpf', label: 'CPF', required: true, disabledOnEdit: true, pattern: '\\d{11}', maxLength: 11, hint: 'Informe somente os 11 dígitos.' },
  { name: 'nome', label: 'Nome completo', required: true, maxLength: 100 },
  { name: 'email', label: 'E-mail', type: 'email' as const, required: true, maxLength: 100 },
  { name: 'senha', label: 'Senha', type: 'password' as const, required: true, optionalOnEdit: true, minLength: 6, hint: 'Na edição, deixe em branco para manter a senha atual.' },
  { name: 'enderecoRua', label: 'Rua', required: true, maxLength: 100, wide: true },
  { name: 'enderecoNumero', label: 'Número', required: true, maxLength: 10 },
  { name: 'enderecoBairro', label: 'Bairro', required: true, maxLength: 60 },
  { name: 'enderecoCidade', label: 'Cidade', required: true, maxLength: 60 },
  { name: 'enderecoCep', label: 'CEP', required: true, maxLength: 10 },
  { name: 'telefones', label: 'Telefones', type: 'tel' as const, wide: true, hint: 'Separe mais de um telefone por vírgula.' },
]

function perfis(usuario: Usuario) {
  const values = [usuario.tutor && 'Tutor', usuario.funcionario && 'Funcionário', usuario.veterinario && 'Veterinário'].filter(Boolean)
  return values.length ? values.join(', ') : 'Usuário'
}

function toInput(values: FormValues): UsuarioInput {
  return {
    cpf: values.cpf.trim(), nome: values.nome.trim(), email: values.email.trim(), senha: values.senha,
    enderecoRua: values.enderecoRua.trim(), enderecoNumero: values.enderecoNumero.trim(),
    enderecoBairro: values.enderecoBairro.trim(), enderecoCidade: values.enderecoCidade.trim(),
    enderecoCep: values.enderecoCep.trim(),
    telefones: values.telefones.split(',').map((telefone) => telefone.trim()).filter(Boolean),
  }
}

export function UsuariosPage() {
  return <CrudPage<Usuario, UsuarioInput, string>
    title="Usuários"
    description="Gerencie os dados pessoais e de acesso cadastrados no hospital."
    singular="Usuário"
    searchPlaceholder="Buscar por nome, CPF, e-mail ou perfil..."
    service={usuarioService}
    getId={(item) => item.cpf}
    getLabel={(item) => item.nome}
    columns={[
      { label: 'Nome', render: (item) => <><strong>{item.nome}</strong><small>{item.cpf}</small></>, searchValue: (item) => `${item.nome} ${item.cpf}` },
      { label: 'E-mail', render: (item) => item.email, searchValue: (item) => item.email },
      { label: 'Perfil', render: perfis, searchValue: perfis },
      { label: 'Cidade', render: (item) => item.enderecoCidade, searchValue: (item) => item.enderecoCidade },
      { label: 'Cadastro', render: (item) => formatarData(item.dataCadastro) },
    ]}
    details={[
      { label: 'CPF', render: (item) => item.cpf }, { label: 'Nome', render: (item) => item.nome },
      { label: 'E-mail', render: (item) => item.email }, { label: 'Perfis', render: perfis },
      { label: 'Endereço', render: (item) => `${item.enderecoRua}, ${item.enderecoNumero} — ${item.enderecoBairro}` },
      { label: 'Cidade / CEP', render: (item) => `${item.enderecoCidade} — ${item.enderecoCep}` },
      { label: 'Telefones', render: (item) => item.telefones.join(', ') }, { label: 'Cadastro', render: (item) => formatarData(item.dataCadastro) },
    ]}
    fields={fields}
    emptyValues={emptyValues}
    toFormValues={(item) => ({ ...item, senha: '', telefones: item.telefones.join(', ') } as unknown as FormValues)}
    toInput={toInput}
  />
}
