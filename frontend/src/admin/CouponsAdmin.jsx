import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Search, Pencil, Trash2, Ticket, Copy, Shuffle } from 'lucide-react'
import { api } from '../api'
import { Spinner, Empty, StoreLogo, useFetch } from '../components/common'
import { useToast } from '../components/Toast'
import { copyText, daysLeft, formatDate, formatNumber } from '../config'
import { Confirm, Modal, PageHeader, Pagination, Switch } from './ui'

const EMPTY = {
  store: '', title: '', code: '', discount: '', description: '', link: '', expires_at: '',
  is_verified: true, is_exclusive: false, is_active: true,
}

function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function StatusTag({ coupon }) {
  if (!coupon.is_active) return <span className="tag tag-muted">معطل</span>
  if (coupon.is_expired) return <span className="tag tag-danger">منتهي</span>
  const d = daysLeft(coupon.expires_at)
  if (d != null && d <= 7) return <span className="tag tag-warning">ينتهي قريباً</span>
  return <span className="tag tag-success">فعال</span>
}

function CouponForm({ coupon, stores, defaultStore, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const toast = useToast()

  useEffect(() => {
    if (coupon === undefined) return
    setForm(coupon ? {
      store: coupon.store, title: coupon.title, code: coupon.code, discount: coupon.discount,
      description: coupon.description, link: coupon.link, expires_at: coupon.expires_at || '',
      is_verified: coupon.is_verified, is_exclusive: coupon.is_exclusive, is_active: coupon.is_active,
    } : { ...EMPTY, store: defaultStore || '' })
    setError('')
  }, [coupon, defaultStore])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e?.target ? e.target.value : e }))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const body = { ...form, expires_at: form.expires_at || null, code: form.code.trim() }
    try {
      if (coupon?.id) await api.patch(`/admin/coupons/${coupon.id}/`, body)
      else await api.post('/admin/coupons/', body)
      toast(coupon?.id ? 'تم تحديث الكوبون' : 'تمت إضافة الكوبون')
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={coupon !== undefined}
      title={coupon?.id ? 'تعديل الكوبون' : 'إضافة كوبون جديد'}
      onClose={onClose}
      wide
      footer={(
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>إلغاء</button>
          <button type="submit" form="coupon-form" className="btn btn-primary" disabled={busy}>{busy ? 'جاري الحفظ...' : 'حفظ'}</button>
        </>
      )}
    >
      <form id="coupon-form" className="form-grid" onSubmit={submit}>
        {error && <div className="alert alert-danger span-2">{error}</div>}
        <label className="field span-2">
          <span>الشركة *</span>
          <select className="select" required value={form.store} onChange={set('store')}>
            <option value="">اختر الشركة</option>
            {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <label className="field span-2">
          <span>عنوان الكوبون *</span>
          <input className="input" required value={form.title} onChange={set('title')} placeholder="مثال: خصم 15% على جميع المنتجات" />
        </label>
        <label className="field">
          <span>كود الخصم</span>
          <div className="input-group">
            <input className="input input-ltr code-input" value={form.code} onChange={set('code')} placeholder="SAVE15" />
            <button type="button" className="btn btn-outline" onClick={() => set('code')(randomCode())} title="توليد كود"><Shuffle size={16} /></button>
          </div>
          <small>اتركه فارغاً لو كان عرضاً بدون كود.</small>
        </label>
        <label className="field">
          <span>قيمة الخصم</span>
          <input className="input" value={form.discount} onChange={set('discount')} placeholder="15% أو 100 جنيه" />
        </label>
        <label className="field">
          <span>رابط العرض</span>
          <input className="input input-ltr" type="url" value={form.link} onChange={set('link')} placeholder="https://..." />
          <small>إن ترك فارغاً سيُستخدم رابط موقع الشركة.</small>
        </label>
        <label className="field">
          <span>تاريخ الانتهاء</span>
          <input className="input" type="date" value={form.expires_at} onChange={set('expires_at')} />
          <small>اتركه فارغاً لكوبون بدون تاريخ انتهاء.</small>
        </label>
        <label className="field span-2">
          <span>التفاصيل والشروط</span>
          <textarea className="textarea" rows={3} value={form.description} onChange={set('description')} placeholder="شروط استخدام الكود..." />
        </label>
        <div className="span-2 switch-row">
          <Switch checked={form.is_active} onChange={set('is_active')} label="مفعل" />
          <Switch checked={form.is_verified} onChange={set('is_verified')} label="موثق" />
          <Switch checked={form.is_exclusive} onChange={set('is_exclusive')} label="حصري" />
        </div>
      </form>
    </Modal>
  )
}

