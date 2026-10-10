const TOKEN_KEY = 'careerai-access-token'

export function saveAccessToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {})
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  const response = await fetch(path, { ...options, headers })
  if (response.status === 204) return null
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.detail || `Request failed (${response.status}).`)
  return payload
}

export async function authenticate(mode, values) {
  const result = await apiRequest(`/api/auth/${mode}`, {
    method: 'POST',
    body: JSON.stringify(values),
  })
  saveAccessToken(result.access_token)
  return result.user
}

export async function uploadResume(file) {
  const body = new FormData()
  body.append('file', file)
  const resume = await apiRequest('/api/resumes', { method: 'POST', body })
  return { ...resume, uploadedAt: resume.uploaded_at, textLength: resume.text_length }
}
