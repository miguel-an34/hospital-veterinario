import { CalendarDays, ChevronLeft, Pencil, Scale, Trash2, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { LoadingState } from '../components/LoadingState'
import { useToast } from '../components/Toast'
import { animalService } from '../services/animalService'
import type { Animal } from '../types/Animal'
import { calcularIdade, formatarData, formatarPeso } from '../utils/formatters'

export function AnimalDetailsPage() {
  const { id } = useParams()
  const [animal, setAnimal] = useState<Animal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()
  const { showToast } = useToast()

  useEffect(() => {
    animalService.buscarPorId(Number(id))
      .then(setAnimal)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Não foi possível carregar o animal.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!animal) return
    setDeleting(true)
    try {
      await animalService.excluir(animal.id)
      showToast(`${animal.nome} foi excluído com sucesso.`)
      navigate('/animais')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Não foi possível excluir o animal.', 'error')
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  if (loading) return <LoadingState label="Carregando paciente..." />

  if (error || !animal) return (
    <div className="content-card error-state"><p>{error || 'Animal não encontrado.'}</p><Link to="/animais" className="button button--secondary">Voltar à lista</Link></div>
  )

  return (
    <div>
      <Link to="/animais" className="back-link"><ChevronLeft size={17} /> Voltar para pacientes</Link>
      <section className="patient-hero">
        <div className="patient-hero__identity">
          <span className="patient-hero__avatar">{animal.nome.slice(0, 1).toUpperCase()}</span>
          <div><p className="eyebrow">Paciente #{String(animal.id).padStart(4, '0')}</p><h1>{animal.nome}</h1><p>{animal.especie} · {animal.raca}</p></div>
        </div>
        <div className="patient-hero__actions">
          <Link to={`/animais/${animal.id}/editar`} className="button button--secondary"><Pencil size={17} /> Editar</Link>
          <button className="button button--danger-ghost" onClick={() => setConfirmOpen(true)}><Trash2 size={17} /> Excluir</button>
        </div>
      </section>

      <div className="details-layout">
        <section className="content-card details-card">
          <div className="card-heading"><div><p className="eyebrow">Cadastro</p><h2>Informações do paciente</h2></div><span className={`sex-badge sex-badge--${animal.sexo.toLowerCase()}`}>{animal.sexo === 'M' ? 'Macho' : 'Fêmea'}</span></div>
          <dl className="details-grid">
            <div><dt>Nome</dt><dd>{animal.nome}</dd></div>
            <div><dt>Espécie</dt><dd>{animal.especie}</dd></div>
            <div><dt>Raça</dt><dd>{animal.raca}</dd></div>
            <div><dt>Sexo</dt><dd>{animal.sexo === 'M' ? 'Macho' : 'Fêmea'}</dd></div>
            <div><dt>Data de nascimento</dt><dd>{formatarData(animal.dataNascimento)}</dd></div>
            <div><dt>Idade aproximada</dt><dd>{calcularIdade(animal.dataNascimento)}</dd></div>
            <div><dt>Peso</dt><dd>{formatarPeso(animal.peso)}</dd></div>
          </dl>
        </section>

        <aside className="details-aside">
          <section className="content-card tutor-card">
            <div className="card-heading"><div><p className="eyebrow">Responsável</p><h2>Tutor</h2></div><span className="soft-icon"><UserRound size={19} /></span></div>
            <div className="tutor-card__person"><span>{animal.tutor.slice(0, 1).toUpperCase()}</span><div><strong>{animal.tutor}</strong><small>Tutor principal</small></div></div>
          </section>
          <section className="content-card clinical-summary">
            <p className="eyebrow">Resumo clínico</p><h2>Acompanhamento</h2>
            <div><span><Scale size={18} /></span><p><strong>{formatarPeso(animal.peso)}</strong><small>Peso registrado</small></p></div>
            <div><span><CalendarDays size={18} /></span><p><strong>Nenhuma consulta</strong><small>Histórico será integrado ao backend</small></p></div>
          </section>
        </aside>
      </div>

      <ConfirmDialog open={confirmOpen} title="Excluir animal?" description={`O cadastro de ${animal.nome} será removido. Esta ação não poderá ser desfeita.`} loading={deleting} onCancel={() => setConfirmOpen(false)} onConfirm={handleDelete} />
    </div>
  )
}
