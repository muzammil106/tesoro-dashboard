const TOKEN_KEY = 'tesoro_token'
const ROLE_KEY = 'tesoro_role'
const NAME_KEY = 'tesoro_name'

export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

export function setAuthToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // ignore
  }
}

export function getAuthRole() {
  try {
    return localStorage.getItem(ROLE_KEY) || ''
  } catch {
    return ''
  }
}

export function setAuthRole(role) {
  try {
    localStorage.setItem(ROLE_KEY, role)
  } catch {
    // ignore
  }
}

export function getAuthName() {
  try {
    return localStorage.getItem(NAME_KEY) || ''
  } catch {
    return ''
  }
}

export function setAuthName(name) {
  try {
    localStorage.setItem(NAME_KEY, name)
  } catch {
    // ignore
  }
}

export function clearAuthToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ROLE_KEY)
    localStorage.removeItem(NAME_KEY)
  } catch {
    // ignore
  }
}

export function isAuthed() {
  return Boolean(getAuthToken())
}

export function isAdminAuthed() {
  return isAuthed() && String(getAuthRole()).toLowerCase() === 'admin'
}
