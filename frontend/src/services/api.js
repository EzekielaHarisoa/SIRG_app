/**
 * Base URL of the backend.
 *
 * In development this stays empty on purpose: requests are sent to the Vite
 * dev server and proxied to Spring Boot (see vite.config.js), which avoids the
 * CORS configuration the backend does not provide. Set VITE_API_BASE_URL when
 * the frontend is deployed separately from the API.
 */
const BASE_URL = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

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
  const url = `${BASE_URL}${path}`
  const init = { method, headers: {} }

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
    // The dev proxy answers 502/503/504 when it cannot reach Spring Boot.
    const backendUnreachable =
      [502, 503, 504].includes(response.status) && (data === null || data === '')
    if (backendUnreachable) {
      throw new ApiError(
        'Impossible de joindre le serveur. Vérifiez que le backend est démarré et accessible.',
        0,
        data,
      )
    }
    throw buildError(response.status, data)
  }

  return data
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  baseUrl: BASE_URL,
}

export default api
