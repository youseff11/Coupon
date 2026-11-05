import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import SiteLayout from './components/SiteLayout'
import Home from './pages/Home'
import Stores from './pages/Stores'
import StorePage from './pages/StorePage'
import Search from './pages/Search'
import Coupons from './pages/Coupons'
import NotFound from './pages/NotFound'
import AdminLayout from './admin/AdminLayout'
import Login from './admin/Login'
import Dashboard from './admin/Dashboard'
import StoresAdmin from './admin/StoresAdmin'
import CouponsAdmin from './admin/CouponsAdmin'
import CategoriesAdmin from './admin/CategoriesAdmin'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<Home />} />
          <Route path="stores" element={<Stores />} />
          <Route path="stores/:slug" element={<StorePage />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="search" element={<Search />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="admin/login" element={<Login />} />
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="stores" element={<StoresAdmin />} />
          <Route path="coupons" element={<CouponsAdmin />} />
          <Route path="categories" element={<CategoriesAdmin />} />
        </Route>
      </Routes>
    </>
  )
}
