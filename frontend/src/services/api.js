const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export class ApiError extends Error {
  constructor(message, status, raw) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.raw = raw
  }
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    try {
      return await response.json()
    } catch {
      return null
    }
  }
  const text = await response.text()
  if (!text) return null
  return text
}

function buildError(status, body) {
  let message
  if (body && typeof body === 'object') {
    message = body.message || body.error || body.detail || body.erreur
    if (Array.isArray(body.errors) && body.errors.length > 0) {
      const first = body.errors[0]
      message = message || (typeof first === 'string' ? first : first?.defaultMessage || first?.message)
    }
  } else if (typeof body === 'string' && body.trim()) {
    message = body.trim()
  }
  if (!message) {
    message = `Erreur HTTP ${status}`
  }
  return new ApiError(message, status, body)
}

async function request(method, path, body) {
  let url = `${BASE_URL}${path}`
  let init = { method, headers: {}, credentials: 'include' }
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrfToken = document.cookie
      .split('; ')
      .find((cookie) => cookie.startsWith('XSRF-TOKEN='))
      ?.slice('XSRF-TOKEN='.length)
    if (csrfToken) init.headers['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken)
  }

  if (body !== undefined && body !== null) {
    init.headers['Content-Type'] = 'application/json'
    init.body = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(url, init)
  } catch (networkError) {
    throw new ApiError(
      'Impossible de joindre le serveur. Vérifiez que le backend est démarré et accessible.',
      0,
      null,
    )
  }

  const data = await parseResponse(response)

  if (!response.ok) {
    throw buildError(response.status, data)
  }

  return data
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  baseUrl: BASE_URL,
  currentUser: () => request('GET', '/auth/me'),
}

export default api
