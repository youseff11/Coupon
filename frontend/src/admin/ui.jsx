import { useEffect } from 'react'
import { X, ChevronRight, ChevronLeft, AlertTriangle } from 'lucide-react'

export function Modal({ open, title, onClose, children, footer, wide }) {
  useEffect(() => {
    if (!open) return
    const esc = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', esc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', esc)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="modal-backdrop adm-modal-backdrop" onMouseDown={onClose}>
      <div className={`modal adm-modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <div className="adm-modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="إغلاق"><X size={20} /></button>
        </div>
        <div className="adm-modal-body">{children}</div>
        {footer && <div className="adm-modal-foot">{footer}</div>}
      </div>
    </div>
  )
}

export function Confirm({ open, title = 'تأكيد الحذف', text, onCancel, onConfirm, busy }) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      footer={(
        <>
          <button className="btn btn-ghost" onClick={onCancel}>إلغاء</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={busy}>{busy ? 'جاري الحذف...' : 'حذف'}</button>
        </>
      )}
    >
      <div className="confirm-body">
        <div className="confirm-icon"><AlertTriangle size={26} /></div>
        <p>{text}</p>
      </div>
    </Modal>
  )
}

export function Switch({ checked, onChange, label, disabled }) {
  return (
    <label className={`switch ${disabled ? 'disabled' : ''}`}>
      <input type="checkbox" checked={!!checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className="switch-track"><span className="switch-thumb" /></span>
      {label && <span className="switch-label">{label}</span>}
    </label>
  )
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="adm-page-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div className="adm-page-actions">{children}</div>}
    </div>
  )
}

export function Pagination({ page, count, pageSize = 24, onChange }) {
  const pages = Math.ceil(count / pageSize)
  if (pages <= 1) return null
  return (
    <div className="pagination">
      <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronRight size={16} /> السابق
      </button>
      <span>صفحة {page} من {pages}</span>
      <button className="btn btn-ghost btn-sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        التالي <ChevronLeft size={16} />
      </button>
    </div>
  )
}
