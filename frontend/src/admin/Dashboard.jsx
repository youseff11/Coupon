import { Link } from 'react-router-dom'
import { Store, Ticket, Copy, Clock, Plus, TrendingUp, AlertTriangle, Tags } from 'lucide-react'
import { useFetch, Spinner, StoreLogo } from '../components/common'
import { formatNumber } from '../config'
import { PageHeader } from './ui'

function Stat({ icon: Icon, label, value, hint, color }) {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-icon"><Icon size={22} /></div>
      <div>
        <span className="stat-label">{label}</span>
        <strong className="stat-value">{formatNumber(value)}</strong>
        {hint && <span className="stat-hint">{hint}</span>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { data, loading } = useFetch('/admin/stats/')
  if (loading || !data) return <Spinner />

  const maxCopies = Math.max(1, ...data.top_stores.map((s) => s.copies))

  return (
    <>
      <PageHeader title="نظرة عامة" subtitle="ملخص أداء الموقع والكوبونات">
        <Link to="/admin/stores?new=1" className="btn btn-outline"><Plus size={18} /> شركة جديدة</Link>
        <Link to="/admin/coupons?new=1" className="btn btn-primary"><Plus size={18} /> كوبون جديد</Link>
      </PageHeader>

      <div className="stats-grid">
        <Stat icon={Store} label="الشركات" value={data.stores} hint={`${formatNumber(data.active_stores)} مفعلة`} color="violet" />
        <Stat icon={Ticket} label="كوبونات فعالة" value={data.live_coupons} hint={`من أصل ${formatNumber(data.coupons)}`} color="green" />
        <Stat icon={Copy} label="مرات النسخ" value={data.total_copies} hint="إجمالي استخدام الأكواد" color="orange" />
        <Stat icon={Clock} label="تنتهي خلال 7 أيام" value={data.expiring_soon} hint={`${formatNumber(data.expired_coupons)} منتهية`} color="red" />
      </div>

      <div className="dash-grid">
        <section className="card adm-card">
          <div className="adm-card-head">
            <h2><TrendingUp size={18} /> الأكواد الأكثر نسخاً</h2>
            <Link to="/admin/coupons" className="see-all">الكل</Link>
          </div>
          <div className="top-list">
            {data.top_coupons.map((c, i) => (
              <div key={c.id} className="top-item">
                <span className="top-rank">{i + 1}</span>
                <StoreLogo store={c.store_info} size={40} />
                <div className="top-text">
                  <strong>{c.title}</strong>
                  <span>{c.store_info.name} {c.code && <code>{c.code}</code>}</span>
                </div>
                <span className="top-value">{formatNumber(c.copies_count)}</span>
              </div>
            ))}
            {!data.top_coupons.length && <p className="muted">لا توجد بيانات بعد.</p>}
          </div>
        </section>

        <section className="card adm-card">
          <div className="adm-card-head">
            <h2><Store size={18} /> أفضل الشركات أداءً</h2>
          </div>
          <div className="bars">
            {data.top_stores.map((s) => (
              <div key={s.id} className="bar-row">
                <span className="bar-label">{s.name}</span>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${(s.copies / maxCopies) * 100}%` }} /></div>
                <span className="bar-value">{formatNumber(s.copies)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="quick-grid">
        {data.expiring_soon > 0 && (
          <Link to="/admin/coupons?status=active" className="quick-card warn">
            <AlertTriangle size={20} />
            <span>لديك {formatNumber(data.expiring_soon)} كوبون ينتهي خلال أسبوع — راجعها وحدّث تواريخها.</span>
          </Link>
        )}
        <Link to="/admin/categories" className="quick-card">
          <Tags size={20} />
          <span>{formatNumber(data.categories)} تصنيف — نظّم المتاجر في تصنيفات لتسهيل التصفح.</span>
        </Link>
      </div>
    </>
  )
}
