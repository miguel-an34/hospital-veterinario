import { CalendarRange, Download, FileBarChart2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { LoadingState } from '../components/LoadingState'
import { relatorioService } from '../services/relatorioService'
import type {
  AgendaPorPeriodo,
  AtendimentoPorProfissional,
  ExameRelatorio,
  HistoricoPorPaciente,
  InternacaoAtiva,
  TipoRelatorio,
} from '../types/Relatorio'
import { formatarCompetencia, formatarData, formatarDataHora, formatarMoeda, formatarPeso } from '../utils/formatters'

const relatoriosMeta: Record<TipoRelatorio, { eyebrow: string; titulo: string; arquivo: string }> = {
  atendimentos: { eyebrow: 'Volume por competência', titulo: 'Atendimentos por profissional', arquivo: 'relatorio-atendimentos.csv' },
  historico: { eyebrow: 'Prontuário consolidado', titulo: 'Histórico por paciente', arquivo: 'relatorio-historico.csv' },
  internacoes: { eyebrow: 'Ocupação hospitalar', titulo: 'Internações ativas', arquivo: 'relatorio-internacoes-ativas.csv' },
  exames: { eyebrow: 'Acompanhamento diagnóstico', titulo: 'Exames e resultados', arquivo: 'relatorio-exames.csv' },
  agenda: { eyebrow: 'Planejamento de atendimentos', titulo: 'Agenda por período', arquivo: 'relatorio-agenda.csv' },
}

const umDiaEmMs = 1000 * 60 * 60 * 24

function diasDesde(dataHora: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(dataHora).getTime()) / umDiaEmMs))
}

