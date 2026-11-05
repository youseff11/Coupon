import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search as SearchIcon, SearchX } from 'lucide-react'
import { useFetch, Spinner, Empty } from '../components/common'
import StoreCard from '../components/StoreCard'
import { CouponCard, CouponModal } from '../components/Coupon'

export default function Search() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const [input, setInput] = useState(q)
  const [active, setActive] = useState(null)
  const stores = useFetch(q ? '/stores/' : null, { search: q, all: 1 })
  const coupons = useFetch(q ? '/coupons/' : null, { search: q })

  useEffect(() => { setInput(q) }, [q])

  const submit = (e) => {
    e.preventDefault()
    setParams(input.trim() ? { q: input.trim() } : {})
  }

  const loading = stores.loading || coupons.loading
  const storeList = stores.data || []
  const couponList = coupons.data?.results || []

  return (
    <div className="container page">
      <form className="hero-search search-page-form" onSubmit={submit}>
        <SearchIcon size={22} />
        <input autoFocus value={input} onChange={(e) => setInput(e.target.value)} placeholder="ابحث عن متجر أو كوبون..." />
        <button className="btn btn-primary btn-lg" type="submit">بحث</button>
      </form>

      {!q ? null : loading ? <Spinner /> : !storeList.length && !couponList.length ? (
        <Empty icon={SearchX} title={`لا توجد نتائج لـ "${q}"`} text="تأكد من كتابة اسم المتجر بشكل صحيح أو جرّب كلمة أخرى." />
      ) : (
        <>
          {storeList.length > 0 && (
            <section className="section">
              <div className="section-head"><h2>المتاجر ({storeList.length})</h2></div>
              <div className="grid-stores">{storeList.map((s) => <StoreCard key={s.id} store={s} />)}</div>
            </section>
          )}
          {couponList.length > 0 && (
            <section className="section">
              <div className="section-head"><h2>الكوبونات ({coupons.data.count})</h2></div>
              <div className="coupon-list">
                {couponList.map((c) => <CouponCard key={c.id} coupon={c} showStore onOpen={setActive} />)}
              </div>
            </section>
          )}
        </>
      )}
      <CouponModal coupon={active} onClose={() => setActive(null)} />
    </div>
  )
}
