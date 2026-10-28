import api from './api.js'

export async function loginRequest({ login, password, role }) {
  await api.get('/auth/csrf')
  return api.post('/auth/login', { login, password, role })
}

export async function currentUserRequest() {
  return api.currentUser()
}

export async function logoutRequest() {
  await api.get('/auth/csrf')
  return api.post('/auth/logout', {})
}

export default { loginRequest, currentUserRequest, logoutRequest }
