const override = typeof window !== 'undefined' ? (localStorage.getItem('API_BASE_URL') || '') : ''
const baseRaw = (override || import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
export const API_BASE_URL = baseRaw
  ? (baseRaw.endsWith('/api') ? baseRaw : `${baseRaw}/api`)
  : '/api'

