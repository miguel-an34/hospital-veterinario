import { useEffect, useMemo, useState } from 'react'
import { CrudPage, type FormValues, type SelectOption } from '../components/CrudPage'
import { consultaService } from '../services/consultaService'
import { exameService } from '../services/exameService'
import type { Exame, ExameInput } from '../types/Exame'
import { formatarData } from '../utils/formatters'

export function ExamesPage() {
  const [consultas, setConsultas] = useState<SelectOption[]>([])

  useEffect(() => {
    consultaService.listar().then((data) => setConsultas(data.map((item) => ({
      value: String(item.id), label: `Consulta #${item.id} — ${item.animal}`,
    })))).catch(() => undefined)
  }, [])

  const fields = useMemo(() => [
    { name: 'tipo', label: 'Tipo de exame', required: true, maxLength: 60, placeholder: 'Ex.: Hemograma' },
    { name: 'consultaId', label: 'Consulta', type: 'select' as const, required: true, options: consultas },
    { name: 'dataSolicitacao', label: 'Data da solicitação', type: 'date' as const, required: true },
    { name: 'dataResultado', label: 'Data do resultado', type: 'date' as const, hint: 'Opcional enquanto o exame estiver pendente.' },
    { name: 'resultado', label: 'Resultado', type: 'textarea' as const, maxLength: 200, wide: true },
    { name: 'observacoes', label: 'Observações', type: 'textarea' as const, wide: true },
  ], [consultas])

  return <CrudPage<Exame, ExameInput, number>
    title="Exames"
    description="Controle solicitações, resultados e observações de exames clínicos."
    singular="Exame"
    searchPlaceholder="Buscar por tipo, paciente, resultado ou consulta..."
    service={exameService}
    getId={(item) => item.id}
    getLabel={(item) => `${item.tipo} #${item.id}`}
    columns={[
      { label: 'Exame', render: (item) => <><strong>{item.tipo}</strong><small>ID #{item.id}</small></>, searchValue: (item) => `${item.tipo} ${item.id}` },
      { label: 'Paciente', render: (item) => item.paciente, searchValue: (item) => item.paciente },
      { label: 'Solicitação', render: (item) => formatarData(item.dataSolicitacao) },
      { label: 'Resultado em', render: (item) => item.dataResultado ? formatarData(item.dataResultado) : 'Pendente' },
      { label: 'Resultado', render: (item) => item.resultado || 'Aguardando', searchValue: (item) => item.resultado ?? '' },
    ]}
    details={[
      { label: 'Código', render: (item) => `#${item.id}` }, { label: 'Tipo', render: (item) => item.tipo },
      { label: 'Paciente', render: (item) => item.paciente }, { label: 'Consulta', render: (item) => `#${item.consultaId}` },
      { label: 'Data da solicitação', render: (item) => formatarData(item.dataSolicitacao) },
      { label: 'Data do resultado', render: (item) => item.dataResultado ? formatarData(item.dataResultado) : 'Pendente' },
      { label: 'Resultado', render: (item) => item.resultado || 'Aguardando resultado' },
      { label: 'Observações', render: (item) => item.observacoes || 'Sem observações' },
    ]}
    fields={fields}
    emptyValues={{ tipo: '', consultaId: '', dataSolicitacao: new Date().toISOString().slice(0, 10), dataResultado: '', resultado: '', observacoes: '' }}
    toFormValues={(item) => ({ tipo: item.tipo, consultaId: String(item.consultaId), dataSolicitacao: item.dataSolicitacao, dataResultado: item.dataResultado ?? '', resultado: item.resultado ?? '', observacoes: item.observacoes ?? '' })}
    toInput={(values: FormValues) => ({ tipo: values.tipo.trim(), consultaId: Number(values.consultaId), dataSolicitacao: values.dataSolicitacao, dataResultado: values.dataResultado || null, resultado: values.resultado.trim() || null, observacoes: values.observacoes.trim() || null })}
  />
}
