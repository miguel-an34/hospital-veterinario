import { useEffect, useMemo, useState } from 'react'
import { CrudPage, type FormValues, type SelectOption } from '../components/CrudPage'
import { agendamentoService } from '../services/agendamentoService'
import { animalService } from '../services/animalService'
import { consultaService } from '../services/consultaService'
import { veterinarioService } from '../services/veterinarioService'
import type { Consulta, ConsultaInput } from '../types/Consulta'
import { agoraParaInputDataHora, formatarDataHora } from '../utils/formatters'

export function ConsultasPage() {
  const [animais, setAnimais] = useState<SelectOption[]>([])
  const [veterinarios, setVeterinarios] = useState<SelectOption[]>([])
  const [agendamentos, setAgendamentos] = useState<SelectOption[]>([])

  useEffect(() => {
    Promise.all([animalService.listar(), veterinarioService.listar(), agendamentoService.listar()])
      .then(([animalData, veterinarioData, agendamentoData]) => {
        setAnimais(animalData.map((animal) => ({ value: String(animal.id), label: `${animal.nome} — ${animal.especie}` })))
        setVeterinarios(veterinarioData.map((vet) => ({ value: vet.cpf, label: `${vet.nome} — CRMV ${vet.crmv}` })))
        setAgendamentos(agendamentoData.map((item) => ({ value: String(item.id), label: `#${item.id} — ${item.animal} — ${item.data}` })))
      }).catch(() => undefined)
  }, [])

  const fields = useMemo(() => [
    { name: 'dataHora', label: 'Data e hora', type: 'datetime-local' as const, required: true },
    { name: 'status', label: 'Status', type: 'select' as const, required: true, options: [
      { value: 'Agendada', label: 'Agendada' }, { value: 'Em andamento', label: 'Em andamento' },
      { value: 'Concluída', label: 'Concluída' }, { value: 'Cancelada', label: 'Cancelada' },
    ] },
    { name: 'animalId', label: 'Paciente', type: 'select' as const, required: true, options: animais },
    { name: 'veterinarioCpf', label: 'Veterinário', type: 'select' as const, required: true, options: veterinarios },
    { name: 'agendamentoId', label: 'Agendamento relacionado', type: 'select' as const, options: agendamentos, hint: 'Opcional.' },
    { name: 'observacoes', label: 'Observações', type: 'textarea' as const, wide: true },
  ], [agendamentos, animais, veterinarios])

  return <CrudPage<Consulta, ConsultaInput, number>
    title="Consultas"
    description="Registre atendimentos, responsáveis e situação clínica dos pacientes."
    singular="Consulta"
    searchPlaceholder="Buscar por paciente, veterinário, status ou observação..."
    service={consultaService}
    getId={(item) => item.id}
    getLabel={(item) => `Consulta #${item.id}`}
    columns={[
      { label: 'Consulta', render: (item) => <><strong>#{item.id}</strong><small>{item.status}</small></>, searchValue: (item) => `${item.id} ${item.status}` },
      { label: 'Data e hora', render: (item) => formatarDataHora(item.dataHora), searchValue: (item) => item.dataHora },
      { label: 'Paciente', render: (item) => item.animal, searchValue: (item) => item.animal },
      { label: 'Veterinário', render: (item) => item.veterinario, searchValue: (item) => item.veterinario },
      { label: 'Agendamento', render: (item) => item.agendamentoId ? `#${item.agendamentoId}` : 'Sem vínculo' },
      { label: 'Observações', render: (item) => item.observacoes || '—', searchValue: (item) => item.observacoes ?? '' },
    ]}
    details={[
      { label: 'Código', render: (item) => `#${item.id}` }, { label: 'Status', render: (item) => item.status },
      { label: 'Data e hora', render: (item) => formatarDataHora(item.dataHora) },
      { label: 'Paciente', render: (item) => `${item.animal} (#${item.animalId})` },
      { label: 'Veterinário', render: (item) => `${item.veterinario} (${item.veterinarioCpf})` },
      { label: 'Agendamento', render: (item) => item.agendamentoId ? `#${item.agendamentoId}` : 'Sem vínculo' },
      { label: 'Observações', render: (item) => item.observacoes || 'Sem observações' },
    ]}
    fields={fields}
    emptyValues={{ dataHora: agoraParaInputDataHora(), observacoes: '', status: 'Agendada', animalId: '', veterinarioCpf: '', agendamentoId: '' }}
    toFormValues={(item) => ({ dataHora: item.dataHora.slice(0, 16), observacoes: item.observacoes ?? '', status: item.status, animalId: String(item.animalId), veterinarioCpf: item.veterinarioCpf, agendamentoId: item.agendamentoId ? String(item.agendamentoId) : '' })}
    toInput={(values: FormValues) => ({ dataHora: values.dataHora, observacoes: values.observacoes.trim(), status: values.status, animalId: Number(values.animalId), veterinarioCpf: values.veterinarioCpf, agendamentoId: values.agendamentoId ? Number(values.agendamentoId) : null })}
  />
}
