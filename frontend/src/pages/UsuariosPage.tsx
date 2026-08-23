import { CrudPage, type FormValues } from '../components/CrudPage'
import { usuarioService } from '../services/usuarioService'
import type { Usuario, UsuarioInput } from '../types/Usuario'
import { formatarData } from '../utils/formatters'

const emptyValues: FormValues = {
  cpf: '', nome: '', email: '', senha: '', enderecoRua: '', enderecoNumero: '',
  enderecoBairro: '', enderecoCidade: '', enderecoCep: '', telefones: '', perfil: 'tutor',
  matricula: '', cargo: '', salario: '', dataAdmissao: '', veterinario: 'false', crmv: '', especialidade: '',
}

const hoje = new Date().toISOString().slice(0, 10)
const perfilFuncionario = { field: 'perfil', values: ['funcionario', 'ambos'] }

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
  {
    name: 'perfil', label: 'Perfil do usuário', type: 'select' as const, required: true, wide: true,
    options: [
      { value: 'tutor', label: 'Tutor' },
      { value: 'funcionario', label: 'Funcionário' },
      { value: 'ambos', label: 'Tutor e funcionário' },
    ],
  },
  { name: 'matricula', label: 'Matrícula', required: true, maxLength: 20, showWhen: perfilFuncionario },
  { name: 'cargo', label: 'Cargo', required: true, maxLength: 50, showWhen: perfilFuncionario },
  { name: 'salario', label: 'Salário', type: 'number' as const, required: true, min: '0', step: '0.01', showWhen: perfilFuncionario },
  { name: 'dataAdmissao', label: 'Data de admissão', type: 'date' as const, required: true, max: hoje, showWhen: perfilFuncionario },
  {
    name: 'veterinario', label: 'Atuação clínica', type: 'select' as const, required: true, wide: true,
    options: [{ value: 'false', label: 'Não é veterinário' }, { value: 'true', label: 'É veterinário' }],
    showWhen: perfilFuncionario,
  },
  { name: 'crmv', label: 'CRMV', required: true, maxLength: 20, showWhen: [perfilFuncionario, { field: 'veterinario', value: 'true' }] },
  { name: 'especialidade', label: 'Especialidade', maxLength: 60, showWhen: [perfilFuncionario, { field: 'veterinario', value: 'true' }] },
]

function perfis(usuario: Usuario) {
  const values = [usuario.tutor && 'Tutor', usuario.funcionario && 'Funcionário', usuario.veterinario && 'Veterinário'].filter(Boolean)
  return values.length ? values.join(', ') : 'Usuário'
}

function toInput(values: FormValues): UsuarioInput {
  const tutor = values.perfil === 'tutor' || values.perfil === 'ambos'
  const funcionario = values.perfil === 'funcionario' || values.perfil === 'ambos'
  const veterinario = funcionario && values.veterinario === 'true'
  return {
    cpf: values.cpf.trim(), nome: values.nome.trim(), email: values.email.trim(), senha: values.senha,
    enderecoRua: values.enderecoRua.trim(), enderecoNumero: values.enderecoNumero.trim(),
    enderecoBairro: values.enderecoBairro.trim(), enderecoCidade: values.enderecoCidade.trim(),
    enderecoCep: values.enderecoCep.trim(),
    telefones: values.telefones.split(',').map((telefone) => telefone.trim()).filter(Boolean),
    tutor, funcionario,
    matricula: funcionario ? values.matricula.trim() : null,
    cargo: funcionario ? values.cargo.trim() : null,
    salario: funcionario ? Number(values.salario) : null,
    dataAdmissao: funcionario ? values.dataAdmissao : null,
    veterinario,
    crmv: veterinario ? values.crmv.trim() : null,
    especialidade: veterinario ? values.especialidade.trim() : null,
  }
}

function toFormValues(item: Usuario): FormValues {
  const perfil = item.tutor && item.funcionario ? 'ambos' : item.funcionario ? 'funcionario' : 'tutor'
  return {
    cpf: item.cpf, nome: item.nome, email: item.email, senha: '', enderecoRua: item.enderecoRua,
    enderecoNumero: item.enderecoNumero, enderecoBairro: item.enderecoBairro,
    enderecoCidade: item.enderecoCidade, enderecoCep: item.enderecoCep,
    telefones: item.telefones.join(', '), perfil, matricula: item.matricula ?? '',
    cargo: item.cargo ?? '', salario: item.salario == null ? '' : String(item.salario),
    dataAdmissao: item.dataAdmissao ?? '', veterinario: String(item.veterinario),
    crmv: item.crmv ?? '', especialidade: item.especialidade ?? '',
  }
}

export function UsuariosPage() {
  return <CrudPage<Usuario, UsuarioInput, string>
    title="Usuários"
    description="Cadastre pessoas e defina seus perfis de tutor, funcionário ou veterinário."
    singular="Usuário"
    searchPlaceholder="Buscar por nome, CPF, e-mail, perfil, matrícula ou cargo..."
    service={usuarioService}
    getId={(item) => item.cpf}
    getLabel={(item) => item.nome}
    columns={[
      { label: 'Nome', render: (item) => <><strong>{item.nome}</strong><small>{item.cpf}</small></>, searchValue: (item) => `${item.nome} ${item.cpf}` },
      { label: 'E-mail', render: (item) => item.email, searchValue: (item) => item.email },
      { label: 'Perfil', render: perfis, searchValue: (item) => `${perfis(item)} ${item.matricula ?? ''} ${item.cargo ?? ''} ${item.crmv ?? ''}` },
      { label: 'Cidade', render: (item) => item.enderecoCidade, searchValue: (item) => item.enderecoCidade },
      { label: 'Cadastro', render: (item) => formatarData(item.dataCadastro) },
    ]}
    details={[
      { label: 'CPF', render: (item) => item.cpf }, { label: 'Nome', render: (item) => item.nome },
      { label: 'E-mail', render: (item) => item.email }, { label: 'Perfis', render: perfis },
      { label: 'Endereço', render: (item) => `${item.enderecoRua}, ${item.enderecoNumero} — ${item.enderecoBairro}` },
      { label: 'Cidade / CEP', render: (item) => `${item.enderecoCidade} — ${item.enderecoCep}` },
      { label: 'Telefones', render: (item) => item.telefones.join(', ') }, { label: 'Cadastro', render: (item) => formatarData(item.dataCadastro) },
      { label: 'Matrícula / Cargo', render: (item) => item.funcionario ? `${item.matricula} — ${item.cargo}` : null },
      { label: 'CRMV / Especialidade', render: (item) => item.veterinario ? `${item.crmv}${item.especialidade ? ` — ${item.especialidade}` : ''}` : null },
    ]}
    fields={fields}
    emptyValues={emptyValues}
    toFormValues={toFormValues}
    toInput={toInput}
  />
}
