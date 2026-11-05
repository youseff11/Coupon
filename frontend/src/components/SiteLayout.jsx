import { useRef, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Menu, Search, X, Ticket, Store, Home, Tag } from 'lucide-react'
import { SITE } from '../config'
import { useFetch } from './common'
import CategoryIcon from './CategoryIcon'

// Hidden admin entrance: three quick clicks/taps on the header logo icon.
function useSecretClicks(count, onTrigger, windowMs = 800) {
  const clicks = useRef([])
  return (e) => {
    const now = Date.now()
    clicks.current = [...clicks.current.filter((t) => now - t < windowMs), now]
    if (clicks.current.length >= count) {
      clicks.current = []
      e.preventDefault()
      onTrigger()
    }
  }
}

export function Brand({ light, secret }) {
  const navigate = useNavigate()
  const onLogoClick = useSecretClicks(3, () => navigate('/admin/login'))
  return (
    <Link to="/" className={`brand ${light ? 'brand-light' : ''}`}>
      <img src="/favicon.svg" alt="" width="36" height="36" onClick={secret ? onLogoClick : undefined} draggable="false" />
      <span>{SITE.name}</span>
    </Link>
  )
}

function Header() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  const submit = (e) => {
    e.preventDefault()
    if (!q.trim()) return
    navigate(`/search?q=${encodeURIComponent(q.trim())}`)
    setOpen(false)
  }

  const links = [
    { to: '/', label: 'الرئيسية', icon: Home, end: true },
    { to: '/stores', label: 'المتاجر', icon: Store },
    { to: '/coupons', label: 'أحدث الكوبونات', icon: Ticket },
  ]

  return (
    <header className="site-header">
      <div className="container header-inner">
        <button className="icon-btn only-mobile" onClick={() => setOpen(true)} aria-label="القائمة">
          <Menu size={22} />
        </button>
        <Brand secret />
        <nav className="main-nav only-desktop">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>{l.label}</NavLink>
          ))}
        </nav>
        <form className="header-search only-desktop" onSubmit={submit}>
          <Search size={18} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن متجر أو كوبون..." />
        </form>
        <button className="icon-btn only-mobile" onClick={() => navigate('/search')} aria-label="بحث">
          <Search size={22} />
        </button>
      </div>

      <div className={`drawer-backdrop ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`drawer ${open ? 'open' : ''}`}>
        <div className="drawer-head">
          <Brand />
          <button className="icon-btn" onClick={() => setOpen(false)} aria-label="إغلاق"><X size={22} /></button>
        </div>
        <form className="header-search" onSubmit={submit}>
          <Search size={18} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن متجر أو كوبون..." />
        </form>
        <nav className="drawer-nav">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setOpen(false)}>
              <l.icon size={19} /> {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </header>
  )
}

function Footer() {
  const { data: cats } = useFetch('/categories/')
  const { data: stores } = useFetch('/stores/', { featured: 1 })
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Brand light />
          <p className="footer-about">
            {SITE.tagline}. نجمع لك أحدث أكواد الخصم الموثقة يومياً لتوفر أكثر في كل عملية شراء.
          </p>
        </div>
        <div>
          <h4>التصنيفات</h4>
          <ul>
            {(cats || []).slice(0, 6).map((c) => (
              <li key={c.id}><Link to={`/stores?category=${c.slug}`}><CategoryIcon name={c.icon} size={14} /> {c.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4>متاجر مميزة</h4>
          <ul>
            {(stores?.results || []).slice(0, 6).map((s) => (
              <li key={s.id}><Link to={`/stores/${s.slug}`}>كود خصم {s.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4>روابط</h4>
          <ul>
            <li><Link to="/stores"><Store size={14} /> كل المتاجر</Link></li>
            <li><Link to="/coupons"><Tag size={14} /> أحدث الكوبونات</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">© {new Date().getFullYear()} {SITE.name} — جميع الحقوق محفوظة</div>
      </div>
    </footer>
  )
}

export default function SiteLayout() {
  return (
    <div className="site">
      <Header />
      <main className="site-main"><Outlet /></main>
      <Footer />
    </div>
  )
}
