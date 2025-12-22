import { http } from '../http'
import { endpoints } from '../endpoints'

export async function getCategoryList({ page = 1, pageSize = 100, searchBy } = {}) {
  const res = await http.post(
    endpoints.categories.all,
    {},
    {
      params: {
        page,
        limit: pageSize,
        searchBy,
      },
    },
  )

  return res.data
}

export async function createCategory(payload) {
  const res = await http.post(endpoints.categories.create, payload)
  return res.data
}

export async function updateCategory(categoryId, payload) {
  const res = await http.post(endpoints.categories.update, { categoryId, ...payload })
  return res.data
}

export async function deleteCategory(categoryId) {
  const res = await http.post(endpoints.categories.delete, { categoryId })
  return res.data
}
