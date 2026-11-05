const BASE = import.meta.env.VITE_API_URL || '/api'
const TOKEN_KEY = 'admin_token'

export const auth = {
  get token() {
    try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
  },
  set(token) {
    try { localStorage.setItem(TOKEN_KEY, token) } catch { /* ignore */ }
  },
  clear() {
    try { localStorage.removeItem(TOKEN_KEY) } catch { /* ignore */ }
  },
}

export class ApiError extends Error {
  constructor(status, data) {
    super(extractMessage(data) || `HTTP ${status}`)
    this.status = status
    this.data = data
  }
}

function extractMessage(data) {
  if (!data || typeof data !== 'object') return ''
  if (data.detail) return data.detail
  const first = Object.entries(data)[0]
  if (!first) return ''
  const [field, val] = first
  const msg = Array.isArray(val) ? val[0] : val
  return field === 'non_field_errors' ? msg : `${field}: ${msg}`
}

async function request(path, { method = 'GET', body, params } = {}) {
  let url = BASE + path
  if (params) {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null))
    if ([...qs].length) url += '?' + qs
  }
  const headers = {}
  // Public endpoints never get the token, so a stale one can't break them.
  const isPrivate = path.startsWith('/admin') || path === '/auth/me/' || path === '/auth/logout/'
  if (isPrivate && auth.token) headers.Authorization = `Token ${auth.token}`
  let payload = body
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }
  const res = await fetch(url, { method, headers, body: payload })
  if (res.status === 204) return null
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    if (res.status === 401 && path.startsWith('/admin')) {
      auth.clear()
      window.dispatchEvent(new Event('auth:logout'))
    }
    throw new ApiError(res.status, data)
  }
  return data
}

export const api = {
  get: (path, params) => request(path, { params }),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  del: (path) => request(path, { method: 'DELETE' }),
}
