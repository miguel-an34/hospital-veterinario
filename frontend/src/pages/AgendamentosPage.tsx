import { useEffect, useMemo, useState } from 'react'
import { CrudPage, type FormValues, type SelectOption } from '../components/CrudPage'
import { agendamentoService } from '../services/agendamentoService'
import { animalService } from '../services/animalService'
import { tutorService } from '../services/tutorService'
import type { Agendamento, AgendamentoInput } from '../types/Agendamento'
import { formatarData } from '../utils/formatters'

function formatarHorario(value: string) {
  return value ? value.slice(0, 5) : '—'
}

export function AgendamentosPage() {
  const [animais, setAnimais] = useState<SelectOption[]>([])
  const [tutores, setTutores] = useState<SelectOption[]>([])

  useEffect(() => {
    Promise.all([animalService.listar(), tutorService.listar()]).then(([animalData, tutorData]) => {
      setAnimais(animalData.map((animal) => ({ value: String(animal.id), label: `${animal.nome} — ${animal.especie}` })))
      setTutores(tutorData.map((tutor) => ({ value: tutor.cpf, label: `${tutor.nome} — ${tutor.cpf}` })))
    }).catch(() => undefined)
  }, [])

  const fields = useMemo(() => [
    { name: 'data', label: 'Data', type: 'date' as const, required: true },
    { name: 'horario', label: 'Horário', type: 'time' as const, required: true },
    { name: 'motivo', label: 'Motivo', type: 'textarea' as const, required: true, maxLength: 200, wide: true },
    { name: 'tutorCpf', label: 'Tutor responsável', type: 'select' as const, required: true, options: tutores },
    { name: 'animalId', label: 'Paciente', type: 'select' as const, required: true, options: animais },
  ], [animais, tutores])

  return <CrudPage<Agendamento, AgendamentoInput, number>
    title="Agendamentos"
    description="Organize os atendimentos previstos para os pacientes do hospital."
    singular="Agendamento"
    searchPlaceholder="Buscar por paciente, tutor, motivo ou data..."
    service={agendamentoService}
    getId={(item) => item.id}
    getLabel={(item) => `Agendamento #${item.id}`}
    columns={[
      { label: 'Data / horário', render: (item) => <><strong>{formatarData(item.data)}</strong><small>{formatarHorario(item.horario)}</small></>, searchValue: (item) => `${item.data} ${item.horario}` },
      { label: 'Paciente', render: (item) => item.animal, searchValue: (item) => item.animal },
      { label: 'Tutor', render: (item) => item.tutor, searchValue: (item) => item.tutor },
      { label: 'Motivo', render: (item) => item.motivo, searchValue: (item) => item.motivo },
    ]}
    details={[
      { label: 'Código', render: (item) => `#${item.id}` }, { label: 'Data', render: (item) => formatarData(item.data) },
      { label: 'Horário', render: (item) => formatarHorario(item.horario) }, { label: 'Motivo', render: (item) => item.motivo },
      { label: 'Paciente', render: (item) => `${item.animal} (#${item.animalId})` }, { label: 'Tutor', render: (item) => `${item.tutor} (${item.tutorCpf})` },
    ]}
    fields={fields}
    emptyValues={{ data: new Date().toISOString().slice(0, 10), horario: '', motivo: '', tutorCpf: '', animalId: '' }}
    toFormValues={(item) => ({ data: item.data, horario: item.horario.slice(0, 5), motivo: item.motivo, tutorCpf: item.tutorCpf, animalId: String(item.animalId) })}
    toInput={(values: FormValues) => ({ data: values.data, horario: values.horario, motivo: values.motivo.trim(), tutorCpf: values.tutorCpf, animalId: Number(values.animalId) })}
  />
}
