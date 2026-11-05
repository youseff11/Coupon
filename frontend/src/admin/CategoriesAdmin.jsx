import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Tags } from 'lucide-react'
import { api } from '../api'
import { Spinner, Empty } from '../components/common'
import CategoryIcon, { CATEGORY_ICONS } from '../components/CategoryIcon'
import { useToast } from '../components/Toast'
import { Confirm, Modal, PageHeader } from './ui'

const EMPTY = { name: '', slug: '', icon: 'tag', order: 0 }
const ICONS = Object.keys(CATEGORY_ICONS)

export default function CategoriesAdmin() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(undefined)
  const [form, setForm] = useState(EMPTY)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const toast = useToast()

  const load = useCallback(() => {
    setLoading(true)
    api.get('/admin/categories/').then(setItems).finally(() => setLoading(false))
  }, [])
  useEffect(load, [load])

  const open = (cat) => {
    setEditing(cat)
    setForm(cat ? { name: cat.name, slug: cat.slug, icon: cat.icon, order: cat.order } : { ...EMPTY, order: items.length })
    setError('')
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const body = { ...form, order: Number(form.order) || 0 }
      if (editing?.id) await api.patch(`/admin/categories/${editing.id}/`, body)
      else await api.post('/admin/categories/', body)
      toast('تم حفظ التصنيف')
      setEditing(undefined)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    try {
      await api.del(`/admin/categories/${deleting.id}/`)
      toast('تم حذف التصنيف')
      setDeleting(null)
      load()
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader title="التصنيفات" subtitle="نظّم الشركات في تصنيفات تظهر في الموقع">
        <button className="btn btn-primary" onClick={() => open(null)}><Plus size={18} /> إضافة تصنيف</button>
      </PageHeader>

      {loading ? <Spinner /> : !items.length ? (
        <div className="card adm-card"><Empty icon={Tags} title="لا توجد تصنيفات" /></div>
      ) : (
        <div className="cat-admin-grid">
          {items.map((c) => (
            <div key={c.id} className="card cat-admin-card">
              <span className="cat-admin-icon"><CategoryIcon name={c.icon} size={24} /></span>
              <div className="cat-admin-text">
                <strong>{c.name}</strong>
                <span>{c.stores_count} شركة • ترتيب {c.order}</span>
              </div>
              <div className="cell-actions">
                <button className="icon-btn" onClick={() => open(c)} title="تعديل"><Pencil size={18} /></button>
                <button className="icon-btn danger" onClick={() => setDeleting(c)} title="حذف"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={editing !== undefined}
        title={editing?.id ? 'تعديل التصنيف' : 'إضافة تصنيف'}
        onClose={() => setEditing(undefined)}
        footer={(
          <>
            <button className="btn btn-ghost" onClick={() => setEditing(undefined)}>إلغاء</button>
            <button type="submit" form="cat-form" className="btn btn-primary" disabled={busy}>حفظ</button>
          </>
        )}
      >
        <form id="cat-form" className="form-grid" onSubmit={submit}>
          {error && <div className="alert alert-danger span-2">{error}</div>}
          <label className="field span-2">
            <span>اسم التصنيف *</span>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <div className="field span-2">
            <span>الأيقونة</span>
            <div className="icon-picker">
              {ICONS.map((i) => (
                <button type="button" key={i} className={form.icon === i ? 'active' : ''} onClick={() => setForm({ ...form, icon: i })} title={i} aria-label={i}><CategoryIcon name={i} size={20} /></button>
              ))}
            </div>
          </div>
          <label className="field">
            <span>الرابط (slug)</span>
            <input className="input input-ltr" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="تلقائي" />
          </label>
          <label className="field">
            <span>الترتيب</span>
            <input className="input" type="number" min="0" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
          </label>
        </form>
      </Modal>

      <Confirm
        open={!!deleting}
        text={<>حذف التصنيف <b>{deleting?.name}</b>؟ لن يتم حذف الشركات التابعة له.</>}
        onCancel={() => setDeleting(null)}
        onConfirm={remove}
        busy={busy}
      />
    </>
  )
}
