import { Eye, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { LoadingState } from '../components/LoadingState'
import { useToast } from '../components/Toast'
import { animalService } from '../services/animalService'
import type { Animal } from '../types/Animal'
import { formatarData, formatarPeso } from '../utils/formatters'

export function AnimalListPage() {
  const [animais, setAnimais] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [animalToDelete, setAnimalToDelete] = useState<Animal | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { showToast } = useToast()

  const loadAnimals = async () => {
    setLoading(true)
    setError('')
    try {
      setAnimais(await animalService.listar())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar os animais.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAnimals()
  }, [])

  const filteredAnimals = useMemo(() => {
    const term = search.trim().toLocaleLowerCase()
    if (!term) return animais
    return animais.filter((animal) =>
      [animal.nome, animal.especie, animal.raca, animal.tutor]
        .some((value) => value.toLocaleLowerCase().includes(term)),
    )
  }, [animais, search])

  const handleDelete = async () => {
    if (!animalToDelete) return
    setDeleting(true)
    try {
      await animalService.excluir(animalToDelete.id)
      setAnimais((current) => current.filter((animal) => animal.id !== animalToDelete.id))
      showToast(`${animalToDelete.nome} foi excluído com sucesso.`)
      setAnimalToDelete(null)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Não foi possível excluir o animal.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <header className="page-header">
        <div><p className="eyebrow">Cadastros</p><h1>Pacientes</h1><p>Consulte e gerencie os animais atendidos pelo hospital.</p></div>
        <Link to="/animais/novo" className="button button--primary"><Plus size={18} /> Novo animal</Link>
      </header>

      <section className="content-card list-card">
        <div className="list-toolbar">
          <label className="search-box">
            <Search size={18} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome, espécie, raça ou tutor..." aria-label="Buscar animais" />
            {search && <button onClick={() => setSearch('')} aria-label="Limpar busca"><X size={17} /></button>}
          </label>
          <span className="result-count">{filteredAnimals.length} {filteredAnimals.length === 1 ? 'registro' : 'registros'}</span>
        </div>

        {loading ? <LoadingState label="Buscando pacientes..." /> : error ? (
          <div className="error-state"><p>{error}</p><button className="button button--secondary" onClick={loadAnimals}>Tentar novamente</button></div>
        ) : filteredAnimals.length === 0 ? (
          <div className="empty-state">
            <span><PawIcon /></span>
            <h2>{search ? 'Nenhum resultado encontrado' : 'Nenhum animal cadastrado'}</h2>
            <p>{search ? 'Tente buscar por outro termo.' : 'Cadastre o primeiro paciente para começar.'}</p>
            {!search && <Link to="/animais/novo" className="button button--primary"><Plus size={18} /> Novo animal</Link>}
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Paciente</th><th>Espécie / raça</th><th>Sexo</th><th>Nascimento</th><th>Peso</th><th>Tutor</th><th><span className="sr-only">Ações</span></th></tr></thead>
              <tbody>
                {filteredAnimals.map((animal) => (
                  <tr key={animal.id}>
                    <td><Link className="patient-cell" to={`/animais/${animal.id}`}><span className="animal-avatar">{animal.nome.slice(0, 1).toUpperCase()}</span><span><strong>{animal.nome}</strong><small>ID #{String(animal.id).padStart(4, '0')}</small></span></Link></td>
                    <td><strong>{animal.especie}</strong><small>{animal.raca}</small></td>
                    <td><span className={`sex-badge sex-badge--${animal.sexo.toLowerCase()}`}>{animal.sexo === 'M' ? 'Macho' : 'Fêmea'}</span></td>
                    <td>{formatarData(animal.dataNascimento)}</td>
                    <td>{formatarPeso(animal.peso)}</td>
                    <td>{animal.tutor}</td>
                    <td>
                      <div className="table-actions">
                        <Link to={`/animais/${animal.id}`} className="icon-button" title="Visualizar" aria-label={`Visualizar ${animal.nome}`}><Eye size={18} /></Link>
                        <Link to={`/animais/${animal.id}/editar`} className="icon-button" title="Editar" aria-label={`Editar ${animal.nome}`}><Pencil size={17} /></Link>
                        <button className="icon-button icon-button--danger" onClick={() => setAnimalToDelete(animal)} title="Excluir" aria-label={`Excluir ${animal.nome}`}><Trash2 size={17} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(animalToDelete)}
        title="Excluir animal?"
        description={`O cadastro de ${animalToDelete?.nome ?? 'este animal'} será removido. Esta ação não poderá ser desfeita.`}
        loading={deleting}
        onCancel={() => setAnimalToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}

function PawIcon() {
  return <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="4" cy="8" r="2"/><path d="M12 10c-4 0-7 3-7 6.5S7.5 21 10 20c1.3-.5 2.7-.5 4 0 2.5 1 5-.1 5-3.5S16 10 12 10Z"/></svg>
}
