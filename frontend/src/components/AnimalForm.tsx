import { Save } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import type { AnimalInput, SexoAnimal } from '../types/Animal'
import type { TutorSummary } from '../types/Tutor'

interface AnimalFormProps {
  initialData?: AnimalInput
  submitting: boolean
  submitLabel: string
  tutores: TutorSummary[]
  onSubmit: (data: AnimalInput) => Promise<void>
  onCancel: () => void
}

const emptyForm: AnimalInput = {
  nome: '',
  especie: '',
  raca: '',
  sexo: 'M',
  dataNascimento: '',
  peso: 0,
  tutorCpf: '',
}

export function AnimalForm({ initialData, submitting, submitLabel, tutores, onSubmit, onCancel }: AnimalFormProps) {
  const [form, setForm] = useState<AnimalInput>(initialData ?? emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof AnimalInput, string>>>({})

  const updateField = <K extends keyof AnimalInput>(field: K, value: AnimalInput[K]) => {
    setForm((current) => ({ ...current, [field]: value }))
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const validate = () => {
    const nextErrors: Partial<Record<keyof AnimalInput, string>> = {}
    if (!form.nome.trim()) nextErrors.nome = 'Informe o nome do animal.'
    if (!form.especie.trim()) nextErrors.especie = 'Informe a espécie.'
    if (!form.raca.trim()) nextErrors.raca = 'Informe a raça ou use “Sem raça definida”.'
    if (!form.dataNascimento) nextErrors.dataNascimento = 'Informe a data de nascimento.'
    if (form.dataNascimento > new Date().toISOString().split('T')[0]) nextErrors.dataNascimento = 'A data não pode estar no futuro.'
    if (!Number.isFinite(form.peso) || form.peso <= 0) nextErrors.peso = 'Informe um peso maior que zero.'
    if (!form.tutorCpf) nextErrors.tutorCpf = 'Selecione o tutor responsável.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!validate()) return
    await onSubmit({
      ...form,
      nome: form.nome.trim(),
      especie: form.especie.trim(),
      raca: form.raca.trim(),
    })
  }

  return (
    <form className="animal-form" onSubmit={handleSubmit} noValidate>
      <div className="form-section-heading">
        <span>01</span>
        <div><h2>Identificação do paciente</h2><p>Dados básicos utilizados no cadastro clínico.</p></div>
      </div>

      <div className="form-grid">
        <label className="field field--wide">
          <span>Nome do animal <em>*</em></span>
          <input value={form.nome} onChange={(e) => updateField('nome', e.target.value)} placeholder="Ex.: Luna" autoFocus />
          {errors.nome && <small className="field__error">{errors.nome}</small>}
        </label>

        <label className="field">
          <span>Espécie <em>*</em></span>
          <input value={form.especie} onChange={(e) => updateField('especie', e.target.value)} placeholder="Ex.: Cão" list="especies" />
          <datalist id="especies"><option value="Cão" /><option value="Gato" /><option value="Ave" /><option value="Coelho" /><option value="Réptil" /></datalist>
          {errors.especie && <small className="field__error">{errors.especie}</small>}
        </label>

        <label className="field">
          <span>Raça <em>*</em></span>
          <input value={form.raca} onChange={(e) => updateField('raca', e.target.value)} placeholder="Ex.: Golden Retriever" />
          {errors.raca && <small className="field__error">{errors.raca}</small>}
        </label>

        <fieldset className="field">
          <legend>Sexo <em>*</em></legend>
          <div className="segmented-control">
            {(['M', 'F'] as SexoAnimal[]).map((sexo) => (
              <label key={sexo} className={form.sexo === sexo ? 'is-selected' : ''}>
                <input type="radio" name="sexo" value={sexo} checked={form.sexo === sexo} onChange={() => updateField('sexo', sexo)} />
                {sexo === 'M' ? 'Macho' : 'Fêmea'}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="field">
          <span>Data de nascimento <em>*</em></span>
          <input type="date" value={form.dataNascimento} max={new Date().toISOString().split('T')[0]} onChange={(e) => updateField('dataNascimento', e.target.value)} />
          {errors.dataNascimento && <small className="field__error">{errors.dataNascimento}</small>}
        </label>

        <label className="field">
          <span>Peso (kg) <em>*</em></span>
          <input type="number" min="0.01" step="0.01" value={form.peso || ''} onChange={(e) => updateField('peso', Number(e.target.value))} placeholder="0,00" />
          {errors.peso && <small className="field__error">{errors.peso}</small>}
        </label>
      </div>

      <div className="form-divider" />
      <div className="form-section-heading">
        <span>02</span>
        <div><h2>Responsável</h2><p>Vínculo do paciente com seu tutor.</p></div>
      </div>

      <div className="form-grid">
        <label className="field field--wide">
          <span>Tutor responsável <em>*</em></span>
          <select value={form.tutorCpf} onChange={(e) => updateField('tutorCpf', e.target.value)}>
            <option value="">Selecione um tutor</option>
            {tutores.map((tutor) => <option key={tutor.cpf} value={tutor.cpf}>{tutor.nome} — CPF {tutor.cpf}</option>)}
          </select>
          <small className="field__hint">O vínculo será gravado na tabela Tutor_Animal pelo CPF selecionado.</small>
          {errors.tutorCpf && <small className="field__error">{errors.tutorCpf}</small>}
        </label>
      </div>

      <div className="form-actions">
        <button type="button" className="button button--secondary" onClick={onCancel} disabled={submitting}>Cancelar</button>
        <button type="submit" className="button button--primary" disabled={submitting}>
          {submitting ? <span className="button-spinner" /> : <Save size={18} />}
          {submitting ? 'Salvando...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
