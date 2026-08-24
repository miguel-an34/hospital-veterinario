import { CalendarDays, ClipboardPlus, Stethoscope } from 'lucide-react'
import { useEffect, useState } from 'react'
import { LoadingState } from '../components/LoadingState'
import { relatorioService } from '../services/relatorioService'
import type { AgendaDiaria, HistoricoClinico, InternacaoAtiva } from '../types/Relatorio'
import { formatarDataHora } from '../utils/formatters'

function formatarHorario(value: string) {
  return value ? value.slice(0, 5) : '—'
}

export function RelatoriosPage() {
  const [agenda, setAgenda] = useState<AgendaDiaria[]>([])
  const [internacoes, setInternacoes] = useState<InternacaoAtiva[]>([])
  const [historico, setHistorico] = useState<HistoricoClinico[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadRelatorios = async () => {
    setLoading(true)
    setError('')
    try {
      const [agendaData, internacoesData, historicoData] = await Promise.all([
        relatorioService.agendaDiaria(),
        relatorioService.internacoesAtivas(),
        relatorioService.historicoClinico(),
      ])
      setAgenda(agendaData)
      setInternacoes(internacoesData)
      setHistorico(historicoData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar os relatórios.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadRelatorios()
  }, [])

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">Relatórios</p>
          <h1>Visões estratégicas</h1>
          <p>Consolidado de agenda, internações e histórico clínico direto do banco de dados.</p>
        </div>
      </header>

      {loading ? (
        <section className="content-card"><LoadingState label="Carregando relatórios..." /></section>
      ) : error ? (
        <section className="content-card error-state">
          <p>{error}</p>
          <button className="button button--secondary" onClick={loadRelatorios}>Tentar novamente</button>
        </section>
      ) : (
        <div className="reports-list">
          <section className="content-card list-card">
            <div className="card-heading">
              <div><p className="eyebrow">Hoje</p><h2>Agenda diária</h2></div>
              <span className="soft-icon"><CalendarDays size={19} /></span>
            </div>
            {agenda.length === 0 ? <p className="reports-empty-message">Nenhum agendamento para hoje.</p> : (
              <div className="table-scroll">
                <table className="data-table">
                  <thead><tr><th>Horário</th><th>Paciente</th><th>Tutor</th><th>Motivo</th></tr></thead>
                  <tbody>
                    {agenda.map((item, index) => (
                      <tr key={index}>
                        <td>{formatarHorario(item.horario)}</td>
                        <td>{item.paciente}</td>
                        <td>{item.tutor}</td>
                        <td>{item.motivo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="content-card list-card">
            <div className="card-heading">
              <div><p className="eyebrow">Leitos ocupados</p><h2>Internações ativas</h2></div>
              <span className="soft-icon"><Stethoscope size={19} /></span>
            </div>
            {internacoes.length === 0 ? <p>Nenhuma internação ativa no momento.</p> : (
              <div className="table-scroll">
                <table className="data-table">
                  <thead><tr><th>Leito</th><th>Paciente</th><th>Entrada</th><th>Tutor</th><th>Observações</th></tr></thead>
                  <tbody>
                    {internacoes.map((item, index) => (
                      <tr key={index}>
                        <td>{item.leito}</td>
                        <td>{item.paciente}</td>
                        <td>{formatarDataHora(item.dataEntrada)}</td>
                        <td>{item.tutorResponsavel}</td>
                        <td>{item.observacoes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="content-card list-card">
            <div className="card-heading">
              <div><p className="eyebrow">Prontuário</p><h2>Histórico clínico</h2></div>
              <span className="soft-icon"><ClipboardPlus size={19} /></span>
            </div>
            {historico.length === 0 ? <p>Nenhum atendimento registrado ainda.</p> : (
              <div className="table-scroll">
                <table className="data-table">
                  <thead><tr><th>Paciente</th><th>Espécie</th><th>Data</th><th>Diagnóstico</th><th>Veterinário</th></tr></thead>
                  <tbody>
                    {historico.map((item, index) => (
                      <tr key={index}>
                        <td>{item.paciente}</td>
                        <td>{item.especie}</td>
                        <td>{formatarDataHora(item.dataAtendimento)}</td>
                        <td>{item.diagnostico}</td>
                        <td>{item.veterinarioResponsavel}</td>
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
