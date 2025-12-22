import { http } from '../http'
import { endpoints } from '../endpoints'
import { getItems } from '../../utils/paginated'

// Postman: POST /users/all?page=1&limit=15&search=...&isPremium=true|false
export async function getUserList({ page, pageSize, search, isPremium } = {}) {
  const res = await http.post(
    endpoints.users.all || endpoints.users.list,
    {},
    {
      params: {
        page,
        limit: pageSize,
        search: search || undefined,
        isPremium: isPremium === '' || isPremium == null ? undefined : isPremium,
      },
    },
  )
  return res.data
}

// There's no dedicated "get user by id" endpoint in the provided Postman export.
// Best-effort: fetch via /users/all using the id as the search value and return the first match.
export async function getUserDetail(id) {
  const data = await getUserList({ page: 1, pageSize: 1, search: id })
  const first = getItems(data)?.[0]
  return first || { id }
}

// Not present in Postman export.
export async function blockUser() {
  throw new Error('Block user endpoint is not available')
}

// Postman: POST /users/update
// Note: the Postman example shows name/profileImage/password fields.
// We also pass-through any extra fields (e.g. isBlocked) to support admin toggles if the backend accepts them.
export async function updateUser(payload = {}) {
  const { userId, name, profileImage, currentPassword, newPassword, ...rest } = payload

  const res = await http.post(endpoints.users.update, {
    userId,
    ...(name != null ? { name } : {}),
    ...(profileImage != null ? { profileImage } : {}),
    ...(currentPassword ? { currentPassword } : {}),
    ...(newPassword ? { newPassword } : {}),
    ...rest,
  })
  return res.data
}

// Postman: POST /users/create
export async function createUser(payload) {
  const res = await http.post(endpoints.users.create || '/users/create', payload)
  return res.data
}

// Postman: POST /users/delete
export async function deleteUser({ userId, password } = {}) {
  const res = await http.post(endpoints.users.delete, {
    userId,
    password,
  })
  return res.data
}
