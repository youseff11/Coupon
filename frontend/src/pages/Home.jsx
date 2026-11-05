import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ArrowLeft, BadgeCheck, Zap, ShieldCheck, TrendingUp, Sparkles } from 'lucide-react'
import { useFetch, SkeletonCards } from '../components/common'
import StoreCard from '../components/StoreCard'
import CategoryIcon from '../components/CategoryIcon'
import HeroArt from '../components/HeroArt'
import { CouponCard, CouponModal } from '../components/Coupon'
import { SITE } from '../config'

function SectionHead({ title, icon: Icon, to, linkLabel = 'عرض الكل' }) {
  return (
    <div className="section-head">
      <h2>{Icon && <Icon size={22} />} {title}</h2>
      {to && <Link to={to} className="see-all">{linkLabel} <ArrowLeft size={16} /></Link>}
    </div>
  )
}

export default function Home() {
  const [q, setQ] = useState('')
  const [active, setActive] = useState(null)
  const navigate = useNavigate()
  const featured = useFetch('/stores/', { featured: 1 })
  const cats = useFetch('/categories/')
  const latest = useFetch('/coupons/')
  const popular = useFetch('/coupons/', { ordering: 'popular' })

  const submit = (e) => {
    e.preventDefault()
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <>
      <section className="hero">
        <div className="hero-glow" />
        <div className="container hero-inner">
          <div className="hero-text">
          <span className="hero-badge"><Sparkles size={15} /> أكواد محدّثة يومياً</span>
          <h1>وفّر أكثر مع <span>أكواد خصم</span> فعالة لأشهر المتاجر</h1>
          <p>{SITE.tagline} — انسخ الكود، واستمتع بالخصم فوراً.</p>
          <form className="hero-search" onSubmit={submit}>
            <Search size={22} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن نون، أمازون، طلبات..." />
            <button className="btn btn-accent btn-lg" type="submit">ابحث</button>
          </form>
          <div className="hero-features">
            <span><BadgeCheck size={18} /> أكواد موثقة</span>
            <span><Zap size={18} /> نسخ بضغطة واحدة</span>
            <span><ShieldCheck size={18} /> مجانية 100%</span>
          </div>
          </div>
          <div className="hero-art"><HeroArt /></div>
        </div>
      </section>

      <div className="container">
        <section className="section">
          <SectionHead title="متاجر مميزة" to="/stores" linkLabel="كل المتاجر" />
          {featured.loading ? <SkeletonCards count={6} /> : (
            <div className="grid-stores">
              {(featured.data?.results || []).map((s) => <StoreCard key={s.id} store={s} />)}
            </div>
          )}
        </section>

        {cats.data?.length > 0 && (
          <section className="section">
            <SectionHead title="تصفح حسب التصنيف" />
            <div className="cat-grid">
              {cats.data.map((c) => (
                <Link key={c.id} to={`/stores?category=${c.slug}`} className="cat-card">
                  <span className="cat-icon"><CategoryIcon name={c.icon} size={26} /></span>
                  <span className="cat-name">{c.name}</span>
                  <span className="cat-count">{c.stores_count} متجر</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="section">
          <SectionHead title="أحدث الكوبونات" to="/coupons" />
          {latest.loading ? <SkeletonCards count={3} className="coupon-list" /> : (
            <div className="coupon-list">
              {(latest.data?.results || []).slice(0, 6).map((c) => (
                <CouponCard key={c.id} coupon={c} showStore onOpen={setActive} />
              ))}
            </div>
          )}
        </section>

        <section className="section">
          <SectionHead title="الأكثر استخداماً" icon={TrendingUp} to="/coupons?ordering=popular" />
          {popular.loading ? <SkeletonCards count={3} className="coupon-list" /> : (
            <div className="coupon-list">
              {(popular.data?.results || []).slice(0, 4).map((c) => (
                <CouponCard key={c.id} coupon={c} showStore onOpen={setActive} />
              ))}
            </div>
          )}
        </section>
      </div>

      <CouponModal coupon={active} onClose={() => setActive(null)} />
    </>
  )
}
