import { useEffect, useState } from 'react'
import { api } from '../api'

export function useFetch(path, params, deps = []) {
  const [state, setState] = useState({ data: null, loading: !!path, error: null })
  const key = JSON.stringify(params || {})

  useEffect(() => {
    if (!path) return
    let alive = true
    setState((s) => ({ ...s, loading: true, error: null }))
    api.get(path, params)
      .then((data) => alive && setState({ data, loading: false, error: null }))
      .catch((error) => alive && setState({ data: null, loading: false, error }))
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, key, ...deps])

  return state
}

export function StoreLogo({ store, size = 64, className = '' }) {
  const [broken, setBroken] = useState(false)
  const initials = (store?.name || '?').trim().slice(0, 2)
  return (
    <div className={`store-logo ${className}`} style={{ width: size, height: size }}>
      {store?.logo && !broken
        ? <img src={store.logo} alt={store.name} loading="lazy" onError={() => setBroken(true)} />
        : <span style={{ fontSize: size * 0.32 }}>{initials}</span>}
    </div>
  )
}

export function Spinner({ label = 'جاري التحميل...' }) {
  return (
    <div className="spinner-wrap" role="status">
      <div className="spinner" />
      <span>{label}</span>
    </div>
  )
}

export function Empty({ icon: Icon, title, text, children }) {
  return (
    <div className="empty">
      {Icon && <div className="empty-icon"><Icon size={30} /></div>}
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {children}
    </div>
  )
}

export function SkeletonCards({ count = 6, className = 'grid-stores' }) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => <div key={i} className="skeleton" />)}
    </div>
  )
}
