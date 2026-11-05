import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ExternalLink, BadgeCheck, Ticket, ChevronLeft, Store as StoreIcon, Lightbulb } from 'lucide-react'
import CategoryIcon from '../components/CategoryIcon'
import { useFetch, StoreLogo, Spinner, Empty } from '../components/common'
import { CouponCard, CouponModal } from '../components/Coupon'
import { formatNumber, SITE } from '../config'

export default function StorePage() {
  const { slug } = useParams()
  const [params, setParams] = useSearchParams()
  const [filter, setFilter] = useState('all')
  const [active, setActive] = useState(null)
  const { data: store, loading, error } = useFetch(`/stores/${encodeURIComponent(slug)}/`)
  const related = useFetch(store?.category ? '/stores/' : null, { all: 1 })

  useEffect(() => {
    if (store) document.title = `كود خصم ${store.name} | ${SITE.name}`
    return () => { document.title = `${SITE.name} | أكواد خصم وكوبونات فعالة` }
  }, [store])

  // Shared links look like /stores/noon?c=12 — open that coupon directly.
  useEffect(() => {
    const id = params.get('c')
    if (store && id) {
      const c = store.coupons.find((x) => String(x.id) === id)
      if (c) setActive(c)
    }
  }, [store, params])

  const close = useCallback(() => {
    setActive(null)
    if (params.get('c')) {
      params.delete('c')
      setParams(params, { replace: true })
    }
  }, [params, setParams])

  const coupons = useMemo(() => {
    const all = store?.coupons || []
    if (filter === 'codes') return all.filter((c) => c.code)
    if (filter === 'deals') return all.filter((c) => !c.code)
    return all
  }, [store, filter])

  if (loading) return <div className="container"><Spinner /></div>
  if (error || !store) {
    return (
      <div className="container">
        <Empty icon={StoreIcon} title="المتجر غير موجود" text="ربما تم حذفه أو تغيير رابطه.">
          <Link to="/stores" className="btn btn-primary">تصفح كل المتاجر</Link>
        </Empty>
      </div>
    )
  }

  const codesCount = store.coupons.filter((c) => c.code).length
  const relatedStores = (related.data || [])
    .filter((s) => s.category === store.category && s.id !== store.id)
    .slice(0, 6)

  return (
    <>
      <div className="store-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link to="/">الرئيسية</Link> <ChevronLeft size={14} />
            <Link to="/stores">المتاجر</Link> <ChevronLeft size={14} />
            <span>{store.name}</span>
          </nav>
          <div className="store-hero-inner">
            <StoreLogo store={store} size={112} className="store-hero-logo" />
            <div className="store-hero-text">
              <h1>كود خصم {store.name}</h1>
              <p>{store.description || `أحدث كوبونات وأكواد خصم ${store.name} الفعالة.`}</p>
              <div className="store-stats">
                <span><Ticket size={16} /> {formatNumber(store.coupons_count)} كوبون فعال</span>
                <span><BadgeCheck size={16} /> {formatNumber(store.coupons.filter((c) => c.is_verified).length)} موثق</span>
                {store.category_name && <Link to={`/stores?category=${store.category_slug}`}><CategoryIcon name={store.category_icon} size={16} /> {store.category_name}</Link>}
              </div>
            </div>
            {store.website_url && (
              <a href={store.website_url} className="btn btn-accent btn-lg store-visit" target="_blank" rel="noopener noreferrer nofollow">
                زيارة الموقع <ExternalLink size={18} />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="container store-layout">
        <section>
          <div className="filter-tabs">
            {[
              ['all', `الكل (${store.coupons.length})`],
              ['codes', `أكواد (${codesCount})`],
              ['deals', `عروض (${store.coupons.length - codesCount})`],
            ].map(([key, label]) => (
              <button key={key} className={filter === key ? 'active' : ''} onClick={() => setFilter(key)}>{label}</button>
            ))}
          </div>
          {coupons.length ? (
            <div className="coupon-list">
              {coupons.map((c) => <CouponCard key={c.id} coupon={c} store={store} onOpen={setActive} />)}
            </div>
          ) : (
            <Empty icon={Ticket} title="لا توجد كوبونات حالياً" text="تابعنا، نضيف أكواداً جديدة باستمرار." />
          )}
        </section>

        <aside className="store-aside">
          <div className="card aside-card">
            <h3><Lightbulb size={18} /> كيف تستخدم كود خصم {store.name}؟</h3>
            <ol className="steps">
              <li>اضغط على <b>انسخ الكود</b> ليتم نسخه تلقائياً.</li>
              <li>اذهب إلى موقع أو تطبيق {store.name} وأضف المنتجات للسلة.</li>
              <li>الصق الكود في خانة <b>كود الخصم</b> عند الدفع.</li>
              <li>استمتع بالتوفير!</li>
            </ol>
          </div>
          {relatedStores.length > 0 && (
            <div className="card aside-card">
              <h3>متاجر مشابهة</h3>
              <div className="related-list">
                {relatedStores.map((s) => (
                  <Link key={s.id} to={`/stores/${s.slug}`} className="related-item">
                    <StoreLogo store={s} size={44} />
                    <div>
                      <strong>{s.name}</strong>
                      <span>{formatNumber(s.coupons_count)} كوبون</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      <CouponModal coupon={active} store={store} onClose={close} />
    </>
  )
}
