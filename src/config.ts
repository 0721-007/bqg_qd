const raw = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || ''
export const API_BASE_URL = raw.endsWith('/api') ? raw : `${raw}/api`

