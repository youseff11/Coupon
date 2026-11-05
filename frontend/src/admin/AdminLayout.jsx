import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Store, Ticket, Tags, LogOut, Menu, ExternalLink, X } from 'lucide-react'
import { api, auth } from '../api'
import { SITE } from '../config'
import { Spinner } from '../components/common'

const NAV = [
  { to: '/admin', label: 'لوحة التحكم', icon: LayoutDashboard, end: true },
  { to: '/admin/stores', label: 'الشركات والمتاجر', icon: Store },
  { to: '/admin/coupons', label: 'أكواد الخصم', icon: Ticket },
  { to: '/admin/categories', label: 'التصنيفات', icon: Tags },
]

export default function AdminLayout() {
  const [user, setUser] = useState(null)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    if (!auth.token) {
      navigate('/admin/login', { replace: true })
      return
    }
    api.get('/auth/me/').then(setUser).catch(() => {
      auth.clear()
      navigate('/admin/login', { replace: true })
    })
    const onLogout = () => navigate('/admin/login', { replace: true })
    window.addEventListener('auth:logout', onLogout)
    return () => window.removeEventListener('auth:logout', onLogout)
  }, [navigate])

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    document.title = `لوحة التحكم | ${SITE.name}`
  }, [])

  const logout = async () => {
    await api.post('/auth/logout/').catch(() => {})
    auth.clear()
    navigate('/admin/login', { replace: true })
  }

  if (!user) return <Spinner />

  const current = NAV.find((n) => (n.end ? pathname === n.to : pathname.startsWith(n.to)))

  return (
    <div className="adm">
      <div className={`adm-backdrop ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`adm-sidebar ${open ? 'open' : ''}`}>
        <div className="adm-brand">
          <img src="/favicon.svg" alt="" width="34" height="34" />
          <div>
            <strong>{SITE.name}</strong>
            <span>لوحة التحكم</span>
          </div>
          <button className="icon-btn adm-close" onClick={() => setOpen(false)} aria-label="إغلاق"><X size={20} /></button>
        </div>
        <nav className="adm-nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}>
              <n.icon size={19} /> <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="adm-sidebar-foot">
          <a href="/" target="_blank" rel="noreferrer" className="adm-nav-link"><ExternalLink size={18} /> عرض الموقع</a>
          <button onClick={logout} className="adm-nav-link danger"><LogOut size={18} /> تسجيل الخروج</button>
        </div>
      </aside>

      <div className="adm-main">
        <header className="adm-topbar">
          <button className="icon-btn adm-menu" onClick={() => setOpen(true)} aria-label="القائمة"><Menu size={22} /></button>
          <div className="adm-topbar-title">{current?.label}</div>
          <div className="adm-user">
            <div className="adm-avatar">{(user.name || user.username).slice(0, 1).toUpperCase()}</div>
            <div className="adm-user-text">
              <strong>{user.name || user.username}</strong>
              <span>مدير</span>
            </div>
          </div>
        </header>
        <main className="adm-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
