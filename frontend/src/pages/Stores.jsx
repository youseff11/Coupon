import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Store } from 'lucide-react'
import { useFetch, SkeletonCards, Empty } from '../components/common'
import StoreCard from '../components/StoreCard'
import CategoryIcon from '../components/CategoryIcon'

export default function Stores() {
  const [params, setParams] = useSearchParams()
  const category = params.get('category') || ''
  const [q, setQ] = useState('')
  const [debounced, setDebounced] = useState('')
  const cats = useFetch('/categories/')
  const stores = useFetch('/stores/', { all: 1, category, search: debounced })

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 300)
    return () => clearTimeout(t)
  }, [q])

  const setCategory = (slug) => {
    if (slug) params.set('category', slug)
    else params.delete('category')
    setParams(params)
  }

  const current = cats.data?.find((c) => c.slug === category)

  return (
    <div className="container page">
      <div className="page-head">
        <h1>{current ? `متاجر ${current.name}` : 'كل المتاجر'}</h1>
        <p>اختر المتجر لعرض جميع أكواد الخصم والعروض المتاحة.</p>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث باسم المتجر..." />
        </div>
      </div>

      <div className="chips">
        <button className={!category ? 'chip active' : 'chip'} onClick={() => setCategory('')}>الكل</button>
        {(cats.data || []).map((c) => (
          <button key={c.id} className={category === c.slug ? 'chip active' : 'chip'} onClick={() => setCategory(c.slug)}>
            <CategoryIcon name={c.icon} size={16} /> {c.name}
          </button>
        ))}
      </div>

      {stores.loading ? <SkeletonCards count={12} /> : stores.data?.length ? (
        <div className="grid-stores">
          {stores.data.map((s) => <StoreCard key={s.id} store={s} />)}
        </div>
      ) : (
        <Empty icon={Store} title="لا توجد متاجر" text="جرّب كلمة بحث أخرى أو تصنيفاً مختلفاً." />
      )}
    </div>
  )
}
