/**
 * Central HTTP client for the SIRG backend (Spring Boot / Oracle).
 *
 * Base URL is configured via the VITE_API_BASE_URL environment variable.
 * All domain services use this module so the base URL is never duplicated.
 *
 * The endpoint paths in each service file reflect the real Spring Boot
 * controllers. JSON property names still need to be confirmed against the
 * OpenAPI document at http://localhost:8080/v3/api-docs (or the Swagger UI at
 * /swagger-ui/index.html) before forms are finalized.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export class ApiError extends Error {
  constructor(message, { status, statusText, body } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.statusText = statusText
    this.body = body
  }
}

/**
 * Parse a JSON response, returning null when the body is empty (e.g. HTTP 204).
 */
async function parseBody(response) {
  if (response.status === 204) return null

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    const text = await response.text()
    return text || null
  }

  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function buildUrl(path, params) {
  const url = new URL(`${BASE_URL}${path}`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })
  }
  // url.toString() prepends origin when BASE_URL is empty; slice it back out.
  if (!BASE_URL) {
    return `${path}${url.search}`
  }
  return `${BASE_URL}${path}${url.search}`
}

/**
 * Core request function. Throws ApiError on non-2xx responses or network errors.
 */
export async function request(path, options = {}) {
  const {
    method = 'GET',
    body,
    params,
    headers: customHeaders = {},
    signal,
  } = options

  const url = buildUrl(path, params)

  const headers = { ...customHeaders }
  let finalBody = body
  if (body !== undefined && body !== null) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json'
    finalBody = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(url, {
      method,
      headers,
      body: finalBody,
      signal,
    })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new ApiError(
      "Impossible de joindre le serveur. Vérifiez que le backend est démarré et que CORS est configuré.",
      { status: 0 },
    )
  }

  const data = await parseBody(response)

  if (!response.ok) {
    let message = `Erreur ${response.status}`
    if (response.statusText) message += ` — ${response.statusText}`
    if (data && typeof data === 'object') {
      message = data.message || data.error || data.detail || message
    } else if (typeof data === 'string' && data) {
      message = data
    }
    throw new ApiError(message, {
      status: response.status,
      statusText: response.statusText,
      body: data,
    })
  }

  return data
}

export const api = {
  get: (path, options = {}) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options = {}) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options = {}) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options = {}) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options = {}) => request(path, { ...options, method: 'DELETE' }),
}
