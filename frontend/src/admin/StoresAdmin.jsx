import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Search, Pencil, Trash2, ExternalLink, ImagePlus, Store as StoreIcon, Ticket } from 'lucide-react'
import { api } from '../api'
import { Spinner, Empty, StoreLogo, useFetch } from '../components/common'
import { useToast } from '../components/Toast'
import { formatNumber } from '../config'
import { Confirm, Modal, PageHeader, Pagination, Switch } from './ui'

const EMPTY = { name: '', slug: '', description: '', website_url: '', category: '', is_featured: false, is_active: true }

function LogoInput({ preview, onFile, onRemove }) {
  const ref = useRef(null)
  const [drag, setDrag] = useState(false)

  const pick = (file) => {
    if (file && file.type.startsWith('image/')) onFile(file)
  }

  return (
    <div
      className={`logo-drop ${drag ? 'drag' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]) }}
    >
      {preview ? (
        <img src={preview} alt="" className="logo-preview" />
      ) : (
        <div className="logo-placeholder"><ImagePlus size={28} /></div>
      )}
      <div className="logo-drop-text">
        <strong>شعار الشركة</strong>
        <span>اسحب الصورة هنا أو اختر ملفاً (PNG, JPG, SVG — يفضل مربع)</span>
        <div className="logo-drop-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={() => ref.current.click()}>اختيار صورة</button>
          {preview && <button type="button" className="btn btn-ghost btn-sm" onClick={onRemove}>إزالة</button>}
        </div>
      </div>
      <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => { pick(e.target.files[0]); e.target.value = '' }} />
    </div>
  )
}

function StoreForm({ store, categories, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY)
  const [logo, setLogo] = useState(null)
  const [preview, setPreview] = useState(null)
  const [removeLogo, setRemoveLogo] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const toast = useToast()

  useEffect(() => {
    setForm(store ? {
      name: store.name, slug: store.slug, description: store.description || '', website_url: store.website_url || '',
      category: store.category || '', is_featured: store.is_featured, is_active: store.is_active,
    } : EMPTY)
    setPreview(store?.logo || null)
    setLogo(null)
    setRemoveLogo(false)
    setError('')
  }, [store])

  useEffect(() => () => { if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview) }, [preview])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e?.target ? e.target.value : e }))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, typeof v === 'boolean' ? String(v) : v ?? ''))
    if (logo) fd.append('logo', logo)
    if (removeLogo && !logo) fd.append('remove_logo', 'true')
    try {
      if (store?.id) await api.patch(`/admin/stores/${store.id}/`, fd)
      else await api.post('/admin/stores/', fd)
      toast(store?.id ? 'تم تحديث الشركة' : 'تمت إضافة الشركة')
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={store !== undefined}
      title={store?.id ? `تعديل: ${store.name}` : 'إضافة شركة جديدة'}
      onClose={onClose}
      wide
      footer={(
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>إلغاء</button>
          <button type="submit" form="store-form" className="btn btn-primary" disabled={busy}>{busy ? 'جاري الحفظ...' : 'حفظ'}</button>
        </>
      )}
    >
      <form id="store-form" className="form-grid" onSubmit={submit}>
        {error && <div className="alert alert-danger span-2">{error}</div>}
        <div className="span-2">
          <LogoInput
            preview={preview}
            onFile={(f) => { setLogo(f); setPreview(URL.createObjectURL(f)); setRemoveLogo(false) }}
            onRemove={() => { setLogo(null); setPreview(null); setRemoveLogo(true) }}
          />
        </div>
        <label className="field">
          <span>اسم الشركة *</span>
          <input className="input" required value={form.name} onChange={set('name')} placeholder="مثال: نون" />
        </label>
        <label className="field">
          <span>رابط الصفحة (slug)</span>
          <input className="input input-ltr" value={form.slug} onChange={set('slug')} placeholder="noon" />
          <small>يُستخدم في رابط صفحة الشركة. اتركه فارغاً للتوليد التلقائي.</small>
        </label>
        <label className="field">
          <span>التصنيف</span>
          <select className="select" value={form.category} onChange={set('category')}>
            <option value="">بدون تصنيف</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="field">
          <span>رابط الموقع</span>
          <input className="input input-ltr" type="url" value={form.website_url} onChange={set('website_url')} placeholder="https://www.example.com" />
        </label>
        <label className="field span-2">
          <span>الوصف</span>
          <textarea className="textarea" rows={3} value={form.description} onChange={set('description')}
            placeholder="وصف مختصر يظهر في صفحة الشركة" />
        </label>
        <div className="span-2 switch-row">
          <Switch checked={form.is_active} onChange={set('is_active')} label="مفعلة (تظهر في الموقع)" />
          <Switch checked={form.is_featured} onChange={set('is_featured')} label="شركة مميزة (تظهر في الرئيسية)" />
        </div>
      </form>
    </Modal>
  )
}

export default function StoresAdmin() {
  const [params, setParams] = useSearchParams()
  const [list, setList] = useState({ results: [], count: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [status, setStatus] = useState('')
  const [editing, setEditing] = useState(undefined)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)
  const toast = useToast()
  const { data: categories } = useFetch('/admin/categories/')

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search.trim()); setPage(1) }, 300)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    if (params.get('new')) {
      setEditing(null)
      params.delete('new')
      setParams(params, { replace: true })
    }
  }, [params, setParams])

  const load = useCallback(() => {
    setLoading(true)
    api.get('/admin/stores/', { page, search: debounced, status })
      .then(setList)
      .catch((e) => toast(e.message, 'error'))
      .finally(() => setLoading(false))
  }, [page, debounced, status, toast])

  useEffect(load, [load])

  const toggle = async (store, field, value) => {
    setList((l) => ({ ...l, results: l.results.map((s) => (s.id === store.id ? { ...s, [field]: value } : s)) }))
    try {
      await api.patch(`/admin/stores/${store.id}/`, { [field]: value })
    } catch (e) {
      toast(e.message, 'error')
      load()
    }
  }

  const remove = async () => {
    setBusy(true)
    try {
      await api.del(`/admin/stores/${deleting.id}/`)
      toast('تم حذف الشركة')
      setDeleting(null)
      load()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader title="الشركات والمتاجر" subtitle={`${formatNumber(list.count)} شركة`}>
        <button className="btn btn-primary" onClick={() => setEditing(null)}><Plus size={18} /> إضافة شركة</button>
      </PageHeader>

      <div className="card adm-card">
        <div className="adm-filters">
          <div className="search-box">
            <Search size={18} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث باسم الشركة..." />
          </div>
          <select className="select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
            <option value="">كل الحالات</option>
            <option value="active">مفعلة</option>
            <option value="inactive">معطلة</option>
          </select>
        </div>

        {loading ? <Spinner /> : !list.results.length ? (
          <Empty icon={StoreIcon} title="لا توجد شركات" text="ابدأ بإضافة أول شركة.">
            <button className="btn btn-primary" onClick={() => setEditing(null)}><Plus size={18} /> إضافة شركة</button>
          </Empty>
        ) : (
          <div className="table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>الشركة</th>
                  <th>التصنيف</th>
                  <th>الكوبونات</th>
                  <th>مميزة</th>
                  <th>مفعلة</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {list.results.map((s) => (
                  <tr key={s.id}>
                    <td data-label="الشركة">
                      <div className="cell-store">
                        <StoreLogo store={s} size={44} />
                        <div>
                          <strong>{s.name}</strong>
                          <span dir="ltr">/{s.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td data-label="التصنيف">{s.category_name || <span className="muted">—</span>}</td>
                    <td data-label="الكوبونات">
                      <Link to={`/admin/coupons?store=${s.id}`} className="tag tag-primary"><Ticket size={13} /> {formatNumber(s.coupons_count)}</Link>
                    </td>
                    <td data-label="مميزة"><Switch checked={s.is_featured} onChange={(v) => toggle(s, 'is_featured', v)} /></td>
                    <td data-label="مفعلة"><Switch checked={s.is_active} onChange={(v) => toggle(s, 'is_active', v)} /></td>
                    <td className="cell-actions">
                      <Link to={`/admin/coupons?store=${s.id}&new=1`} className="icon-btn" title="إضافة كوبون"><Plus size={18} /></Link>
                      <a href={`/stores/${s.slug}`} target="_blank" rel="noreferrer" className="icon-btn" title="عرض"><ExternalLink size={18} /></a>
                      <button className="icon-btn" title="تعديل" onClick={() => setEditing(s)}><Pencil size={18} /></button>
                      <button className="icon-btn danger" title="حذف" onClick={() => setDeleting(s)}><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} count={list.count} onChange={setPage} />
      </div>

      <StoreForm
        store={editing}
        categories={categories || []}
        onClose={() => setEditing(undefined)}
        onSaved={() => { setEditing(undefined); load() }}
      />
      <Confirm
        open={!!deleting}
        text={<>هل أنت متأكد من حذف <b>{deleting?.name}</b>؟ سيتم حذف جميع الكوبونات الخاصة بها ({formatNumber(deleting?.coupons_count)}).</>}
        onCancel={() => setDeleting(null)}
        onConfirm={remove}
        busy={busy}
      />
    </>
  )
}
