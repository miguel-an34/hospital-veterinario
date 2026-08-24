import { Eye, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { ConfirmDialog } from './ConfirmDialog'
import { LoadingState } from './LoadingState'
import { useToast } from './Toast'

export type EntityId = string | number
export type FormValues = Record<string, string>

export interface SelectOption {
  value: string
  label: string
}

interface CrudFieldCondition {
  field: string
  value?: string
  values?: string[]
}

export interface CrudColumn<T> {
  label: string
  render: (item: T) => ReactNode
  searchValue?: (item: T) => string
}

export interface CrudDetail<T> {
  label: string
  render: (item: T) => ReactNode
}

export interface CrudField {
  name: string
  label: string
  type?: 'text' | 'email' | 'password' | 'date' | 'datetime-local' | 'time' | 'number' | 'tel' | 'select' | 'textarea'
  placeholder?: string
  required?: boolean
  optionalOnEdit?: boolean
  disabledOnEdit?: boolean
  wide?: boolean
  options?: SelectOption[]
  min?: string
  max?: string
  step?: string
  maxLength?: number
  minLength?: number
  pattern?: string
  hint?: string
  showWhen?: CrudFieldCondition | CrudFieldCondition[]
}

interface CrudService<T, TInput, TId extends EntityId> {
  listar: () => Promise<T[]>
  criar: (input: TInput) => Promise<T>
  atualizar: (id: TId, input: TInput) => Promise<T>
  excluir: (id: TId) => Promise<void>
}

interface CrudPageProps<T, TInput, TId extends EntityId> {
  eyebrow?: string
  title: string
  description: string
  singular: string
  searchPlaceholder: string
  service: CrudService<T, TInput, TId>
  getId: (item: T) => TId
  getLabel: (item: T) => string
  columns: CrudColumn<T>[]
  details: CrudDetail<T>[]
  fields: CrudField[]
  emptyValues: FormValues
  toFormValues: (item: T) => FormValues
  toInput: (values: FormValues) => TInput
  canCreate?: boolean
}

type DialogMode = 'create' | 'edit' | 'details' | null

export function CrudPage<T, TInput, TId extends EntityId>({
  eyebrow = 'Cadastros',
  title,
  description,
  singular,
  searchPlaceholder,
  service,
  getId,
  getLabel,
  columns,
  details,
  fields,
  emptyValues,
  toFormValues,
  toInput,
  canCreate = true,
}: CrudPageProps<T, TInput, TId>) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [selected, setSelected] = useState<T | null>(null)
  const [values, setValues] = useState<FormValues>(emptyValues)
  const [submitting, setSubmitting] = useState(false)
  const [toDelete, setToDelete] = useState<T | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { showToast } = useToast()

  const loadItems = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setItems(await service.listar())
    } catch (err) {
      setError(err instanceof Error ? err.message : `Não foi possível carregar ${title.toLocaleLowerCase()}.`)
    } finally {
      setLoading(false)
    }
  }, [service, title])

  useEffect(() => {
    void loadItems()
  }, [loadItems])

  useEffect(() => {
    if (!dialogMode) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) setDialogMode(null)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [dialogMode, submitting])

  const filteredItems = useMemo(() => {
    const term = search.trim().toLocaleLowerCase()
    if (!term) return items
    return items.filter((item) => {
      const searchable = [getLabel(item), ...columns.map((column) => column.searchValue?.(item) ?? '')]
      return searchable.some((value) => value.toLocaleLowerCase().includes(term))
    })
  }, [columns, getLabel, items, search])

  const openCreate = () => {
    setSelected(null)
    setValues({ ...emptyValues })
    setDialogMode('create')
  }

  const openEdit = (item: T) => {
    setSelected(item)
    setValues(toFormValues(item))
    setDialogMode('edit')
  }

  const openDetails = (item: T) => {
    setSelected(item)
    setDialogMode('details')
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      const input = toInput(values)
      const saved = dialogMode === 'edit' && selected
        ? await service.atualizar(getId(selected), input)
        : await service.criar(input)

      setItems((current) => dialogMode === 'edit' && selected
        ? current.map((item) => getId(item) === getId(selected) ? saved : item)
        : [...current, saved])
      showToast(dialogMode === 'edit' ? `${singular} atualizado com sucesso.` : `${singular} cadastrado com sucesso.`)
      setDialogMode(null)
      setSelected(null)
    } catch (err) {
      showToast(err instanceof Error ? err.message : `Não foi possível salvar ${singular.toLocaleLowerCase()}.`, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await service.excluir(getId(toDelete))
      setItems((current) => current.filter((item) => getId(item) !== getId(toDelete)))
      showToast(`${getLabel(toDelete)} foi excluído com sucesso.`)
      setToDelete(null)
    } catch (err) {
      showToast(err instanceof Error ? err.message : `Não foi possível excluir ${singular.toLocaleLowerCase()}.`, 'error')
    } finally {
      setDeleting(false)
    }
  }

  const requestDelete = (item: T) => {
    setDialogMode(null)
    setToDelete(item)
  }

  const isEditing = dialogMode === 'edit'

  return (
    <div>
      <header className="page-header">
        <div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>
        {canCreate && <button className="button button--primary" onClick={openCreate}><Plus size={18} /> Novo {singular.toLocaleLowerCase()}</button>}
      </header>

      <section className="content-card list-card">
        <div className="list-toolbar">
          <label className="search-box">
            <Search size={18} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={searchPlaceholder} aria-label={`Buscar em ${title}`} />
            {search && <button onClick={() => setSearch('')} aria-label="Limpar busca"><X size={17} /></button>}
          </label>
          <span className="result-count">{filteredItems.length} {filteredItems.length === 1 ? 'registro' : 'registros'}</span>
        </div>

        {loading ? <LoadingState label={`Carregando ${title.toLocaleLowerCase()}...`} /> : error ? (
          <div className="error-state"><p>{error}</p><button className="button button--secondary" onClick={loadItems}>Tentar novamente</button></div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state"><span><Search size={28} /></span><h2>Nenhum registro encontrado</h2><p>{search ? 'Tente buscar por outro termo.' : canCreate ? `Cadastre o primeiro ${singular.toLocaleLowerCase()}.` : 'Nenhum cadastro desse perfil está disponível.'}</p></div>
        ) : (
          <div className="table-scroll">
            <table className="data-table entity-table">
              <thead><tr>{columns.map((column) => <th key={column.label}>{column.label}</th>)}<th><span className="sr-only">Ações</span></th></tr></thead>
              <tbody>{filteredItems.map((item) => (
                <tr key={String(getId(item))}>
                  {columns.map((column) => <td key={column.label}>{column.render(item)}</td>)}
                  <td><div className="table-actions">
                    <button className="icon-button" onClick={() => openDetails(item)} title="Visualizar" aria-label={`Visualizar ${getLabel(item)}`}><Eye size={18} /></button>
                    <button className="icon-button" onClick={() => openEdit(item)} title="Editar" aria-label={`Editar ${getLabel(item)}`}><Pencil size={17} /></button>
                    <button className="icon-button icon-button--danger" onClick={() => requestDelete(item)} title="Excluir" aria-label={`Excluir ${getLabel(item)}`}><Trash2 size={17} /></button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>

      {(dialogMode === 'create' || dialogMode === 'edit') && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => !submitting && setDialogMode(null)}>
          <section className="entity-dialog" role="dialog" aria-modal="true" aria-labelledby="entity-form-title" onMouseDown={(event) => event.stopPropagation()}>
            <header className="entity-dialog__header">
              <div><p className="eyebrow">{isEditing ? 'Editar cadastro' : 'Novo cadastro'}</p><h2 id="entity-form-title">{isEditing ? `Editar ${selected ? getLabel(selected) : singular}` : `Cadastrar ${singular.toLocaleLowerCase()}`}</h2></div>
              <button className="icon-button" onClick={() => setDialogMode(null)} disabled={submitting} aria-label="Fechar"><X size={20} /></button>
            </header>
            <form onSubmit={handleSubmit}>
              <div className="form-grid entity-dialog__fields">
                {fields.map((field) => {
                  const conditions = field.showWhen
                    ? Array.isArray(field.showWhen) ? field.showWhen : [field.showWhen]
                    : []
                  const visible = conditions.every((condition) => condition.values
                    ? condition.values.includes(values[condition.field])
                    : values[condition.field] === condition.value)
                  if (!visible) return null
                  const required = Boolean(field.required && !(isEditing && field.optionalOnEdit))
                  const commonProps = {
                    id: `field-${field.name}`,
                    value: values[field.name] ?? '',
                    required,
                    disabled: submitting || Boolean(isEditing && field.disabledOnEdit),
                    placeholder: field.placeholder,
                    maxLength: field.maxLength,
                    minLength: field.minLength,
                    onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setValues((current) => ({ ...current, [field.name]: event.target.value })),
                  }
                  return (
                    <label className={`field ${field.wide ? 'field--wide' : ''}`} key={field.name} htmlFor={commonProps.id}>
                      <span>{field.label} {required && <em>*</em>}</span>
                      {field.type === 'textarea' ? <textarea {...commonProps} rows={4} /> : field.type === 'select' ? (
                        <select {...commonProps}>
                          <option value="">Selecione...</option>
                          {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      ) : (
                        <input {...commonProps} type={field.type ?? 'text'} min={field.min} max={field.max} step={field.step} pattern={field.pattern} />
                      )}
                      {field.hint && <small className="field__hint">{field.hint}</small>}
                    </label>
                  )
                })}
              </div>
              <footer className="entity-dialog__actions">
                <button type="button" className="button button--secondary" onClick={() => setDialogMode(null)} disabled={submitting}>Cancelar</button>
                <button type="submit" className="button button--primary" disabled={submitting}>{submitting && <span className="button-spinner" />}{submitting ? 'Salvando...' : 'Salvar cadastro'}</button>
              </footer>
            </form>
          </section>
        </div>
      )}

      {dialogMode === 'details' && selected && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setDialogMode(null)}>
          <section className="entity-dialog entity-dialog--details" role="dialog" aria-modal="true" aria-labelledby="entity-details-title" onMouseDown={(event) => event.stopPropagation()}>
            <header className="entity-dialog__header">
              <div><p className="eyebrow">Detalhes do registro</p><h2 id="entity-details-title">{getLabel(selected)}</h2></div>
              <button className="icon-button" onClick={() => setDialogMode(null)} aria-label="Fechar"><X size={20} /></button>
            </header>
            <dl className="entity-details-grid">{details.map((detail) => <div key={detail.label}><dt>{detail.label}</dt><dd>{detail.render(selected) || '—'}</dd></div>)}</dl>
            <footer className="entity-dialog__actions">
              <button className="button button--danger-ghost" onClick={() => requestDelete(selected)}><Trash2 size={17} /> Excluir</button>
              <button className="button button--primary" onClick={() => openEdit(selected)}><Pencil size={17} /> Editar</button>
            </footer>
          </section>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={`Excluir ${singular.toLocaleLowerCase()}?`}
        description={`O registro de ${toDelete ? getLabel(toDelete) : singular.toLocaleLowerCase()} será removido. Esta ação não poderá ser desfeita.`}
        loading={deleting}
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
