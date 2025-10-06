import axios from 'axios'

export const baseURL = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export const api = axios.create({
  baseURL,
})

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `JWT ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

export function mediaUrl(path) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  // Ensure single slash between base and path and respect MEDIA_URL paths
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${baseURL}${clean}`
}
