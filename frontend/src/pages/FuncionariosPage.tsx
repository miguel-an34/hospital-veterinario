import { CrudPage, type FormValues } from '../components/CrudPage'
import { funcionarioService } from '../services/funcionarioService'
import type { Funcionario, FuncionarioInput } from '../types/Funcionario'
import { formatarData } from '../utils/formatters'

const hoje = new Date().toISOString().slice(0, 10)

const emptyValues: FormValues = {
  cpf: '', nome: '', email: '', senha: '', enderecoRua: '', enderecoNumero: '',
  enderecoBairro: '', enderecoCidade: '', enderecoCep: '', telefones: '',
  matricula: '', cargo: '', salario: '', dataAdmissao: '', veterinario: 'false',
  crmv: '', especialidade: '',
}

const fields = [
  { name: 'cpf', label: 'CPF', required: true, disabledOnEdit: true, pattern: '\\d{11}', maxLength: 11, hint: 'Informe somente os 11 dígitos.' },
  { name: 'nome', label: 'Nome completo', required: true, maxLength: 100 },
  { name: 'email', label: 'E-mail', type: 'email' as const, required: true, maxLength: 100 },
  { name: 'senha', label: 'Senha', type: 'password' as const, required: true, optionalOnEdit: true, minLength: 6, hint: 'Mínimo de 6 caracteres. Na edição, deixe em branco para manter.' },
  { name: 'enderecoRua', label: 'Rua', required: true, maxLength: 100, wide: true },
  { name: 'enderecoNumero', label: 'Número', required: true, maxLength: 10 },
  { name: 'enderecoBairro', label: 'Bairro', required: true, maxLength: 60 },
  { name: 'enderecoCidade', label: 'Cidade', required: true, maxLength: 60 },
  { name: 'enderecoCep', label: 'CEP', required: true, maxLength: 10 },
  { name: 'telefones', label: 'Telefones', type: 'tel' as const, wide: true, hint: 'Separe mais de um telefone por vírgula.' },
  { name: 'matricula', label: 'Matrícula', required: true, maxLength: 20 },
  { name: 'cargo', label: 'Cargo', required: true, maxLength: 50 },
  { name: 'salario', label: 'Salário', type: 'number' as const, required: true, min: '0', step: '0.01' },
  { name: 'dataAdmissao', label: 'Data de admissão', type: 'date' as const, required: true, max: hoje },
  {
    name: 'veterinario', label: 'Vínculo profissional', type: 'select' as const, required: true, wide: true,
    options: [{ value: 'false', label: 'Funcionário' }, { value: 'true', label: 'Veterinário' }],
  },
  { name: 'crmv', label: 'CRMV', required: true, maxLength: 20, showWhen: { field: 'veterinario', value: 'true' } },
  { name: 'especialidade', label: 'Especialidade', maxLength: 60, showWhen: { field: 'veterinario', value: 'true' } },
]

function formatarSalario(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function toInput(values: FormValues): FuncionarioInput {
  return {
    cpf: values.cpf.trim(), nome: values.nome.trim(), email: values.email.trim(), senha: values.senha,
    enderecoRua: values.enderecoRua.trim(), enderecoNumero: values.enderecoNumero.trim(),
    enderecoBairro: values.enderecoBairro.trim(), enderecoCidade: values.enderecoCidade.trim(),
    enderecoCep: values.enderecoCep.trim(),
    telefones: values.telefones.split(',').map((telefone) => telefone.trim()).filter(Boolean),
    matricula: values.matricula.trim(), cargo: values.cargo.trim(), salario: Number(values.salario),
    dataAdmissao: values.dataAdmissao, veterinario: values.veterinario === 'true',
    crmv: values.crmv.trim(), especialidade: values.especialidade.trim(),
  }
}

function toFormValues(item: Funcionario): FormValues {
  return {
    cpf: item.cpf, nome: item.nome, email: item.email, senha: '', enderecoRua: item.enderecoRua,
    enderecoNumero: item.enderecoNumero, enderecoBairro: item.enderecoBairro,
    enderecoCidade: item.enderecoCidade, enderecoCep: item.enderecoCep,
    telefones: item.telefones.join(', '), matricula: item.matricula, cargo: item.cargo,
    salario: String(item.salario), dataAdmissao: item.dataAdmissao,
    veterinario: String(item.veterinario), crmv: item.crmv ?? '', especialidade: item.especialidade ?? '',
  }
}

export function FuncionariosPage() {
  return <CrudPage<Funcionario, FuncionarioInput, string>
    title="Funcionários"
    description="Gerencie os dados pessoais, profissionais e vínculos veterinários da equipe."
    singular="Funcionário"
    searchPlaceholder="Buscar por nome, CPF, matrícula, cargo ou CRMV..."
    service={funcionarioService}
    getId={(item) => item.cpf}
    getLabel={(item) => item.nome}
    columns={[
      { label: 'Funcionário', render: (item) => <><strong>{item.nome}</strong><small>{item.cpf}</small></>, searchValue: (item) => `${item.nome} ${item.cpf}` },
      { label: 'Matrícula', render: (item) => item.matricula, searchValue: (item) => item.matricula },
      { label: 'Cargo', render: (item) => item.cargo, searchValue: (item) => item.cargo },
      { label: 'Vínculo', render: (item) => item.veterinario ? `Veterinário · ${item.crmv}` : 'Funcionário', searchValue: (item) => `${item.veterinario ? 'Veterinário' : 'Funcionário'} ${item.crmv ?? ''}` },
      { label: 'Admissão', render: (item) => formatarData(item.dataAdmissao) },
    ]}
    details={[
      { label: 'CPF', render: (item) => item.cpf }, { label: 'Nome', render: (item) => item.nome },
      { label: 'E-mail', render: (item) => item.email }, { label: 'Telefones', render: (item) => item.telefones.join(', ') },
      { label: 'Matrícula', render: (item) => item.matricula }, { label: 'Cargo', render: (item) => item.cargo },
      { label: 'Salário', render: (item) => formatarSalario(item.salario) },
      { label: 'Data de admissão', render: (item) => formatarData(item.dataAdmissao) },
      { label: 'Vínculo', render: (item) => item.veterinario ? 'Veterinário' : 'Funcionário' },
      { label: 'CRMV', render: (item) => item.crmv }, { label: 'Especialidade', render: (item) => item.especialidade },
      { label: 'Endereço', render: (item) => `${item.enderecoRua}, ${item.enderecoNumero} — ${item.enderecoBairro}` },
      { label: 'Cidade / CEP', render: (item) => `${item.enderecoCidade} — ${item.enderecoCep}` },
      { label: 'Cadastro', render: (item) => formatarData(item.dataCadastro) },
    ]}
    fields={fields}
    emptyValues={emptyValues}
    toFormValues={toFormValues}
    toInput={toInput}
    canCreate={false}
  />
}
