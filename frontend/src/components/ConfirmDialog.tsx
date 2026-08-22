import { AlertTriangle, X } from 'lucide-react'
import { useEffect } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Excluir registro',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) onCancel()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [loading, onCancel, open])

  if (!open) return null

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={() => !loading && onCancel()}>
      <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="confirm-dialog__header">
          <span className="confirm-dialog__icon"><AlertTriangle size={23} /></span>
          <button className="icon-button" onClick={onCancel} disabled={loading} aria-label="Fechar"><X size={20} /></button>
        </div>
        <h2 id="dialog-title">{title}</h2>
        <p>{description}</p>
        <div className="confirm-dialog__actions">
          <button className="button button--secondary" onClick={onCancel} disabled={loading}>Cancelar</button>
          <button className="button button--danger" onClick={onConfirm} disabled={loading}>
            {loading ? <span className="button-spinner" /> : null}
            {loading ? 'Excluindo...' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  )
}
