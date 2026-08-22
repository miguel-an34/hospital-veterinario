import { ChevronLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AnimalForm } from '../components/AnimalForm'
import { LoadingState } from '../components/LoadingState'
import { useToast } from '../components/Toast'
import { animalService } from '../services/animalService'
import { tutorService } from '../services/tutorService'
import type { Animal, AnimalInput } from '../types/Animal'
import type { TutorSummary } from '../types/Tutor'

export function AnimalFormPage() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const [animal, setAnimal] = useState<Animal | null>(null)
  const [tutores, setTutores] = useState<TutorSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { showToast } = useToast()

  useEffect(() => {
    const animalRequest = id ? animalService.buscarPorId(Number(id)) : Promise.resolve(null)
    Promise.all([animalRequest, tutorService.listar()])
      .then(([loadedAnimal, loadedTutores]) => {
        setAnimal(loadedAnimal)
        setTutores(loadedTutores)
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Não foi possível carregar o animal.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (data: AnimalInput) => {
    setSubmitting(true)
    try {
      const saved = isEditing
        ? await animalService.atualizar(Number(id), data)
        : await animalService.criar(data)
      showToast(isEditing ? 'Dados do animal atualizados com sucesso.' : 'Animal cadastrado com sucesso.')
      navigate(`/animais/${saved.id}`)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Não foi possível salvar o animal.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Link to={isEditing && animal ? `/animais/${animal.id}` : '/animais'} className="back-link"><ChevronLeft size={17} /> Voltar para {isEditing ? 'o paciente' : 'pacientes'}</Link>
      <header className="page-header page-header--compact">
        <div>
          <p className="eyebrow">{isEditing ? 'Edição de cadastro' : 'Novo cadastro'}</p>
          <h1>{isEditing ? `Editar ${animal?.nome ?? 'animal'}` : 'Cadastrar animal'}</h1>
          <p>{isEditing ? 'Atualize as informações do paciente abaixo.' : 'Preencha as informações para incluir um novo paciente.'}</p>
        </div>
      </header>

      <section className="content-card form-card">
        {loading ? <LoadingState label="Carregando cadastro..." /> : error ? (
          <div className="error-state"><p>{error}</p><Link to="/animais" className="button button--secondary">Voltar à lista</Link></div>
        ) : (
          <AnimalForm
            key={animal?.id ?? 'new'}
            initialData={animal ?? undefined}
            submitting={submitting}
            submitLabel={isEditing ? 'Salvar alterações' : 'Cadastrar animal'}
            tutores={tutores}
            onSubmit={handleSubmit}
            onCancel={() => navigate(isEditing && animal ? `/animais/${animal.id}` : '/animais')}
          />
        )}
      </section>
    </div>
  )
}
