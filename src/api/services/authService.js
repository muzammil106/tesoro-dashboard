import { http } from '../http'
import { endpoints } from '../endpoints'

export async function login(payload) {
  const res = await http.post(endpoints.auth.login, payload)
  return res.data
}

// Postman: /users/me (POST)
export async function getMe() {
  const res = await http.post(endpoints.users.me)
  return res.data
}
