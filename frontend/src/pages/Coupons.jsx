import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Ticket } from 'lucide-react'
import { api } from '../api'
import { Spinner, Empty } from '../components/common'
import { CouponCard, CouponModal } from '../components/Coupon'

const TABS = [
  ['', 'الأحدث'],
  ['popular', 'الأكثر استخداماً'],
  ['exclusive', 'حصري'],
]

export default function Coupons() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('ordering') || ''
  const [items, setItems] = useState([])
  const [next, setNext] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState(null)

  useEffect(() => { setPage(1) }, [tab])

  useEffect(() => {
    let alive = true
    setLoading(true)
    const query = { page, ordering: tab === 'popular' ? 'popular' : '', exclusive: tab === 'exclusive' ? 1 : '' }
    api.get('/coupons/', query).then((d) => {
      if (!alive) return
      setItems((prev) => (page === 1 ? d.results : [...prev, ...d.results]))
      setNext(d.next)
    }).finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [tab, page])

  return (
    <div className="container page">
      <div className="page-head">
        <h1>أحدث كوبونات وأكواد الخصم</h1>
        <p>كل الأكواد الفعالة من جميع المتاجر في مكان واحد.</p>
      </div>
      <div className="filter-tabs">
        {TABS.map(([key, label]) => (
          <button key={key} className={tab === key ? 'active' : ''}
            onClick={() => { key ? params.set('ordering', key) : params.delete('ordering'); setParams(params) }}>
            {label}
          </button>
        ))}
      </div>
      {items.length > 0 && (
        <div className="coupon-list">
          {items.map((c) => <CouponCard key={c.id} coupon={c} showStore onOpen={setActive} />)}
        </div>
      )}
      {loading && <Spinner />}
      {!loading && !items.length && <Empty icon={Ticket} title="لا توجد كوبونات" />}
      {!loading && next && (
        <div className="center mt">
          <button className="btn btn-outline btn-lg" onClick={() => setPage((p) => p + 1)}>عرض المزيد</button>
        </div>
      )}
      <CouponModal coupon={active} onClose={() => setActive(null)} />
    </div>
  )
}