export default function CouponsAdmin() {
  const [params, setParams] = useSearchParams()
  const [list, setList] = useState({ results: [], count: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [editing, setEditing] = useState(undefined)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)
  const toast = useToast()
  const { data: stores } = useFetch('/admin/stores/', { all: 1 })
  const storeFilter = params.get('store') || ''
  const status = params.get('status') || ''

  const setFilter = (key, value) => {
    if (value) params.set(key, value)
    else params.delete(key)
    setParams(params, { replace: true })
    setPage(1)
  }

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
    api.get('/admin/coupons/', { page, search: debounced, store: storeFilter, status })
      .then(setList)
      .catch((e) => toast(e.message, 'error'))
      .finally(() => setLoading(false))
  }, [page, debounced, storeFilter, status, toast])

  useEffect(load, [load])

  const toggle = async (coupon, value) => {
    setList((l) => ({ ...l, results: l.results.map((c) => (c.id === coupon.id ? { ...c, is_active: value } : c)) }))
    try {
      await api.patch(`/admin/coupons/${coupon.id}/`, { is_active: value })
    } catch (e) {
      toast(e.message, 'error')
      load()
    }
  }

  const remove = async () => {
    setBusy(true)
    try {
      await api.del(`/admin/coupons/${deleting.id}/`)
      toast('تم حذف الكوبون')
      setDeleting(null)
      load()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const copy = async (code) => {
    if (await copyText(code)) toast(`تم نسخ ${code}`)
  }

  return (
    <>
      <PageHeader title="أكواد الخصم" subtitle={`${formatNumber(list.count)} كوبون`}>
        <button className="btn btn-primary" onClick={() => setEditing(null)}><Plus size={18} /> إضافة كوبون</button>
      </PageHeader>

      <div className="card adm-card">
        <div className="adm-filters">
          <div className="search-box">
            <Search size={18} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث بالعنوان أو الكود أو الشركة..." />
          </div>
          <select className="select" value={storeFilter} onChange={(e) => setFilter('store', e.target.value)}>
            <option value="">كل الشركات</option>
            {(stores || []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select className="select" value={status} onChange={(e) => setFilter('status', e.target.value)}>
            <option value="">كل الحالات</option>
            <option value="active">فعال</option>
            <option value="expired">منتهي</option>
            <option value="inactive">معطل</option>
          </select>
        </div>

        {loading ? <Spinner /> : !list.results.length ? (
          <Empty icon={Ticket} title="لا توجد كوبونات" text="أضف كوبوناً جديداً أو غيّر الفلاتر.">
            <button className="btn btn-primary" onClick={() => setEditing(null)}><Plus size={18} /> إضافة كوبون</button>
          </Empty>
        ) : (
          <div className="table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>الكوبون</th>
                  <th>الكود</th>
                  <th>الخصم</th>
                  <th>الانتهاء</th>
                  <th>النسخ</th>
                  <th>الحالة</th>
                  <th>مفعل</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {list.results.map((c) => (
                  <tr key={c.id}>
                    <td data-label="الكوبون">
                      <div className="cell-store">
                        <StoreLogo store={c.store_info} size={40} />
                        <div>
                          <strong className="clamp">{c.title}</strong>
                          <span>{c.store_info.name}{c.is_exclusive && ' • حصري'}</span>
                        </div>
                      </div>
                    </td>
                    <td data-label="الكود">
                      {c.code ? (
                        <button className="code-chip" onClick={() => copy(c.code)} title="نسخ">
                          <span dir="ltr">{c.code}</span> <Copy size={13} />
                        </button>
                      ) : <span className="muted">عرض بدون كود</span>}
                    </td>
                    <td data-label="الخصم">{c.discount || '—'}</td>
                    <td data-label="الانتهاء" className="nowrap">{c.expires_at ? formatDate(c.expires_at) : <span className="muted">مفتوح</span>}</td>
                    <td data-label="النسخ">{formatNumber(c.copies_count)}</td>
                    <td data-label="الحالة"><StatusTag coupon={c} /></td>
                    <td data-label="مفعل"><Switch checked={c.is_active} onChange={(v) => toggle(c, v)} /></td>
                    <td className="cell-actions">
                      <button className="icon-btn" title="تعديل" onClick={() => setEditing(c)}><Pencil size={18} /></button>
                      <button className="icon-btn danger" title="حذف" onClick={() => setDeleting(c)}><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} count={list.count} onChange={setPage} />
      </div>

      <CouponForm
        coupon={editing}
        stores={stores || []}
        defaultStore={storeFilter}
        onClose={() => setEditing(undefined)}
        onSaved={() => { setEditing(undefined); load() }}
      />
      <Confirm
        open={!!deleting}
        text={<>هل أنت متأكد من حذف الكوبون <b>{deleting?.title}</b>؟</>}
        onCancel={() => setDeleting(null)}
        onConfirm={remove}
        busy={busy}
      />
    </>
  )
}
