import { CalendarRange, Download, FileBarChart2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { LoadingState } from '../components/LoadingState'
import { relatorioService } from '../services/relatorioService'
import type { AtendimentoPorProfissional, HistoricoPorPaciente, TipoRelatorio } from '../types/Relatorio'
import { formatarCompetencia, formatarData, formatarDataHora, formatarMoeda, formatarPeso } from '../utils/formatters'

export function RelatoriosPage() {
  const [tipo, setTipo] = useState<TipoRelatorio>('atendimentos')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [atendimentos, setAtendimentos] = useState<AtendimentoPorProfissional[]>([])
  const [historico, setHistorico] = useState<HistoricoPorPaciente[]>([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)
  const [error, setError] = useState('')

  const filtros = useMemo(() => ({
    dataInicio: dataInicio || undefined,
    dataFim: dataFim || undefined,
  }), [dataFim, dataInicio])

  const relatorioVazio = tipo === 'atendimentos' ? atendimentos.length === 0 : historico.length === 0

  const resumo = useMemo(() => {
    if (tipo === 'atendimentos') {
      return [
        { label: 'Linhas no relatório', value: atendimentos.length.toLocaleString('pt-BR') },
        { label: 'Atendimentos', value: atendimentos.reduce((total, item) => total + item.quantidadeAtendimentos, 0).toLocaleString('pt-BR') },
        { label: 'Profissionais', value: new Set(atendimentos.map((item) => item.veterinarioCpf)).size.toLocaleString('pt-BR') },
        { label: 'Faturamento', value: formatarMoeda(atendimentos.reduce((total, item) => total + item.faturamentoTotal, 0)) },
      ]
    }

    return [
      { label: 'Consultas', value: historico.length.toLocaleString('pt-BR') },
      { label: 'Pacientes', value: new Set(historico.map((item) => item.idAnimal)).size.toLocaleString('pt-BR') },
      { label: 'Veterinários', value: new Set(historico.map((item) => item.veterinarioCpf)).size.toLocaleString('pt-BR') },
      { label: 'Com registro clínico', value: historico.filter((item) => Boolean(item.diagnostico)).length.toLocaleString('pt-BR') },
    ]
  }, [atendimentos, historico, tipo])

  const invalidarResultado = () => {
    setHasGenerated(false)
    setAtendimentos([])
    setHistorico([])
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
    try {
      if (tipo === 'atendimentos') {
        const data = await relatorioService.atendimentos(filtros)
        setAtendimentos(data)
        setHistorico([])
      } else {
        const data = await relatorioService.historico(filtros)
        setHistorico(data)
        setAtendimentos([])
      }
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
      link.download = tipo === 'atendimentos' ? 'relatorio-atendimentos.csv' : 'relatorio-historico.csv'
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
              <p className="eyebrow">{tipo === 'atendimentos' ? 'Resumo financeiro e volume' : 'Prontuário consolidado'}</p>
              <h2>{tipo === 'atendimentos' ? 'Atendimentos por profissional' : 'Histórico por paciente'}</h2>
            </div>
            <span className="soft-icon"><FileBarChart2 size={19} /></span>
          </div>

          {tipo === 'atendimentos' ? (
            <div className="table-scroll">
              <table className="data-table reports-table">
                <thead>
                  <tr>
                    <th>Profissional</th>
                    <th>Competência</th>
                    <th>Quantidade</th>
                    <th>Faturamento</th>
                  </tr>
                </thead>
                <tbody>
                  {atendimentos.map((item) => (
                    <tr key={`${item.veterinarioCpf}-${item.ano}-${item.mes}`}>
                      <td>
                        <strong>{item.profissional}</strong>
                        <small>CPF {item.veterinarioCpf}</small>
                      </td>
                      <td>{formatarCompetencia(item.ano, item.mes)}</td>
                      <td>{item.quantidadeAtendimentos}</td>
                      <td>{formatarMoeda(item.faturamentoTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="table-scroll">
              <table className="data-table reports-table reports-table--wide">
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>Tutor</th>
                    <th>Veterinário</th>
                    <th>Consulta</th>
                    <th>Status</th>
                    <th>Diagnóstico</th>
                    <th>Observações</th>
                  </tr>
                </thead>
                <tbody>
                  {historico.map((item) => (
                    <tr key={item.idConsulta}>
                      <td>
                        <strong>{item.paciente}</strong>
                        <small>
                          {item.especie}
                          {item.raca ? ` • ${item.raca}` : ''}
                          {item.peso ? ` • ${formatarPeso(item.peso)}` : ''}
                          {item.dataNascimento ? ` • Nasc. ${formatarData(item.dataNascimento)}` : ''}
                        </small>
                      </td>
                      <td>
                        <strong>{item.tutor || '—'}</strong>
                        <small>{item.tutorCpf || 'CPF não informado'}</small>
                      </td>
                      <td>
                        <strong>{item.veterinario}</strong>
                        <small>{item.veterinarioCpf}</small>
                      </td>
                      <td>{formatarDataHora(item.dataConsulta)}</td>
                      <td>{item.status}</td>
                      <td>{item.diagnostico || '—'}</td>
                      <td>{item.observacoes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </section>
        </div>
      )}
    </div>
  )
}