export function RelatoriosPage() {
  const [tipo, setTipo] = useState<TipoRelatorio>('atendimentos')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [atendimentos, setAtendimentos] = useState<AtendimentoPorProfissional[]>([])
  const [historico, setHistorico] = useState<HistoricoPorPaciente[]>([])
  const [internacoes, setInternacoes] = useState<InternacaoAtiva[]>([])
  const [exames, setExames] = useState<ExameRelatorio[]>([])
  const [agenda, setAgenda] = useState<AgendaPorPeriodo[]>([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)
  const [error, setError] = useState('')

  const filtros = useMemo(() => ({
    dataInicio: dataInicio || undefined,
    dataFim: dataFim || undefined,
  }), [dataFim, dataInicio])

  const totalRegistros = {
    atendimentos: atendimentos.length,
    historico: historico.length,
    internacoes: internacoes.length,
    exames: exames.length,
    agenda: agenda.length,
  }[tipo]

  const relatorioVazio = totalRegistros === 0

  const resumo = useMemo(() => {
    if (tipo === 'atendimentos') {
      return [
        { label: 'Linhas no relatório', value: atendimentos.length.toLocaleString('pt-BR') },
        { label: 'Atendimentos', value: atendimentos.reduce((total, item) => total + item.quantidadeAtendimentos, 0).toLocaleString('pt-BR') },
        { label: 'Profissionais', value: new Set(atendimentos.map((item) => item.veterinarioCpf)).size.toLocaleString('pt-BR') },
        { label: 'Faturamento', value: formatarMoeda(atendimentos.reduce((total, item) => total + item.faturamentoTotal, 0)) },
      ]
    }

    if (tipo === 'historico') {
      return [
        { label: 'Consultas', value: historico.length.toLocaleString('pt-BR') },
        { label: 'Pacientes', value: new Set(historico.map((item) => item.idAnimal)).size.toLocaleString('pt-BR') },
        { label: 'Veterinários', value: new Set(historico.map((item) => item.veterinarioCpf)).size.toLocaleString('pt-BR') },
        { label: 'Com registro clínico', value: historico.filter((item) => Boolean(item.diagnostico)).length.toLocaleString('pt-BR') },
      ]
    }

    if (tipo === 'internacoes') {
      const permanencias = internacoes.map((item) => diasDesde(item.dataEntrada))
      const mediaPermanencia = permanencias.length
        ? Math.round(permanencias.reduce((total, dias) => total + dias, 0) / permanencias.length)
        : 0
      return [
        { label: 'Internações ativas', value: internacoes.length.toLocaleString('pt-BR') },
        { label: 'Leitos ocupados', value: new Set(internacoes.map((item) => item.leito)).size.toLocaleString('pt-BR') },
        { label: 'Pacientes', value: new Set(internacoes.map((item) => item.paciente)).size.toLocaleString('pt-BR') },
        { label: 'Permanência média', value: `${mediaPermanencia} dia${mediaPermanencia === 1 ? '' : 's'}` },
      ]
    }

    if (tipo === 'exames') {
      const concluidos = exames.filter((item) => Boolean(item.dataResultado && item.resultado)).length
      return [
        { label: 'Exames', value: exames.length.toLocaleString('pt-BR') },
        { label: 'Concluídos', value: concluidos.toLocaleString('pt-BR') },
        { label: 'Pendentes', value: (exames.length - concluidos).toLocaleString('pt-BR') },
        { label: 'Tipos de exame', value: new Set(exames.map((item) => item.tipo)).size.toLocaleString('pt-BR') },
      ]
    }

    return [
      { label: 'Agendamentos', value: agenda.length.toLocaleString('pt-BR') },
      { label: 'Pacientes', value: new Set(agenda.map((item) => item.idAnimal)).size.toLocaleString('pt-BR') },
      { label: 'Dias com agenda', value: new Set(agenda.map((item) => item.data)).size.toLocaleString('pt-BR') },
      { label: 'Urgências', value: agenda.filter((item) => item.motivo.toLocaleLowerCase('pt-BR').includes('urgência')).length.toLocaleString('pt-BR') },
    ]
  }, [agenda, atendimentos, exames, historico, internacoes, tipo])

  const limparDados = () => {
    setAtendimentos([])
    setHistorico([])
    setInternacoes([])
    setExames([])
    setAgenda([])
  }

  const invalidarResultado = () => {
    setHasGenerated(false)
    limparDados()
    setError('')
  }

  const alterarTipo = (novoTipo: TipoRelatorio) => {
    setTipo(novoTipo)
    invalidarResultado()
  }

  const alterarDataInicio = (value: string) => {
    setDataInicio(value)
    invalidarResultado()
  }

  const alterarDataFim = (value: string) => {
    setDataFim(value)
    invalidarResultado()
  }

  const gerarRelatorio = async () => {
    if (dataInicio && dataFim && dataInicio > dataFim) {
      setHasGenerated(false)
      setError('A data inicial não pode ser posterior à data final.')
      return
    }

    setLoading(true)
    setError('')
    limparDados()
    try {
      if (tipo === 'atendimentos') setAtendimentos(await relatorioService.atendimentos(filtros))
      if (tipo === 'historico') setHistorico(await relatorioService.historico(filtros))
      if (tipo === 'internacoes') setInternacoes(await relatorioService.internacoes(filtros))
      if (tipo === 'exames') setExames(await relatorioService.exames(filtros))
      if (tipo === 'agenda') setAgenda(await relatorioService.agenda(filtros))
      setHasGenerated(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar o relatório.')
    } finally {
      setLoading(false)
    }
  }

  const exportarCsv = async () => {
    if (!hasGenerated || relatorioVazio) return

    setExporting(true)
    setError('')
    try {
      const blob = await relatorioService.exportarCsv(tipo, filtros)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = relatoriosMeta[tipo].arquivo
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível exportar o relatório.')
    } finally {
      setExporting(false)
    }
  }

  const renderTabela = () => {
    if (tipo === 'atendimentos') {
      return (
        <table className="data-table reports-table">
          <thead><tr><th>Profissional</th><th>Competência</th><th>Quantidade</th><th>Faturamento</th></tr></thead>
          <tbody>{atendimentos.map((item) => (
            <tr key={`${item.veterinarioCpf}-${item.ano}-${item.mes}`}>
              <td><strong>{item.profissional}</strong><small>CPF {item.veterinarioCpf}</small></td>
              <td>{formatarCompetencia(item.ano, item.mes)}</td>
              <td>{item.quantidadeAtendimentos}</td>
              <td>{formatarMoeda(item.faturamentoTotal)}</td>
            </tr>
          ))}</tbody>
        </table>
      )
    }

    if (tipo === 'historico') {
      return (
        <table className="data-table reports-table reports-table--wide">
          <thead><tr><th>Paciente</th><th>Tutor</th><th>Veterinário</th><th>Consulta</th><th>Status</th><th>Diagnóstico</th><th>Observações</th></tr></thead>
          <tbody>{historico.map((item) => (
            <tr key={item.idConsulta}>
              <td>
                <strong>{item.paciente}</strong>
                <small>{item.especie}{item.raca ? ` • ${item.raca}` : ''}{item.peso ? ` • ${formatarPeso(item.peso)}` : ''}{item.dataNascimento ? ` • Nasc. ${formatarData(item.dataNascimento)}` : ''}</small>
              </td>
              <td><strong>{item.tutor || '—'}</strong><small>{item.tutorCpf || 'CPF não informado'}</small></td>
              <td><strong>{item.veterinario}</strong><small>{item.veterinarioCpf}</small></td>
              <td>{formatarDataHora(item.dataConsulta)}</td>
              <td>{item.status}</td>
              <td>{item.diagnostico || '—'}</td>
              <td>{item.observacoes || '—'}</td>
            </tr>
          ))}</tbody>
        </table>
      )
    }

    if (tipo === 'internacoes') {
      return (
        <table className="data-table reports-table">
          <thead><tr><th>Leito</th><th>Paciente</th><th>Tutor</th><th>Entrada</th><th>Tempo internado</th><th>Observações</th></tr></thead>
          <tbody>{internacoes.map((item) => {
            const dias = diasDesde(item.dataEntrada)
            return (
              <tr key={`${item.leito}-${item.paciente}-${item.dataEntrada}`}>
                <td><strong>{item.leito}</strong></td>
                <td><strong>{item.paciente}</strong></td>
                <td>{item.tutorResponsavel}</td>
                <td>{formatarDataHora(item.dataEntrada)}</td>
                <td>{dias} dia{dias === 1 ? '' : 's'}</td>
                <td>{item.observacoes || '—'}</td>
              </tr>
            )
          })}</tbody>
        </table>
      )
    }

    if (tipo === 'exames') {
      return (
        <table className="data-table reports-table reports-table--wide">
          <thead><tr><th>Exame</th><th>Paciente</th><th>Veterinário</th><th>Solicitação</th><th>Resultado</th><th>Situação</th><th>Observações</th></tr></thead>
          <tbody>{exames.map((item) => {
            const concluido = Boolean(item.dataResultado && item.resultado)
            return (
              <tr key={item.idExame}>
                <td><strong>{item.tipo}</strong><small>Exame #{item.idExame} • Consulta #{item.idConsulta}</small></td>
                <td><strong>{item.paciente}</strong><small>Paciente #{item.idAnimal}</small></td>
                <td>{item.veterinario}</td>
                <td>{formatarData(item.dataSolicitacao)}</td>
                <td><strong>{item.resultado || 'Aguardando resultado'}</strong><small>{item.dataResultado ? formatarData(item.dataResultado) : 'Sem data de resultado'}</small></td>
                <td><span className={`report-status report-status--${concluido ? 'done' : 'pending'}`}>{concluido ? 'Concluído' : 'Pendente'}</span></td>
                <td>{item.observacoes || '—'}</td>
              </tr>
            )
          })}</tbody>
        </table>
      )
    }

    return (
      <table className="data-table reports-table">
        <thead><tr><th>Data e horário</th><th>Paciente</th><th>Tutor</th><th>Motivo</th></tr></thead>
        <tbody>{agenda.map((item) => (
          <tr key={item.idAgendamento}>
            <td><strong>{formatarData(item.data)}</strong><small>{item.horario.slice(0, 5)} • Agendamento #{item.idAgendamento}</small></td>
            <td><strong>{item.paciente}</strong><small>Paciente #{item.idAnimal}</small></td>
            <td><strong>{item.tutor}</strong><small>CPF {item.tutorCpf}</small></td>
            <td>{item.motivo}</td>
          </tr>
        ))}</tbody>
      </table>
    )
  }

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">Relatórios</p>
          <h1>Central analítica</h1>
          <p>Gere relatórios por período, visualize no navegador e exporte o resultado filtrado em CSV.</p>
        </div>
      </header>

      <section className="content-card reports-filter-card">
        <div className="reports-filter-grid">
          <label className="field">
            <span>Relatório</span>
            <select value={tipo} onChange={(event) => alterarTipo(event.target.value as TipoRelatorio)}>
              <option value="atendimentos">Atendimentos</option>
              <option value="historico">Histórico por paciente</option>
              <option value="internacoes">Internações ativas</option>
              <option value="exames">Exames e resultados</option>
              <option value="agenda">Agenda por período</option>
            </select>
          </label>

          <label className="field">
            <span>Data inicial</span>
            <input type="date" value={dataInicio} max={dataFim || undefined} onChange={(event) => alterarDataInicio(event.target.value)} />
          </label>

          <label className="field">
            <span>Data final</span>
            <input type="date" value={dataFim} min={dataInicio || undefined} onChange={(event) => alterarDataFim(event.target.value)} />
          </label>

          <div className="reports-filter-actions">
            <button className="button button--primary" onClick={gerarRelatorio} disabled={loading}>
              {loading ? <span className="button-spinner" /> : <FileBarChart2 size={16} />}
              <span>Gerar Relatório</span>
            </button>
            <button className="button button--secondary" onClick={exportarCsv} disabled={loading || exporting || !hasGenerated || relatorioVazio}>
              {exporting ? <span className="button-spinner" /> : <Download size={16} />}
              <span>Baixar CSV</span>
            </button>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="content-card"><LoadingState label="Gerando relatório..." /></section>
      ) : error ? (
        <section className="content-card error-state">
          <p>{error}</p>
          <button className="button button--secondary" onClick={gerarRelatorio}>Tentar novamente</button>
        </section>
      ) : !hasGenerated ? (
        <section className="content-card empty-state">
          <span><FileBarChart2 size={24} /></span>
          <h2>Selecione os filtros para iniciar</h2>
          <p>Escolha o tipo de relatório, defina o período desejado e clique em gerar relatório.</p>
        </section>
      ) : relatorioVazio ? (
        <section className="content-card empty-state">
          <span><CalendarRange size={24} /></span>
          <h2>Nenhum registro encontrado</h2>
          <p>Ajuste o tipo de relatório ou o período informado e gere novamente.</p>
        </section>
      ) : (
        <div className="reports-result">
          <section className="reports-summary-grid" aria-label="Resumo do relatório">
            {resumo.map((item) => (
              <article className="content-card reports-summary-card" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </article>
            ))}
          </section>

          <section className="content-card list-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">{relatoriosMeta[tipo].eyebrow}</p>
                <h2>{relatoriosMeta[tipo].titulo}</h2>
              </div>
              <span className="soft-icon"><FileBarChart2 size={19} /></span>
            </div>
            <div className="table-scroll">{renderTabela()}</div>
          </section>
        </div>
      )}
    </div>
  )
}
