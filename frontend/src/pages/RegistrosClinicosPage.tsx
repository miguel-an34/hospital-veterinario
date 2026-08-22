import { useEffect, useMemo, useState } from 'react'
import { CrudPage, type FormValues, type SelectOption } from '../components/CrudPage'
import { consultaService } from '../services/consultaService'
import { registroClinicoService } from '../services/registroClinicoService'
import type { RegistroClinico, RegistroClinicoInput } from '../types/RegistroClinico'
import { formatarData } from '../utils/formatters'

export function RegistrosClinicosPage() {
  const [consultas, setConsultas] = useState<SelectOption[]>([])

  useEffect(() => {
    consultaService.listar().then((data) => setConsultas(data.map((item) => ({
      value: String(item.id), label: `Consulta #${item.id} — ${item.animal} — ${item.status}`,
    })))).catch(() => undefined)
  }, [])

  const fields = useMemo(() => [
    { name: 'consultaId', label: 'Consulta', type: 'select' as const, required: true, options: consultas },
    { name: 'dataRegistro', label: 'Data do registro', type: 'date' as const, required: true, max: new Date().toISOString().slice(0, 10) },
    { name: 'descricao', label: 'Descrição clínica', type: 'textarea' as const, required: true, wide: true, hint: 'Registre diagnóstico, conduta e evolução do paciente.' },
  ], [consultas])

  return <CrudPage<RegistroClinico, RegistroClinicoInput, number>
    eyebrow="Prontuários"
    title="Registros clínicos"
    description="Mantenha diagnósticos e evoluções vinculados às consultas realizadas."
    singular="Registro clínico"
    searchPlaceholder="Buscar por paciente, descrição, consulta ou data..."
    service={registroClinicoService}
    getId={(item) => item.id}
    getLabel={(item) => `Registro #${item.id}`}
    columns={[
      { label: 'Registro', render: (item) => <><strong>#{item.id}</strong><small>{formatarData(item.dataRegistro)}</small></>, searchValue: (item) => `${item.id} ${item.dataRegistro}` },
      { label: 'Paciente', render: (item) => item.paciente, searchValue: (item) => item.paciente },
      { label: 'Consulta', render: (item) => `#${item.consultaId}` },
      { label: 'Descrição', render: (item) => item.descricao, searchValue: (item) => item.descricao },
    ]}
    details={[
      { label: 'Código', render: (item) => `#${item.id}` }, { label: 'Data', render: (item) => formatarData(item.dataRegistro) },
      { label: 'Paciente', render: (item) => item.paciente }, { label: 'Consulta', render: (item) => `#${item.consultaId}` },
      { label: 'Descrição clínica', render: (item) => item.descricao },
    ]}
    fields={fields}
    emptyValues={{ consultaId: '', dataRegistro: new Date().toISOString().slice(0, 10), descricao: '' }}
    toFormValues={(item) => ({ consultaId: String(item.consultaId), dataRegistro: item.dataRegistro, descricao: item.descricao })}
    toInput={(values: FormValues) => ({ consultaId: Number(values.consultaId), dataRegistro: values.dataRegistro, descricao: values.descricao.trim() })}
  />
}
