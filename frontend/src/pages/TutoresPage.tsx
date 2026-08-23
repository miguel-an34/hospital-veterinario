import { CrudPage, type FormValues } from '../components/CrudPage'
import { tutorService } from '../services/tutorService'
import type { Tutor, TutorInput } from '../types/Tutor'
import { formatarData } from '../utils/formatters'

const tutorCrudService = {
  listar: () => tutorService.listarCompleto(),
  criar: tutorService.criar,
  atualizar: tutorService.atualizar,
  excluir: tutorService.excluir,
}

const emptyValues: FormValues = {
  cpf: '', nome: '', email: '', senha: '', enderecoRua: '', enderecoNumero: '',
  enderecoBairro: '', enderecoCidade: '', enderecoCep: '', telefones: '',
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
]

function toInput(values: FormValues): TutorInput {
  return {
    cpf: values.cpf.trim(), nome: values.nome.trim(), email: values.email.trim(), senha: values.senha,
    enderecoRua: values.enderecoRua.trim(), enderecoNumero: values.enderecoNumero.trim(),
    enderecoBairro: values.enderecoBairro.trim(), enderecoCidade: values.enderecoCidade.trim(),
    enderecoCep: values.enderecoCep.trim(), telefones: values.telefones.split(',').map((telefone) => telefone.trim()).filter(Boolean),
  }
}

export function TutoresPage() {
  return <CrudPage<Tutor, TutorInput, string>
    title="Tutores"
    description="Gerencie responsáveis, contatos e endereços dos pacientes."
    singular="Tutor"
    searchPlaceholder="Buscar por nome, CPF, e-mail ou cidade..."
    service={tutorCrudService}
    getId={(item) => item.cpf}
    getLabel={(item) => item.nome}
    columns={[
      { label: 'Tutor', render: (item) => <><strong>{item.nome}</strong><small>{item.cpf}</small></>, searchValue: (item) => `${item.nome} ${item.cpf}` },
      { label: 'E-mail', render: (item) => item.email, searchValue: (item) => item.email },
      { label: 'Telefone', render: (item) => item.telefones[0] ?? '—', searchValue: (item) => item.telefones.join(' ') },
      { label: 'Cidade', render: (item) => item.enderecoCidade, searchValue: (item) => item.enderecoCidade },
      { label: 'Cadastro', render: (item) => formatarData(item.dataCadastro) },
    ]}
    details={[
      { label: 'CPF', render: (item) => item.cpf }, { label: 'Nome', render: (item) => item.nome },
      { label: 'E-mail', render: (item) => item.email }, { label: 'Telefones', render: (item) => item.telefones.join(', ') },
      { label: 'Endereço', render: (item) => `${item.enderecoRua}, ${item.enderecoNumero} — ${item.enderecoBairro}` },
      { label: 'Cidade / CEP', render: (item) => `${item.enderecoCidade} — ${item.enderecoCep}` },
      { label: 'Cadastro', render: (item) => formatarData(item.dataCadastro) },
    ]}
    fields={fields}
    emptyValues={emptyValues}
    toFormValues={(item) => ({ ...item, senha: '', telefones: item.telefones.join(', ') } as unknown as FormValues)}
    toInput={toInput}
    canCreate={false}
  />
}
