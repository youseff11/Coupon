import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, User, Eye, EyeOff, LogIn } from 'lucide-react'
import { api, auth } from '../api'
import { SITE } from '../config'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (auth.token) navigate('/admin', { replace: true })
    document.title = `تسجيل الدخول | ${SITE.name}`
  }, [navigate])

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await api.post('/auth/login/', form)
      auth.set(res.token)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-art">
        <div className="login-art-inner">
          <img src="/favicon.svg" alt="" width="64" height="64" />
          <h2>{SITE.name}</h2>
          <p>أدر الشركات وأكواد الخصم من مكان واحد، وتابع أداء كل كوبون لحظة بلحظة.</p>
        </div>
      </div>
      <div className="login-form-wrap">
        <form className="login-card" onSubmit={submit}>
          <h1>تسجيل الدخول</h1>
          <p className="login-sub">أهلاً بعودتك! سجّل الدخول للوحة التحكم.</p>
          {error && <div className="alert alert-danger">{error}</div>}
          <label className="field">
            <span>اسم المستخدم</span>
            <div className="input-icon">
              <User size={18} />
              <input className="input" autoComplete="username" required value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </div>
          </label>
          <label className="field">
            <span>كلمة المرور</span>
            <div className="input-icon">
              <Lock size={18} />
              <input className="input" type={show ? 'text' : 'password'} autoComplete="current-password" required
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <button type="button" className="input-icon-end" onClick={() => setShow((s) => !s)} aria-label="إظهار كلمة المرور">
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          <button className="btn btn-primary btn-lg btn-block" disabled={busy}>
            {busy ? 'جاري الدخول...' : <><LogIn size={18} /> دخول</>}
          </button>
        </form>
      </div>
    </div>
  )
}
