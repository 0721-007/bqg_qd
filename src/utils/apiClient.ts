import { API_BASE_URL } from '../config'

export interface ApiRequestOptions {
  auth?: boolean
  adminPassword?: string
  headers?: Record<string, string>
}

async function apiFetch<T>(path: string, init: RequestInit = {}, options: ApiRequestOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
  const baseHeaders = (init.headers || {}) as Record<string, string>
  const headers: Record<string, string> = { ...baseHeaders, ...(options.headers || {}) }

  if (init.body && !(init.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  if (options.auth !== false) {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('authorToken') || '') : ''
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  if (options.adminPassword) {
    headers['x-admin-password'] = options.adminPassword
  }

  const response = await fetch(url, { ...init, headers })

  let data: any = null
  const text = await response.text()
  if (text) {
    try { data = JSON.parse(text) } catch { data = text }
  }

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authorToken')
      localStorage.removeItem('authorUser')
      window.location.href = '/login'
    }
    const msg = (data && (data.msg || data.error || data.message)) || '未登录或登录已过期'
    throw new Error(msg)
  }

  if (!response.ok) {
    const msg = (data && (data.msg || data.error || data.message)) || '请求失败'
    throw new Error(msg)
  }

  if (data && typeof data === 'object' && 'code' in data && 'msg' in data) {
    if (data.code !== 0) {
      const msg = data.msg || '请求失败'
      throw new Error(msg)
    }
    return (data.data as T)
  }

  return data as T
}

export function apiGet<T>(path: string, options?: ApiRequestOptions) {
  return apiFetch<T>(path, { method: 'GET' }, options)
}

export function apiPost<T>(path: string, body: any, options?: ApiRequestOptions) {
  const init: RequestInit = { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }
  return apiFetch<T>(path, init, options)
}

export function apiPut<T>(path: string, body: any, options?: ApiRequestOptions) {
  const init: RequestInit = { method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) }
  return apiFetch<T>(path, init, options)
}

export function apiDelete<T>(path: string, options?: ApiRequestOptions) {
  return apiFetch<T>(path, { method: 'DELETE' }, options)
}
